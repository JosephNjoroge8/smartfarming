<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Services\WeatherService;
use App\Services\LocationService;
use Inertia\Inertia;

class WeatherController extends Controller
{
    protected $weatherService;
    protected $locationService;
    
    public function __construct(WeatherService $weatherService, LocationService $locationService)
    {
        $this->weatherService = $weatherService;
        $this->locationService = $locationService;
    }
    
    /**
     * Display weather dashboard
     */
    public function index()
    {
        return Inertia::render('Weather/Index');
    }
    
    /**
     * Show weather page
     */
    public function show(Request $request, $location = null)
    {
        $location = $location ?? $request->query('location') ?? 'Nairobi, Kenya';
        
        Log::info('Weather page requested', ['location' => $location]);
        
        $weather = $this->weatherService->getWeatherData($location);
        
        return Inertia::render('Weather/Show', [
            'weather' => $weather,
            'requestedLocation' => $location,
            'lat' => $weather['coord']['lat'] ?? null,
            'lon' => $weather['coord']['lon'] ?? null
        ]);
    }
    
    /**
     * Show weather by coordinates
     */
    public function showByCoordinates(Request $request)
    {
        $lat = $request->query('lat');
        $lon = $request->query('lon');
        
        if (!$lat || !$lon) {
            return redirect()->route('weather.show');
        }
        
        $weatherData = $this->weatherService->getWeatherByCoordinates($lat, $lon);
        
        // Don't manipulate the data structure here, pass it directly to the view
        return Inertia::render('Weather/Show', [
            'weather' => $weatherData,
            'requestedLocation' => $request->query('location', null),
            'lat' => $lat,
            'lon' => $lon
        ]);
    }
    
    /**
     * API endpoint for getting weather data by location
     */
    public function getWeatherData(Request $request)
    {
        $location = $request->query('location');
        
        if (empty($location)) {
            return response()->json(['error' => 'No location provided'], 400);
        }
        
        Log::info('Weather data requested', ['location' => $location]);
        
        $weather = $this->weatherService->getWeatherData($location);
        return response()->json($weather);
    }
    
    /**
     * API endpoint to get weather by coordinates
     */
    public function byCoordinates(Request $request)
    {
        $lat = $request->query('lat');
        $lon = $request->query('lon');
        
        if (!$lat || !$lon) {
            return response()->json(['error' => 'Latitude and longitude required'], 400);
        }
        
        $weather = $this->weatherService->getWeatherByCoordinates($lat, $lon);
        
        // Return the full response directly
        return response()->json($weather);
    }
    
    /**
     * API endpoint to get weather by location name
     */
    public function byLocation(Request $request)
    {
        $location = $request->query('location');
        
        if (!$location) {
            return response()->json(['error' => 'Location name required'], 400);
        }
        
        $weather = $this->weatherService->getWeatherData($location);
        
        return response()->json($weather);
    }
    
    /**
     * API endpoint for getting weather by coordinates
     */
    public function getWeatherByCoordinates(Request $request)
    {
        $lat = $request->query('lat');
        $lon = $request->query('lon');
        
        if (empty($lat) || empty($lon)) {
            return response()->json(['error' => 'Coordinates required'], 400);
        }
        
        Log::info('Weather by coordinates requested', ['lat' => $lat, 'lon' => $lon]);
        
        $weather = $this->weatherService->getWeatherByCoordinates($lat, $lon);
        
        // Get location name for display
        $location = $this->locationService->reverseGeocode($lat, $lon);
        if (empty($location['error'])) {
            $weather['location_name'] = $location['name'];
            $weather['location_country'] = $location['country'];
        }
        
        return response()->json($weather);
    }

    /**
     * API endpoint to get default weather
     */
    public function getDefault()
    {
        $weather = $this->weatherService->getDefaultWeather();
        
        // Include proper location name from weather data
        if (!isset($weather['error'])) {
            $weather['formatted_location'] = ($weather['location_name'] ?? 'Nairobi') . ', ' . 
                                            ($weather['location_country'] ?? 'Kenya');
        }
        
        return response()->json($weather);
    }

    /**
     * API endpoint for default weather (Nairobi)
     */
    public function getDefaultWeather()
    {
        Log::info('Default weather requested');
        $weather = $this->weatherService->getDefaultWeather();
        return response()->json($weather);
    }

    /**
     * Reverse geocode coordinates to location name
     */
    public function reverseGeocode(Request $request)
    {
        $lat = $request->query('lat');
        $lon = $request->query('lon');
        
        if (!$lat || !$lon) {
            return response()->json(['error' => 'Latitude and longitude required'], 400);
        }
        
        $location = $this->locationService->reverseGeocode($lat, $lon);
        
        return response()->json($location);
    }

    /**
     * API endpoint to get weather by location with strict mode
     */
    public function getWeather(Request $request)
    {
        $location = $request->input('location');
        $strict = $request->boolean('strict', false);
        
        if (!$location) {
            return response()->json([
                'error' => 'Location parameter is required'
            ], 400);
        }
        
        try {
            // Get coordinates for the location name
            $coordinates = $this->locationService->getCoordinates($location);
            
            if (!$coordinates) {
                // If strict mode and no coordinates found, return error without fallback
                if ($strict) {
                    return response()->json([
                        'error' => "Location '{$location}' not found. Please check spelling or provide a different location."
                    ], 404);
                }
                
                // Otherwise, use fallback coordinates (if implemented)
                // ...
            }
            
            // Get weather data using the coordinates
            $weatherData = $this->weatherService->getWeatherByCoordinates(
                $coordinates['lat'], 
                $coordinates['lon']
            );
            
            // Format the response for your frontend
            return response()->json($this->formatWeatherResponse($weatherData, $location));
            
        } catch (\Exception $e) {
            Log::error('Weather API error', [
                'location' => $location,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'error' => 'Failed to retrieve weather data. Please try again later.'
            ], 500);
        }
    }
}