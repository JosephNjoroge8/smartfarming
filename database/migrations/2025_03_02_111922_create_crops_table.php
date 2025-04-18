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
        Schema::create('crops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('crop_name');
            $table->string('crop_type');
            $table->string('variety')->nullable();
            $table->date('planting_date');
            $table->string('location');
            $table->string('soil_type')->nullable();
            $table->decimal('soil_ph', 4, 2)->nullable();
            $table->string('soil_moisture')->nullable();
            $table->string('seed_source')->nullable();
            $table->text('seed_treatment')->nullable();
            $table->text('weather_conditions')->nullable();
            $table->string('irrigation_method')->nullable();
            $table->string('irrigation_frequency')->nullable();
            $table->text('fertilizer_details')->nullable();
            $table->text('pesticide_details')->nullable();
            $table->integer('initial_plant_count')->nullable();
            $table->text('growth_goals')->nullable();
            $table->string('equipment_used')->nullable();
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crops');
    }
};
