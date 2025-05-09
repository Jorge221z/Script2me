<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;

class LanguageController extends Controller
{
    public function switchLang($lang)
    {
        if (in_array($lang, ['en', 'es'])) {
            Session::put('locale', $lang);
            App::setLocale($lang);
            
            // Si es una petición AJAX, devuelve una respuesta JSON
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Language changed successfully',
                    'locale' => $lang
                ]);
            }
        }
        
        return redirect()->back();
    }
}
