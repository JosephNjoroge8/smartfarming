<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class LocationService
{
    protected $apiKey;
    
    public function __construct()
    {
        $this->apiKey = config('services.openweathermap.key') ?? 
                      env('OPENWEATHERMAP_API_KEY') ?? 
                      env('WEATHER_API_KEY');
                      
        // Log the API key status
        Log::debug('OpenWeatherMap API Key Status: ' . (empty($this->apiKey) ? 'MISSING' : 'Available'));
    }
    
    /**
     * Get coordinates for a location name
     */
    public function getCoordinates($location)
    {
        if (empty($location)) {
            return ['error' => 'No location provided'];
        }
        
        Log::info('Getting coordinates for location', ['location' => $location]);
        
        try {
            // Direct geocoding API call
            $url = 'https://api.openweathermap.org/geo/1.0/direct';
            $params = [
                'q' => $location,
                'limit' => 1,
                'appid' => $this->apiKey
            ];
            
            $response = Http::get($url, $params);
            
            if (!$response->successful()) {
                Log::error('Geocoding API error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return ['error' => 'Geocoding service error: ' . $response->body()];
            }
            
            $data = $response->json();
            Log::debug('Geocoding raw response', ['data' => $data]);
            
            if (empty($data)) {
                Log::warning('No results found for location', ['location' => $location]);
                // Try a well-known location as fallback
                if ($fallback = $this->getKnownLocation($location)) {
                    Log::info('Using fallback location', ['fallback' => $fallback]);
                    return $fallback;
                }
                return ['error' => 'Location not found'];
            }
            
            return [
                'lat' => $data[0]['lat'],
                'lon' => $data[0]['lon'],
                'name' => $data[0]['name'],
                'country' => $data[0]['country'],
                'state' => $data[0]['state'] ?? null
            ];
        } catch (\Exception $e) {
            Log::error('Geocoding exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ['error' => 'Geocoding service error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Reverse geocoding - get location name from coordinates
     */
    public function reverseGeocode($lat, $lon)
    {
        if (empty($lat) || empty($lon)) {
            return ['error' => 'Missing coordinates'];
        }
        
        Log::info('Reverse geocoding', ['lat' => $lat, 'lon' => $lon]);
        
        try {
            // Direct reverse geocoding API call
            $url = 'https://api.openweathermap.org/geo/1.0/reverse';
            $params = [
                'lat' => $lat,
                'lon' => $lon,
                'limit' => 1,
                'appid' => $this->apiKey
            ];
            
            $response = Http::get($url, $params);
            
            if (!$response->successful()) {
                Log::error('Reverse geocoding API error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return ['error' => 'Reverse geocoding error: ' . $response->body()];
            }
            
            $data = $response->json();
            Log::debug('Reverse geocoding raw response', ['data' => $data]);
            
            if (empty($data)) {
                Log::warning('No results found for coordinates', ['lat' => $lat, 'lon' => $lon]);
                return ['error' => 'Location not found for these coordinates'];
            }
            
            return [
                'name' => $data[0]['name'],
                'country' => $data[0]['country'],
                'state' => $data[0]['state'] ?? null,
                'lat' => $lat,
                'lon' => $lon
            ];
        } catch (\Exception $e) {
            Log::error('Reverse geocoding exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return ['error' => 'Reverse geocoding error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get coordinates for known locations as fallback
     */
    protected function getKnownLocation($location)
    {
        $locations = [
            'nairobi' => ['lat' => -1.2921, 'lon' => 36.8219, 'name' => 'Nairobi', 'country' => 'KE'],
            'mombasa' => ['lat' => -4.0435, 'lon' => 39.6682, 'name' => 'Mombasa', 'country' => 'KE'],
            'kisumu' => ['lat' => -0.1022, 'lon' => 34.7617, 'name' => 'Kisumu', 'country' => 'KE'],
            'nakuru' => ['lat' => -0.3031, 'lon' => 36.0800, 'name' => 'Nakuru', 'country' => 'KE'],
            'eldoret' => ['lat' => 0.5143, 'lon' => 35.2698, 'name' => 'Eldoret', 'country' => 'KE'],
            'maseno' => ['lat' => 0.0075, 'lon' => 34.6006, 'name' => 'Maseno', 'country' => 'KE']
        ];
        
        $searchLocation = strtolower(trim($location));
        
        // Direct match
        foreach ($locations as $key => $data) {
            if ($searchLocation == $key || $searchLocation == strtolower($data['name'])) {
                return $data;
            }
        }
        
        // Partial match
        foreach ($locations as $key => $data) {
            if (strpos($searchLocation, $key) !== false) {
                return $data;
            }
        }
        
        // No match found
        return null;
    }
    
    /**
     * Get nearest known location
     */
    public function getNearestKnownLocation($searchLocation = null)
    {
        // Enhanced known locations with agricultural regions
        $locations = [
            'nairobi' => ['lat' => -1.2921, 'lon' => 36.8219, 'name' => 'Nairobi', 'country' => 'KE'],
            'mombasa' => ['lat' => -4.0435, 'lon' => 39.6682, 'name' => 'Mombasa', 'country' => 'KE'],
            'kisumu' => ['lat' => -0.1022, 'lon' => 34.7617, 'name' => 'Kisumu', 'country' => 'KE'],
            'nakuru' => ['lat' => -0.3031, 'lon' => 36.0800, 'name' => 'Nakuru', 'country' => 'KE'],
            'eldoret' => ['lat' => 0.5143, 'lon' => 35.2698, 'name' => 'Eldoret', 'country' => 'KE'],
            'maseno' => ['lat' => 0.0075, 'lon' => 34.6006, 'name' => 'Maseno', 'country' => 'KE']
        ];
        
        // If search term provided, try to find closest match
        if ($searchLocation) {
            $searchLocation = strtolower(trim($searchLocation));
            foreach ($locations as $key => $data) {
                if (strpos($key, $searchLocation) !== false || 
                    strpos(strtolower($data['name']), $searchLocation) !== false) {
                    return $data;
                }
            }
        }
        
        // Default to Nairobi if no match or no search term
        return $locations['nairobi'];
    }
}