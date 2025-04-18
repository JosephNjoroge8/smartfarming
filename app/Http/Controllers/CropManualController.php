<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CropManual;
use App\Models\CropManualComment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CropManualController extends Controller
{
    /**
     * Display the crop manual page
     */
    public function index()
    {
        $crops = CropManual::orderBy('name')->get(['id', 'name', 'icon']);
        
        return Inertia::render('CropManual', [
            'initialCrops' => $crops,
            'auth' => [
                'user' => Auth::user(),
            ]
        ]);
    }

    /**
     * Get all crops for the manual (API endpoint)
     */
    public function getAllCrops()
    {
        try {
            $crops = CropManual::orderBy('name')->get(['id', 'name', 'icon']);
            return response()->json($crops);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching crops: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detailed information about a specific crop (API endpoint)
     */
    public function getCropDetails($id)
    {
        try {
            $crop = CropManual::findOrFail($id);

            return response()->json([
                'id' => $crop->id,
                'name' => $crop->name,
                'description' => $crop->description,
                'image_url' => $crop->image_url,
                'growing_season' => $crop->growing_season,
                'water_needs' => $crop->water_needs,
                'soil_type' => $crop->soil_type,
                'time_to_harvest' => $crop->time_to_harvest,
                'steps' => json_decode($crop->growing_steps),
                'dos' => json_decode($crop->dos),
                'donts' => json_decode($crop->donts),
                'created_at' => $crop->created_at
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching crop details: ' . $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get comments for a specific crop (API endpoint)
     */
    public function getComments($id)
    {
        try {
            $comments = CropManualComment::where('crop_manual_id', $id)
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'content' => $comment->content,
                        'user_name' => $comment->user->name,
                        'created_at' => $comment->created_at
                    ];
                });

            return response()->json($comments);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching comments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new comment on a crop (API endpoint)
     */
    public function storeComment(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|min:3|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid comment: ' . $validator->errors()->first()
            ], 422);
        }

        try {
            // Verify the crop exists
            $crop = CropManual::findOrFail($id);

            // Create the comment
            $comment = new CropManualComment();
            $comment->content = $request->input('content');
            $comment->crop_manual_id = $id;
            $comment->user_id = Auth::id();
            $comment->save();

            return response()->json([
                'id' => $comment->id,
                'content' => $comment->content,
                'user_name' => Auth::user()->name,
                'created_at' => $comment->created_at
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error saving comment: ' . $e->getMessage()
            ], 500);
        }
    }
}