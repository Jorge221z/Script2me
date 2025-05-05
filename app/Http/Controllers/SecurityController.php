<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Inertia\Inertia;
use Exception;
use App\Services\GeminiService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpWord\IOFactory;

class SecurityController extends Controller
{
    use ValidatesRequests;
    public function index()
    {
        try {
            // funcion que nos lleva a la vista de seguridad//
            return Inertia::render('securityDashboard', [
                'SecContents' => session('SecContents', []),
                'SecNames' => session('SecNames', [])
            ]);
        } catch (Exception $e) {
            error_log('Error en index: ' . $e->getMessage());
            return Inertia::render('securityDashboard', [
                'SecContents' => [],
                'SecNames' => [],
                'error' => __('messages.dashboard_load_error', ['msg' => $e->getMessage()])
            ]);
        }
    }



    public function scan(Request $request, GeminiService $geminiService) //le pasamos tambien el servicio de gemini//
    {
        //validamos el captcha solo si fue enviado
        if ($request->has('captcha')) {
            $this->validate($request, [
                'captcha' => 'required|string'
            ]);

            // Verificamos el captcha
            $captchaResponse = $request->input('captcha');
            $secretKey = env('RECAPTCHA_SECRET_KEY');

            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $captchaResponse,
                'remoteip' => $request->ip(),
            ]);

            $responseData = $response->json();

            if (!$responseData['success']) {
                return redirect()->back()->with('error', __('messages.captcha_failed'));
            }
        }

        // Validar los archivos subidos
        $this->validate($request, [
            'files' => 'required|array|min:1',
            'files.*' => 'required|file|max:2048'
        ]);

        // Definir las extensiones permitidas
        {
            $allowedExtensions = ['pdf', 'docx', 'c', 'cpp', 'h', 'cs', 'java', 'kt', 'kts', 'swift', 'go', 'rs', 'dart', 'py', 'rb', 'pl', 'php', 'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'js', 'jsx', 'vue', 'svelte', 'sql', 'db', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'env', 'sh', 'bat', 'ps1', 'twig', 'ejs', 'pug', 'md', 'ipynb', 'r', 'mat', 'asm', 'f90', 'f95', 'txt'];

            $validator = Validator::make($request->all(), [
                'files' => 'required|array|min:1',
                'files.*' => [
                    'required',
                    'file',
                    'max:2048',
                    function ($attribute, $value, $fail) use ($allowedExtensions) {
                        $extension = strtolower($value->getClientOriginalExtension());
                        if (!in_array($extension, $allowedExtensions)) {
                            $fail(__('messages.extension_not_allowed', ['ext' => $extension]));
                        }
                    }
                ]
            ], [
                'files.required' => __('messages.files_required'),
                'files.*.file' => __('messages.files_file'),
                'files.*.max' => __('messages.files_max'),
                'files.min' => __('messages.files_min')
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator);
            }

            $newContents = [];
            $newNames = [];

            foreach ($request->file('files') as $file) {
                try {
                    // Leer el contenido ANTES de almacenar y/o procesar
                    $content = file_get_contents($file->getRealPath());
                    $extension = strtolower($file->getClientOriginalExtension()); //para comparar extensiones de forma sencilla//

                    if ($extension === 'pdf') {
                        try {
                            $parser = new \Smalot\PdfParser\Parser();
                            $pdf = $parser->parseContent($content);
                            $text = $pdf->getText();

                            $lines = explode("\n", $text);
                            $cleanLines = [];

                            foreach ($lines as $line) {
                                $trimmedLine = trim(preg_replace('/\s+/', ' ', $line));
                                if ($trimmedLine !== '') {
                                    $cleanLines[] = $trimmedLine;
                                }
                            }

                            $cleanText = implode("\n", $cleanLines);
                            $newContents[] = $cleanText;
                        } catch (Exception $e) {
                            throw new Exception(__('messages.failed_parse_pdf', ['msg' => $e->getMessage()]));
                        }
                    } else if ($extension === 'docx') {
                        try {
                            $phpWord = IOFactory::load($file->getRealPath());
                            $lines = [];

                            foreach ($phpWord->getSections() as $section) {
                                foreach ($section->getElements() as $element) {
                                    if ($element instanceof Text) {
                                        $line = trim(preg_replace('/[ \t]+/', ' ', $element->getText()));
                                        if ($line !== '') {
                                            $lines[] = $line;
                                        }
                                    } elseif ($element instanceof TextRun) {
                                        $textRunLine = '';
                                        foreach ($element->getElements() as $child) {
                                            if ($child instanceof Text) {
                                                $textRunLine .= $child->getText() . ' ';
                                            }
                                        }
                                        $line = trim(preg_replace('/[ \t]+/', ' ', $textRunLine));
                                        if ($line !== '') {
                                            $lines[] = $line;
                                        }
                                    }
                                }
                            }
                            $cleanText = implode("\n", $lines);
                            $newContents[] = $cleanText;
                        } catch (Exception $e) {
                            throw new Exception(__('messages.failed_parse_docx', ['msg' => $e->getMessage()]));
                        }
                    } else {
                        //$cleanText = trim(preg_replace('/\s+/', ' ', $content));
                        $newContents[] = $content;
                    }

                    $timestampName = time() . '_' . $file->getClientOriginalName();

                    $file->storeAs('uploads', $timestampName, 'public');
                    $newNames[] = $file->getClientOriginalName();
                } catch (Exception $e) {
                    return back()->withErrors(['files' => __('messages.error_processing_file', ['name' => $file->getClientOriginalName()])]);
                }
            }
            //Aqui vamos a manejar las llamadas a la API de Gemini y como lo integramos en los arrays de session//

            $SecContents = []; //array para almacenar las respuestas de la API//

            foreach ($newContents as $content) {
                try {
                    $completePrompt = $this->BuildSecurityPrompt($content);
                    $rawResponse = $geminiService->generateText($completePrompt);
                    // Ahora extraemos el contenido del JSON //
                    $jsonResponse = $this->extractJsonFromResponse($rawResponse);

                    // Validamos el caso en el que la salida se quede vacia tras limpiarla //
                    if (empty($jsonResponse) || !isset($jsonResponse['score'])) {
                        return redirect()->back()->with('error', __('messages.gemini_empty_response'));
                    }

                    // Ahora almacenamos la salida en el arrray de la API//
                    $SecContents[] = $jsonResponse;


                } catch (Exception $e) {
                    $SecContents[] = [
                        'filename' => $content['filename'],
                        'error' => $e->getMessage()
                    ];
                    continue;
                }
            }

            // Actualizamos arrays de sesion
            $request->session()->put('SecContents', array_merge(
                $request->session()->get('SecContents', []),
                $SecContents
            ));

            $request->session()->put('SecNames', array_merge(
                $request->session()->get('SecNames', []),
                $newNames
            ));

            $request->session()->save(); //guardamos la sesion de forma explicita //

            // Redirigimos a la vista de seguridad con los resultados
            return redirect()->back()->with('success', count($newNames) === 1 ? __('messages.file_security_success') : __('messages.file_security_success', ['count' => count($newNames)]));
        }

    }


    protected function extractJsonFromResponse($response)
    {
        // Buscamos el primer bloque JSON bien estructurado { ... }
        if (preg_match('/\{(?:[^{}]|(?R))*\}/s', $response, $matches)) {
            return json_decode($matches[0], true);
        }

        return null;
    }

    protected function BuildSecurityPrompt(string $code)
    {
        return <<<EOT
            return <<<EOT
You are a security expert. Analyze the following code for **security vulnerabilities** and **bad practices**.

**REQUIREMENTS**  
1. **ONLY** respond with a single valid JSON object—no markdown fences, no extra commentary, no apologies.  
2. JSON must have exactly these fields:  
   - `score` (integer 0–100)  
   - `summary` (string, max 2 sentences)  
   - `critical_lines` (array of integers)  
   - `vulnerabilities` (array of objects with keys: `line` (int), `issue` (string), `suggestion` (string))  
3. If no issues are found, return `score: 100`, empty arrays for `critical_lines` and `vulnerabilities`, and a summary like `"No issues found"`.

Analyze the following source code:
**CODE TO ANALYZE**  
{$code}

{
  "score": 64,
  "summary": "...",
  "critical_lines": [23, 47],
  "vulnerabilities": [
    {
      "line": 23,
      "issue": "SQL Injection",
      "suggestion": "Use prepared statements."
    }
    // ...
  ]
}
EOT;
    }


    public function clearSecSession(Request $request)
    {
        $request->session()->forget(['SecContents', 'SecNames']);
        $request->session()->save(); //guardamos la sesion de forma explicita //
        return redirect()->back()->with([
            'success' => __('messages.history_cleared'),
            '_sync' => now()->timestamp,
        ]);
    }


}

