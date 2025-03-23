<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Cambiar la ruta principal para redirigir directamente al dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Hacer que el dashboard sea accesible sin autenticación usando Inertia
Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->name('dashboard');

require __DIR__.'/settings.php';

// Elimina este require para quitar rutas de autenticación
// require __DIR__.'/auth.php';
