<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description'
    ];

    /**
     * Get the posts that belong to this category
     */
    public function posts()
    {
        return $this->belongsToMany(BlogPost::class, 'blog_post_categories', 'category_id', 'post_id');
    }
}