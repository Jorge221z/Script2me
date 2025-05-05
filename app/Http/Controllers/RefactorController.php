<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;
use Exception;
use Illuminate\Support\Facades\Log;
use App\Services\GeminiService;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Support\Facades\Http;

class RefactorController extends Controller
{
    use ValidatesRequests;
    public function index()
    {
        try {
            // Eliminar la línea que borra la sesión
            return Inertia::render('refactorDashboard', [
                'ApiContents' => session('ApiContents', []),
                'ApiNames' => session('ApiNames', [])
            ]);
        } catch (Exception $e) {
            error_log('Error en index: ' . $e->getMessage());
            return Inertia::render('refactorDashboard', [
                'ApiContents' => [],
                'ApiNames' => [],
                'error' => __('messages.dashboard_load_error', ['msg' => $e->getMessage()])
            ]);
        }
    }

    

    public function listModels(GeminiService $geminiService)
    {
        try {
            $models = $geminiService->listModels();
            return response()->json([
                'status' => 'success',
                'models' => $models
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al listar los modelos',
                'error' => $e->getMessage()
            ]);
        }
    }




    public function process(Request $request, GeminiService $geminiService) //le pasamos tambien el servicio de gemini//
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
            $basePrompt = <<<'EOD'
You are a “Refactoring Specialist” with deep expertise in writing idiomatic, high-performance code. 

1. Auto-detect the source language.  
2. Analyze and transform the code to maximize readability, maintainability and algorithmic efficiency, using best-practice idioms for that language.  
3. Preserve exact functional behavior (all edge cases, inputs/outputs, side-effects).  
4. Output only the refactored code, wrapped in a fenced code block with the correct language tag—no explanations, comments or extra text.  
5. If the input is already optimal, return it verbatim inside a fenced code block.  
6. Ensure formatting follows community/style-guide conventions (e.g., PSR-12 for PHP, PEP8 for Python, Google Java Style, etc.).  
7. (Optional) Include minimal smoke tests or assertions in the same snippet if it improves clarity or safety.

EOD;


            $apiContents = []; //array para almacenar la salida de la API//

            foreach ($newContents as $content) {
                try {
                    $completePrompt = $basePrompt . "\n\n" . $content;
                    $rawResponse = $geminiService->generateText($completePrompt);
                    // Limpiamos la salida para que se vea mas limpia y ordenada //
                    $cleanedResponse = preg_replace('/^```[a-zA-Z]*\n/', '', $rawResponse);
                    $cleanedResponse = preg_replace('/```$/', '', $cleanedResponse);
                    $cleanedResponse = trim($cleanedResponse);

                    //Validamos el caso en el que la salida se quede vacia tras limpiarla //
                    if (empty($cleanedResponse)) {
                        return redirect()->back()->with('error', __('messages.gemini_empty_response'));
                    }

                    // Ahora almacenamos la salida en el arrray de la API//
                    $apiContents[] = $cleanedResponse;


                } catch (Exception $e) {
                    return redirect()->back()->with('error', __('messages.gemini_api_error', ['msg' => $e->getMessage()]));
                }
            }


            // Actualizamos arrays de sesion
            $request->session()->put('ApiContents', array_merge(
                $request->session()->get('ApiContents', []),
                $apiContents
            ));

            $request->session()->put('ApiNames', array_merge(
                $request->session()->get('ApiNames', []),
                $newNames
            ));

            $request->session()->save(); //guardamos la sesion de forma explicita //

            return redirect()->back()->with('success', count($newNames) === 1 ? __('messages.file_refactor_success') : __('messages.file_refactor_success', ['count' => count($newNames)]));
        }
    }


    public function clearApiSession(Request $request)
    {
        $request->session()->forget(['ApiContents', 'ApiNames']);
        $request->session()->save(); //guardamos la sesion de forma explicita //
        return redirect()->back()->with([
            'success' => __('messages.history_cleared'),
            '_sync' => now()->timestamp,
        ]);
    }

}