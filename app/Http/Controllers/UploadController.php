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
        // Definir las extensiones permitidas
        $allowedExtensions = [
            'pdf', 'docx', 'c', 'cpp', 'h', 'cs', 'java', 'kt', 'kts', 'swift', 'go', 'rs', 'dart', 'py', 'rb', 'pl', 'php',
            'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'js', 'jsx', 'vue', 'svelte', 'sql', 'db', 'sqlite',
            'sqlite3', 'mdb', 'accdb', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'env', 'sh', 'bat', 'ps1', 'twig', 'ejs',
            'pug', 'md', 'ipynb', 'r', 'mat', 'asm', 'f90', 'f95', 'txt'
        ];

        // Lista de MIME types explícitamente prohibidos
        $forbiddenMimes = [
            'application/x-msdownload', // .exe, .dll
            'application/x-msdos-program',
            'application/x-dosexec',
            'application/x-executable',
            'application/x-mach-binary',
            'application/x-elf',
            'application/x-sharedlib',
            'application/x-object',
            'application/x-pie-executable',
            'application/x-msi',
            'application/x-bat',
            'application/x-cmd',
            'application/x-php',
            'application/x-python',
            'application/x-perl',
            'application/x-ruby',
            'application/x-shellscript',
            'application/x-powershell',
            'application/x-csh',
            'application/x-tcl',
            'application/x-script',
            'application/octet-stream', // genérico, solo bloquear si extensión no es de confianza
        ];

        // Validar los archivos subidos con límite de 20 archivos y comprobación de extensión y mimetype peligroso
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|min:1|max:20',
            'files.*' => [
                'required',
                'file',
                'max:2048',
                function ($attribute, $value, $fail) use ($allowedExtensions, $forbiddenMimes) {
                    $extension = strtolower($value->getClientOriginalExtension());
                    if (!in_array($extension, $allowedExtensions)) {
                        $fail(__('messages.extension_not_allowed', ['ext' => $extension]));
                        return;
                    }
                    // Validar mimetype solo para bloquear tipos peligrosos
                    $finfo = new \finfo(FILEINFO_MIME_TYPE);
                    $mimeType = $finfo->file($value->getRealPath());
                    if (in_array($mimeType, $forbiddenMimes)) {
                        $fail(__('messages.invalid_mime_type', ['ext' => $extension, 'mime' => $mimeType]));
                        return;
                    }
                    // Si es octet-stream, solo permitir si la extensión es de confianza (ya validado arriba)
                    // No bloquear por mimetype desconocido si la extensión es válida
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
                //antes de guardar el archivo, se sanitiza el nombre del archivo
                $sanitizedName = preg_replace('/[^a-zA-Z0-9_\-.]/', '_', $file->getClientOriginalName());

                // Almacenar el archivo en un directorio no público
                $timestampName = time() . '_' . $sanitizedName;
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
