<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class UploadController extends Controller
{

    public function store(Request $request)
    {
        $allowedExtensions = ['c', 'cpp', 'h', 'cs', 'java', 'kt', 'kts', 'swift', 'go', 'rs', 'dart', 'py', 'rb', 'pl', 'php', 'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'js', 'jsx', 'vue', 'svelte', 'sql', 'db', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'env', 'sh', 'bat', 'ps1', 'twig', 'ejs', 'pug', 'md', 'ipynb', 'r', 'mat', 'asm', 'f90', 'f95', 'txt'];

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

    $contents = [];
    $names = [];

    foreach ($request->file('files') as $file) {
        try {
            // Almacenar primero
            $file->store('uploads', 'public');

            // Leer contenido después de almacenar (más seguro)
            $contents[] = file_get_contents($file->getRealPath());
            $names[] = $file->getClientOriginalName();
        } catch (\Exception $e) {
            return back()->withErrors(['files' => 'Error al procesar: '.$file->getClientOriginalName()]);
        }
    }

        return Inertia::render('dashboard',
        ['contents' => $contents,
        'names' => $names,
        'success' => 'Upload completed succesfully']);
    }

}
