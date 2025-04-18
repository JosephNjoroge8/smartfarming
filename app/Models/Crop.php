<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Crop extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'crop_name',
        'crop_type',
        'variety',
        'planting_date',
        'location',
        'soil_type',
        'soil_ph',
        'soil_moisture',
        'seed_source',
        'seed_treatment',
        'weather_conditions',
        'irrigation_method',
        'irrigation_frequency',
        'fertilizer_details',
        'pesticide_details',
        'initial_plant_count',
        'growth_goals',
        'equipment_used',
        'notes',
        'photo_path',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function diseaseDetections()
    {
        return $this->hasMany(DiseaseDetection::class);
    }

    // Add field type validation
    public static $rules = [
        'name' => 'required|string|max:255',
        'type' => 'required|string|max:100',
        'planting_date' => 'required|date',
        'expected_harvest_date' => 'required|date|after:planting_date',
        'field_location' => 'required|string|max:255',
        'notes' => 'nullable|string'
    ];
}
