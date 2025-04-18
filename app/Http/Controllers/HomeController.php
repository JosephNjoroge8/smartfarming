<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Crop;
use App\Models\Activity;
use Carbon\Carbon;
use Illuminate\Database\QueryException;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Home');
    }
    
    public function dashboard()
    {
        // Redirect admin users to admin dashboard if they access the regular dashboard
        if (Auth::check() && Auth::user()->is_admin) {
            return redirect()->route('admin.dashboard');
        }
        
        // Get user's crops with error handling
        try {
            $crops = Crop::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
        } catch (\Exception $e) {
            $crops = [];
        }
        
        // Get or create sample activities
        try {
            $recentActivity = Activity::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
                
            // If no activities exist, create welcome activities
            if ($recentActivity->isEmpty() && Auth::check()) {
                $activity = Activity::create([
                    'user_id' => Auth::id(),
                    'type' => 'info',
                    'message' => 'Welcome to SmaFarm! Set up your first crop to get started.',
                ]);
                
                $recentActivity = Activity::where('user_id', Auth::id())
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get();
            }
        } catch (\Exception $e) {
            // Fallback to sample data
            $recentActivity = [
                [
                    'id' => 1,
                    'type' => 'info',
                    'message' => 'Welcome to SmaFarm! Set up your first crop to get started.',
                    'time' => 'Just now'
                ]
            ];
        }
        
        return Inertia::render('Dashboard', [
            'auth' => ['user' => Auth::user()],
            'crops' => $crops,
            'recentActivity' => $recentActivity
        ]);
    }
    
    public function activities()
    {
        $activities = \App\Models\Activity::where('user_id', Auth::id())
                                        ->orderBy('created_at', 'desc')
                                        ->paginate(15);
                                        
        return Inertia::render('Activities', [
            'activities' => $activities
        ]);
    }
    
    public function contact()
    {
        return Inertia::render('Contact');
    }
    
    public function terms()
    {
        return Inertia::render('Terms');
    }
    
    public function help()
    {
        return Inertia::render('Help');
    }
}