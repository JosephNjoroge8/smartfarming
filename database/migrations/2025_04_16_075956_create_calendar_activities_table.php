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
        Schema::create('calendar_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crop_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->text('text');
            $table->boolean('completed')->default(false);
            $table->timestamps();
            
            // Add index for faster queries
            $table->index(['crop_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendar_activities');
    }
};
