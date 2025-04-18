<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'content',
        'blog_post_id',
        'user_id'
    ];

    /**
     * Get the post this comment belongs to
     */
    public function blogPost()
    {
        return $this->belongsTo(BlogPost::class);
    }

    /**
     * Get the user who wrote the comment
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}