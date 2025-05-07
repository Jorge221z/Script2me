<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
});

test('it rejects mime type spoofing', function () {
    // Create a PHP file with a spoofed text MIME type
    $maliciousContent = '<?php echo "Malicious code execution"; ?>';
    $fakeFile = UploadedFile::fake()->createWithContent(
        'innocent.txt', 
        $maliciousContent
    );
    
    // Try to spoof the MIME type
    $fakeFile->mimeType = 'text/plain';

    $response = $this->post('/upload', [
        'files' => [$fakeFile]
    ]);

    // The validator should catch the MIME type mismatch
    $response->assertStatus(302);
    $response->assertSessionHasErrors();
});

test('it prevents path traversal in filenames', function () {
    // Attempt path traversal in filename
    $file = UploadedFile::fake()->create('../../../etc/passwd.txt', 100);

    $response = $this->post('/upload', [
        'files' => [$file]
    ]);

    // Just check that no files were stored in the uploads directory
    $filesInUploads = Storage::disk('local')->files('uploads');
    expect($filesInUploads)->toBeEmpty();
    
    // The request should result in an error (MIME type or path-related)
    $response->assertSessionHasErrors();
});

test('it sanitizes filenames to prevent xss', function () {
    // XSS payload in filename
    $file = UploadedFile::fake()->create('<script>alert("XSS")</script>.txt', 100);

    $response = $this->post('/upload', [
        'files' => [$file]
    ]);

    // Check that the response doesn't contain the raw script tag
    expect($response->getContent())->not->toContain('<script>alert("XSS")</script>');
});

test('it prevents uploading oversized files', function () {
    // Create a file larger than the 2MB limit
    $largeFile = UploadedFile::fake()->create('large.txt', 3000); // 3MB file
    
    $response = $this->post('/upload', [
        'files' => [$largeFile]
    ]);
    
    $response->assertSessionHasErrors();
});

test('it validates file extensions properly', function () {
    // Create a PHP file with a double extension to bypass filters
    $maliciousFile = UploadedFile::fake()->create('malicious.txt.php', 100);
    
    $response = $this->post('/upload', [
        'files' => [$maliciousFile]
    ]);
    
    $response->assertSessionHasErrors();
});

test('it handles null byte injection attempts', function () {
    // Try null byte injection in filename
    $filename = "malicious\0.php";
    $file = UploadedFile::fake()->create($filename, 100);
    
    $response = $this->post('/upload', [
        'files' => [$file]
    ]);
    
    // Always make at least one assertion - the response should have errors
    // or no PHP files should be stored
    $response->assertStatus(302);
    
    // Make sure no files with .php extension were stored
    $filesInUploads = Storage::disk('local')->files('uploads');
    if (!empty($filesInUploads)) {
        foreach ($filesInUploads as $storedFile) {
            expect($storedFile)->not->toContain('.php');
        }
    } else {
        // If no files were stored (likely case), we need an explicit assertion
        expect($filesInUploads)->toBeEmpty();
    }
});

test('it rejects zero-byte files', function () {
    // Create an empty file (0 bytes)
    $emptyFile = UploadedFile::fake()->create('empty.txt', 0);
    
    $response = $this->post('/upload', [
        'files' => [$emptyFile]
    ]);
    
    // Should reject empty files
    $response->assertSessionHasErrors();
});
