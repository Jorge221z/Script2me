<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use GuzzleHttp\Client;
use App\Services\HuggingFaceService;

class HuggingFaceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void  //peticion a la api de hugging interface//
    {
        $this->app->singleton('huggingface', function ($app) {
            return new Client([
                'base_uri' => 'https://api-inference.huggingface.co/models/',
                'headers' => [
                    'Authorization' => 'Bearer ' . env('HUGGINGFACE_API_TOKEN'),
                    'Content-Type' => 'application/json',
                ]
            ]);
        });

        // Registrar el servicio
        $this->app->singleton(HuggingFaceService::class, function ($app) {
            return new HuggingFaceService($app->make('huggingface'));
        });

    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
