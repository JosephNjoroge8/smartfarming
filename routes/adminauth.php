<?php

use App\Http\Controllers\Admin\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Admin\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Admin\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Admin\Auth\NewPasswordController;
use App\Http\Controllers\Admin\Auth\PasswordController;
use App\Http\Controllers\Admin\Auth\PasswordResetLinkController;
use App\Http\Controllers\Admin\Auth\VerifyEmailController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Remember: these routes already have 'admin' prefix from RouteServiceProvider

// Guest admin routes
Route::middleware('guest:admin')->group(function () {
    // Use explicit "/" at the beginning to ensure no confusion
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])
        ->name('admin.login');
        
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('admin.password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('admin.password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('admin.password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('admin.password.store');
});

Route::middleware('auth:admin')->group(function () {
    Route::get('/dashboard', function() {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'userCount' => \App\Models\User::count(),
                'newUsersToday' => \App\Models\User::whereDate('created_at', today())->count(),
                'blogCount' => \App\Models\BlogPost::count() ?? 0,
                'cropManualCount' => \App\Models\CropManual::count() ?? 0,
            ]
        ]);
    })->name('admin.dashboard');

    Route::get('/users', function() {
        $users = \App\Models\User::latest()->paginate(15);
        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    })->name('admin.users');

    Route::get('/blogs', function() {
        $blogs = \App\Models\BlogPost::latest()->paginate(15);
        return Inertia::render('Admin/Blogs/Index', [
            'blogs' => $blogs
        ]);
    })->name('admin.blogs');

    Route::get('/crop-manuals', function() {
        $manuals = \App\Models\CropManual::latest()->paginate(15);
        return Inertia::render('Admin/CropManuals/Index', [
            'manuals' => $manuals
        ]);
    })->name('admin.crop-manuals');

    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('admin.verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('admin.verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('admin.verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('admin.password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store'])
        ->name('admin.password.confirm.store');

    Route::put('password', [PasswordController::class, 'update'])
        ->name('admin.password.update');

    Route::get('system-settings', [AdminController::class, 'systemSettings'])
        ->name('admin.system-settings');
        
    Route::post('user-management', [AdminController::class, 'manageUsers'])
        ->name('admin.user-management');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('admin.logout');
});
