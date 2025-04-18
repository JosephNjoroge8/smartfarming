<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run()
    {
        Admin::create([
            'name' => 'Admin User',
            'email' => 'admin@smartfarming.com',
            'password' => Hash::make('password123'),
            'is_super_admin' => true,
        ]);
    }
}