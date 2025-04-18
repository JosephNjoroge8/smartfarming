<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $query = User::query();
        
        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }
        
        $users = $query->orderBy('created_at', 'desc')
                      ->paginate(15)
                      ->withQueryString();
        
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
            'admin' => Auth::guard('admin')->user(),
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            'admin' => Auth::guard('admin')->user(),
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
        ]);
        
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'location' => $validated['location'] ?? null,
        ]);
        
        return redirect()->route('admin.users.index')
                        ->with('message', 'User created successfully');
    }

    /**
     * Show the form for editing the specified user
     */
    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'admin' => Auth::guard('admin')->user(),
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => ['nullable', Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
        ]);
        
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;
        $user->location = $validated['location'] ?? null;
        
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        
        $user->save();
        
        return redirect()->route('admin.users')
                        ->with('message', 'User updated successfully');
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        $user->delete();
        
        return redirect()->route('admin.users')
                        ->with('message', 'User deleted successfully');
    }
}