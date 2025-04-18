<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    /**
     * Return all blog posts
     */
    public function index()
    {
        // Simple placeholder response to test the route
        return response()->json(['message' => 'Blog posts endpoint reached successfully']);
        
        // Uncomment when you're ready to return real data
        /*
        $posts = BlogPost::with(['categories', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($posts);
        */
    }
    
    /**
     * Return a specific blog post
     */
    public function show($id)
    {
        return response()->json(['message' => 'Single post endpoint reached successfully', 'post_id' => $id]);
    }
    
    /**
     * Return all blog categories
     */
    public function getCategories()
    {
        return response()->json(['message' => 'Categories endpoint reached successfully']);
    }
}