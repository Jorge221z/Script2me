<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

use function PHPUnit\Framework\throwException;

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
        } catch (\Exception $e) {
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
        $allowedExtensions = ['pdf','c', 'cpp', 'h', 'cs', 'java', 'kt', 'kts', 'swift', 'go', 'rs', 'dart', 'py', 'rb', 'pl', 'php', 'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'js', 'jsx', 'vue', 'svelte', 'sql', 'db', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'env', 'sh', 'bat', 'ps1', 'twig', 'ejs', 'pug', 'md', 'ipynb', 'r', 'mat', 'asm', 'f90', 'f95', 'txt'];

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

                if (strtolower($file->getClientOriginalExtension()) === 'pdf') { //bucle para procesar pdfs
                    try {
                        $parser = new \Smalot\PdfParser\Parser();
                        $pdf = $parser->parseContent($content);
                        $text = $pdf->getText();
                    } catch(Exception $e) {
                        throw new Exception("Failed to parse the .pdf file: " . $e->getMessage());
                    }
                    $newContents[] = $text;
                } else {
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

        return redirect()->back()->with('success', 'Archivos subidos correctamente');
    }

    public function clearSession(Request $request)
    {
        $request->session()->forget(['contents', 'names']);
        return redirect()->route('dashboard')->with('success', 'Historial limpiado');
    }
}
