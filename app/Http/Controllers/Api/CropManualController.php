<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CropManual;
use Illuminate\Http\Request;

class CropManualController extends Controller
{
    public function index()
    {
        $manuals = CropManual::with(['category', 'images'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($manuals);
    }

    public function show($id)
    {
        $manual = CropManual::with(['category', 'images'])
            ->findOrFail($id);
            
        return response()->json($manual);
    }
}