<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'title',
        'description',
        'due_date',
        'status',
        'priority',
        'user_id',
        'crop_id',
        'completed_at'
    ];
    
    protected $dates = [
        'due_date',
        'completed_at'
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function crop()
    {
        return $this->belongsTo(Crop::class);
    }
}
