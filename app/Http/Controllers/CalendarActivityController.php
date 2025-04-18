<?php

namespace App\Http\Controllers;

use App\Models\CalendarActivity;
use App\Models\Crop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CalendarActivityController extends Controller
{
    public function index(Crop $crop)
    {
        // Ensure user owns this crop
        if ($crop->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $activities = CalendarActivity::where('crop_id', $crop->id)->get();
        
        // Format activities in the same structure as your frontend expects
        $formattedActivities = [];
        foreach ($activities as $activity) {
            $dateKey = $activity->date->format('Y-m-d');
            if (!isset($formattedActivities[$dateKey])) {
                $formattedActivities[$dateKey] = [];
            }
            
            $formattedActivities[$dateKey][] = [
                'id' => $activity->id,
                'text' => $activity->text,
                'completed' => (bool) $activity->completed,
                'date' => $dateKey,
                'synced' => true
            ];
        }

        return response()->json([
            'success' => true,
            'activities' => $formattedActivities
        ]);
    }

    public function store(Request $request, Crop $crop)
    {
        // Ensure user owns this crop
        if ($crop->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Process each activity from the activities object
        $savedIds = [];
        
        foreach ($request->activities as $dateKey => $dateActivities) {
            foreach ($dateActivities as $activity) {
                // Skip empty activities
                if (empty($activity['text'])) continue;
                
                // Check if this is an existing activity with a real ID
                if (isset($activity['id']) && !str_contains($activity['id'], 'temp_')) {
                    // Update existing
                    $existingActivity = CalendarActivity::find($activity['id']);
                    if ($existingActivity && $existingActivity->crop_id == $crop->id) {
                        $existingActivity->update([
                            'text' => $activity['text'],
                            'completed' => $activity['completed'] ?? false,
                            'date' => $dateKey
                        ]);
                        $savedIds[] = $existingActivity->id;
                    }
                } else {
                    // Create new
                    $newActivity = CalendarActivity::create([
                        'crop_id' => $crop->id,
                        'date' => $dateKey,
                        'text' => $activity['text'],
                        'completed' => $activity['completed'] ?? false
                    ]);
                    $savedIds[] = $newActivity->id;
                }
            }
        }
        
        // Remove activities not included in the request (deleted on frontend)
        CalendarActivity::where('crop_id', $crop->id)
            ->whereNotIn('id', $savedIds)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Activities saved successfully'
        ]);
    }

    public function update(Request $request, Crop $crop, $id)
    {
        $activity = CalendarActivity::findOrFail($id);
        
        // Ensure user owns this crop and activity belongs to this crop
        if ($crop->user_id !== Auth::id() || $activity->crop_id !== $crop->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }
        
        $activity->update([
            'text' => $request->text,
            'completed' => $request->completed ?? $activity->completed,
            'date' => $request->date ?? $activity->date
        ]);
        
        return response()->json([
            'success' => true,
            'activity' => $activity
        ]);
    }

    public function destroy(Crop $crop, $id)
    {
        $activity = CalendarActivity::findOrFail($id);
        
        // Ensure user owns this crop and activity belongs to this crop
        if ($crop->user_id !== Auth::id() || $activity->crop_id !== $crop->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }
        
        $activity->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Activity deleted successfully'
        ]);
    }
}