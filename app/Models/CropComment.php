<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CropComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'content',
        'crop_id',
        'user_id'
    ];

    /**
     * Get the crop this comment belongs to
     */
    public function crop()
    {
        return $this->belongsTo(Crop::class);
    }

    /**
     * Get the user who wrote the comment
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}