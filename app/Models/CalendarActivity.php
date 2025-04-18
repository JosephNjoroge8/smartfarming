<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'crop_id',
        'date',
        'text',
        'completed'
    ];

    protected $casts = [
        'date' => 'date',
        'completed' => 'boolean'
    ];

    public function crop()
    {
        return $this->belongsTo(Crop::class);
    }
}