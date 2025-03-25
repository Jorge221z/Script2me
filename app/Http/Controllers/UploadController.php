<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UploadController extends Controller
{

    public function store(Request $request)
    {
        $request -> validate([
            'files' => 'required|array', //lo pasamos como array para poder subir varios archivos a la vez //
            'files.*' => 'required','file','max:2048',
            function ($attribute, $value, $fail) {
                $extension = strtolower($value->getClientOriginalExtension());
                $allowedExtensions = ['c', 'cpp', 'h', 'cs', 'java', 'kt', 'kts', 'swift', 'go', 'rs', 'dart', 'py', 'rb', 'pl', 'php', 'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'js', 'jsx', 'vue', 'svelte', 'sql', 'db', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'env', 'sh', 'bat', 'ps1', 'twig', 'ejs', 'pug', 'md', 'ipynb', 'r', 'mat', 'asm', 'f90', 'f95', 'txt'];

                if (!in_array($extension, $allowedExtensions)) {
                    $fail('La extensión del archivo no está soportada.');
                }
            }
        ],[
            'files.required' => 'Upload at least one file',
            'files.*.file' => 'Each element must be a valid file',
            'files.*.max' => 'Files must not exceed 2MB ',
            'files.*.mimes' => 'The file extension is not supported :values',
            'files.min' => 'Debes subir al menos un archivo',
        ]);

        $contents = []; //almacenara el contenido de los archivos
        $names = []; //almacenara los nombres completos de los archivos(con la extension tambien) //

        foreach($request->file('files') as $file) { //obtenemos todos los archivos del campo files del formulario//
                $contents[] = file_get_contents($file->path());
                $names[] = $file->getClientOriginalName();
                //despues de leer el contenido, almacenamos //
                $file->store('uploads', 'public'); //usamos el sistema de almacenamiento de Laravel //
        }

        return Inertia::render('dashboard', ['contents' => $contents, 'names' => $names, 'success' => 'Upload completed succesfully']);
    }

}
