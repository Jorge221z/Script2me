<?php

use App\Http\Controllers\LandingController;
use App\Http\Controllers\RefactorController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// SEO Routes
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');

// Redirect root URL to landing page
Route::get('/', function() {
    return redirect('/home');
});
Route::get('/dashboard', [UploadController::class, 'index'])->name('dashboard');
Route::get('/refactor-dashboard', [RefactorController::class, 'index'])->name('refactor.index');
Route::get('/security-dashboard', [SecurityController::class, 'index'])->name('security.index');
Route::get('/home', [LandingController::class, 'index'])->name('landing.index');
Route::get('/landing', [LandingController::class, 'index'])->name('landing.alt');

Route::post('/upload', [UploadController::class, 'store'])->name('upload.store');
Route::post('/process', [RefactorController::class, 'process'])->name('refactor.process');
Route::post('/scan', [SecurityController::class, 'scan'])->name('security.scan');

Route::post('/clear-session', [UploadController::class, 'clearSession'])->name('clear.session');
Route::post('/clear-api-session', [RefactorController::class, 'clearApiSession'])->name('clear.apisession');
Route::post('/clear-sec-session', [SecurityController ::class, 'clearSecSession'])->name('clear.secsession');

// Language Routes - Usar definiciones explícitas para evitar problemas
Route::get('/lang/{lang}', [\App\Http\Controllers\LanguageController::class, 'switchLang'])->name('lang.switch');
Route::get('/api/current-language', [\App\Http\Controllers\LanguageController::class, 'getCurrentLanguage'])->name('lang.current');

Route::get('/terms', function () {
    return Inertia::render('TAndC');
})->name('terms');

// Nuevas rutas para probar la API de Gemini
Route::get('/list-gemini-models', [RefactorController::class, 'listModels'])->name('gemini.models');

require __DIR__.'/settings.php';



// Elimino este require para quitar rutas de autenticación
// require __DIR__.'/auth.php';
