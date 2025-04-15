<?php

use App\Http\Controllers\RefactorController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Mostrar el mismo contenido en la ruta principal y en dashboard
Route::get('/', [UploadController::class, 'index'])->name('home');
Route::get('/dashboard', [UploadController::class, 'index'])->name('dashboard');
Route::get('/refactor-dashboard', [RefactorController::class, 'index'])->name('refactor.index');
Route::post('/upload', [UploadController::class, 'store'])->name('upload.store');
Route::post('/process', [RefactorController::class, 'process'])->name('refactor.process');
Route::post('/clear-session', [UploadController::class, 'clearSession'])->name('clear.session');


Route::get('/terms', function () {
    return Inertia::render('TAndC');
})->name('terms');

// Nueva ruta para probar la API de Gemini
Route::get('/test-gemini-api', [RefactorController::class, 'testApi'])->name('gemini.test');
Route::get('/list-gemini-models', [RefactorController::class, 'listModels'])->name('gemini.models');

require __DIR__.'/settings.php';



// Elimino este require para quitar rutas de autenticación
// require __DIR__.'/auth.php';
