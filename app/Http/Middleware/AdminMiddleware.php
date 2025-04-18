<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Check if authenticated with admin guard
        if (!Auth::guard('admin')->check()) {
            return redirect('/admin/login')->with('error', 'Please login as admin');
        }
        
        return $next($request);
    }
}