<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Admin;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('password');
            $table->string('profile_photo')->nullable();
            $table->boolean('is_super_admin')->default(false);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // Create a default super admin
        Admin::create([
            'name' => 'Super Admin',
            'email' => 'admin@smartfarming.com',
            'password' => Hash::make('adminpass123'), // Change this in production
            'is_super_admin' => true,
        ]);

        // Insert admin user from environment variables
        DB::table('admins')->insert([
            'name' => env('ADMIN_NAME', 'Admin User'),
            'email' => env('ADMIN_EMAIL', 'admin@smartfarm.com'),
            'password' => Hash::make(env('ADMIN_PASSWORD', Str::random(16))),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};