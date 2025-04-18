<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;
use Exception;
use Illuminate\Support\Facades\Log;
use App\Services\GeminiService;
use Illuminate\Foundation\Validation\ValidatesRequests;

class RefactorController extends Controller
{
    use ValidatesRequests;
    public function index()
    {
        try {
            // Eliminar la línea que borra la sesión
            return Inertia::render('refactorDashboard', [
                'ApiContents' => session('ApiContents', []),
                'ApiNames' => session('ApiNames', [])
            ]);
        } catch (Exception $e) {
            error_log('Error en index: ' . $e->getMessage());
            return Inertia::render('refactorDashboard', [
                'ApiContents' => [],
                'ApiNames' => [],
                'error' => 'Error al cargar refactor: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Prueba de la API de Gemini.
     */

    public function testApi(GeminiService $geminiService)
    {
        $prompt = <<<'EOD'
Actúa como un experto en refactorización de código TypeScript.

Refactoriza el siguiente código TypeScript para mejorar su legibilidad y eficiencia. Devuelve **únicamente el código TypeScript refactorizado**, sin explicaciones ni texto adicional. Asegúrate de que el código refactorizado sea funcionalmente equivalente al original. Si la refactorización no es posible o el código original es óptimo, devuelve el código original tal cual.

```typescript
interface Producto {
    nombre: string;
    precio: number;
    cantidad: number;
    descuento?: number; // Propiedad opcional para el descuento
}


class CarritoCompra {
    private productos: Producto[] = [];

    agregarProducto(producto: Producto): void {
        this.productos.push(producto);
    }

    calcularTotal(): number {
        let total = 0;
        for (const producto of this.productos) {
            const precioFinal = producto.precio * (1 - (producto.descuento || 0)); // Aplicar descuento si existe
            total += precioFinal * producto.cantidad;
        }
        return total;
    }

    aplicarDescuento(tipoCliente: string): void {
        let descuento = 0;
        const totalProductos = this.productos.length;
        const totalCarrito = this.calcularTotal();

        if (tipoCliente === 'premium') {
            descuento = totalProductos > 10 || totalCarrito > 500 ? 0.20 : 0.10;
        } else if (tipoCliente === 'regular' && totalProductos > 5 && totalCarrito > 200) {
            descuento = 0.05;
        }

        if (descuento > 0) {
            for (let i = 0; i < this.productos.length; i++) {
                if (this.productos[i].descuento === undefined) { // Solo aplicar si no hay descuento previo
                    this.productos[i].descuento = descuento;
                }
            }
        }

    }
}

IGNORE_WHEN_COPYING_START
Use code with caution.TypeScript
IGNORE_WHEN_COPYING_END


EOD;

        try {
            $response = $geminiService->generateText($prompt);

            // Limpiar la respuesta usando expresiones regulares
            $response = preg_replace('/^```(?:typescript)?\n?/', '', $response); // Elimina ```typescript al principio
            $response = preg_replace('/```$/', '', $response); // Elimina ``` al final
            $response = trim($response); // Elimina espacios en blanco adicionales al principio y al final

            // Verificar si la respuesta contiene código TypeScript válido.
            if (strpos($response, 'interface') !== false || strpos($response, 'class') !== false || strpos($response, '=>') !== false) {
                return response($response)->header('Content-Type', 'text/plain');
            } else {
                throw new Exception(message: "La respuesta de Gemini no contiene código TypeScript válido: " . $response);
            }

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al procesar la solicitud con Gemini',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function listModels(GeminiService $geminiService)
    {
        try {
            $models = $geminiService->listModels();
            return response()->json([
                'status' => 'success',
                'models' => $models
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al listar los modelos',
                'error' => $e->getMessage()
            ]);
        }
    }




    public function process(Request $request, GeminiService $geminiService) //le pasamos tambien el servicio de gemini//
    {
        // Validar los archivos subidos
        $this->validate($request, [
            'files' => 'required|array|min:1',
            'files.*' => 'required|file|max:2048'
        ]);

        // Definir las extensiones permitidas
        {
            $allowedExtensions = ['pdf', 'docx', 'c', 'cpp', 'h', 'cs', 'java', 'kt', 'kts', 'swift', 'go', 'rs', 'dart', 'py', 'rb', 'pl', 'php', 'ts', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 'js', 'jsx', 'vue', 'svelte', 'sql', 'db', 'sqlite', 'sqlite3', 'mdb', 'accdb', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'env', 'sh', 'bat', 'ps1', 'twig', 'ejs', 'pug', 'md', 'ipynb', 'r', 'mat', 'asm', 'f90', 'f95', 'txt'];

            $validator = Validator::make($request->all(), [
                'files' => 'required|array|min:1',
                'files.*' => [
                    'required',
                    'file',
                    'max:2048',
                    function ($attribute, $value, $fail) use ($allowedExtensions) {
                        $extension = strtolower($value->getClientOriginalExtension());
                        if (!in_array($extension, $allowedExtensions)) {
                            $fail("La extensión .$extension no está permitida.");
                        }
                    }
                ]
            ], [
                'files.required' => 'Debes subir al menos un archivo',
                'files.*.file' => 'Cada elemento debe ser un archivo válido',
                'files.*.max' => 'Los archivos no deben exceder 2MB',
                'files.min' => 'Debes subir al menos un archivo'
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator);
            }

            $newContents = [];
            $newNames = [];

            foreach ($request->file('files') as $file) {
                try {
                    // Leer el contenido ANTES de almacenar y/o procesar
                    $content = file_get_contents($file->getRealPath());
                    $extension = strtolower($file->getClientOriginalExtension()); //para comparar extensiones de forma sencilla//

                    if ($extension === 'pdf') {
                        try {
                            $parser = new \Smalot\PdfParser\Parser();
                            $pdf = $parser->parseContent($content);
                            $text = $pdf->getText();

                            $lines = explode("\n", $text);
                            $cleanLines = [];

                            foreach ($lines as $line) {
                                $trimmedLine = trim(preg_replace('/\s+/', ' ', $line));
                                if ($trimmedLine !== '') {
                                    $cleanLines[] = $trimmedLine;
                                }
                            }

                            $cleanText = implode("\n", $cleanLines);
                            $newContents[] = $cleanText;
                        } catch (Exception $e) {
                            throw new Exception("Failed to parse the .pdf file: " . $e->getMessage());
                        }
                    } else if ($extension === 'docx') {
                        try {
                            $phpWord = IOFactory::load($file->getRealPath());
                            $lines = [];

                            foreach ($phpWord->getSections() as $section) {
                                foreach ($section->getElements() as $element) {
                                    if ($element instanceof Text) {
                                        $line = trim(preg_replace('/[ \t]+/', ' ', $element->getText()));
                                        if ($line !== '') {
                                            $lines[] = $line;
                                        }
                                    } elseif ($element instanceof TextRun) {
                                        $textRunLine = '';
                                        foreach ($element->getElements() as $child) {
                                            if ($child instanceof Text) {
                                                $textRunLine .= $child->getText() . ' ';
                                            }
                                        }
                                        $line = trim(preg_replace('/[ \t]+/', ' ', $textRunLine));
                                        if ($line !== '') {
                                            $lines[] = $line;
                                        }
                                    }
                                }
                            }
                            $cleanText = implode("\n", $lines);
                            $newContents[] = $cleanText;
                        } catch (Exception $e) {
                            throw new Exception("Failed to parse the .docx file: " . $e->getMessage());
                        }
                    } else {
                        //$cleanText = trim(preg_replace('/\s+/', ' ', $content));
                        $newContents[] = $content;
                    }

                    $timestampName = time() . '_' . $file->getClientOriginalName();

                    $file->storeAs('uploads', $timestampName, 'public');
                    $newNames[] = $file->getClientOriginalName();
                } catch (Exception $e) {
                    return back()->withErrors(['files' => 'Error al procesar: ' . $file->getClientOriginalName()]);
                }
            }
            //Aqui vamos a manejar las llamadas a la API de Gemini y como lo integramos en los arrays de session//
            $basePrompt = <<<'EOD'
            Actúa como un experto en refactorización de código.

            Refactoriza el siguiente código para mejorar su legibilidad y eficiencia. Detecta automáticamente el lenguaje de programación. Devuelve únicamente el código refactorizado, sin explicaciones ni texto adicional. Asegúrate de que el código refactorizado sea funcionalmente equivalente al original. Si la refactorización no es posible o el código original es óptimo, devuelve el código original tal cual.
        EOD;

            $apiContents = []; //array para almacenar la salida de la API//

            foreach ($newContents as $content) {
                try {
                    $completePrompt = $basePrompt . "\n\n" . $content;
                    $rawResponse = $geminiService->generateText($completePrompt);
                    // Limpiamos la salida para que se vea mas limpia y ordenada //
                    $cleanedResponse = preg_replace('/^```.*?\n?/', '', $rawResponse);
                    $cleanedResponse = preg_replace('/```$/', '', $cleanedResponse);
                    $cleanedResponse = trim($cleanedResponse);

                    //Validamos el caso en el que la salida se quede vacia tras limpiarla //
                    if (empty($cleanedResponse)) {
                        return redirect()->back()->with('error','The response from Gemini is empty. Please try again with other file.');
                    }

                    // Ahora almacenamos la salida en el arrray de la API//
                    $apiContents[] = $cleanedResponse;


                } catch (Exception $e) {
                    return redirect()->back()->with('error', 'Error while trying to call the API: ' . $e->getMessage());
                }
            }


            // Actualizamos arrays de sesion
            $request->session()->put('ApiContents', array_merge(
                $request->session()->get('ApiContents', []),
                $apiContents
            ));

            $request->session()->put('ApiNames', array_merge(
                $request->session()->get('ApiNames', []),
                $newNames
            ));

            $request->session()->save(); //guardamos la sesion de forma explicita //

            return redirect()->back()->with('success', count($newNames) === 1 ? 'File processed successfully' : count($newNames) . ' files processed successfully');
        }
    }


    public function clearApiSession(Request $request)
    {
        $request->session()->forget(['ApiContents', 'ApiNames']);
        $request->session()->save(); //guardamos la sesion de forma explicita //
        return redirect()->back()->with([
            'success' => 'Historial cleared',
            '_sync' => now()->timestamp,
        ]);
    }

}