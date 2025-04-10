<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use App\Services\HuggingFaceService;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;
use Exception;
use Illuminate\Support\Facades\Log;

class RefactorController extends Controller
{
    public function index()
    {
        try {
            // Eliminar la línea que borra la sesión
            return Inertia::render('refactorDashboard', [
                'contents' => session('contents', []),
                'names' => session('names', [])
            ]);
        } catch (Exception $e) {
            error_log('Error en index: ' . $e->getMessage());
            return Inertia::render('refactorDashboard', [
                'contents' => [],
                'names' => [],
                'error' => 'Error al cargar refactor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Prueba la conexión a la API de Hugging Face
     */
    public function testApi()
    {
        try {
            $apiKey = config('services.huggingface.api_key');

            if (empty($apiKey)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'API key de Hugging Face no configurada'
                ]);
            }

            // Usar Guzzle directamente en lugar de Kambo
            $client = new Client();
            $model = 'codellama/CodeLlama-13b-hf';
            $prompt = "Hola, ¿estás funcionando correctamente?";

            $response = $client->post("https://api-inference.huggingface.co/models/{$model}", [
                'headers' => [
                    'Authorization' => "Bearer {$apiKey}",
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'inputs' => $prompt,
                    'parameters' => [
                        'max_new_tokens' => 100,
                        'temperature' => 0.7,
                    ],
                ],
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            return response()->json([
                'status' => 'success',
                'message' => 'API de Hugging Face funcionando correctamente',
                'response' => $result[0]['generated_text'] ?? 'No se recibió respuesta específica'
            ]);
        } catch (GuzzleException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al conectar con la API de Hugging Face',
                'error' => $e->getMessage()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al procesar la respuesta',
                'error' => $e->getMessage()
            ]);
        }
    }

    // protected $huggingFaceService;

    // public function __construct(HuggingFaceService $huggingFaceService)
    // {
    //     $this->huggingFaceService = $huggingFaceService;
    // }

    // Cambiar el nombre del método process a refactor para que coincida con la ruta en web.php
    public function process(Request $request)
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
                        $fail("La extensión .$extension no está permitida.");
                    }
                }
            ]
        ], [
            'files.required' => 'Debes subir al menos un archivo',
            'files.*.file' => 'Cada elemento debe ser un archivo válido',
            'files.*.max' => 'Los archivos no deben exceder 2MB',
            'files.min' => 'Debes subir al menos un archivo'
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

                if ($extension === 'pdf') { //bucle para procesar pdfs
                    try {
                        $parser = new \Smalot\PdfParser\Parser();
                        $pdf = $parser->parseContent($content);
                        $text = $pdf->getText();

                        $cleanText = trim(preg_replace('/\s+/', ' ', $text));
                        $newContents[] = $cleanText;
                    } catch (Exception $e) {
                        throw new Exception("Failed to parse the .pdf file: " . $e->getMessage());
                    }
                } else if ($extension === 'docx') { //bucle para procesar docx
                    try {
                        $phpWord = IOFactory::load($file->getRealPath());
                        $text = '';
                        foreach ($phpWord->getSections() as $section) {
                            foreach ($section->getElements() as $element) {
                                if ($element instanceof Text) {
                                    // Elemento de texto simple
                                    $text .= $element->getText() . ' ';
                                } elseif ($element instanceof TextRun) {
                                    // Elemento que contiene varios textos
                                    foreach ($element->getElements() as $child) {
                                        if ($child instanceof Text) {
                                            $text .= $child->getText() . ' ';
                                        }
                                    }
                                }
                            }
                        }
                        $cleanText = trim(preg_replace('/\s+/', ' ', $text));
                        $newContents[] = $cleanText;
                    } catch (Exception $e) {
                        throw new Exception("Failed to parse the .docx file: " . $e->getMessage());
                    }
                } else {
                    $cleanText = trim(preg_replace('/\s+/', ' ', $content));
                    $newContents[] = $cleanText;
                }

                $timestampName = time() . '_' . $file->getClientOriginalName();

                $file->storeAs('uploads', $timestampName, 'public');
                $newNames[] = $file->getClientOriginalName();
            } catch (Exception $e) {
                return back()->withErrors(['files' => 'Error al procesar: ' . $file->getClientOriginalName()]);
            }
        }
        //Aqui manejamos la llamda a la api de huggingface//
        $apiContent = [];
        $apiKey = config('services.huggingface.api_key'); // Obtener el API key desde la config

        // Usar el mismo cliente y modelo que funciona en testApi
        $httpClient = new Client();
        $model = 'codellama/CodeLlama-13b-hf'; // Usar el mismo modelo que funciona en testApi

        foreach ($newContents as $index => $content) {
            try {
                // Crear el prompt con instrucciones + código
                $prompt = "Refactoriza el siguiente código para que sea más legible, elimina bloques que hagan referencia a los estilos si los hay y haz que siga las mejores prácticas de programación. Devuelve solo el código refactorizado, sin explicaciones adicionales:\n\n" . $content;

                $response = $httpClient->post("https://api-inference.huggingface.co/models/{$model}", [
                    'headers' => [
                        'Authorization' => "Bearer {$apiKey}",
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'inputs' => $prompt,
                        'parameters' => [
                            'max_new_tokens' => 2000, // Aumentar para permitir respuestas más largas
                            'temperature' => 0.7,
                            'return_full_text' => false, // Para obtener solo la respuesta generada
                        ],
                    ],
                    'timeout' => 120, // Aumentar timeout para archivos grandes
                    'connect_timeout' => 10, // Tiempo de conexión
                ]);

                $responseBody = $response->getBody()->getContents();
                $result = json_decode($responseBody, true);

                // Mejorado el procesamiento de la respuesta para garantizar que se almacene el texto generado
                if (is_array($result) && isset($result[0]['generated_text'])) {
                    // Formato estándar de respuesta de Hugging Face
                    $apiContent[] = $result[0]['generated_text'];
                } elseif (is_array($result) && !empty($result)) {
                    // Otro formato de array, buscamos texto generado en cualquier campo
                    $text = '';
                    array_walk_recursive($result, function($item, $key) use (&$text) {
                        if (is_string($item) && (
                            $key === 'generated_text' ||
                            $key === 'text' ||
                            strpos($key, 'text') !== false
                        )) {
                            $text .= $item . "\n";
                        }
                    });
                    $apiContent[] = !empty($text) ? $text : 'Respuesta de la API sin texto generado identificable';
                } elseif (is_string($result)) {
                    // Si ya es un string, lo usamos directamente
                    $apiContent[] = $result;
                } else {
                    // Si nada funciona, convertimos a JSON para visualización
                    $apiContent[] = 'Formato de respuesta no estándar: ' . json_encode($result);
                    // Añadir a log para debugging
                    Log::debug('Respuesta API no estándar: ' . $responseBody);
                }
            } catch (GuzzleException $e) {
                // Manejar específicamente errores de Guzzle
                return back()->withErrors(['apiError' => 'Error de conexión con la API: ' . $e->getMessage()]);
            } catch (Exception $e) {
                return back()->withErrors(['apiError' => 'Error al procesar la respuesta: ' . $e->getMessage()]);
            }
        }

        // Actualizar sesión con el contenido de la API
        $request->session()->put('contents', array_merge(
            $request->session()->get('contents', []),
            $apiContent
        ));

        $request->session()->put('names', array_merge(
            $request->session()->get('names', []),
            $newNames
        ));

        return redirect()->back()->with('success', 'Archivos subidos correctamente');
    }
}
