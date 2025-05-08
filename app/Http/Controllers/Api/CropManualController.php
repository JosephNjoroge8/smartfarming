<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CropManual;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CropManualController extends Controller
{
    public function index()
    {
        try {
            // Remove relationships that don't exist
            $manuals = CropManual::orderBy('created_at', 'desc')
                ->get();
                
            return response()->json($manuals);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            // Remove relationships that don't exist
            $manual = CropManual::findOrFail($id);
                
            return response()->json($manual);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Crop manual not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}