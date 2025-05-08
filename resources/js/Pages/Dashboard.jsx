import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, Fragment, useMemo } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';
import debounce from 'lodash/debounce';

// Utility function for calculating crop progress
const calculateCropProgress = (crop) => {
    if (!crop.planting_date || !(crop.harvest_date || crop.expected_harvest_date)) return 0;
    
    try {
        const today = new Date();
        const plantDate = new Date(crop.planting_date);
        const harvestDate = new Date(crop.harvest_date || crop.expected_harvest_date);
        
        // Handle edge cases better
        if (today < plantDate) return 0;
        if (today > harvestDate) return 100;
        
        const totalDays = Math.max(1, (harvestDate - plantDate) / (1000 * 60 * 60 * 24));
        const daysElapsed = (today - plantDate) / (1000 * 60 * 60 * 24);
        
        return Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));
    } catch (error) {
        console.error("Error calculating crop progress:", error);
        return 0;
    }
};

const WeatherWidget = ({ weatherData, loading, error, location }) => {
    if (loading) return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex items-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>{error}</p>
            </div>
            <button className="mt-2 text-sm text-blue-600 hover:text-blue-800" onClick={() => window.location.reload()}>
                Try again
            </button>
        </div>
    );
    
    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                <span>Current Weather</span>
                <span className="text-sm text-gray-500 font-normal">{location || 'Your Location'}</span>
            </h2>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="mr-4">
                        {weatherData.weather && weatherData.weather[0] && (
                            <img 
                                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
                                alt={weatherData.weather[0].description}
                                className="h-16 w-16"
                            />
                        )}
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{Math.round(weatherData.main?.temp)}°C</p>
                        <p className="text-gray-500 capitalize">{weatherData.weather?.[0]?.description || 'Current conditions'}</p>
                    </div>
                </div>
                <div>
                    <p><span className="font-medium">Humidity:</span> {weatherData.main?.humidity}%</p>
                    <p><span className="font-medium">Wind:</span> {weatherData.wind?.speed} m/s</p>
                    {weatherData.forecast && weatherData.forecast.list && (
                        <p className="text-xs text-blue-600 mt-2">
                            {weatherData.forecast.list.length > 0 ? '5-day forecast available' : 'No forecast data'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard({ auth, crops = [], recentActivity = [] }) {
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);
    const [cropsLoading, setCropsLoading] = useState(!crops || crops.length === 0);
    const [showTip, setShowTip] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0); // Used to trigger re-fetches
    
    const [completedTasksCount, setCompletedTasksCount] = useState(0);
    const [priorityTasksCount, setPriorityTasksCount] = useState(0);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());
    
    // Enhanced user details with fallback values
    const userLocation = auth?.user?.location || 'Your Farm';
    const userName = auth?.user?.name?.split(' ')[0] || 'Farmer';
    
    const safeRoute = useMemo(() => {
        return (name, fallbackUrl = '#') => {
            try {
                return route(name);
            } catch (error) {
                console.warn(`Route '${name}' not found, using fallback URL`);
                return fallbackUrl;
            }
        };
    }, []);

    // Weather data fetching
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setWeatherLoading(true);
                const location = auth?.user?.location || 'Nairobi, Kenya';
                
                const response = await axios.get(`/api/weather?location=${encodeURIComponent(location)}`);
                setWeatherData(response.data);
                setWeatherError(null);
            } catch (error) {
                console.error("Weather API error:", error);
                setWeatherError("Unable to load weather data. Please check your connection.");
                
                // Fallback weather data with more realistic values and forecast
                setWeatherData({
                    main: { temp: 24, humidity: 65 },
                    weather: [{ description: 'Partly cloudy', icon: '03d' }],
                    wind: { speed: 3.6 },
                    name: auth?.user?.location || 'Your Location',
                    forecast: {
                        list: [
                            { dt: Date.now()/1000, main: { temp: 24 }, weather: [{ icon: '03d' }], pop: 0.1 },
                            { dt: (Date.now()/1000) + 86400, main: { temp: 26 }, weather: [{ icon: '01d' }], pop: 0 },
                            { dt: (Date.now()/1000) + 172800, main: { temp: 25 }, weather: [{ icon: '10d' }], pop: 0.4 },
                        ]
                    }
                });
            } finally {
                setWeatherLoading(false);
                setLastRefreshed(new Date());
            }
        };

        fetchWeather();
    }, [auth?.user?.location, refreshKey]);

    // Generate tasks based on crops and weather
    useEffect(() => {
        const generateTasks = () => {
            try {
                setTasksLoading(true);
                
                const today = new Date();
                const generatedTasks = [];
                
                crops.forEach(crop => {
                    if (!crop.planting_date) return;
                    
                    const plantingDate = new Date(crop.planting_date);
                    const daysSincePlanting = Math.floor((today - plantingDate) / (1000 * 60 * 60 * 24));
                    
                    // Generate more context-aware tasks
                    if (daysSincePlanting === 0) {
                        generatedTasks.push({
                            id: `${crop.id}-planting`,
                            title: `Plant ${crop.crop_type || 'crop'}`,
                            description: `It's time to plant your ${crop.crop_type || 'crop'} according to your plan`,
                            crop_id: crop.id,
                            crop_name: crop.crop_type,
                            completed: false,
                            priority: 'high'
                        });
                    }
                    
                    // Weekly watering task - more realistic with weather conditions
                    if (daysSincePlanting % 7 === 0 && daysSincePlanting > 0) {
                        const waterNeeded = weatherData?.main?.temp > 25 ? 'thoroughly' : 'moderately';
                        generatedTasks.push({
                            id: `${crop.id}-water-${daysSincePlanting}`,
                            title: `Water ${crop.crop_type || 'crop'}`,
                            description: `Water ${waterNeeded} based on current weather conditions`,
                            crop_id: crop.id,
                            crop_name: crop.crop_type,
                            completed: false,
                            priority: daysSincePlanting === 7 ? 'high' : 'medium'
                        });
                    }
                    
                    // Add due dates and more task types
                    if (daysSincePlanting === 14) {
                        generatedTasks.push({
                            id: `${crop.id}-fertilize-${daysSincePlanting}`,
                            title: `Apply fertilizer to ${crop.crop_type || 'crop'}`,
                            description: `Apply recommended nutrients based on growth stage`,
                            crop_id: crop.id,
                            crop_name: crop.crop_type,
                            completed: false,
                            priority: 'high',
                            due_date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
                        });
                    }
                    
                    // Update task statistics
                    const completedCount = generatedTasks.filter(task => task.completed).length;
                    const priorityCount = generatedTasks.filter(task => task.priority === 'high').length;
                    
                    setCompletedTasksCount(completedCount);
                    setPriorityTasksCount(priorityCount);
                });
                
                // Set final tasks
                setTasks(generatedTasks.length > 0 ? generatedTasks : [
                    { id: 'default-1', title: "Monitor crop growth", description: "Regularly check your crops for proper growth", completed: false, priority: 'medium' },
                    { id: 'default-2', title: "Check for pests", description: "Inspect plants for any signs of pest infestation", completed: false, priority: 'medium' },
                    { id: 'default-3', title: "Plan next planting", description: "Consider what crops to plant next season", completed: false, priority: 'low' }
                ]);
            } catch (error) {
                console.error("Task generation error:", error);
            } finally {
                setTasksLoading(false);
            }
        };

        // Generate tasks initially and when weather data changes
        generateTasks();
    }, [crops, weatherData?.main?.temp, refreshKey]);

    // Task toggling function
    const toggleTask = (id) => {
        setTasks(tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        }));
        
        // Update task statistics
        const updatedTasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        const completedCount = updatedTasks.filter(task => task.completed).length;
        setCompletedTasksCount(completedCount);
    };

    // Weather advice function
    const getWeatherAdvice = () => {
        if (!weatherData?.main) return "Monitor weather conditions for optimal farming decisions.";
        
        const temp = weatherData.main.temp;
        const condition = weatherData.weather?.[0]?.main?.toLowerCase() || '';
        const humidity = weatherData.main?.humidity || 0;
        
        // More contextual advice that considers multiple factors
        if (temp > 30) {
            if (humidity > 70) {
                return "High temperature and humidity alert: Risk of heat stress for crops. Ensure adequate irrigation and consider shade for sensitive plants.";
            }
            return "High temperature alert: Ensure crops have adequate irrigation and consider providing shade for sensitive plants.";
        }
        
        if (temp < 10) {
            if (condition.includes('clear') && temp < 5) {
                return "Frost risk alert: Protect sensitive crops from frost damage overnight when skies are clear.";
            }
            return "Low temperature alert: Protect sensitive crops from frost damage and consider delaying new plantings.";
        }
        
        if (condition.includes('rain')) {
            if (condition.includes('heavy') || condition.includes('thunder')) {
                return "Heavy rain alert: Ensure proper field drainage to prevent waterlogging and check for erosion after rainfall.";
            }
            return "Rainfall detected: Hold off on irrigation and ensure proper field drainage to prevent waterlogging.";
        }
        
        if (condition.includes('storm')) {
            return "Storm warning: Secure farm equipment and structures, check drainage systems to prevent erosion.";
        }
        
        // Ideal conditions based on temperature
        if (temp >= 20 && temp <= 28 && humidity >= 40 && humidity <= 70) {
            return "Ideal growing conditions: Perfect time for field operations and crop monitoring. Excellent photosynthesis conditions.";
        }
        
        return "Good growing conditions: Continue regular field operations and crop monitoring.";
    };

    // Refresh function
    const handleRefresh = debounce(() => {
        setRefreshKey(prevKey => prevKey + 1);
        setLastRefreshed(new Date());
    }, 1000);

    return (
        <AuthenticatedLayout user={auth?.user}>
            <Head title="Smart Farming Dashboard" />

            <Transition
                show={showTip}
                as={Fragment}
                enter="transform transition duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transform transition duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 mb-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm text-green-800">
                                    <strong>Welcome back, {userName}!</strong> Your personalized Smart Farming dashboard provides real-time insights and tools to optimize your {crops.length > 0 ? `${crops.length} crops` : 'farming operations'}.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowTip(false)} 
                            className="flex-shrink-0 ml-4"
                            aria-label="Close welcome message"
                        >
                            <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </Transition>
            <div className="pb-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 space-y-6">
                            <WeatherWidget 
                                weatherData={weatherData} 
                                loading={weatherLoading} 
                                error={weatherError} 
                                location={auth?.user?.location}
                            />
                            
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                         </svg>
                                            My Crops
                                            {crops.length > 0 && (
                                                <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                                    {crops.length}
                                                </span>
                                            )}
                                        </h3>
                                        <Link 
                                            href={safeRoute('crops.create')} 
                                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-500 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            Create new crop
                                        </Link>
                                    </div>

                                    {cropsLoading ? (
                                        <div className="animate-pulse space-y-4">
                                            <div className="h-24 bg-gray-200 rounded"></div>
                                            <div className="h-24 bg-gray-200 rounded"></div>
                                        </div>
                                    ) : crops && crops.length > 0 ? (
                                        <div className="space-y-4">
                                            {crops.map((crop, index) => (
                                                <Link 
                                                    key={crop.id || index} 
                                                    href={safeRoute('crops.show', `/crops/${crop.id}`)} 
                                                    className="block border border-gray-200 rounded-lg p-4 hover:bg-green-50 transition group relative"
                                                >
                                                    <div className="sm:flex justify-between">
                                                        <div className="mb-2 sm:mb-0">
                                                            <div className="flex items-center">
                                                                <h4 className="font-medium text-lg text-gray-800 group-hover:text-green-700 transition">
                                                                    {crop.crop_type || crop.name || "Unnamed Crop"}
                                                                </h4>
                                                                <span className={`inline-flex ml-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    crop.status === 'harvested' ? 'bg-amber-100 text-amber-800' :
                                                                    (calculateCropProgress(crop) < 25) ? 'bg-blue-100 text-blue-800' : 
                                                                    (calculateCropProgress(crop) < 75) ? 'bg-green-100 text-green-800' :
                                                                    'bg-orange-100 text-orange-800'
                                                                }`}>
                                                                    {crop.status || (calculateCropProgress(crop) < 25 ? 'Early Stage' : 
                                                                        calculateCropProgress(crop) < 75 ? 'Growing' : 
                                                                        calculateCropProgress(crop) < 100 ? 'Near Harvest' : 'Ready to Harvest')}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 100-4H5a2 2 0 100 4z" />
                                                                </svg>
                                                                Planted: {new Date(crop.planting_date).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-sm text-gray-600 flex items-center">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                {crop.location || 'Location not specified'}
                                                            </p>
                                                        </div>
                                                        
                                                        <div className="sm:text-right">
                                                            {(crop.harvest_date || crop.expected_harvest_date) && (
                                                                <div className="text-sm font-medium mb-1 flex items-center sm:justify-end">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                                    </svg>
                                                                    Harvest: {new Date(crop.harvest_date || crop.expected_harvest_date).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-500 mb-2">Growth Progress</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-2">
                                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${
                                                                    calculateCropProgress(crop) > 80 ? 'bg-amber-500' :
                                                                    calculateCropProgress(crop) > 50 ? 'bg-gradient-to-r from-green-500 to-amber-500' :
                                                                    'bg-gradient-to-r from-green-500 to-emerald-500'
                                                                }`} 
                                                                style={{ width: `${calculateCropProgress(crop)}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                                                            <span>Planted</span>
                                                            <span>{calculateCropProgress(crop)}%</span>
                                                            <span>Harvest</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                            
                                            <div className="flex justify-center pt-2">
                                                <Link 
                                                    href={safeRoute('my-crops')}
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                                                >
                                                    View all crops
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            <h4 className="text-lg font-medium text-gray-700 mb-1">No crops added yet</h4>
                                            <p className="text-gray-500 mb-4 text-sm text-center max-w-sm">
                                                Start tracking your first crop to get personalized recommendations and optimize your farm management.
                                            </p>
                                            <Link 
                                                href={safeRoute('crops.create')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Start Your First Crop
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            Recent Activity
                                        </h3>
                                        <Link 
                                            href={safeRoute('activities')}
                                            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
                                        >
                                            View all
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {recentActivity && recentActivity.length > 0 ? (
                                            recentActivity.map((activity, index) => (
                                                <div 
                                                    key={activity.id || index} 
                                                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                                                        activity.type === 'alert' ? 'bg-red-50' : 
                                                        activity.type === 'tip' ? 'bg-blue-50' : 'bg-gray-50'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-full flex-shrink-0 ${
                                                        activity.type === 'alert' ? 'bg-red-200 text-red-600' : 
                                                        activity.type === 'tip' ? 'bg-blue-200 text-blue-600' : 'bg-green-200 text-green-600'
                                                    }`}>
                                                        {activity.type === 'alert' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                            </svg>
                                                        ) : activity.type === 'tip' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between">
                                                            <p className={`font-medium ${
                                                                activity.type === 'alert' ? 'text-red-800' : 
                                                                activity.type === 'tip' ? 'text-blue-800' : 'text-green-800'
                                                            }`}>
                                                                {activity.message || "Activity logged"}
                                                            </p>
                                                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                                {activity.time ? activity.time : 
                                                                  activity.created_at ? new Date(activity.created_at).toLocaleTimeString('en-US', {
                                                                      hour: 'numeric',
                                                                      minute: '2-digit',
                                                                      hour12: true
                                                                  }) : ''}
                                                            </span>
                                                        </div>
                                                        {activity.subject && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {activity.subject}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                                <p className="text-gray-500 mb-1">No recent activities</p>
                                                <p className="text-sm text-gray-400">Your farm activities will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="md:col-span-4">
                            {/* Quick Actions */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 mb-6">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Quick Actions
                                    </h3>
                                    <div className="space-y-3">
                                        <Link 
                                            href={safeRoute('disease-detection')} 
                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-sm group"
                                        >
                                            <div className="flex items-center">
                                                <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <span className="font-medium">Scan for Disease</span>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-0 group-hover:translate-x-1 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                        <Link 
                                            href={safeRoute('crop-manual')} 
                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-sm group"
                                        >
                                            <div className="flex items-center">
                                                <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                                <span className="font-medium">Crop Manuals</span>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-0 group-hover:translate-x-1 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                        <Link 
                                            href={
                                                (() => {
                                                    try {
                                                        return route('market-prices');
                                                    } catch (e) {
                                                        console.warn('Route market-prices not found, using fallback URL');
                                                        return '/market-prices';
                                                    }
                                                })()
                                            }
                                            className="flex items-center p-2 text-base font-normal rounded-lg text-gray-900 hover:bg-gray-100"
                                        >
                                            <svg className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" 
                                                fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                                                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                                            </svg>
                                            <span className="ml-3">Market Prices</span>
                                        </Link>
                                        <Link 
                                            href={
                                                (() => {
                                                    try {
                                                        return route('soil-analysis');
                                                    } catch (e) {
                                                        console.warn('Route soil-analysis not found, using fallback URL');
                                                        return '/soil-analysis';
                                                    }
                                                })()
                                            }
                                            className="flex items-center p-2 text-base font-normal rounded-lg text-gray-900 hover:bg-gray-100"
                                        >
                                            <svg className="w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900" 
                                                fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                                                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                                            </svg>
                                            <span className="ml-3">Soil Analysis</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Today's Tasks */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Today's Tasks
                                    </h3>
                                    <div className="space-y-3">
                                        {tasksLoading ? (
                                            <div className="animate-pulse space-y-2">
                                                <div className="h-6 bg-gray-200 rounded"></div>
                                                <div className="h-6 bg-gray-200 rounded"></div>
                                                <div className="h-6 bg-gray-200 rounded"></div>
                                            </div>
                                        ) : tasks && tasks.length > 0 ? (
                                            tasks.map(task => (
                                                <div 
                                                    key={task.id} 
                                                    className={`p-3 rounded-lg border ${
                                                        task.priority === 'high' ? 'border-red-500 bg-red-50' :
                                                        task.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                                        'border-gray-300 bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-sm font-medium text-gray-800">{task.title}</h4>
                                                        <button 
                                                            onClick={() => toggleTask(task.id)}
                                                            className={`p-1 rounded-full ${
                                                                task.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                                            }`}
                                                            title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-gray-500 mb-1">No tasks for today</p>
                                                <p className="text-sm text-gray-400">Your tasks will appear here</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Farm Overview - Now full width at bottom */}
                        <div className="md:col-span-12 mt-6">
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                                <div className="p-6 h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h2m4 0h12M5 7a2 2 0 100 4h14a2 2 0 100-4H5zm0 0V5a2 2 0 012-2h10a2 2 0 012 2v2m-2 4v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m2 4h10" />
                                            </svg>
                                            Farm Overview
                                        </h3>
                                        <button 
                                            onClick={handleRefresh}
                                            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                            title="Refresh data"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Reorganized content for full width display - using grid layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Stats section */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div className="bg-green-50 p-3 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-700">Total Crops</h4>
                                                    <p className="text-2xl font-bold text-green-700">
                                                        {Array.isArray(crops) ? crops.length : 0}
                                                    </p>
                                                    {crops.length > 0 && (
                                                        <p className="text-xs text-gray-500 mt-1">Active farming</p>
                                                    )}
                                                </div>
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-700">Tasks</h4>
                                                    <div className="flex justify-center items-center space-x-1">
                                                        <span className="text-2xl font-bold text-blue-700">
                                                            {completedTasksCount}
                                                        </span>
                                                        <span className="text-gray-500">/</span>
                                                        <span className="text-2xl font-bold text-blue-700">
                                                            {tasks.length}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {priorityTasksCount > 0 && `${priorityTasksCount} high priority`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Weather advisory section */}
                                        <div>
                                            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg h-full">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Weather Advisory
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {getWeatherAdvice()}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Quick links and forecast section */}
                                        <div className="space-y-4">
                                            {/* Weather forecast conditional rendering */}
                                            {weatherData?.forecast?.list && weatherData.forecast.list.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">5-Day Forecast</h4>
                                                    <div className="flex justify-between">
                                                        {weatherData.forecast.list
                                                            .filter((item, index) => index % 8 === 0)
                                                            .slice(0, 5)
                                                            .map((forecast, index) => {
                                                                const date = new Date(forecast.dt * 1000);
                                                                const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
                                                                return (
                                                                    <div key={index} className="text-center">
                                                                        <p className="text-xs text-gray-500">{dayName}</p>
                                                                        {forecast.weather && forecast.weather[0] && (
                                                                            <img 
                                                                                src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`} 
                                                                                alt={forecast.weather[0].description || 'Weather'} 
                                                                                className="h-8 w-8 mx-auto"
                                                                            />
                                                                        )}
                                                                        <p className="text-sm font-medium text-gray-700">
                                                                            {Math.round(forecast.main?.temp)}°C
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Quick links */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Links</h4>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <Link 
                                                        href={safeRoute('weather')}
                                                        className="text-sm flex items-center justify-center p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                                        </svg>
                                                        Weather
                                                    </Link>
                                                    <Link 
                                                        href={safeRoute('tasks')}
                                                        className="text-sm flex items-center justify-center p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        Tasks
                                                    </Link>
                                                    <Link 
                                                        href={safeRoute('my-crops')}
                                                        className="text-sm flex items-center justify-center p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                        My Crops
                                                    </Link>
                                                </div>
                                            </div>
                                            
                                            <div className="text-xs text-right text-gray-500">
                                                Last updated: {lastRefreshed.toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}