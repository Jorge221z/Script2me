<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Config;

class GeminiService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    public function __construct()
    {
        $this->apiKey = Config::get('services.gemini.api_key');
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    public function generateText($prompt, $model = 'gemini-2.0-flash-001')
    {
        try {
            $response = $this->client->post("/v1beta/models/{$model}:generateContent?key={$this->apiKey}", [
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                ],
            ]);
            $data = json_decode($response->getBody(), true);
            return $data['candidates'][0]['content']['parts'][0]['text'];
        } catch (GuzzleException $e) {
            throw new \Exception('Error en la solicitud a Gemini: ' . $e->getMessage());
        }
    }

    public function listModels()
    {
        try {
            $response = $this->client->get("/v1beta/models?key={$this->apiKey}");
            $data = json_decode($response->getBody(), true);
            return $data['models'];
        } catch (GuzzleException $e) {
            throw new \Exception('Error al listar los modelos: ' . $e->getMessage());
        }
    }
}