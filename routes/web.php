<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\CropController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CropManualController;
use App\Http\Controllers\DiseaseDetectionController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WeatherController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Debug routes
Route::get('/debug-admin-route', function() {
    return [
        'admin_login_route' => route('admin.login'),
        'user_login_route' => route('login'),
        'current_guards' => array_keys(config('auth.guards')),
    ];
});

Route::get('/test-admin', function() {
    if (Auth::guard('admin')->check()) {
        return "Logged in as admin: " . Auth::guard('admin')->user()->name;
    }
    return "Not logged in as admin";
});

// Add this temporary debug route to check admin authentication
Route::get('/debug-admin-auth', function () {
    return [
        'admin_authenticated' => auth()->guard('admin')->check(),
        'admin_user' => auth()->guard('admin')->user(),
        'web_authenticated' => auth()->guard('web')->check(),
        'session_has_admin' => session()->has('admin_id'),
    ];
});

// Public routes - accessible to everyone
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

// Static public pages
Route::get('/contact', function () { return Inertia::render('Contact'); })->name('contact');
Route::get('/about', function () { return Inertia::render('About'); })->name('about');
Route::get('/terms', function () { return Inertia::render('Terms'); })->name('terms');
Route::get('/help', function () { return Inertia::render('Help'); })->name('help');

// Outside the admin middleware - these routes for normal users
Route::get('/crop-manuals', function() {
    $manuals = \App\Models\CropManual::where('is_published', true)->paginate(12);
    
    return Inertia::render('CropManuals/Index', [
        'manuals' => $manuals
    ]);
})->name('crop-manuals.index');

Route::get('/crop-manuals/{id}', function($id) {
    $manual = \App\Models\CropManual::findOrFail($id);
    
    // Security check - unpublished manuals should only be visible to admins
    if (!$manual->is_published && !Auth::guard('admin')->check()) {
        abort(404);
    }
    
    return Inertia::render('CropManuals/Show', [
        'manual' => $manual,
        'canComment' => $manual->allow_comments
    ]);
})->name('crop-manuals.show');

// Authenticated user routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profile routes
    Route::controller(ProfileController::class)->group(function () {
        Route::get('/profile', 'edit')->name('profile.edit');
        Route::patch('/profile', 'update')->name('profile.update');
        Route::delete('/profile', 'destroy')->name('profile.destroy');
    });
    
    // Crop routes
    Route::get('/my-crops', function () {
        $crops = \App\Models\Crop::where('user_id', auth::id())->get();
        return Inertia::render('MyCrops', ['crops' => $crops]);
    })->name('my-crops');
    
    Route::get('/crops/create', function () {
        return inertia('Crops/Createcrop');  // uppercase "Crops" to match your folder
    })->name('crops.create');
    
    Route::controller(CropController::class)->group(function () {
        Route::post('/crops', 'store')->name('crops.store');
    });
    
    // Single crop routes
    Route::get('/crops/{id}', function ($id) {
        $crop = \App\Models\Crop::findOrFail($id);
        return Inertia::render('Crops/Show', ['crop' => $crop]);
    })->name('crops.show');
    
    Route::get('/crops/{id}/edit', function ($id) {
        $crop = \App\Models\Crop::findOrFail($id);
        
        if ($crop->user_id !== auth::id()) {
            return redirect('/my-crops')->with('error', 'You do not have permission to edit this crop');
        }
        
        return Inertia::render('Crops/Edit', ['crop' => $crop]);
    })->name('crops.edit');

    Route::put('/crops/{id}', function (Request $request, $id) {
        $crop = \App\Models\Crop::findOrFail($id);
        
        if ($crop->user_id !== auth::id()) {
            return redirect('/my-crops')->with('error', 'You do not have permission to edit this crop');
        }
        
        $validated = $request->validate([
            'crop_name' => 'required|string|max:255',
            'crop_type' => 'required|string|max:255',
            'variety' => 'nullable|string|max:255',
            'planting_date' => 'required|date',
            'location' => 'required|string|max:255',
        ]);
        
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('crops', 'public');
            $crop->photo_path = $path;
        }
        
        $crop->fill($validated);
        $crop->save();
        
        return redirect()->route('crops.show', $crop->id)->with('success', 'Crop updated successfully');
    })->name('crops.update');
    
    // Task routes
    Route::get('/tasks', function () {
        return Inertia::render('Tasks/Index');
    })->name('tasks');
    
    Route::get('/tasks/create', function () {
        return Inertia::render('Tasks/Create');
    })->name('tasks.create');
    
    Route::get('/tasks/list', [TaskController::class, 'list'])->name('tasks.list');
    
    // Utility routes
    Route::get('/disease-detection', function () {
        return Inertia::render('DiseaseDetection');
    })->name('disease-detection');
    
    Route::get('/weather', function () {
        return Inertia::render('Weather/Show');
    })->name('weather');
    
    Route::get('/activities', function () {
        return Inertia::render('Activities');
    })->name('activities');
    
    Route::get('/market-prices', function () {
        return Inertia::render('MarketPrices');
    })->name('market-prices');

    Route::get('/soil-analysis', function () {
        return Inertia::render('SoilAnalysis');
    })->name('soil-analysis');
    
    // Feature routes
    Route::get('/blog', function () {
        $posts = \App\Models\BlogPost::latest()->paginate(10);
        return Inertia::render('Blog', ['posts' => $posts]);
    })->name('blog');
    
    Route::get('/crop-manual', function () {
        $manuals = \App\Models\CropManual::all();
        return Inertia::render('CropManual', ['manuals' => $manuals]);
    })->name('crop-manual');
    
    // Compatibility route
    Route::get('/crops/Createcrop', function() {
        return redirect()->route('crops.create');
    })->name('crops.Createcrop');
});

// Admin routes
Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {
    Route::get('/admin/system-settings', [AdminController::class, 'systemSettings']);
    Route::post('/admin/user-management', [AdminController::class, 'manageUsers']);
    
    Route::get('/admin/users', function() {
        $users = \App\Models\User::paginate(10); // Paginate users
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'admin' => Auth::guard('admin')->user()
        ]);
    })->name('admin.users');
    
    Route::get('/admin/users/create', function() {
        return Inertia::render('Admin/Users/Create', [
            'admin' => Auth::guard('admin')->user()
        ]);
    })->name('admin.users.create');
    
    Route::get('/admin/users/{id}', function($id) {
        $user = \App\Models\User::findOrFail($id);
        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'admin' => Auth::guard('admin')->user()
        ]);
    })->name('admin.users.show');
    
    Route::get('/admin/users/{id}/edit', function($id) {
        $user = \App\Models\User::findOrFail($id);
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'admin' => Auth::guard('admin')->user()
        ]);
    })->name('admin.users.edit');

    
    // Crop Manual routes - Updated without categories
    Route::get('/admin/crop-manuals', function() {
        $cropManuals = \App\Models\CropManual::paginate(10);
        
        return Inertia::render('Admin/CropManual/Index', [
            'cropManuals' => $cropManuals,
            'admin' => Auth::guard('admin')->user()
        ]);
    })->name('admin.crop-manuals.index');

    Route::get('/admin/crop-manuals/create', function() {
        return Inertia::render('Admin/CropManual/Create', [
            'admin' => Auth::guard('admin')->user(),
            // Removed categories
        ]);
    })->name('admin.crop-manuals.create');

    Route::post('/admin/crop-manuals', function(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'description' => 'required|string',
            'planting_instructions' => 'nullable|string',
            'growing_conditions' => 'nullable|string',
            'pest_management' => 'nullable|string',
            'harvesting_info' => 'nullable|string',
            'nutritional_value' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'allow_comments' => 'boolean',
        ]);
        
        $cropManual = new \App\Models\CropManual();
        
        // Set all text fields
        $cropManual->title = $validated['name']; // Assuming your DB field is 'title' not 'name'
        $cropManual->scientific_name = $validated['scientific_name'];
        $cropManual->description = $validated['description'];
        $cropManual->planting_instructions = $validated['planting_instructions'];
        $cropManual->growing_conditions = $validated['growing_conditions'];
        $cropManual->pest_management = $validated['pest_management'];
        $cropManual->harvesting_info = $validated['harvesting_info'];
        $cropManual->nutritional_value = $validated['nutritional_value'];
        $cropManual->is_published = $validated['is_published'];
        $cropManual->allow_comments = $validated['allow_comments'];
        
        // Handle image upload if present
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('crop-manuals', 'public');
            $cropManual->image_path = $path;
        }
        
        $cropManual->save();
        
        return redirect()->route('admin.crop-manuals.index')
            ->with('success', 'Crop manual created successfully');
    })->name('admin.crop-manuals.store');

    Route::get('/admin/crop-manuals/{id}', function($id) {
        $manual = \App\Models\CropManual::findOrFail($id);
        
        return Inertia::render('Admin/CropManual/Show', [
            'manual' => $manual,
            'admin' => Auth::guard('admin')->user()
        ]);
    })->name('admin.crop-manuals.show');

    Route::get('/admin/crop-manuals/{id}/edit', function($id) {
        $manual = \App\Models\CropManual::findOrFail($id);
        
        return Inertia::render('Admin/CropManual/Edit', [
            'manual' => $manual,
            'admin' => Auth::guard('admin')->user()
        ]);
    })->name('admin.crop-manuals.edit');

    Route::put('/admin/crop-manuals/{id}', function(Request $request, $id) {
        // Update logic here
    })->name('admin.crop-manuals.update');

    Route::delete('/admin/crop-manuals/{id}', function($id) {
        $manual = \App\Models\CropManual::findOrFail($id);
        $manual->delete();
        
        return redirect()->route('admin.crop-manuals.index')
            ->with('success', 'Crop manual deleted successfully');
    })->name('admin.crop-manuals.destroy');

    // Admin Dashboard Route (if not already defined)
    Route::get('/admin/dashboard', function() {
        return Inertia::render('Admin/Dashboard', [
            'auth' => [
                'user' => Auth::guard('admin')->user()
            ],
            'stats' => [
                'userCount' => \App\Models\User::count(),
                'newUsersToday' => 0, // Or calculate this
                'blogCount' => 0, // Or get actual count
                'cropManualCount' => \App\Models\CropManual::count() ?? 0,
            ]
        ]);
    })->name('admin.dashboard');

    Route::get('/admin/blogs', function() {
        return Inertia::render('Admin/Blogs/Index', [
            'admin' => Auth::guard('admin')->user(),
        ]);
    })->name('admin.blogs');
});



