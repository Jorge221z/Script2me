<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Services\GeminiService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NormalWorkflowTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    /**
     * Test simultaneous processing of multiple different file types
     */
    public function testMultipleFileTypesProcessing()
    {
        // Mock GeminiService
        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('generateText')
                ->andReturn('function example() { return true; }');
        });

        // Create files of different types
        $files = [
            UploadedFile::fake()->createWithContent('example.php', '<?php function example() { return true; } ?>'),
            UploadedFile::fake()->createWithContent('example.js', 'function example() { return true; }'),
            UploadedFile::fake()->createWithContent('example.py', 'def example(): return True'),
            UploadedFile::fake()->createWithContent('example.rb', 'def example\n  return true\nend'),
            UploadedFile::fake()->createWithContent('example.java', 'public class Example {\n public boolean example() { return true; }\n}'),
        ];

        // Process all files
        $response = $this->post('/process', [
            'files' => $files
        ]);

        // Check successful processing
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');

        // Verify all files were processed
        $this->assertTrue(session()->has('ApiContents'));
        $this->assertTrue(session()->has('ApiNames'));
        $this->assertEquals(5, count(session('ApiContents')));
        $this->assertEquals(5, count(session('ApiNames'))); // Corregido a 5, ya no duplicamos nombres
    }
}
