<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CropManual;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CropManualController extends Controller
{
    // Make sure middleware is applied in the constructor
    public function __construct()
    {
        $this->middleware('admin');
    }

    public function index()
    {
        $cropManuals = CropManual::orderBy('name')->paginate(10);
        
        return Inertia::render('Admin/CropManuals/Index', [
            'cropManuals' => $cropManuals
        ]);
    }
    
    public function create()
    {
        return Inertia::render('Admin/CropManuals/Create', [
            'admin' => auth()->guard('admin')->user()
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'description' => 'required|string',
            'planting_instructions' => 'nullable|string',
            'growing_conditions' => 'nullable|string',
            'pest_management' => 'nullable|string',
            'harvesting_info' => 'nullable|string',
            'nutritional_value' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'icon' => 'nullable|string',
            'growing_season' => 'nullable|string',
            'water_needs' => 'nullable|string',
            'soil_type' => 'nullable|string',
            'time_to_harvest' => 'nullable|string',
            'growing_steps' => 'nullable|string',
            'dos' => 'nullable|string',
            'donts' => 'nullable|string',
            'is_published' => 'boolean',
            'allow_comments' => 'boolean',
        ]);
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('crop_manuals', 'public');
            $validated['image_path'] = $path;
            $validated['image_url'] = asset('storage/' . $path);
        }
        
        CropManual::create($validated);
        
        return redirect()->route('admin.crop-manuals.index')
            ->with('success', 'Crop manual created successfully.');
    }
    
    public function show(CropManual $cropManual)
    {
        return Inertia::render('Admin/CropManuals/Show', [
            'cropManual' => $cropManual
        ]);
    }
    
    public function edit(CropManual $cropManual)
    {
        return Inertia::render('Admin/CropManuals/Edit', [
            'cropManual' => $cropManual
        ]);
    }
    
    public function update(Request $request, CropManual $cropManual)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'description' => 'required|string',
            'planting_instructions' => 'nullable|string',
            'growing_conditions' => 'nullable|string',
            'pest_management' => 'nullable|string',
            'harvesting_info' => 'nullable|string',
            'nutritional_value' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'icon' => 'nullable|string',
            'growing_season' => 'nullable|string',
            'water_needs' => 'nullable|string',
            'soil_type' => 'nullable|string',
            'time_to_harvest' => 'nullable|string',
            'growing_steps' => 'nullable|string',
            'dos' => 'nullable|string',
            'donts' => 'nullable|string',
            'is_published' => 'boolean',
            'allow_comments' => 'boolean',
        ]);
        
        if ($request->hasFile('image')) {
            // Delete previous image if exists
            if ($cropManual->image_path) {
                Storage::disk('public')->delete($cropManual->image_path);
            }
            
            $path = $request->file('image')->store('crop_manuals', 'public');
            $validated['image_path'] = $path;
            $validated['image_url'] = asset('storage/' . $path);
        }
        
        $cropManual->update($validated);
        
        return redirect()->route('admin.crop-manuals.index')
            ->with('success', 'Crop manual updated successfully.');
    }
    
    public function destroy(CropManual $cropManual)
    {
        if ($cropManual->image_path) {
            Storage::disk('public')->delete($cropManual->image_path);
        }
        
        $cropManual->delete();
        
        return redirect()->route('admin.crop-manuals.index')
            ->with('success', 'Crop manual deleted successfully.');
    }
}