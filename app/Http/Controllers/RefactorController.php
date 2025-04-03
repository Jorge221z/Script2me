<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

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
}
