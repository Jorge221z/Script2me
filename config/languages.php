<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Idiomas soportados por la aplicación
    |--------------------------------------------------------------------------
    |
    | Lista de códigos de idioma que la aplicación soporta oficialmente.
    |
    */
    'supported' => ['en', 'es'],

    /*
    |--------------------------------------------------------------------------
    | Idioma por defecto
    |--------------------------------------------------------------------------
    |
    | El idioma que se usará cuando no se pueda determinar el idioma del usuario
    | o cuando se especifique un idioma no soportado.
    |
    */
    'default' => env('APP_LOCALE', 'es'),
];
