<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Inertia\Inertia;
use Exception;
use App\Services\GeminiService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;

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



    public function scan(Request $request, GeminiService $geminiService)
    {
        // Validamos el captcha solo si fue enviado
        if ($request->has('captcha')) {
            $this->validate($request, [
                'captcha' => 'required|string'
            ]);

            $captchaResponse = $request->input('captcha');
            $secretKey = env('RECAPTCHA_SECRET_KEY');

            // Implementación de protección SSRF
            // Validar que la URL del servicio es segura antes de realizar la petición
            $recaptchaUrl = 'https://www.google.com/recaptcha/api/siteverify';
            if (!$this->isUrlSafe($recaptchaUrl)) {
                return redirect()->back()->with('error', __('messages.security_url_not_allowed'));
            }

            $response = Http::asForm()->post($recaptchaUrl, [
                'secret' => $secretKey,
                'response' => $captchaResponse,
                'remoteip' => $request->ip(),
            ]);

            $responseData = $response->json();

            if (!$responseData['success']) {
                return redirect()->back()->with('error', __('messages.captcha_failed'));
            }
        }

        // Definir las extensiones permitidas y sus tipos MIME correspondientes
        $allowedExtensions = [
            'pdf' => 'application/pdf',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'c' => 'text/x-c',
            'cpp' => 'text/x-c++',
            'h' => 'text/x-h',
            'cs' => 'text/plain',
            'java' => 'text/x-java',
            'kt' => 'text/plain',
            'kts' => 'text/plain',
            'swift' => 'text/x-swift',
            'go' => 'text/x-go',
            'rs' => 'text/x-rust',
            'dart' => 'text/x-dart',
            'py' => 'text/x-python',
            'rb' => 'text/x-ruby',
            'pl' => 'text/x-perl',
            'php' => 'text/x-php',
            'ts' => 'text/typescript',
            'tsx' => 'text/typescript',
            'html' => 'text/html',
            'htm' => 'text/html',
            'css' => 'text/css',
            'scss' => 'text/x-scss',
            'sass' => 'text/x-sass',
            'less' => 'text/x-less',
            'js' => 'application/javascript',
            'jsx' => 'text/jsx',
            'vue' => 'text/x-vue',
            'svelte' => 'text/plain',
            'sql' => 'text/x-sql',
            'db' => 'application/octet-stream',
            'sqlite' => 'application/x-sqlite3',
            'sqlite3' => 'application/x-sqlite3',
            'mdb' => 'application/x-msaccess',
            'accdb' => 'application/x-msaccess',
            'json' => 'application/json',
            'xml' => 'application/xml',
            'yaml' => 'text/x-yaml',
            'yml' => 'text/x-yaml',
            'toml' => 'text/x-toml',
            'ini' => 'text/x-ini',
            'env' => 'text/plain',
            'sh' => 'application/x-sh',
            'bat' => 'application/x-bat',
            'ps1' => 'application/x-powershell',
            'twig' => 'text/x-twig',
            'ejs' => 'text/plain',
            'pug' => 'text/x-pug',
            'md' => 'text/markdown',
            'ipynb' => 'application/x-ipynb+json',
            'r' => 'text/x-r',
            'mat' => 'application/x-matlab-data',
            'asm' => 'text/x-asm',
            'f90' => 'text/x-fortran',
            'f95' => 'text/x-fortran',
            'txt' => 'text/plain'
        ];

        // Validar los archivos subidos con límite de 10 archivos y comprobación de tipo MIME
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|min:1|max:20',
            'files.*' => [
                'required',
                'file',
                'max:2048',
                function ($attribute, $value, $fail) use ($allowedExtensions) {
                    $extension = strtolower($value->getClientOriginalExtension());
                    if (!array_key_exists($extension, $allowedExtensions)) {
                        $fail(__('messages.extension_not_allowed', ['ext' => $extension]));
                        return;
                    }

                    $finfo = new \finfo(FILEINFO_MIME_TYPE);
                    $mimeType = $finfo->file($value->getRealPath());
                    if ($mimeType !== $allowedExtensions[$extension]) {
                        $fail(__('messages.invalid_mime_type', ['ext' => $extension, 'mime' => $mimeType]));
                    }
                }
            ]
        ], [
            'files.required' => __('messages.files_required'),
            'files.*.file' => __('messages.files_file'),
            'files.*.max' => __('messages.files_max'),
            'files.min' => __('messages.files_min'),
            'files.max' => __('messages.files_max_count', ['count' => 10])
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $newContents = [];
        $newNames = [];

        foreach ($request->file('files') as $file) {
            try {
                $content = file_get_contents($file->getRealPath());
                $extension = strtolower($file->getClientOriginalExtension());

                if (in_array($extension, ['txt', 'md', 'html', 'htm', 'css', 'js', 'json', 'xml', 'yaml', 'yml'])) {
                    $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');
                }

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
                        Log::error('Error parsing PDF: ' . $e->getMessage());
                        throw new Exception(__('messages.failed_parse_pdf'));
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
                        Log::error('Error parsing DOCX: ' . $e->getMessage());
                        throw new Exception(__('messages.failed_parse_docx'));
                    }
                } else {
                    $newContents[] = $content;
                }
                //antes de guardar el archivo, se sanitiza el nombre del archivo
                $sanitizedName = preg_replace('/[^a-zA-Z0-9_\-.]/', '_', $file->getClientOriginalName());

                $timestampName = time() . '_' . $sanitizedName;
                $file->storeAs('uploads', $timestampName, 'local');

                $newNames[] = $file->getClientOriginalName();
            } catch (Exception $e) {
                Log::error('Error processing file: ' . $e->getMessage());
                return back()->withErrors(['files' => __('messages.error_processing_file', ['name' => $file->getClientOriginalName()])]);
            }
        }

        $SecContents = [];

        foreach ($newContents as $content) {
            try {
                $completePrompt = $this->BuildSecurityPrompt($content);
                $rawResponse = $geminiService->generateText($completePrompt);
                $jsonResponse = $this->extractJsonFromResponse($rawResponse);

                if (empty($jsonResponse) || !isset($jsonResponse['score']) || json_last_error() !== JSON_ERROR_NONE) {
                    Log::error('Invalid JSON response from Gemini');
                    return redirect()->back()->with('error', __('messages.gemini_empty_response'));
                }

                $SecContents[] = $jsonResponse;
            } catch (Exception $e) {
                Log::error('Error in Gemini API call: ' . $e->getMessage());
                $SecContents[] = [
                    'filename' => 'unknown',
                    'error' => __('messages.gemini_api_error')
                ];
                continue;
            }
        }

        $request->session()->put('SecContents', array_merge(
            $request->session()->get('SecContents', []),
            $SecContents
        ));

        $request->session()->put('SecNames', array_merge(
            $request->session()->get('SecNames', []),
            $newNames
        ));

        $request->session()->save();

        return redirect()->back()->with('success', count($newNames) === 1 ? __('messages.file_security_success') : __('messages.files_security_success', ['count' => count($newNames)]));
    }


    /**
     * Verifica si una URL es segura contra ataques SSRF
     * 
     * @param string $url La URL a verificar
     * @return bool True si la URL es segura, false en caso contrario
     */
    protected function isUrlSafe(string $url): bool
    {
        $parsedUrl = parse_url($url);
        
        // Lista de dominios permitidos
        $allowedDomains = [
            'www.google.com',
            'googleapis.com',
            'api.openai.com',
            // Añadir otros dominios confiables según sea necesario
        ];
        
        // Lista de IPs y rangos bloqueados
        $blockedIPs = [
            '127.0.0.1',
            '0.0.0.0',
            '::1',
            'localhost',
            '169.254.',
            '10.',
            '172.16.',
            '172.17.',
            '172.18.',
            '172.19.',
            '172.20.',
            '172.21.',
            '172.22.',
            '172.23.',
            '172.24.',
            '172.25.',
            '172.26.',
            '172.27.',
            '172.28.',
            '172.29.',
            '172.30.',
            '172.31.',
            '192.168.'
        ];
        
        // Obtener el host de la URL
        $host = $parsedUrl['host'] ?? '';
        
        // Si el host está vacío, no es seguro
        if (empty($host)) {
            return false;
        }
        
        // Verificar si el host es una dirección IP
        $isIP = filter_var($host, FILTER_VALIDATE_IP);
        
        // Verificar si el host está en la lista de IPs/rangos bloqueados
        if ($isIP) {
            foreach ($blockedIPs as $blockedIP) {
                if (strpos($host, $blockedIP) === 0) {
                    return false;
                }
            }
        }
        
        // Verificar si el host es un dominio permitido
        $isDomainAllowed = false;
        foreach ($allowedDomains as $domain) {
            if ($host === $domain || substr($host, -(strlen($domain) + 1)) === ".$domain") {
                $isDomainAllowed = true;
                break;
            }
        }
        
        return $isDomainAllowed;
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

