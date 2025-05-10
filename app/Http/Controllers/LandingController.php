<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class LandingController extends Controller
{

    public function index()
    {
        try {
            //devolvemos la vista de landing
            return Inertia::render('landing');

        } catch (Exception $e) {
            error_log('Error en landing: ' . $e->getMessage());
            return Inertia::render('landing', [
                'error' => __('messages.dashboard_load_error', ['msg' => $e->getMessage()])
            ]);
        }
    }

}
