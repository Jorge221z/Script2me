<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;
    
    /**
     * Create the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        return $app;
    }

    /**
     * Call protected/private method of a class.
     *
     * @param object $object     Instantiated object that we will run method on
     * @param string $methodName Method name to call
     * @param array  $parameters Array of parameters to pass into method
     *
     * @return mixed Method return
     */
    public function invokeMethod($object, $methodName, array $parameters = [])
    {
        $reflection = new \ReflectionClass(get_class($object));
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);
        
        return $method->invokeArgs($object, $parameters);
    }

    /**
     * Comprehensive check for security headers
     * 
     * @param string $route The route to check headers for
     * @return void
     */
    protected function checkSecurityHeaders(string $route = '/')
    {
        $response = $this->get($route);
        
        // Headers obligatorios de seguridad
        $requiredHeaders = [
            'X-Content-Type-Options' => 'nosniff',
            'X-XSS-Protection' => '1; mode=block',
            'X-Frame-Options' => ['DENY', 'SAMEORIGIN'],
            'Referrer-Policy' => ['no-referrer', 'strict-origin', 'strict-origin-when-cross-origin'],
        ];
        
        // Comprobar headers estrictos
        foreach ($requiredHeaders as $header => $validValues) {
            $validValues = is_array($validValues) ? $validValues : [$validValues];
            
            if ($response->headers->has($header)) {
                $value = $response->headers->get($header);
                expect(in_array($value, $validValues))->toBeTrue(
                    "Header '$header' con valor '$value' no es válido. Valores permitidos: " . implode(', ', $validValues)
                );
            } else {
                $this->fail("Header de seguridad '$header' no está presente en la respuesta de $route");
            }
        }
        
        // Verificación recomendada: Content-Security-Policy
        if ($response->headers->has('Content-Security-Policy')) {
            $cspValue = $response->headers->get('Content-Security-Policy');
            expect($cspValue)->not->toContain("'unsafe-inline'");
            expect($cspValue)->not->toContain("'unsafe-eval'");
        }
        
        // Verificación recomendada: Strict-Transport-Security (HSTS)
        if ($response->headers->has('Strict-Transport-Security')) {
            $hstsValue = $response->headers->get('Strict-Transport-Security');
            expect($hstsValue)->toContain('max-age=');
        }
    }
    
    /**
     * Verificar seguridad de cookies
     * 
     * @return void
     */
    protected function checkSecureCookies()
    {
        $response = $this->get('/');
        $cookies = $response->headers->getCookies();
        
        foreach ($cookies as $cookie) {
            if ($cookie->getName() === 'XSRF-TOKEN' || 
                $cookie->getName() === 'session') {
                
                // En entorno HTTPS, las cookies deberían ser seguras
                if (env('APP_ENV') === 'production') {
                    expect($cookie->isSecure())->toBeTrue(
                        "Cookie '{$cookie->getName()}' debe tener el flag 'secure' en producción"
                    );
                }
                
                // Debería tener HttpOnly
                expect($cookie->isHttpOnly())->toBeTrue(
                    "Cookie '{$cookie->getName()}' debe tener el flag 'httpOnly'"
                );
                
                // SameSite debería ser Lax o Strict
                expect(in_array($cookie->getSameSite(), ['lax', 'strict', 'Lax', 'Strict']))
                    ->toBeTrue("Cookie '{$cookie->getName()}' debe tener SameSite Lax o Strict");
            }
        }
    }
}
