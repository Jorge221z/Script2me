<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Services\GeminiService;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Storage::fake('local');
});

test('it validates recaptcha when provided', function () {
    // Mock HTTP for recaptcha
    Http::fake([
        'https://www.google.com/recaptcha/api/siteverify' => Http::response([
            'success' => false,
            'error-codes' => ['invalid-input-response']
        ], 200)
    ]);
    
    $file = UploadedFile::fake()->create('test.php', 100);
    
    $response = $this->post('/scan', [
        'files' => [$file],
        'captcha' => 'invalid-token'
    ]);
    
    // Should reject invalid captcha
    $response->assertSessionHas('error');
    $response->assertRedirect();
});

test('it prevents malicious file uploads', function () {
    // Mock GeminiService to avoid actual API calls
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('{"score": 0, "summary": "Test summary", "critical_lines": [1], "vulnerabilities": [{"line": 1, "issue": "Test issue", "suggestion": "Test suggestion"}]}');
    });
    
    // Try uploading a PHP file with PHP code inside but renamed as .txt
    $maliciousContent = '<?php system($_GET["cmd"]); ?>';
    $maliciousFile = UploadedFile::fake()->createWithContent(
        'malicious.txt', 
        $maliciousContent
    );
    
    $response = $this->post('/scan', [
        'files' => [$maliciousFile]
    ]);
    
    // The controller should handle this safely
    // Check that the session data doesn't contain the raw PHP code
    $this->assertFalse(
        collect(session('SecContents', []))->contains(function ($item) {
            return strpos(json_encode($item), 'system($_GET') !== false;
        })
    );
});

test('it validates file mime types properly', function () {
    // Try to upload file with invalid MIME type
    $file = UploadedFile::fake()->create('test.php', 100);
    
    // This should be rejected due to mime type checking
    $response = $this->post('/scan', [
        'files' => [$file]
    ]);
    
    $response->assertSessionHasErrors();
});

test('it sanitizes filename to prevent XSS', function () {
    // Mock GeminiService
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('{"score": 100, "summary": "No issues found", "critical_lines": [], "vulnerabilities": []}');
    });
    
    // Create file with XSS in filename
    $file = UploadedFile::fake()->create('<script>alert("XSS")</script>.txt', 100);
    
    $response = $this->post('/scan', [
        'files' => [$file]
    ]);
    
    // Session should contain sanitized names
    $this->assertTrue(
        collect(session('SecNames', []))->every(function ($name) {
            return strpos($name, '<script>') === false;
        })
    );
});

test('it securely handles extractJsonFromResponse', function () {
    // Create an instance of the controller to test protected methods
    $controller = app()->make(\App\Http\Controllers\SecurityController::class);
    
    // Test with valid JSON
    $validJson = '{"key": "value"}';
    $result = $this->invokeMethod($controller, 'extractJsonFromResponse', [$validJson]);
    expect($result)->toBe(['key' => 'value']);
    
    // Test with JSON embedded in other text
    $embeddedJson = 'Some text before {"key": "value"} and some text after';
    $result = $this->invokeMethod($controller, 'extractJsonFromResponse', [$embeddedJson]);
    expect($result)->toBe(['key' => 'value']);
    
    // Test with malformed JSON
    $malformedJson = '{"key": value}'; // Missing quotes around value
    $result = $this->invokeMethod($controller, 'extractJsonFromResponse', [$malformedJson]);
    expect($result)->toBeNull();
    
    // Test with potentially dangerous input
    $dangerousInput = '{"__proto__": {"polluted": true}}';
    $result = $this->invokeMethod($controller, 'extractJsonFromResponse', [$dangerousInput]);
    // Should parse but not cause prototype pollution
    expect($result)->toBe(['__proto__' => ['polluted' => true]]);
});

test('it builds secure prompts', function () {
    $controller = app()->make(\App\Http\Controllers\SecurityController::class);
    
    // Test with normal code
    $normalCode = 'function test() { return true; }';
    $prompt = $this->invokeMethod($controller, 'BuildSecurityPrompt', [$normalCode]);
    expect($prompt)->toContain($normalCode);
    
    // Test with code containing heredoc syntax which could break the prompt
    $trickyCode = "function test() {\n    return <<<EOT\n    This is a test\n    EOT;\n}";
    $prompt = $this->invokeMethod($controller, 'BuildSecurityPrompt', [$trickyCode]);
    expect($prompt)->toContain($trickyCode);
    
    // Test with code containing curly braces that could interfere with JSON
    $bracesCode = "function test() { if (true) { return { key: 'value' }; } }";
    $prompt = $this->invokeMethod($controller, 'BuildSecurityPrompt', [$bracesCode]);
    expect($prompt)->toContain($bracesCode);
});

test('it prevents DoS attacks from large files', function () {
    // Mock GeminiService to avoid actual API calls
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('{"score": 100, "summary": "No issues found", "critical_lines": [], "vulnerabilities": []}');
    });
    
    // Create a large but valid file just under the limit with actual content
    $content = str_repeat('a', 1024 * 1024); // 1MB of content
    $largeFile = UploadedFile::fake()->createWithContent(
        'large.txt',
        $content
    );
    
    $response = $this->post('/scan', [
        'files' => [$largeFile]
    ]);
    
    // Should accept files within the limit
    $response->assertStatus(302); // Redirect after successful upload
    $response->assertSessionMissing('errors');
    
    // Try with a file that's too large
    $oversizedContent = str_repeat('a', 2.1 * 1024 * 1024); // 2.1MB of content
    $oversizedFile = UploadedFile::fake()->createWithContent(
        'too_large.txt',
        $oversizedContent
    );
    
    $response = $this->post('/scan', [
        'files' => [$oversizedFile]
    ]);
    
    // Should reject oversized files
    $response->assertSessionHasErrors();
});

// Helper method to invoke protected methods on controller
function invokeMethod($object, $methodName, array $parameters = [])
{
    $reflection = new \ReflectionClass(get_class($object));
    $method = $reflection->getMethod($methodName);
    $method->setAccessible(true);
    return $method->invokeArgs($object, $parameters);
}
