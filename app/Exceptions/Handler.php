<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Manejar excepciones específicamente para las rutas de API de idioma
        $this->renderable(function (Throwable $e, Request $request) {
            // Verificar si la solicitud es a la API de idioma
            if ($request->is('api/current-language') || $request->is('lang/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'An error occurred while processing your request: ' . $e->getMessage(),
                    'locale' => App::getLocale() // Siempre devolver el idioma actual
                ], 500);
            }
        });
    }
}
