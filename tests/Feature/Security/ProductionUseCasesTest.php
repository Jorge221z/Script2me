<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Services\GeminiService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductionUseCasesTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    /**
     * Test uploading files with complex but legitimate names.
     */
    public function testComplexFilenameHandling()
    {
        // Archivo con espacios y caracteres especiales
        $file1 = UploadedFile::fake()->createWithContent(
            'My Complex File Name (v2.3) [FINAL]!.js',
            'console.log("File with complex name");'
        );

        // Archivo con nombre muy largo
        $longName = str_repeat('a', 150) . '.php';
        $file2 = UploadedFile::fake()->createWithContent(
            $longName,
            '<?php echo "File with very long name"; ?>'
        );

        // Archivo con puntos intermedios en el nombre
        $file3 = UploadedFile::fake()->createWithContent(
            'config.production.v1.0.json',
            '{"version": "1.0", "environment": "production"}'
        );

        // Archivos con caracteres Unicode legítimos
        $file4 = UploadedFile::fake()->createWithContent(
            'résumé-français.txt',
            'Contenu en français avec des accents'
        );

        $file5 = UploadedFile::fake()->createWithContent(
            '日本語ファイル.js',
            'console.log("Japanese filename");'
        );

        $file6 = UploadedFile::fake()->createWithContent(
            'файл_на_русском.py',
            'print("Russian filename")'
        );

        // Archivo con emojis en el nombre (legítimo pero complicado)
        $file7 = UploadedFile::fake()->createWithContent(
            '🚀proyecto_final🔥.js',
            'console.log("Emoji filename");'
        );

        // Subir todos estos archivos al sistema
        $response = $this->post('/upload', [
            'files' => [$file1, $file2, $file3, $file4, $file5, $file6, $file7]
        ]);

        // Verificar respuesta exitosa
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');

        // Verificar que todos los archivos se procesaron correctamente
        $this->assertTrue(session()->has('contents'));
        $this->assertTrue(session()->has('names'));
        $this->assertEquals(7, count(session('contents')));
        $this->assertEquals(7, count(session('names')));

        // Verificar archivos almacenados (con nombres sanitizados)
        $filesInUploads = Storage::disk('local')->files('uploads');
        $this->assertEquals(7, count($filesInUploads));
    }

    /**
     * Test handling of files with legitimate but unusual code.
     */
    public function testUnusualCodeContent()
    {
        // Mock GeminiService
        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('generateText')
                ->andReturn('function optimized() { return true; }');
        });

        // Código con comentarios muy largos
        $fileWithLargeComment = UploadedFile::fake()->createWithContent(
            'large_comment.js',
            'function test() {
                // ' . str_repeat('This is a very long comment. ', 500) . '
                return true;
            }'
        );

        // Código con muchas líneas en blanco
        $fileWithManyBlankLines = UploadedFile::fake()->createWithContent(
            'many_blank_lines.js',
            "function test() {\n" . str_repeat("\n", 500) . "  return true;\n}"
        );

        // Código con caracteres unicode válidos
        $fileWithUnicode = UploadedFile::fake()->createWithContent(
            'unicode.js',
            'const message = "こんにちは世界"; // Hola mundo en japonés
            console.log(message);'
        );

        // Código mezclado HTML y JavaScript (legítimo pero complejo)
        $fileWithMixedContent = UploadedFile::fake()->createWithContent(
            'mixed.html',
            '<!DOCTYPE html>
            <html>
                <head>
                    <title>Mixed Content</title>
                    <script>
                        function greet() {
                            const name = document.getElementById("name").value;
                            alert(`Hola ${name}!`);
                        }
                    </script>
                    <style>
                        body { font-family: "Arial", sans-serif; }
                        .container { padding: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <input id="name" type="text" placeholder="Tu nombre">
                        <button onclick="greet()">Saludar</button>
                    </div>
                </body>
            </html>'
        );

        // Probar refactorizar estos archivos
        $response = $this->post('/process', [
            'files' => [$fileWithLargeComment, $fileWithManyBlankLines, $fileWithUnicode, $fileWithMixedContent]
        ]);

        // Verificar procesamiento exitoso
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');

        // Verificar contenido en sesión
        $this->assertTrue(session()->has('ApiContents'));
        $this->assertTrue(session()->has('ApiNames'));
        $this->assertEquals(4, count(session('ApiContents')));
    }

    /**
     * Test edge cases with mime types que son comunes en proyectos de programación.
     * Solo usa extensiones permitidas y contenido que no dispare la detección de PHP en archivos no PHP.
     */
    public function testEdgeCaseMimeTypes()
    {
        // Mock GeminiService para el escaneo de seguridad
        $this->mock(\App\Services\GeminiService::class, function ($mock) {
            $mock->shouldReceive('generateText')
                ->andReturn('{"score": 95, "summary": "No security issues found", "critical_lines": [], "vulnerabilities": []}');
        });

        // Archivo Markdown con código embebido - extensión permitida
        $markdownFile = UploadedFile::fake()->createWithContent(
            'documentation.md',
            '# Proyecto

            Este es un ejemplo de código:

            ```javascript
            function ejemplo() {
                return true;
            }
            ```

            Y aquí hay otro ejemplo:

            ```python
            def test():
                return True
            ```'
        );

        // Archivo de configuración con extensión permitida (.ini)
        $configFile = UploadedFile::fake()->createWithContent(
            'config.ini',
            'DB_HOST=localhost
            DB_USER=admin
            DB_PASS=secure_password
            API_KEY=abc123def456'
        );

        // Archivo XML (permitido)
        $xmlFile = UploadedFile::fake()->createWithContent(
            'config.xml',
            '<?xml version="1.0" encoding="UTF-8"?>
            <root>
                <element attribute="value">content</element>
                <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
            </root>'
        );

        // Archivo JSON (permitido)
        $jsonFile = UploadedFile::fake()->createWithContent(
            'analysis.json',
            '{
                "cells": [
                    {
                        "cell_type": "code",
                        "execution_count": 1,
                        "source": [
                            "import pandas as pd",
                            "import matplotlib.pyplot as plt",
                            "",
                            "data = pd.DataFrame({",
                            "    \"x\": [1, 2, 3, 4, 5],",
                            "    \"y\": [2, 4, 6, 8, 10]",
                            "})",
                            "",
                            "plt.plot(data.x, data.y)",
                            "plt.show()"
                        ]
                    }
                ]
            }'
        );

        // Probar escanear estos archivos con extensiones permitidas y sin contenido PHP en archivos no PHP
        $response = $this->post('/scan', [
            'files' => [$markdownFile, $configFile, $xmlFile, $jsonFile]
        ]);

        // Verificar procesamiento exitoso
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');
    }

    /**
     * Test handling of files with Windows line endings and UTF-8 BOM.
     */
    public function testLineEndingsAndEncodings()
    {
        // Archivo con terminaciones de línea Windows (CRLF)
        $crlfContent = "function test() {\r\n    console.log('Windows line endings');\r\n    return true;\r\n}";
        $crlfFile = UploadedFile::fake()->createWithContent('windows_endings.js', $crlfContent);

        // Archivo con BOM UTF-8
        $bomContent = "\xEF\xBB\xBF" . "function test() {\n    console.log('UTF-8 with BOM');\n    return true;\n}";
        $bomFile = UploadedFile::fake()->createWithContent('utf8_bom.js', $bomContent);

        // Archivo con mezcla de terminaciones de línea
        $mixedContent = "function test() {\r\n    if (true) {\n        console.log('Mixed line endings');\r    }\n    return true;\r\n}";
        $mixedFile = UploadedFile::fake()->createWithContent('mixed_endings.js', $mixedContent);

        // Mock GeminiService
        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('generateText')
                ->andReturn('function test() { console.log("Reformatted"); return true; }');
        });

        // Probar refactorizar estos archivos
        $response = $this->post('/process', [
            'files' => [$crlfFile, $bomFile, $mixedFile]
        ]);

        // Verificar procesamiento exitoso
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');

        // Verificar que el contenido fue procesado
        $this->assertTrue(session()->has('ApiContents'));
        $this->assertTrue(session()->has('ApiNames'));
        $this->assertEquals(3, count(session('ApiContents')));
    }

    /**
     * Test uploading legitimate files with very unusual extensions
     * pero que son comunes en proyectos de programación.
     */
    public function testUnusualFileExtensions()
    {
        // Archivo de configuración de Webpack
        $webpackConfig = UploadedFile::fake()->createWithContent(
            'webpack.config.js',
            'module.exports = {
                entry: "./src/index.js",
                output: {
                    filename: "bundle.js",
                    path: __dirname + "/dist"
                }
            };'
        );

        // Archivo de definición de tipos TypeScript
        $dtsFile = UploadedFile::fake()->createWithContent(
            'types.d.ts',
            'interface User {
                id: number;
                name: string;
                email: string;
            }

            export type UserRole = "admin" | "editor" | "viewer";'
        );

        // Archivo de configuración Laravel Blade
        $bladeFile = UploadedFile::fake()->createWithContent(
            'header.blade.php',
            '@extends("layouts.app")

            @section("header")
                <h1>{{ $title }}</h1>
                @if($showNavigation)
                    @include("partials.navigation")
                @endif
            @endsection'
        );

        // Archivo de configuración de Docker Compose
        $dockerComposeFile = UploadedFile::fake()->createWithContent(
            'docker-compose.yml',
            'version: "3"
            services:
              web:
                image: nginx:latest
                ports:
                  - "80:80"
              db:
                image: mysql:5.7
                environment:
                  MYSQL_ROOT_PASSWORD: secret'
        );

        // Probar subir estos archivos
        $response = $this->post('/upload', [
            'files' => [$webpackConfig, $dtsFile, $bladeFile, $dockerComposeFile]
        ]);

        // Verificar procesamiento exitoso
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');

        // Verificar que todos los archivos fueron procesados
        $this->assertTrue(session()->has('contents'));
        $this->assertTrue(session()->has('names'));
        $this->assertEquals(4, count(session('contents')));
        $this->assertEquals(4, count(session('names')));
    }

    /**
     * Test handling of files with minified/compressed code
     * que son legítimos pero difíciles de procesar.
     */
    public function testMinifiedCodeFiles()
    {
        // Mock GeminiService
        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('generateText')
                ->andReturn('{"score": 90, "summary": "Minified code analyzed successfully", "critical_lines": [], "vulnerabilities": []}');
        });

        // Archivo JS minificado
        $minifiedJs = UploadedFile::fake()->createWithContent(
            'script.min.js',
            'function a(b,c){return b+c}function d(e,f){return e*f}const g=a(5,3);const h=d(g,2);console.log(h)'
        );

        // Archivo CSS minificado
        $minifiedCss = UploadedFile::fake()->createWithContent(
            'style.min.css',
            'body,html{margin:0;padding:0;font-family:Arial,sans-serif}header{background:#f8f8f8;padding:20px}main{padding:15px}.container{max-width:1200px;margin:0 auto}'
        );

        // HTML minificado
        $minifiedHtml = UploadedFile::fake()->createWithContent(
            'template.min.html',
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Example</title></head><body><header><h1>Title</h1></header><main><p>Content</p></main><script src="script.min.js"></script></body></html>'
        );

        // Probar escaneo de seguridad
        $response = $this->post('/scan', [
            'files' => [$minifiedJs, $minifiedCss, $minifiedHtml]
        ]);

        // Verificar procesamiento exitoso
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');

        // Verificar resultados en sesión
        $this->assertTrue(session()->has('SecContents'));
        $this->assertTrue(session()->has('SecNames'));
        $this->assertEquals(3, count(session('SecContents')));
    }

    /**
     * Test handling of source code files with unusual but legitimate syntax.
     */
    public function testUnusualCodeSyntax()
    {
        // Mock GeminiService
        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('generateText')
                ->andReturn('function optimized() { return true; }');
        });

        // Código PHP con syntaxis alternativa
        $phpAltSyntax = UploadedFile::fake()->createWithContent(
            'template.php',
            '<?php
            $items = ["apple", "banana", "orange"];
            ?>
            <ul>
            <?php foreach ($items as $item): ?>
                <li><?= htmlspecialchars($item) ?></li>
            <?php endforeach; ?>
            </ul>
            <?php if ($showMore): ?>
                <a href="more.php">Show more</a>
            <?php endif; ?>'
        );

        // JavaScript con Template Literals complejos
        $jsTemplateLiterals = UploadedFile::fake()->createWithContent(
            'complex_template.js',
            'const html = `
                <div class="${isActive ? \'active\' : \'\'}">
                    <h1>${title.toUpperCase()}</h1>
                    <ul>
                        ${items.map(item => `<li>${item.name}: $${item.price.toFixed(2)}</li>`).join(\'\')}
                    </ul>
                    ${isFooterVisible ? `<footer>&copy; ${new Date().getFullYear()}</footer>` : \'\'}
                </div>
            `;'
        );

        // Código Python con decoradores y comprensiones
        $pythonAdvanced = UploadedFile::fake()->createWithContent(
            'advanced.py',
            'from functools import lru_cache

            @lru_cache(maxsize=100)
            def fibonacci(n):
                if n <= 1:
                    return n
                return fibonacci(n-1) + fibonacci(n-2)

            # List comprehension con if-else anidado
            result = [x if x % 2 == 0 else x * 2 for x in [fibonacci(i) for i in range(10)] if x > 5]
            print(result)'
        );

        // Definiciones TypeScript complejas
        $typeScriptAdvanced = UploadedFile::fake()->createWithContent(
            'advanced.ts',
            'type Primitive = string | number | boolean | null | undefined;
            type JSONObject = { [key: string]: JSONValue };
            type JSONArray = JSONValue[];
            type JSONValue = Primitive | JSONObject | JSONArray;

            interface ApiResponse<T extends JSONValue> {
                data?: T;
                error?: {
                    code: number;
                    message: string;
                };
                meta: {
                    requestId: string;
                    timestamp: number;
                }
            }

            function processResponse<T extends JSONValue>(response: ApiResponse<T>): T | null {
                return response.data ?? null;
            }'
        );

        // Probar refactorización
        $response = $this->post('/process', [
            'files' => [$phpAltSyntax, $jsTemplateLiterals, $pythonAdvanced, $typeScriptAdvanced]
        ]);

        // Verificar procesamiento exitoso
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');
    }

    /**
     * Test handling extremely large but valid files that are within size limits.
     */
    public function testLargeValidFiles()
    {
        $longRepeatedPhp = '<?php
        /**
         * This is a large but valid PHP file with many function definitions
         */
        ';

        // Generar muchas funciones diferentes para simular un archivo grande legítimo
        for ($i = 1; $i <= 100; $i++) {
            $longRepeatedPhp .= "
            /**
             * Function $i description
             * @param string \$param Parameter description
             * @return string Return value description
             */
            function testFunction$i(\$param) {
                // Complex logic here
                \$result = '';
                for (\$j = 0; \$j < strlen(\$param); \$j++) {
                    \$result .= chr(ord(\$param[\$j]) + $i);
                }
                return \$result;
            }
            ";
        }

        $largePhpFile = UploadedFile::fake()->createWithContent('large_functions.php', $longRepeatedPhp);

        // Mock GeminiService para evitar problemas con llamadas API reales
        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('generateText')
                ->andReturn('{"score": 85, "summary": "Large file analyzed", "critical_lines": [], "vulnerabilities": []}');
        });

        // Probar el escaneo de seguridad
        $response = $this->post('/scan', [
            'files' => [$largePhpFile]
        ]);

        // Verificar procesamiento exitoso
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');

        // Verificar que el archivo se procesó
        $this->assertTrue(session()->has('SecContents'));
        $this->assertTrue(session()->has('SecNames'));
        $this->assertEquals(1, count(session('SecContents')));
    }

    /**
     * Test realistic workflow with code files containing correct but uncommon patterns.
     */
    public function testRealisticUncommonPatterns()
    {
        // PHP con patrones poco comunes pero válidos
        $phpRealisticCode = UploadedFile::fake()->createWithContent(
            'realistic.php',
            '<?php
            namespace App\\Patterns\\Behavioral;

            use Exception;
            use Closure;

            class Command
            {
                private $callback;
                private static $registry = [];

                public function __construct(Closure $callback)
                {
                    $this->callback = $callback;
                }

                public function execute(...$args)
                {
                    return ($this->callback)(...$args);
                }

                public static function register(string $name, Closure $callback): void
                {
                    self::$registry[$name] = new static($callback);
                }

                public static function __callStatic($name, $args)
                {
                    if (isset(self::$registry[$name])) {
                        return self::$registry[$name]->execute(...$args);
                    }
                    throw new Exception("Command {$name} not found");
                }
            }

            // Registrar comandos
            Command::register("save", function($data) {
                return "Data saved: " . json_encode($data);
            });

            // Uso
            echo Command::save(["id" => 1, "name" => "Test"]);
            ?>'
        );

        // JavaScript con patrones avanzados
        $jsRealisticCode = UploadedFile::fake()->createWithContent(
            'realistic.js',
            '// Implementación de proxies y meta-programación
            const handler = {
                get(target, prop) {
                    if (typeof target[prop] === "function") {
                        return function(...args) {
                            console.log(`Method ${prop} called with args: ${args}`);
                            const result = target[prop].apply(target, args);
                            console.log(`Method ${prop} returned: ${result}`);
                            return result;
                        };
                    }

                    console.log(`Property ${prop} accessed`);
                    return target[prop];
                },

                set(target, prop, value) {
                    console.log(`Setting ${prop} to ${value}`);
                    target[prop] = value;
                    return true;
                }
            };

            class User {
                constructor(name) {
                    this.name = name;
                }

                greet() {
                    return `Hello, ${this.name}!`;
                }
            }

            // Crear un proxy para la instancia
            const user = new Proxy(new User("John"), handler);

            // Uso
            console.log(user.name); // Acceso a propiedad
            user.name = "Jane";     // Modificación de propiedad
            console.log(user.greet()); // Llamada a método'
        );

        // Mock GeminiService
        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('generateText')
                ->andReturn('// Refactored code with improved patterns');
        });

        // Probar refactorización de estos archivos
        $response = $this->post('/process', [
            'files' => [$phpRealisticCode, $jsRealisticCode]
        ]);

        // Verificar procesamiento exitoso
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');
    }

    public function flushSession()
    {
        $this->session([]);
        session()->flush();
    }
}
