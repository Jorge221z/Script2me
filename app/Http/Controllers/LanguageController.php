<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Log;

class LanguageController extends Controller
{
    /**
     * Switch application language
     * 
     * @param string $lang
     * 
     */
    public function switchLang($lang)
    {
        try {
            if (!in_array($lang, ['en', 'es'])) {
                return $this->errorResponse('Idioma no soportado: ' . $lang);
            }

            // Guardar en sesión y configurar locale
            Session::put('locale', $lang);
            App::setLocale($lang);
            
            // Si es una petición AJAX, devuelve una respuesta JSON
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Language changed successfully',
                    'locale' => $lang
                ]);
            }

            return redirect()->back();

        } catch (\Exception $e) {
            Log::error('Error changing language: ' . $e->getMessage(), [
                'lang' => $lang,
                'trace' => $e->getTraceAsString()
            ]);

            if (request()->ajax() || request()->wantsJson()) {
                return $this->errorResponse('Error al cambiar el idioma');
            }

            return redirect()->back()->with('error', 'Error al cambiar el idioma');
        }
    }

    /**
     * Get current application language
     * 
     * @return \Illuminate\Http\Response
     */
    public function getCurrentLanguage()
    {
        $locale = Session::get('locale', config('app.locale'));
        
        return response()->json([
            'success' => true,
            'locale' => $locale
        ]);
    }

    /**
     * Return error response
     * 
     * @param string $message
     * @param int $code
     * @return \Illuminate\Http\JsonResponse
     */
    private function errorResponse($message, $code = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], $code);
    }
}
