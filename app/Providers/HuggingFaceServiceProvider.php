<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use GuzzleHttp\Client;

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
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
