<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'type',
        'message',
        'related_type',
        'related_id'
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    // Polymorphic relationship to related models
    public function related()
    {
        return $this->morphTo();
    }
}
