<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Crop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CropController extends Controller
{
    /**
     * Return all crops for the authenticated user
     */
    public function index()
    {
        return response()->json(['message' => 'Crops endpoint reached successfully']);
    }

    /**
     * Return a specific crop
     */
    public function show($id)
    {
        return response()->json(['message' => 'Single crop endpoint reached successfully', 'crop_id' => $id]);
    }
}