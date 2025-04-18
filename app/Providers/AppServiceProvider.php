<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('plant-disease-api', function ($app) {
            return new \GuzzleHttp\Client([
                'base_uri' => env('PLANT_DISEASE_API_URL'),
                'headers' => [
                    'Api-Key' => env('PLANT_DISEASE_API_KEY'),
                    'Content-Type' => 'application/json'
                ]
            ]);
        });
    }
    
    public function boot(): void
    {
        if (env('APP_ENV') !== 'local') {
            URL::forceScheme('https');
        }
        
        Schema::defaultStringLength(191);

        // Verify this works with your Laravel/Vite version
        Vite::prefetch(concurrency: 3);
    }
}