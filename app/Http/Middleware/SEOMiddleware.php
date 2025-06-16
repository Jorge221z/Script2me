<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SEOMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Solo aplicar a respuestas HTML
        if ($response->headers->get('Content-Type') === 'text/html; charset=UTF-8' ||
            str_contains($response->headers->get('Content-Type', ''), 'text/html')) {

            // Agregar headers de SEO y rendimiento
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
            $response->headers->set('X-XSS-Protection', '1; mode=block');
            $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

            // Cache headers para páginas estáticas
            if ($request->is('/', 'landing', 'home')) {
                $response->headers->set('Cache-Control', 'public, max-age=3600'); // 1 hora
            }

            // Preload critical resources
            if ($request->is('/', 'landing', 'home')) {
                $response->headers->set('Link', [
                    '</images/logo.png>; rel=preload; as=image',
                    '</build/assets/app.css>; rel=preload; as=style',
                    '</build/assets/app.js>; rel=preload; as=script'
                ], false);
            }
        }

        return $response;
    }
}
