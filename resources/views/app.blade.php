<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'light') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- SEO Meta Tags --}}
        <meta name="description" content="Script2me - Herramientas de IA para desarrolladores. Refactoriza código, construye prompts y escanea vulnerabilidades con inteligencia artificial.">
        <meta name="keywords" content="AI, refactoring, code analysis, prompt builder, security scanner, development tools, inteligencia artificial, herramientas desarrollo">
        <meta name="author" content="Script2me">
        <meta name="robots" content="index, follow">
        <meta name="language" content="{{ app()->getLocale() }}">

        {{-- Open Graph Meta Tags --}}
        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ config('app.name', 'Script2me') }} - Herramientas de IA para Desarrolladores">
        <meta property="og:description" content="Potencia tu desarrollo con herramientas de IA: refactorización inteligente, construcción de prompts y análisis de seguridad.">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:site_name" content="{{ config('app.name', 'Script2me') }}">
        <meta property="og:image" content="{{ asset('images/logo.png') }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">

        {{-- Twitter Card Meta Tags --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config('app.name', 'Script2me') }} - Herramientas de IA para Desarrolladores">
        <meta name="twitter:description" content="Potencia tu desarrollo con herramientas de IA: refactorización inteligente, construcción de prompts y análisis de seguridad.">
        <meta name="twitter:image" content="{{ asset('images/logo.png') }}">

        {{-- Favicon and Apple Touch Icons --}}
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/logo.png') }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/favicon.ico') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('images/favicon.ico') }}">

        {{-- Canonical URL --}}
        <link rel="canonical" href="{{ url()->current() }}">

        {{-- Structured Data --}}
        @if(request()->is('/') || request()->is('landing'))
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Script2me",
            "description": "Herramientas de IA para desarrolladores que incluyen refactorización de código, construcción de prompts y análisis de seguridad.",
            "url": "{{ config('app.url') }}",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "creator": {
                "@type": "Organization",
                "name": "Script2me"
            },
            "featureList": [
                "Refactorización inteligente de código",
                "Constructor de prompts de IA",
                "Análisis de seguridad automatizado",
                "Soporte para múltiples lenguajes de programación"
            ]
        }
        </script>
        @endif

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "light" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Script2me') }}</title>

        {{-- Preconnect to external domains --}}
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite('resources/js/app.tsx')
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
