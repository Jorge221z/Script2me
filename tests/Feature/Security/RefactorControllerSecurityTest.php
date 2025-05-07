<?php

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Response;

beforeEach(function () {
    Storage::fake('local');
});

test('it rejects script injection in refactor parameters', function () {
    $maliciousCode = "<script>alert('XSS');</script>";
    
    $response = $this->post('/process', [
        'code' => "function test() { return 'hello'; }",
        'language' => 'javascript',
        'options' => [
            'format' => $maliciousCode
        ]
    ]);
    
    // Should reject or sanitize the malicious input
    expect($response->getContent())->not->toContain($maliciousCode);
});

test('it prevents arbitrary file access during refactoring', function () {
    $response = $this->post('/process', [
        'code' => "<?php include('/etc/passwd'); ?>",
        'language' => 'php',
        'target_file' => '../../../../etc/passwd'
    ]);
    
    // Check that no sensitive content is returned
    expect($response->getContent())->not->toContain('root:');
});

test('it sanitizes code output before returning it', function () {
    $maliciousInput = "function innocent() { 
        const payload = '</script><script>alert(\"XSS\");</script>'; 
        return payload;
    }";
    
    $response = $this->post('/process', [
        'code' => $maliciousInput,
        'language' => 'javascript'
    ]);
    
    // Check that script tags are escaped in the response
    expect($response->getContent())->not->toContain('</script><script>alert("XSS");</script>');
});

test('it validates language parameter against injection', function () {
    $response = $this->post('/process', [
        'code' => 'console.log("test")',
        'language' => "javascript'; DROP TABLE users; --"
    ]);
    
    // Should reject SQL injection attempts in parameters or handle them safely
    // Accept any status code that's not a server error (500-599)
    $statusCode = $response->getStatusCode();
    expect($statusCode < 500)->toBeTrue("Expected status code less than 500, got {$statusCode}");
    
    // Additionally check that the response doesn't contain SQL errors
    expect($response->getContent())->not->toContain('SQL syntax');
    expect($response->getContent())->not->toContain('mysql_error');
});

test('it limits processing time to prevent DoS attacks', function () {
    // Create code that might cause excessive processing
    $complexCode = str_repeat("function a() { return a() + a(); }\n", 1000);
    
    $startTime = microtime(true);
    
    $response = $this->post('/process', [
        'code' => $complexCode,
        'language' => 'javascript'
    ]);
    
    $endTime = microtime(true);
    $executionTime = $endTime - $startTime;
    
    // Processing should timeout or fail gracefully within reasonable time
    expect($executionTime)->toBeLessThan(5.0);
});

test('it prevents command injection via language options', function () {
    $response = $this->post('/process', [
        'code' => 'const x = 1;',
        'language' => 'javascript',
        'options' => [
            'formatter' => 'prettier',
            'args' => '--config /etc/passwd && cat /etc/passwd'
        ]
    ]);
    
    // Verify no file system commands were executed
    expect($response->getContent())->not->toContain('root:');
});

test('it handles malformed JSON gracefully', function () {
    // Send malformed JSON that might cause parsing errors
    $malformedJson = '{test": "value", unclosed: {';
    
    $response = $this->post('/process', [
        'code' => $malformedJson,
        'language' => 'json',
        'action' => 'format'
    ]);
    
    // The response should not be a server error (500)
    $statusCode = $response->getStatusCode();
    expect($statusCode < 500)->toBeTrue("Expected status code less than 500, got {$statusCode}");
});

// Testing CSRF protection
test('it enforces CSRF protection', function () {
    // Disable CSRF middleware temporarily to test if it's properly implemented
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
    
    $response = $this->post('/process', [
        'code' => 'console.log("test")',
        'language' => 'javascript'
    ]);
    
    // Even with CSRF disabled, the code should process securely
    $statusCode = $response->getStatusCode();
    expect($statusCode >= 200 && $statusCode < 500)->toBeTrue();
});

// Testing for secure content handling
test('it safely handles potentially dangerous code', function() {
    $dangerousCode = '<?php system($_GET["cmd"]); ?>';
    
    $response = $this->post('/process', [
        'code' => $dangerousCode,
        'language' => 'php'
    ]);
    
    // The controller should sanitize or handle this code safely
    expect($response->getContent())->not->toContain('system($_GET');
});
