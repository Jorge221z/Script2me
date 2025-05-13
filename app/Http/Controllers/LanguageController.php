<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;

class LanguageController extends Controller
{
    /**
     * Idiomas soportados por la aplicación
     */
    protected $supportedLanguages = ['en', 'es'];

    /**
     * Switch application language
     *
     * @param string $lang
     * @return \Illuminate\Http\Response
     */
    public function switchLang($lang)
    {
        try {
            if (!in_array($lang, $this->supportedLanguages)) {
                return $this->errorResponse('Idioma no soportado: ' . $lang);
            }

            // 1. Guardar en sesión
            Session::put('locale', $lang);
            Session::save(); // Forzar guardado inmediato

            // 2. Establecer también en cookie para persistencia entre sesiones
            Cookie::queue(Cookie::make('locale', $lang, 60 * 24 * 365)); // 1 año

            // 3. Configurar locale para la solicitud actual
            App::setLocale($lang);

            // Si es una petición AJAX, devuelve una respuesta JSON
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Language changed successfully',
                    'locale' => $lang
                ]);
            }

            // 4. Redirigir con flash de éxito (ya en el idioma correcto)
            return redirect()->back()->with('success', __('messages.language_changed'));

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
