<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\BlogComment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class BlogController extends Controller
{
    /**
     * Display the blog page
     */
    public function index()
    {
        return Inertia::render('Blog', [
            'auth' => [
                'user' => Auth::user()
            ],
            'posts' => BlogPost::with(['categories', 'user'])
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }
    
    /**
     * Get a specific blog post with details (API endpoint)
     */
    public function show($id)
    {
        $post = BlogPost::with(['categories', 'user', 'comments.user'])
            ->findOrFail($id);
            
        return response()->json($post);
    }

    /**
     * Get all blog categories (API endpoint)
     */
    public function getCategories()
    {
        $categories = BlogCategory::all();
        return response()->json($categories);
    }

    /**
     * Get comments for a specific blog post (API endpoint)
     */
    public function getComments($id)
    {
        try {
            $comments = BlogComment::where('blog_post_id', $id)
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'content' => $comment->content,
                        'user_name' => $comment->user->name,
                        'created_at' => $comment->created_at
                    ];
                });

            return response()->json($comments);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error fetching comments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new comment on a blog post (API endpoint)
     */
    public function storeComment(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|min:3|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid comment: ' . $validator->errors()->first()
            ], 422);
        }

        try {
            // Verify the post exists
            $post = BlogPost::findOrFail($id);

            // Create the comment
            $comment = new BlogComment();
            $comment->content = $request->input('content');
            $comment->blog_post_id = $id;
            $comment->user_id = Auth::id();
            $comment->save();

            return response()->json([
                'id' => $comment->id,
                'content' => $comment->content,
                'user_name' => Auth::user()->name,
                'created_at' => $comment->created_at
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error saving comment: ' . $e->getMessage()
            ], 500);
        }
    }
}