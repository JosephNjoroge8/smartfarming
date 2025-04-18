<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\User;
use App\Models\BlogPost;
use App\Models\CropManual;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Display a listing of admins
     */
    public function index()
    {
        $this->authorize('viewAny', Admin::class);
        
        $admins = Admin::all();
        
        return Inertia::render('Admin/Admins/Index', [
            'admins' => $admins,
            'auth' => [
                'user' => Auth::guard('admin')->user(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new admin
     */
    public function create()
    {
        $this->authorize('create', Admin::class);
        
        return Inertia::render('Admin/Admins/Create', [
            'admin' => Auth::guard('admin')->user(),
        ]);
    }

    /**
     * Store a newly created admin
     */
    public function store(Request $request)
    {
        $this->authorize('create', Admin::class);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:admins',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', Password::defaults()],
            'profile_photo' => 'nullable|image|max:1024',
            'is_super_admin' => 'boolean',
        ]);
        
        // Handle profile photo upload
        $photoPath = null;
        if ($request->hasFile('profile_photo')) {
            $photoPath = $request->file('profile_photo')->store('admin-photos', 'public');
        }
        
        $admin = new Admin();
        $admin->name = $validated['name'];
        $admin->email = $validated['email'];
        $admin->phone = $validated['phone'] ?? null;
        $admin->password = Hash::make($validated['password']);
        $admin->profile_photo = $photoPath;
        $admin->is_super_admin = $validated['is_super_admin'] ?? false;
        $admin->save();
        
        return redirect()->route('admin.admins.index')
                        ->with('message', 'Administrator created successfully');
    }

    /**
     * Show the form for editing the specified admin
     */
    public function edit(Admin $admin)
    {
        $this->authorize('update', $admin);
        
        return Inertia::render('Admin/Admins/Edit', [
            'editAdmin' => $admin,
            'admin' => Auth::guard('admin')->user(),
        ]);
    }

    /**
     * Update the specified admin
     */
    public function update(Request $request, Admin $admin)
    {
        $this->authorize('update', $admin);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:admins,email,'.$admin->id,
            'phone' => 'nullable|string|max:20',
            'password' => ['nullable', Password::defaults()],
            'profile_photo' => 'nullable|image|max:1024',
            'is_super_admin' => 'boolean',
        ]);
        
        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            if ($admin->profile_photo) {
                Storage::disk('public')->delete($admin->profile_photo);
            }
            $admin->profile_photo = $request->file('profile_photo')->store('admin-photos', 'public');
        }
        
        $admin->name = $validated['name'];
        $admin->email = $validated['email'];
        $admin->phone = $validated['phone'] ?? $admin->phone;
        
        // Only update password if provided
        if (!empty($validated['password'])) {
            $admin->password = Hash::make($validated['password']);
        }
        
        // Only super admin can change super admin status
        if (Auth::guard('admin')->user()->is_super_admin) {
            $admin->is_super_admin = $validated['is_super_admin'] ?? $admin->is_super_admin;
        }
        
        $admin->save();
        
        return redirect()->route('admin.admins.index')
                        ->with('message', 'Administrator updated successfully');
    }

    /**
     * Remove the specified admin
     */
    public function destroy(Admin $admin)
    {
        $this->authorize('delete', $admin);
        
        // Prevent deleting yourself
        if ($admin->id === Auth::guard('admin')->id()) {
            return redirect()->route('admin.admins.index')
                            ->with('error', 'You cannot delete your own account');
        }
        
        // Delete profile photo if exists
        if ($admin->profile_photo) {
            Storage::disk('public')->delete($admin->profile_photo);
        }
        
        $admin->delete();
        
        return redirect()->route('admin.admins.index')
                        ->with('message', 'Administrator deleted successfully');
    }

    /**
     * Show the admin profile
     */
    public function showProfile()
    {
        $admin = Auth::guard('admin')->user();
        
        return Inertia::render('Admin/Profile', [
            'admin' => $admin,
        ]);
    }

    /**
     * Update the admin profile
     */
    public function updateProfile(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:admins,email,'.$admin->id,
            'phone' => 'nullable|string|max:20',
            'current_password' => 'nullable|required_with:new_password|current_password:admin',
            'new_password' => ['nullable', 'required_with:current_password', Password::defaults()],
            'profile_photo' => 'nullable|image|max:1024',
        ]);
        
        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? $admin->phone,
        ];
        
        // Handle profile photo upload
        if ($request->hasFile('profile_photo')) {
            if ($admin->profile_photo) {
                Storage::disk('public')->delete($admin->profile_photo);
            }
            $updateData['profile_photo'] = $request->file('profile_photo')->store('admin-photos', 'public');
        }
        
        // Update password if provided
        if (!empty($validated['new_password'])) {
            $updateData['password'] = Hash::make($validated['new_password']);
        }
        
        Admin::where('id', $admin->id)->update($updateData);
        
        return redirect()->route('admin.profile')
                        ->with('message', 'Profile updated successfully');
    }

    /**
     * Show the admin dashboard
     */
    public function dashboard()
    {
        // Get statistics for admin dashboard
        $stats = [
            'userCount' => User::count(),
            'newUsersToday' => User::whereDate('created_at', today())->count(),
            'blogCount' => BlogPost::count() ?? 0,
            'cropManualCount' => CropManual::count() ?? 0,
        ];
        
        return Inertia::render('Admin/Dashboard', [
            'auth' => [
                'user' => Auth::guard('admin')->user(),  // Now passing admin user
            ],
            'stats' => $stats
        ]);
    }
    
    public function users()
    {
        $users = User::orderBy('created_at', 'desc')->paginate(10);
        
        return Inertia::render('Admin/Users', [
            'auth' => [
                'user' => Auth::guard('admin')->user(),
            ],
            'users' => $users
        ]);
    }
    
    public function blogs()
    {
        $blogs = BlogPost::with('user')->orderBy('created_at', 'desc')->paginate(10);
        
        return Inertia::render('Admin/Blogs', [
            'auth' => [
                'user' => Auth::guard('admin')->user(),
            ],
            'blogs' => $blogs
        ]);
    }
    
    public function cropManuals()
    {
        $manuals = CropManual::orderBy('name')->paginate(10);
        
        return Inertia::render('Admin/CropManuals', [
            'auth' => [
                'user' => Auth::guard('admin')->user(),
            ],
            'manuals' => $manuals
        ]);
    }
}