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
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('excerpt');
            $table->longText('content');
            $table->string('image_url')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('draft'); // draft, published, archived
            $table->boolean('featured')->default(false);
            $table->integer('read_time')->default(5); // estimated read time in minutes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};