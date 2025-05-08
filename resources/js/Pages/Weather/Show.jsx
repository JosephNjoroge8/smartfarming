import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function WeatherShow({ auth }) {
    const [weatherData, setWeatherData] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState('');
    
    // Get user's location or use default
    useEffect(() => {
        // Try to get user's location from browser
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                position => {
                    fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
                },
                err => {
                    console.warn("Location access denied:", err);
                    fetchWeatherByCity("KISUMU"); // Default fallback
                }
            );
        } else {
            fetchWeatherByCity("Kisumu");
        }
    }, []);
    
    const fetchWeatherByCoords = async (lat, lon) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=YOUR_API_KEY`);
            setWeatherData(response.data);
            setLocation(`${response.data.name}, ${response.data.sys.country}`);
            
            // Also fetch forecast
            const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=YOUR_API_KEY`);
            setForecast(forecastResponse.data);
            
            setError(null);
        } catch (err) {
            console.error("Weather fetch error:", err);
            setError("Failed to load weather data. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    const fetchWeatherByCity = async (city) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=YOUR_API_KEY`);
            setWeatherData(response.data);
            setLocation(`${response.data.name}, ${response.data.sys.country}`);
            
            // Also fetch forecast
            const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=YOUR_API_KEY`);
            setForecast(forecastResponse.data);
            
            setError(null);
        } catch (err) {
            console.error("Weather fetch error:", err);
            setError("Failed to load weather data for this location. Please try another city.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleSearch = (e) => {
        e.preventDefault();
        if (location.trim()) {
            fetchWeatherByCity(location);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Weather Forecast</h2>}
        >
            <Head title="Weather" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Search input */}
                        <form onSubmit={handleSearch} className="mb-6">
                            <div className="flex">
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Enter city name"
                                    className="flex-grow px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-r hover:bg-green-700 focus:outline-none"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                        
                        {/* Loading state */}
                        {loading && (
                            <div className="flex justify-center items-center py-12">
                                <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        )}
                        
                        {/* Error state */}
                        {error && !loading && (
                            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
                                {error}
                            </div>
                        )}
                        
                        {/* Weather data */}
                        {weatherData && !loading && !error && (
                            <div>
                                <div className="flex flex-col md:flex-row items-center justify-between mb-8 p-6 bg-blue-50 rounded-lg">
                                    <div className="flex items-center mb-4 md:mb-0">
                                        <img
                                            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                                            alt={weatherData.weather[0].description}
                                            className="w-20 h-20"
                                        />
                                        <div>
                                            <h3 className="text-2xl font-bold">{location}</h3>
                                            <p className="text-gray-600 capitalize">{weatherData.weather[0].description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center md:text-right">
                                        <div className="text-4xl font-bold">{Math.round(weatherData.main.temp)}°C</div>
                                        <div className="text-gray-600">
                                            Feels like {Math.round(weatherData.main.feels_like)}°C
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white p-4 rounded shadow text-center">
                                        <div className="text-gray-500">Humidity</div>
                                        <div className="text-xl font-semibold">{weatherData.main.humidity}%</div>
                                    </div>
                                    <div className="bg-white p-4 rounded shadow text-center">
                                        <div className="text-gray-500">Wind</div>
                                        <div className="text-xl font-semibold">{Math.round(weatherData.wind.speed * 3.6)} km/h</div>
                                    </div>
                                    <div className="bg-white p-4 rounded shadow text-center">
                                        <div className="text-gray-500">Pressure</div>
                                        <div className="text-xl font-semibold">{weatherData.main.pressure} hPa</div>
                                    </div>
                                    <div className="bg-white p-4 rounded shadow text-center">
                                        <div className="text-gray-500">Visibility</div>
                                        <div className="text-xl font-semibold">{(weatherData.visibility / 1000).toFixed(1)} km</div>
                                    </div>
                                </div>
                                
                                {/* Forecast section */}
                                {forecast && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">5-Day Forecast</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                            {/* Only show one forecast per day (12:00) */}
                                            {forecast.list
                                                .filter(item => item.dt_txt.includes('12:00:00'))
                                                .slice(0, 5)
                                                .map((item, index) => (
                                                    <div key={index} className="bg-white p-4 rounded shadow text-center">
                                                        <div className="font-medium">
                                                            {new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                                                        </div>
                                                        <img
                                                            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                                                            alt={item.weather[0].description}
                                                            className="w-12 h-12 mx-auto"
                                                        />
                                                        <div className="text-xl font-semibold">{Math.round(item.main.temp)}°C</div>
                                                        <div className="text-gray-500 capitalize">{item.weather[0].description}</div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}