<?php

namespace App\Http\Controllers;

use App\Models\Crop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CropController extends Controller
{
    /**
     * Display a listing of the crops.
     */
    public function index()
    {
        $crops = Crop::where('user_id', Auth::id())->orderBy('created_at', 'desc')->get();
        
        return Inertia::render('MyCrops', [
            'crops' => $crops,
            'auth' => [
                'user' => Auth::user(),
            ]
        ]);
    }

    /**
     * Show the form for creating a new crop.
     */
    public function create()
    {
        return Inertia::render('crops/Createcrop', [
            'auth' => [
                'user' => Auth::user(),
            ]
        ]);
    }

    /**
     * Store a newly created crop in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'crop_name' => 'required|string|max:255',
            'crop_type' => 'required|string|max:255',
            'variety' => 'nullable|string|max:255',
            'planting_date' => 'required|date',
            'location' => 'required|string|max:255',
            'soil_type' => 'nullable|string|max:255',
            'soil_ph' => 'nullable|numeric|min:0|max:14',
            'soil_moisture' => 'nullable|string|max:255',
            'seed_source' => 'nullable|string|max:255',
            'seed_treatment' => 'nullable|string|max:255',
            'weather_conditions' => 'nullable|string|max:255',
            'irrigation_method' => 'nullable|string|max:255',
            'irrigation_frequency' => 'nullable|string|max:255',
            'fertilizer_details' => 'nullable|string',
            'pesticide_details' => 'nullable|string',
            'initial_plant_count' => 'nullable|integer|min:1',
            'growth_goals' => 'nullable|string',
            'equipment_used' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'photo' => 'nullable|image|max:2048', // 2MB max
        ]);
        
        // Handle photo upload
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('crop-photos', 'public');
        }
        
        // Create crop with user_id
        $crop = new Crop(array_merge(
            $validated,
            [
                'user_id' => Auth::id(),
                'photo_path' => $photoPath,
            ]
        ));
        
        $crop->save();
        
        return redirect()->route('my-crops')->with('success', 'Crop added successfully!');
    }

    /**
     * Display the specified crop.
     */
    public function show(Crop $crop)
    {
        // Authorization check
        $this->authorize('view', $crop);
        
        return Inertia::render('crops/Show', [
            'crop' => $crop,
            'auth' => [
                'user' => Auth::user(),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified crop.
     */
    public function edit(Crop $crop)
    {
        // Authorization check
        $this->authorize('update', $crop);
        
        return Inertia::render('crops/Edit', [
            'crop' => $crop,
            'auth' => [
                'user' => Auth::user(),
            ]
        ]);
    }

    /**
     * Update the specified crop in storage.
     */
    public function update(Request $request, Crop $crop)
    {
        // Authorization check
        $this->authorize('update', $crop);
        
        $validated = $request->validate([
            'crop_name' => 'required|string|max:255',
            'crop_type' => 'required|string|max:255',
            'variety' => 'nullable|string|max:255',
            'planting_date' => 'required|date',
            'location' => 'required|string|max:255',
            'soil_type' => 'nullable|string|max:255',
            'soil_ph' => 'nullable|numeric|min:0|max:14',
            'soil_moisture' => 'nullable|string|max:255',
            'seed_source' => 'nullable|string|max:255',
            'seed_treatment' => 'nullable|string|max:255',
            'weather_conditions' => 'nullable|string|max:255',
            'irrigation_method' => 'nullable|string|max:255',
            'irrigation_frequency' => 'nullable|string|max:255',
            'fertilizer_details' => 'nullable|string',
            'pesticide_details' => 'nullable|string',
            'initial_plant_count' => 'nullable|integer|min:1',
            'growth_goals' => 'nullable|string',
            'equipment_used' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'photo' => 'nullable|image|max:2048', // 2MB max
        ]);
        
        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($crop->photo_path) {
                Storage::disk('public')->delete($crop->photo_path);
            }
            
            $photoPath = $request->file('photo')->store('crop-photos', 'public');
            $crop->photo_path = $photoPath;
        }
        
        $crop->update($validated);
        
        return redirect()->route('my-crops')->with('success', 'Crop updated successfully!');
    }

    /**
     * Remove the specified crop from storage.
     */
    public function destroy(Crop $crop)
    {
        // Authorization check
        $this->authorize('delete', $crop);
        
        // Delete photo if exists
        if ($crop->photo_path) {
            Storage::disk('public')->delete($crop->photo_path);
        }
        
        $crop->delete();
        
        return redirect()->route('my-crops')->with('success', 'Crop deleted successfully!');
    }
}