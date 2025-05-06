<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
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
                'error' => __('messages.dashboard_load_error', ['msg' => $e->getMessage()])
            ]);
        }
    }

    public function store(Request $request)
    {
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

        // Validar los archivos subidos con límite de 20 archivos y comprobación de tipo MIME
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
                // Leer el contenido ANTES de almacenar y/o procesar
                $content = file_get_contents($file->getRealPath());
                $extension = strtolower($file->getClientOriginalExtension());

                // Sanitizar el contenido según el tipo de archivo
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

                // Almacenar el archivo en un directorio no público
                $timestampName = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('uploads', $timestampName, 'local');

                $newNames[] = $file->getClientOriginalName();
            } catch (Exception $e) {
                Log::error('Error processing file: ' . $e->getMessage());
                return back()->withErrors(['files' => __('messages.error_processing_file', ['name' => $file->getClientOriginalName()])]);
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

        return redirect()->back()->with('success', count($newNames) === 1
            ? __('messages.file_upload_success')
            : __('messages.files_upload_success', ['count' => count($newNames)]));
    }


    public function clearSession(Request $request)
    {
        $request->session()->forget(['contents', 'names']);
        $request->session()->save(); //guardamos la sesion de forma explicita //
        return redirect()->back()->with([
            'success' => __('messages.history_cleared'),
        ]);
    }
}
