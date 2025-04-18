<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use function Laravel\Prompts\clear;
use function PHPUnit\Framework\throwException;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;

class UploadController extends Controller
{
    public function index()
    {
        try {
            // Eliminar la línea que borra la sesión
            return Inertia::render('dashboard', [
                'contents' => session('contents', []),
                'names' => session('names', [])
            ]);
        } catch (Exception $e) {
            error_log('Error en index: ' . $e->getMessage());
            return Inertia::render('dashboard', [
                'contents' => [],
                'names' => [],
                'error' => 'Error al cargar dashboard: ' . $e->getMessage()
            ]);
        }
    }

    public function store(Request $request)
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
                        throw new Exception("Failed to parse the .pdf file: " . $e->getMessage());
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
                    } catch(Exception $e) {
                        throw new Exception("Failed to parse the .docx file: " . $e->getMessage());
                    }
                } else {
                    //$cleanText = trim(preg_replace('/\s+/', ' ', $content));
                    $newContents[] = $content;
                }

                $timestampName = time().'_'.$file->getClientOriginalName();

                $file->storeAs('uploads', $timestampName, 'public');
                $newNames[] = $file->getClientOriginalName();
            } catch (Exception $e) {
                return back()->withErrors(['files' => 'Error al procesar: '.$file->getClientOriginalName()]);
            }
        }

        // Actualizar sesión
        $request->session()->put('contents', array_merge(
            $request->session()->get('contents', []),
            $newContents
        ));

        $request->session()->put('names', array_merge(
            $request->session()->get('names', []),
            $newNames
        ));

        $request->session()->save(); //guardamos la sesion de forma explicita //

        return redirect()->back()->with('success', count($newNames) === 1 ? 'File upload successfully' : count($newNames) . ' files uploaded successfully');
    }

    public function clearSession(Request $request)
    {
        $request->session()->forget(['contents', 'names']);
        $request->session()->save(); //guardamos la sesion de forma explicita //
        return redirect()->back()->with([
            'success' => 'Historial cleared',
        ]);
    }
}
