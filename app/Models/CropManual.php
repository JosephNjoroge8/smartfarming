<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CropManual extends Model
{
    use HasFactory;

    protected $table = 'crop_manuals';

    protected $fillable = [
        'name',
        'scientific_name',
        'description',
        'planting_instructions',
        'growing_conditions',
        'pest_management',
        'harvesting_info',
        'nutritional_value',
        'image_url',
        'image_path',
        'icon',
        'growing_season',
        'water_needs',
        'soil_type',
        'time_to_harvest',
        'growing_steps',
        'dos',
        'donts',
        'is_published',
        'allow_comments',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'growing_steps' => 'array',
        'dos' => 'array',
        'donts' => 'array',
        'is_published' => 'boolean',
        'allow_comments' => 'boolean',
    ];

    /**
     * Get comments for this crop manual
     */
    public function comments()
    {
        return $this->hasMany(CropManualComment::class);
    }
}