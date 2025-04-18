<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated as admin and is a super admin
        if (Auth::guard('admin')->check() && Auth::guard('admin')->user()->is_super_admin) {
            return $next($request);
        }
        
        // Redirect to admin login if not logged in
        if (!Auth::guard('admin')->check()) {
            return redirect()->route('admin.login');
        }
        
        // Redirect to admin dashboard if not super admin
        return redirect()->route('admin.dashboard')->with('error', 'You do not have super admin privileges');
    }
}