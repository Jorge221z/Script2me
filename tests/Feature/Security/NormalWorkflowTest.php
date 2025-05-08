<?php

namespace Tests\Feature\Security;

use Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Services\GeminiService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SecurityNormalWorkflowTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    /**
     * Test standard upload flow with multiple programming files.
     */
    public function testStandardUploadFlow()
    {
        // Prepare multiple valid programming files
        $phpFile = UploadedFile::fake()->createWithContent(
            'controller.php',
            '<?php
            class UserController extends Controller
            {
                public function index()
                {
                    $users = User::all();
                    return view("users.index", compact("users"));
                }
            }'
        );

        $jsFile = UploadedFile::fake()->createWithContent(
            'script.js',
            'function calculateTotal(items) {
                return items.reduce((total, item) => {
                    return total + item.price;
                }, 0);
            }'
        );

        $htmlFile = UploadedFile::fake()->createWithContent(
            'template.html',
            '<!DOCTYPE html>
            <html>
                <head>
                    <title>My Template</title>
                </head>
                <body>
                    <div id="app"></div>
                    <script src="script.js"></script>
                </body>
            </html>'
        );

        // Test upload endpoint
        $response = $this->post('/upload', [
            'files' => [$phpFile, $jsFile, $htmlFile]
        ]);

        // Check successful upload
        $response->assertStatus(302); // Redirect
        $response->assertSessionMissing('errors');
        $response->assertSessionHas('success');

        // Verify files in session
        $this->assertTrue(session()->has('contents'));
        $this->assertTrue(session()->has('names'));
        $this->assertEquals(3, count(session('contents')));
        $this->assertEquals(3, count(session('names')));

        // Verify files are stored correctly
        $filesInUploads = Storage::disk('local')->files('uploads');
        $this->assertEquals(3, count($filesInUploads));
    }

    /**
     * Test the security scanning workflow.
     */
    public function testSecurityScanningWorkflow()
    {
        // Mock GeminiService to avoid actual API calls
        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('generateText')
                ->andReturn('{"score": 85, "summary": "Found minor security issues", "critical_lines": [5], "vulnerabilities": [{"line": 5, "issue": "SQL Injection risk", "suggestion": "Use prepared statements"}]}');
        });

        // Create a PHP file with a simple SQL injection vulnerability
        $phpCode = '<?php
        function getUserData($userId) {
            global $db;
            // This has SQL injection vulnerability
            $query = "SELECT * FROM users WHERE id = " . $userId;
            return $db->query($query);
        }
        ?>';

        $phpFile = UploadedFile::fake()->createWithContent('user_data.php', $phpCode);

        // Test security scan endpoint
        $response = $this->post('/scan', [
            'files' => [$phpFile]
        ]);

        // Check successful scan
        $response->assertStatus(302); // Redirect
        $response->assertSessionMissing('errors');
        $response->assertSessionHas('success');

        // Verify scan results in session
        $this->assertTrue(session()->has('SecContents'));
        $this->assertTrue(session()->has('SecNames'));
        $this->assertEquals(1, count(session('SecContents')));

        // Verify scan result content
        $securityContent = session('SecContents')[0];
        $this->assertArrayHasKey('score', $securityContent);
        $this->assertArrayHasKey('summary', $securityContent);
        $this->assertArrayHasKey('vulnerabilities', $securityContent);
    }

    /**
     * Test the code refactoring workflow.
     */
    public function testRefactoringWorkflow()
    {
        // Mock GeminiService to avoid actual API calls
        $this->mock(GeminiService::class, function ($mock) {
            $mock->shouldReceive('generateText')
                ->andReturn('function calculateTotal(items) {
                  return items.reduce((total, item) => total + item.price, 0);
                }');
        });

        // Create a JavaScript file to refactor
        $jsCode = 'function calculateTotal(items) {
            let total = 0;
            for (let i = 0; i < items.length; i++) {
                total = total + items[i].price;
            }
            return total;
        }';

        $jsFile = UploadedFile::fake()->createWithContent('calculate.js', $jsCode);

        // Test refactor endpoint
        $response = $this->post('/process', [
            'files' => [$jsFile]
        ]);

        // Check successful refactoring
        $response->assertStatus(302); // Redirect
        $response->assertSessionMissing('errors');
        $response->assertSessionHas('success');

        // Verify refactored code in session
        $this->assertTrue(session()->has('ApiContents'));
        $this->assertTrue(session()->has('ApiNames'));
        $this->assertEquals(1, count(session('ApiContents')));

        // Check refactored content
        $refactoredCode = session('ApiContents')[0];
        $this->assertStringContainsString('reduce', $refactoredCode);
    }

    /**
     * Test complete end-to-end workflow: upload → security scan → refactor
     */
    public function testCompleteWorkflow()
    {
        // Mock GeminiService
        $this->mock(GeminiService::class, function ($mock) {
            // For security scan
            $mock->shouldReceive('generateText')
                ->once()
                ->andReturn('{"score": 75, "summary": "Several issues found", "critical_lines": [3, 8], "vulnerabilities": [{"line": 3, "issue": "Inefficient code", "suggestion": "Use array functions"}, {"line": 8, "issue": "Potential overflow", "suggestion": "Add validation"}]}');

            // For refactoring - called second time
            $mock->shouldReceive('generateText')
                ->once()
                ->andReturn('function processArray(arr) {
                  if (!Array.isArray(arr) || arr.length === 0) {
                    return 0;
                  }

                  return arr
                    .filter(n => typeof n === "number")
                    .map(n => n * 2)
                    .reduce((sum, n) => sum + n, 0);
                }');
        });

        // Create a JavaScript file with some code that needs improvement
        $jsCode = 'function processArray(arr) {
            let result = 0;
            // Not checking if arr is valid
            for (let i = 0; i < arr.length; i++) {
                // Not checking element type
                let doubled = arr[i] * 2;
                result = result + doubled;
            }
            // Not validating against overflow
            return result;
        }';

        $jsFile = UploadedFile::fake()->createWithContent('process.js', $jsCode);

        // Step 1: Upload the file
        $response = $this->post('/upload', [
            'files' => [$jsFile]
        ]);
        $response->assertStatus(302);
        $response->assertSessionHas('success');

        // Step 2: Security scan
        $this->flushSession();
        $response = $this->post('/scan', [
            'files' => [$jsFile]
        ]);
        $response->assertStatus(302);
        $response->assertSessionHas('success');
        $this->assertTrue(session()->has('SecContents'));

        // Step 3: Refactor
        $this->flushSession();
        $response = $this->post('/process', [
            'files' => [$jsFile]
        ]);
        $response->assertStatus(302);
        $response->assertSessionHas('success');
        $this->assertTrue(session()->has('ApiContents'));

        // Verify improved code
        $refactoredCode = session('ApiContents')[0];
        $this->assertStringContainsString('Array.isArray', $refactoredCode);
        $this->assertStringContainsString('filter', $refactoredCode);
        $this->assertStringContainsString('map', $refactoredCode);
        $this->assertStringContainsString('reduce', $refactoredCode);
    }

    /**
     * Test simultaneous processing of multiple different file types
     */
    public function testMultipleFileTypesProcessing()
    {
        // Mock GeminiService
        $this->mock(\App\Services\GeminiService::class, function ($mock) {
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

        // Corregir: Ahora los nombres originales solo se añaden una vez, no se duplican
        $this->assertEquals(5, count(session('ApiNames'))); // Changed from 10 to 5
    }

    /**
     * Test handling of special cases like file names with spaces or special characters
     */
    public function testSpecialFilenamesHandling()
    {
        // Create files with special names
        $files = [
            UploadedFile::fake()->createWithContent('my file with spaces.js', 'console.log("test");'),
            UploadedFile::fake()->createWithContent('special-chars_!@#$%.php', '<?php echo "test"; ?>'),
            UploadedFile::fake()->createWithContent('пример.js', 'console.log("cyrillic");'), // Cyrillic
            UploadedFile::fake()->createWithContent('例子.php', '<?php echo "Chinese"; ?>'), // Chinese
        ];

        // Test upload
        $response = $this->post('/upload', [
            'files' => $files
        ]);

        // Should handle all file names properly
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');

        // Check files were stored with sanitized names
        $filesInUploads = Storage::disk('local')->files('uploads');
        $this->assertEquals(4, count($filesInUploads));

        // Check session contains original names for display
        $this->assertEquals(4, count(session('names')));
        $sessionNames = session('names');
        $this->assertTrue(in_array('my file with spaces.js', $sessionNames) ||
                        in_array('my_file_with_spaces.js', $sessionNames));
    }

    /**
     * Clears the current session
     */
    public function flushSession() // Changed from private to public
    {
        $this->session([]);
        session()->flush();
    }
}
