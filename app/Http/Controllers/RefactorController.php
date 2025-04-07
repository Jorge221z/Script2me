<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use GuzzleHttp\Client;
use App\Services\HuggingFaceService;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;
use Exception;

class RefactorController extends Controller
{
    public function index()
    {
        try {
            // Eliminar la línea que borra la sesión
            return Inertia::render('refactor', [
                'contents' => session('contents', []),
                'names' => session('names', [])
            ]);
        } catch (\Exception $e) {
            error_log('Error en index: ' . $e->getMessage());
            return Inertia::render('refactor', [
                'contents' => [],
                'names' => [],
                'error' => 'Error al cargar refactor: ' . $e->getMessage()
            ]);
        }
    }



    protected $huggingFaceService;

    public function __construct(HuggingFaceService $huggingFaceService)
    {
        $this->huggingFaceService = $huggingFaceService;
    }

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

                    } catch(Exception $e) {
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


                 } catch(Exception $e) {
                    throw new Exception("Failed to parse the .docx file: " . $e->getMessage());
                 }

                } else {
                    $cleanText = trim(preg_replace('/\s+/', ' ', $content));
                    $newContents[] = $cleanText;
                }

                $timestampName = time().'_'.$file->getClientOriginalName();

                $file->storeAs('uploads', $timestampName, 'public');
                $newNames[] = $file->getClientOriginalName();
            } catch (Exception $e) {
                return back()->withErrors(['files' => 'Error al procesar: '.$file->getClientOriginalName()]);
            }
        }
        //Aqui manejamos la llamda a la api de huggingface//
        $apiContent = [];
        foreach ($newContents as $content) {
            try {
                $model = 'deepseek-ai/DeepSeek-V3';
                $inputs = ['text' => $content];
                $response = $this->huggingFaceService->queryModel($model, $inputs);
                $apiContent[] = $response['generated_text'] ?? 'No response from API';


            } catch (Exception $e) {
                return back()->withErrors(['apiError' => 'Error while trying to call the API: ' . $e->getMessage()]);
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
