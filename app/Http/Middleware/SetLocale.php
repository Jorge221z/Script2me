<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;

class SetLocale
{
    protected $supportedLanguages = ['en', 'es'];

    public function handle($request, Closure $next)
    {
        try {
            // Primero intentamos obtener el idioma de la sesión
            $locale = Session::get('locale');

            // Si no está en la sesión, intentamos obtenerlo de la cookie
            if (!$locale) {
                $locale = $request->cookie('locale');
            }

            // Si sigue sin estar disponible, usamos el valor predeterminado
            if (!$locale) {
                $locale = config('app.locale');
            }

            // Nos aseguramos de que sea un idioma soportado
            if (!in_array($locale, $this->supportedLanguages)) {
                $locale = config('app.locale');
            }

            // Establecer el idioma en la aplicación
            App::setLocale($locale);

            // Guardar en sesión para mantenerlo consistente
            Session::put('locale', $locale);

            // Continuamos con la solicitud
            $response = $next($request);

            // Si es una respuesta HTTP, establecemos o actualizamos la cookie
            if (method_exists($response, 'withCookie')) {
                $response->withCookie(cookie('locale', $locale, 60 * 24 * 365)); // 1 año
            }

            return $response;
        } catch (\Exception $e) {
            // En caso de error, registrar pero no interrumpir
            Log::error('Error in SetLocale middleware: ' . $e->getMessage());

            // Establecer idioma por defecto
            App::setLocale(config('app.locale'));

            // Continuar con la solicitud
            return $next($request);
        }
    }
}
