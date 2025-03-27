<?php

use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Cambiar la ruta principal para redirigir directamente al dashboard
Route::redirect('/', '/dashboard')->name('home');
Route::get('/dashboard', [UploadController::class, 'index'])->name('dashboard');
Route::post('/upload', [UploadController::class, 'store'])->name('upload.store');
Route::post('/clear-session', [UploadController::class, 'clearSession'])->name('clear.session');


require __DIR__.'/settings.php';

// Elimina este require para quitar rutas de autenticación
// require __DIR__.'/auth.php';
