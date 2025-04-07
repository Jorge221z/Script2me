<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class HuggingFaceService
{
    protected $client;

    public function __construct(Client $client)
    {
        $this->client = $client;
    }

    public function queryModel(string $model, array $inputs)
    {
        try {
            $response = $this->client->post($model, [
                'json' => [
                    'inputs' => $inputs,
                ],
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            throw new \Exception('Error while consulting the model: ' . $e->getMessage());
        }
    }
}
