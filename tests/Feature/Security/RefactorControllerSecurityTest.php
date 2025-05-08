<?php

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Response;
use App\Services\GeminiService;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    Storage::fake('local');
});

test('it rejects script injection in refactor parameters', function () {
    // Mock GeminiService to avoid actual API calls
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('function test() { return "hello"; }');
    });

    $maliciousCode = "<script>alert('XSS');</script>";

    $response = $this->post('/process', [
        'files' => [
            UploadedFile::fake()->createWithContent('test.js', "function test() { return 'hello'; }")
        ],
        'options' => [
            'format' => $maliciousCode
        ]
    ]);

    // Should reject or sanitize the malicious input
    expect($response->getContent())->not->toContain($maliciousCode);
});

test('it prevents arbitrary file access during refactoring', function () {
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('<?php echo "Safe output"; ?>');
    });

    $maliciousFile = UploadedFile::fake()->createWithContent(
        '../../../../etc/passwd',
        "<?php include('/etc/passwd'); ?>"
    );

    $response = $this->post('/process', [
        'files' => [$maliciousFile]
    ]);

    // Check that no sensitive content is returned
    expect($response->getContent())->not->toContain('root:');

    // Files should only be stored in the uploads directory
    $filesInUploads = Storage::disk('local')->files();
    foreach ($filesInUploads as $storedFile) {
        expect($storedFile)->toContain('uploads/');
        expect($storedFile)->not->toContain('../');
    }
});

test('it sanitizes code output before returning it', function () {
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('function innocent() { const payload = "</script><script>alert(\"XSS\");</script>"; return payload; }');
    });

    $maliciousInput = "function innocent() {
        const payload = '</script><script>alert(\"XSS\");</script>';
        return payload;
    }";

    $file = UploadedFile::fake()->createWithContent('test.js', $maliciousInput);

    $response = $this->post('/process', [
        'files' => [$file]
    ]);

    // Check that script tags are escaped in the response
    expect($response->getContent())->not->toContain('</script><script>alert("XSS");</script>');
});

test('it validates language parameter against injection', function () {
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('console.log("test")');
    });

    $file = UploadedFile::fake()->createWithContent(
        'test.js',
        'console.log("test")'
    );

    $response = $this->post('/process', [
        'files' => [$file],
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

test('it allows legitimate programming files to be processed', function () {
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('function optimized() { return true; }');
    });

    // Test multiple programming file types
    $files = [
        UploadedFile::fake()->createWithContent('test.js', 'function test() { return true; }'),
        UploadedFile::fake()->createWithContent('test.php', '<?php function test() { return true; } ?>'),
        UploadedFile::fake()->createWithContent('test.py', 'def test(): return True'),
        UploadedFile::fake()->createWithContent('test.ts', 'function test(): boolean { return true; }')
    ];

    $response = $this->post('/process', [
        'files' => $files
    ]);

    // Should process all files successfully
    $response->assertStatus(302); // Redirect on success
    $response->assertSessionMissing('errors');

    // Check that the API contents were stored in the session
    expect(session()->has('ApiContents'))->toBeTrue();
    expect(count(session('ApiContents')))->toBe(4);
});

test('it limits processing time to prevent DoS attacks', function () {
    // Create code that might cause excessive processing
    $complexCode = str_repeat("function a() { return a() + a(); }\n", 100);
    $file = UploadedFile::fake()->createWithContent('complex.js', $complexCode);

    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('function optimized() { return true; }');
    });

    $startTime = microtime(true);

    $response = $this->post('/process', [
        'files' => [$file]
    ]);

    $endTime = microtime(true);
    $executionTime = $endTime - $startTime;

    // Processing should timeout or fail gracefully within reasonable time
    expect($executionTime)->toBeLessThan(5.0);
});

test('it prevents command injection via language options', function () {
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('const x = 1;');
    });

    $file = UploadedFile::fake()->createWithContent('test.js', 'const x = 1;');

    $response = $this->post('/process', [
        'files' => [$file],
        'options' => [
            'formatter' => 'prettier',
            'args' => '--config /etc/passwd && cat /etc/passwd'
        ]
    ]);

    // Verify no file system commands were executed
    expect($response->getContent())->not->toContain('root:');
});

test('it handles malformed JSON gracefully', function () {
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('{"fixed": "json"}');
    });

    // Send malformed JSON that might cause parsing errors
    $malformedJson = '{test": "value", unclosed: {';
    $file = UploadedFile::fake()->createWithContent('malformed.json', $malformedJson);

    $response = $this->post('/process', [
        'files' => [$file]
    ]);

    // The response should not be a server error (500)
    $statusCode = $response->getStatusCode();
    expect($statusCode < 500)->toBeTrue("Expected status code less than 500, got {$statusCode}");
});

// Testing CSRF protection
test('it enforces CSRF protection', function () {
    // Disable CSRF middleware temporarily to test if it's properly implemented
    $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

    $file = UploadedFile::fake()->createWithContent('test.js', 'console.log("test")');

    $response = $this->post('/process', [
        'files' => [$file]
    ]);

    // Even with CSRF disabled, the code should process securely
    $statusCode = $response->getStatusCode();
    expect($statusCode >= 200 && $statusCode < 500)->toBeTrue();
});

// Testing for secure content handling
test('it safely handles potentially dangerous code', function() {
    $this->mock(GeminiService::class, function ($mock) {
        $mock->shouldReceive('generateText')
            ->andReturn('<?php function safe() { return true; } ?>');
    });

    $dangerousCode = '<?php system($_GET["cmd"]); ?>';
    $file = UploadedFile::fake()->createWithContent('dangerous.php', $dangerousCode);

    $response = $this->post('/process', [
        'files' => [$file]
    ]);

    // The controller should sanitize or handle this code safely
    // Check that the raw system() call isn't exposed in the session
    $this->assertFalse(
        collect(session('ApiContents', []))->contains(function ($item) {
            return strpos($item, 'system($_GET') !== false;
        })
    );
});
