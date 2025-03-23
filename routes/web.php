<?php

use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Cambiar la ruta principal para redirigir directamente al dashboard
Route::get('/', function () {
    return Inertia::render('dashboard');
})->name('dashboard');

// Hacer que el dashboard sea accesible sin autenticación usando Inertia
Route::get('/dashboard', function () {
    return Inertia::render('dashboard');
})->name('dashboard');


Route::get('/upload', [UploadController::class, 'index'])->name('upload.index');
Route::post('/upload', [UploadController::class, 'store'])->name('upload.store');





require __DIR__.'/settings.php';

// Elimina este require para quitar rutas de autenticación
// require __DIR__.'/auth.php';
