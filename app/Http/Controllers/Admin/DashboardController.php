<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\CropManual;
use App\Models\BlogPost;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Display admin dashboard with key metrics
     */
    public function index()
    {
        $userCount = User::count();
        $newUsersToday = User::whereDate('created_at', today())->count();
        
        $blogPostCount = BlogPost::count();
        $cropManualCount = CropManual::count();
        
        // Monthly new user registration stats
        $userStats = User::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as count')
        )
        ->groupBy('month')
        ->orderBy('month', 'asc')
        ->take(6)
        ->get();
        
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalUsers' => $userCount,
                'newUsersToday' => $newUsersToday,
                'blogPosts' => $blogPostCount,
                'cropManuals' => $cropManualCount,
            ],
            'userGrowth' => $userStats,
            'admin' => Auth::guard('admin')->user(),
        ]);
    }
}