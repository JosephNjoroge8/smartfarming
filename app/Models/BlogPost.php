<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'excerpt',
        'content',
        'image_url',
        'user_id',
        'status',
        'featured',
        'read_time'
    ];

    /**
     * Get the user who authored the post
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the categories for this post
     */
    public function categories()
    {
        return $this->belongsToMany(BlogCategory::class, 'blog_post_categories', 'post_id', 'category_id');
    }

    /**
     * Get the comments for this post
     */
    public function comments()
    {
        return $this->hasMany(BlogComment::class);
    }
}