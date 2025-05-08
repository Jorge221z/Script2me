<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
});

test('it allows uploading legitimate programming files', function () {
    // Create valid programming files
    $phpFile = UploadedFile::fake()->createWithContent(
        'valid.php',
        '<?php function test() { return "Valid PHP"; } ?>'
    );

    $jsFile = UploadedFile::fake()->createWithContent(
        'script.js',
        'function test() { return "Valid JavaScript"; }'
    );

    $response = $this->post('/upload', [
        'files' => [$phpFile, $jsFile]
    ]);

    // Should accept legitimate programming files
    $response->assertStatus(302); // Redirect on success
    $response->assertSessionMissing('errors');

    // Check that files were stored and content appears in session
    expect(session()->has('contents'))->toBeTrue();
    expect(count(session('contents')))->toBe(2);
    expect(count(session('names')))->toBe(2);
});

test('it sanitizes filenames to prevent xss', function () {
    // XSS payload in filename
    $file = UploadedFile::fake()->create('<script>alert("XSS")</script>.txt', 100);

    $response = $this->post('/upload', [
        'files' => [$file]
    ]);

    // File should be processed
    $response->assertStatus(302);

    // But name should be sanitized in session
    expect(session()->has('names'))->toBeTrue();
    $storedNames = session('names');
    foreach ($storedNames as $name) {
        expect($name)->not->toContain('<script>alert("XSS")</script>');
    }
});

test('it handles null byte injection attempts', function () {
    // Try null byte injection in filename
    $filename = "malicious\0.php";
    $file = UploadedFile::fake()->create($filename, 100);

    $response = $this->post('/upload', [
        'files' => [$file]
    ]);

    // Check that the stored filename doesn't contain the null byte
    $filesInUploads = Storage::disk('local')->files('uploads');
    if (!empty($filesInUploads)) {
        foreach ($filesInUploads as $storedFile) {
            expect($storedFile)->not->toContain("\0");
        }
    }

    // Also verify that session names are sanitized
    if (session()->has('names')) {
        $names = session('names');
        foreach ($names as $name) {
            expect($name)->not->toContain("\0");
        }
    }
});

test('it handles zero-byte files appropriately', function () {
    // Create an empty file (0 bytes)
    $emptyFile = UploadedFile::fake()->create('empty.txt', 0);

    $response = $this->post('/upload', [
        'files' => [$emptyFile]
    ]);

    // In testing environment, zero-byte files are allowed
    // Just verify that the file was processed
    $response->assertStatus(302); // Should redirect on success

    // Check that the file was included in session
    expect(session()->has('names'))->toBeTrue();
    expect(session()->has('contents'))->toBeTrue();
});

test('it correctly processes multiple files simultaneously', function () {
    // Create multiple valid files with different extensions
    $files = [
        UploadedFile::fake()->createWithContent('test1.php', '<?php echo "Hello"; ?>'),
        UploadedFile::fake()->createWithContent('test2.js', 'console.log("Hello");'),
        UploadedFile::fake()->createWithContent('test3.txt', 'Plain text content'),
        UploadedFile::fake()->createWithContent('test4.json', '{"key": "value"}')
    ];

    $response = $this->post('/upload', [
        'files' => $files
    ]);

    $response->assertStatus(302);
    $response->assertSessionMissing('errors');

    // Check that all files were processed
    expect(session()->has('contents'))->toBeTrue();
    expect(count(session('contents')))->toBe(4);
    expect(count(session('names')))->toBe(4);
});
