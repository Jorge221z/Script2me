<?php

use App\Http\Controllers\RefactorController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Mostrar el mismo contenido en la ruta principal y en dashboard
Route::get('/', [UploadController::class, 'index'])->name('home');
Route::get('/dashboard', [UploadController::class, 'index'])->name('dashboard');
Route::get('/refactor', [RefactorController::class, 'index'])->name('refactor');
Route::post('/upload', [UploadController::class, 'store'])->name('upload.store');
Route::post('/clear-session', [UploadController::class, 'clearSession'])->name('clear.session');
Route::get('/terms', function () {
    return Inertia::render('TAndC');
})->name('terms');

require __DIR__.'/settings.php';

// Elimina este require para quitar rutas de autenticación
// require __DIR__.'/auth.php';
