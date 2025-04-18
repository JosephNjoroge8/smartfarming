<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminAuth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use App\Providers\RouteServiceProvider;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        // Ensure we're using admin-specific components and routes
        return Inertia::render('Admin/Auth/Login', [
            'canResetPassword' => Route::has('admin.password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        // Explicit validation
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Explicitly use the admin guard
        if (Auth::guard('admin')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // Log successful admin login
            Log::info('Admin login successful', ['admin_id' => Auth::guard('admin')->id()]);

            // Redirect to admin dashboard using named route for flexibility
            return redirect()->intended(RouteServiceProvider::ADMIN_DASHBOARD);
        }

        // Log failed attempts
        Log::warning('Failed admin login attempt', ['email' => $request->email]);

        // Throw validation exception with clear message
        throw ValidationException::withMessages([
            'email' => trans('auth.failed'),
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Log logout action
        $adminId = Auth::guard('admin')->id();
        
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        Log::info('Admin logged out', ['admin_id' => $adminId]);

        // Use named route for flexibility
        return redirect()->route('admin.login');
    }
}
