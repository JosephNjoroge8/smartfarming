<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\WeatherController;
use App\Http\Controllers\DiseaseDetectionController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CropController;
use App\Http\Controllers\Api\CropManualController;
use App\Http\Controllers\CalendarActivityController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Weather API endpoints
Route::get('/weather', [WeatherController::class, 'getWeatherData']);
Route::get('/weather/coordinates', [WeatherController::class, 'getWeatherByCoordinates']);
Route::get('/weather/default', [WeatherController::class, 'getDefaultWeather']);
// Route::get('/location/reverse', [WeatherController::class, 'reverseGeocode']); // Commented out due to duplicate route

// Location API routes
Route::get('/location/coordinates', function(App\Services\LocationService $locationService, Request $request) {
    $location = $request->query('location');
    return $locationService->getCoordinates($location);
});

Route::get('/location/reverse', function(App\Services\LocationService $locationService, Request $request) {
    return $locationService->reverseGeocode(
        $request->query('lat'),
        $request->query('lon')
    );
});

// Disease Detection routes
Route::post('/disease-detection/analyze', [DiseaseDetectionController::class, 'analyze']);

// Blog routes
Route::prefix('blog')->group(function () {
    Route::get('/posts', [BlogController::class, 'index']);
    Route::get('/posts/{id}', [BlogController::class, 'show']);
    Route::get('/categories', [BlogController::class, 'getCategories']);
});

// Crop routes
Route::get('/crops', [CropController::class, 'index']);
Route::get('/crops/{id}', [CropController::class, 'show']);

Route::prefix('api')->group(function () {
    Route::get('/crops', [CropController::class, 'index']);
    Route::get('/crops/{id}', [CropController::class, 'show']);
});

// Crop Manual API Routes
Route::prefix('crop-manuals')->group(function () {
    Route::get('/', [CropManualController::class, 'index']);
    Route::get('/{id}', [CropManualController::class, 'show']);
    Route::post('/', [CropManualController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{id}', [CropManualController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{id}', [CropManualController::class, 'destroy'])->middleware('auth:sanctum');
});

// Fix crop-manuals API endpoint
Route::get('/crop-manuals', function () {
    try {
        $manuals = \App\Models\CropManual::all();
        return response()->json($manuals);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch crop manuals', 'details' => $e->getMessage()], 500);
    }
});

Route::get('/crop-manuals/{id}', [CropManualController::class, 'show']);

// Fix tasks API endpoint
Route::get('/tasks', function () {
    try {
        $tasks = \App\Models\Task::where('user_id', \Illuminate\Support\Facades\Auth::id())->get();
        return response()->json($tasks);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to fetch tasks', 'details' => $e->getMessage()], 500);
    }
});

// Add these routes to handle the task API

// Get tasks for a user
Route::get('/tasks', function (Request $request) {
    $user = \Illuminate\Support\Facades\Auth::user();
    
    if (!$user) {
        return response()->json(['error' => 'Unauthenticated'], 401);
    }
    
    $tasks = \App\Models\Task::where('user_id', $user->id)
        ->orderBy('due_date', 'asc')
        ->get();
        
    return response()->json($tasks);
})->middleware('auth:sanctum');

// Create a new task
Route::post('/tasks', function (Request $request) {
    $user = \Illuminate\Support\Facades\Auth::user();
    
    if (!$user) {
        return response()->json(['error' => 'Unauthenticated'], 401);
    }
    
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'due_date' => 'required|date',
        'crop_id' => 'required|exists:crops,id',
        'description' => 'nullable|string',
    ]);
    
    $task = new \App\Models\Task([
        'title' => $validated['title'],
        'description' => $validated['description'] ?? '',
        'due_date' => $validated['due_date'],
        'status' => 'pending',
        'priority' => 'medium',
        'user_id' => $user->id,
        'crop_id' => $validated['crop_id']
    ]);
    
    $task->save();
    
    return response()->json($task, 201);
})->middleware('auth:sanctum');

// Add this API route if needed
Route::middleware('auth:sanctum')->post('/api/tasks/batch', function (Request $request) {
    $user = \Illuminate\Support\Facades\Auth::user();
    
    if (!$user) {
        return response()->json(['error' => 'Unauthenticated'], 401);
    }
    
    $validated = $request->validate([
        'tasks' => 'required|array',
        'tasks.*.title' => 'required|string|max:255',
        'tasks.*.due_date' => 'required|date',
        'tasks.*.crop_id' => 'required|exists:crops,id',
        'tasks.*.description' => 'nullable|string',
    ]);
    
    $createdTasks = [];
    
    foreach ($validated['tasks'] as $taskData) {
        $task = new \App\Models\Task([
            'title' => $taskData['title'],
            'description' => $taskData['description'] ?? '',
            'due_date' => $taskData['due_date'],
            'status' => 'pending',
            'priority' => 'medium',
            'user_id' => $user->id,
            'crop_id' => $taskData['crop_id'],
            // Store the activity_id for reference
            'metadata' => json_encode(['activity_id' => $taskData['activity_id'] ?? null])
        ]);
        
        $task->save();
        $createdTasks[] = $task;
    }
    
    return response()->json($createdTasks, 201);
});

// Get user's crops
Route::middleware('auth:sanctum')->get('/user-crops', function (Request $request) {
    return \App\Models\Crop::where('user_id', $request->user()->id)->get();
});

// Update task status
Route::middleware('auth:sanctum')->put('/tasks/{task}', function (Request $request, $task) {
    $task = \App\Models\Task::findOrFail($task);
    
    // Check if the user owns this task
    if ($task->user_id !== $request->user()->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    
    $task->update([
        'status' => $request->status
    ]);
    
    return response()->json($task);
});

// Protected API routes
Route::middleware('auth:sanctum')->group(function () {
    // Calendar Activity routes
    Route::get('/crop/{crop}/activities', [CalendarActivityController::class, 'index']);
    Route::post('/crop/{crop}/activities', [CalendarActivityController::class, 'store']);
    Route::put('/crop/{crop}/activities/{id}', [CalendarActivityController::class, 'update']);
    Route::delete('/crop/{crop}/activities/{id}', [CalendarActivityController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->get('/user/recent-activities', function () {
    // Return sample data for now
    return [
        [
            'id' => 1,
            'type' => 'system',
            'message' => 'Welcome to your Smart Farming dashboard',
            'created_at' => now()->toISOString()
        ],
        [
            'id' => 2,
            'type' => 'tip',
            'message' => 'Remember to monitor your crop growth regularly',
            'created_at' => now()->subHours(2)->toISOString()
        ],
        [
            'id' => 3,
            'type' => 'alert',
            'message' => 'Weather alert: Expected rainfall tomorrow',
            'created_at' => now()->subHours(4)->toISOString()
        ]
    ];
});