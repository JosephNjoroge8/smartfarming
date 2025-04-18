<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('crop_manuals', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('scientific_name')->nullable();
            $table->text('description');
            $table->text('planting_instructions')->nullable();
            $table->text('growing_conditions')->nullable();
            $table->text('pest_management')->nullable();
            $table->text('harvesting_info')->nullable();
            $table->text('nutritional_value')->nullable();
            $table->string('image_url')->nullable();
            $table->string('image_path')->nullable();
            $table->string('icon')->nullable();
            $table->string('growing_season')->nullable();
            $table->string('water_needs')->nullable();
            $table->string('soil_type')->nullable();
            $table->string('time_to_harvest')->nullable();
            $table->text('growing_steps')->nullable();
            $table->text('dos')->nullable();
            $table->text('donts')->nullable();
            $table->boolean('is_published')->default(false);
            $table->boolean('allow_comments')->default(true);
            $table->timestamps();
        });

        if (!Schema::hasTable('crop_manual_comments')) {
            Schema::create('crop_manual_comments', function (Blueprint $table) {
                $table->id();
                $table->text('content');
                $table->foreignId('crop_manual_id')->constrained()->onDelete('cascade');
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Disable foreign key checks before dropping tables
        Schema::disableForeignKeyConstraints();
        
        Schema::dropIfExists('crop_manual_comments');
        Schema::dropIfExists('crop_manuals');
        
        // Re-enable foreign key checks
        Schema::enableForeignKeyConstraints();
    }
};