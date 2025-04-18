<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class WeatherService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.openweathermap.org/data/2.5';
    protected $locationService;

    public function __construct(LocationService $locationService)
    {
        $this->apiKey = config('services.openweathermap.key') ?? 
                       env('OPENWEATHERMAP_API_KEY') ?? 
                       env('WEATHER_API_KEY');
        $this->locationService = $locationService;
        
        // Debug the API key
        Log::debug('OpenWeatherMap API Key: ' . substr($this->apiKey, 0, 3) . '...');
    }
    
    /**
     * Get weather by coordinates - DIRECT API CALL
     */
    public function getWeatherByCoordinates($lat, $lon)
    {
        Log::info('Getting weather for coordinates', ['lat' => $lat, 'lon' => $lon]);
        
        try {
            // Current weather API call
            $weatherUrl = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&units=metric&appid=" . config('services.openweathermap.key');
            $weatherResponse = Http::get($weatherUrl);
            
            // Forecast API call
            $forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&units=metric&appid=" . config('services.openweathermap.key');
            $forecastResponse = Http::get($forecastUrl);
            
            if ($weatherResponse->successful() && $forecastResponse->successful()) {
                $weatherData = $weatherResponse->json();
                $forecastData = $forecastResponse->json();
                
                // Combine both responses
                $weatherData['forecast'] = $forecastData;
                return $weatherData;
            }
            
            // Handle API errors
            $errorMessage = $weatherResponse->successful() 
                ? 'Forecast API error: ' . ($forecastResponse->json()['message'] ?? 'Unknown error')
                : 'Weather API error: ' . ($weatherResponse->json()['message'] ?? 'Unknown error');
                
            Log::error($errorMessage, ['lat' => $lat, 'lon' => $lon]);
            
            return [
                'error' => 'Weather service error: ' . $errorMessage
            ];
        } catch (\Exception $e) {
            Log::error('Error getting weather by coordinates', [
                'lat' => $lat, 
                'lon' => $lon,
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => 'Failed to retrieve weather data: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get default weather data for testing
     */
    public function getDefaultWeather()
    {
        try {
            // Try Nairobi as default
            $coordinates = $this->locationService->getCoordinates('Nairobi, Kenya');
            
            if (isset($coordinates['error'])) {
                Log::warning('Failed to get coordinates for default location', [
                    'error' => $coordinates['error']
                ]);
                // Hardcode Nairobi coordinates as fallback
                $lat = -1.2921;
                $lon = 36.8219;
            } else {
                $lat = $coordinates['lat'];
                $lon = $coordinates['lon'];
            }
            
            return $this->getWeatherByCoordinates($lat, $lon);
        } catch (\Exception $e) {
            Log::error('Default weather error', ['message' => $e->getMessage()]);
            return ['error' => 'Default weather unavailable: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get weather by location name
     */
    public function getWeatherData($location)
    {
        if (empty($location)) {
            return ['error' => 'No location provided'];
        }
        
        Log::info('Getting weather for location', ['location' => $location]);
        
        try {
            // Get coordinates for the location
            $coordinates = $this->locationService->getCoordinates($location);
            
            if (isset($coordinates['error'])) {
                Log::warning('Failed to get coordinates for location', [
                    'location' => $location,
                    'error' => $coordinates['error']
                ]);
                return ['error' => $coordinates['error']];
            }
            
            // Get weather using coordinates
            return $this->getWeatherByCoordinates($coordinates['lat'], $coordinates['lon']);
        } catch (\Exception $e) {
            Log::error('Weather by location error', [
                'location' => $location,
                'message' => $e->getMessage()
            ]);
            return ['error' => 'Weather service error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get weather by location name with location name in response
     */
    public function getWeatherByLocation($location)
    {
        Log::info('Getting weather for location', ['location' => $location]);
        
        try {
            // Get coordinates for this location
            $coordinates = $this->locationService->getCoordinates($location);
            
            if (!$coordinates) {
                Log::warning('Location not found', ['location' => $location]);
                return [
                    'error' => "Location '{$location}' not found. Please check spelling or provide a different location."
                ];
            }
            
            // Get weather using these coordinates
            $weather = $this->getWeatherByCoordinates($coordinates['lat'], $coordinates['lon']);
            
            // If successful, add the location name
            if (!isset($weather['error'])) {
                $weather['location_name'] = $location;
            }
            
            return $weather;
        } catch (\Exception $e) {
            Log::error('Error getting weather by location', [
                'location' => $location,
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => 'Failed to retrieve weather data: ' . $e->getMessage()
            ];
        }
    }
}