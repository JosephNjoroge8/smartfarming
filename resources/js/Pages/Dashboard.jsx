import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';

const WeatherWidget = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
        const city = 'Kisumu';
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) throw new Error('Weather fetch failed');
                return response.json();
            })
            .then(data => {
                setWeatherData({
                    temperature: `${Math.round(data.main.temp)}°C`,
                    condition: data.weather[0].main,
                    humidity: `${data.main.humidity}%`,
                    wind: `${data.wind.speed} m/s`,
                    location: data.name
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching weather:', err);
                setError('Could not fetch weather data');
                setLoading(false);
            });
    }, []);
    
    if (loading) return <div>Loading weather data...</div>;
    if (error) return <div>{error}</div>;
    
    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current Weather</h2>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-3xl font-bold">{weatherData.temperature}</p>
                    <p className="text-gray-500">{weatherData.location}</p>
                </div>
                <div>
                    <p><span className="font-medium">Condition:</span> {weatherData.condition}</p>
                    <p><span className="font-medium">Humidity:</span> {weatherData.humidity}</p>
                    <p><span className="font-medium">Wind:</span> {weatherData.wind}</p>
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
    
    const safeRoute = (name, fallbackUrl = '#') => {
        try {
            return route(name);
        } catch (error) {
            console.warn(`Route '${name}' not found, using fallback URL`);
            return fallbackUrl;
        }
    };

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
                setWeatherError("Unable to load weather data");
                
                setWeatherData({
                    main: { temp: 24, humidity: 65 },
                    weather: [{ description: 'Partly Cloudy', icon: '03d' }],
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
            }
        };

        fetchWeather();
    }, [auth?.user?.location]);

    useEffect(() => {
        const generateTasks = () => {
            try {
                setTasksLoading(true);
                if (!crops || crops.length === 0) {
                    setTasks([
                        { id: 'welcome-1', title: "Add your first crop", completed: false, priority: 'high' },
                        { id: 'welcome-2', title: "Complete your profile", completed: false, priority: 'medium' },
                        { id: 'welcome-3', title: "Explore farming resources", completed: false, priority: 'low' }
                    ]);
                    return;
                }
                
                const today = new Date();
                const generatedTasks = [];
                
                crops.forEach(crop => {
                    if (!crop.planting_date) return;
                    
                    const plantingDate = new Date(crop.planting_date);
                    const daysSincePlanting = Math.floor((today - plantingDate) / (1000 * 60 * 60 * 24));
                    
                    if (daysSincePlanting === 0) {
                        generatedTasks.push({
                            id: `${crop.id}-planting`,
                            title: `Plant ${crop.crop_type}`,
                            crop_id: crop.id,
                            crop_name: crop.crop_type,
                            completed: false,
                            priority: 'high'
                        });
                    }
                    
                    if (daysSincePlanting % 7 === 0) {
                        generatedTasks.push({
                            id: `${crop.id}-water-${daysSincePlanting}`,
                            title: `Water ${crop.crop_type}`,
                            crop_id: crop.id,
                            crop_name: crop.crop_type,
                            completed: false,
                            priority: daysSincePlanting === 7 ? 'high' : 'medium'
                        });
                    }
                    
                    if (daysSincePlanting === 14) {
                        generatedTasks.push({
                            id: `${crop.id}-fertilize-${daysSincePlanting}`,
                            title: `Apply fertilizer to ${crop.crop_type}`,
                            crop_id: crop.id,
                            crop_name: crop.crop_type,
                            completed: false,
                            priority: 'high'
                        });
                    }
                });
                
                if (generatedTasks.length === 0) {
                    setTasks([
                        { id: 'default-1', title: "Monitor crop growth", completed: false, priority: 'medium' },
                        { id: 'default-2', title: "Check for pests", completed: false, priority: 'medium' },
                        { id: 'default-3', title: "Plan next planting", completed: false, priority: 'low' }
                    ]);
                } else {
                    setTasks(generatedTasks);
                }
            } catch (error) {
                console.error("Task generation error:", error);
                setTasks([
                    { id: 'error-1', title: "Review crop conditions", completed: false, priority: 'medium' },
                    { id: 'error-2', title: "Check farm equipment", completed: false, priority: 'low' }
                ]);
            } finally {
                setTasksLoading(false);
            }
        };

        generateTasks();
    }, [crops]);

    useEffect(() => {
        // Code that calls some setState function
        // Missing or problematic dependency array
    }, []);

    const toggleTask = (id) => {
        setTasks(tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const getWeatherAdvice = () => {
        if (!weatherData?.main) return "Monitor weather conditions for optimal farming decisions.";
        
        const temp = weatherData.main.temp;
        const condition = weatherData.weather?.[0]?.main?.toLowerCase() || '';
        
        if (temp > 30) return "High temperature alert: Ensure crops have adequate irrigation and consider providing shade for sensitive plants.";
        if (temp < 10) return "Low temperature alert: Protect sensitive crops from frost damage and consider delaying new plantings.";
        if (condition.includes('rain')) return "Rainfall detected: Hold off on irrigation and ensure proper field drainage to prevent waterlogging.";
        if (condition.includes('storm')) return "Storm warning: Secure farm equipment and structures, check drainage systems to prevent erosion.";
        
        return "Good growing conditions: Ideal time for regular field operations and crop monitoring.";
    };

    const calculateProgress = (crop) => {
        if (!crop.planting_date || !crop.harvest_date) return 30;
        
        try {
            const plantDate = new Date(crop.planting_date);
            const harvestDate = new Date(crop.harvest_date);
            const today = new Date();
            
            const totalDays = (harvestDate - plantDate) / (1000 * 60 * 60 * 24);
            const daysElapsed = (today - plantDate) / (1000 * 60 * 60 * 24);
            
            return Math.min(100, Math.max(5, Math.round((daysElapsed / totalDays) * 100)));
        } catch (error) {
            return 30;
        }
    };

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
                                    <strong>Welcome to your personalized Smart Farming dashboard.</strong> This central hub provides real-time insights and tools to optimize your farming operations.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowTip(false)} 
                            className="flex-shrink-0 ml-4"
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
                            <WeatherWidget />
                            
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                         </svg>
                                            My Crops
                                        </h3>
                                        <Link 
                                            href={
                                                (() => {
                                                    try {
                                                        return route('crops.create');
                                                    } catch (e) {
                                                        // Fallback if route doesn't exist
                                                        return '/crops/create';
                                                    }
                                                })()
                                            } 
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
                                                                <span className="inline-flex ml-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    {crop.status || 'Growing'}
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
                                                            {crop.harvest_date && (
                                                                <div className="text-sm font-medium mb-1 flex items-center sm:justify-end">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                                    </svg>
                                                                    Harvest: {new Date(crop.harvest_date).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-gray-500 mb-2">Growth Progress</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-2">
                                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" 
                                                                style={{ width: `${calculateProgress(crop)}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                                                            <span>Planted</span>
                                                            <span>{calculateProgress(crop)}%</span>
                                                            <span>Harvest</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </Link>
                                            ))}
                                            
                                            <div className="flex justify-center pt-2">
                                                <Link 
                                                    href={route('my-crops')}
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
                        
                        <div className="md:col-span-4 space-y-6">
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
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
                                            href={safeRoute('blog')} 
                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition shadow-sm group"
                                        >
                                            <div className="flex items-center">
                                                <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                    </svg>
                                                </div>
                                                <span className="font-medium">Farming Blog</span>
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
                            
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Today's Tasks
                                        </h3>
                                        <Link 
                                            href={safeRoute('tasks')}
                                            className="text-sm text-amber-600 hover:text-amber-800 flex items-center transition-colors"
                                        >
                                            View all
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                    
                                    {tasksLoading ? (
                                        <div className="animate-pulse space-y-4">
                                            <div className="h-10 bg-gray-200 rounded"></div>
                                            <div className="h-10 bg-gray-200 rounded"></div>
                                            <div className="h-10 bg-gray-200 rounded"></div>
                                        </div>
                                    ) : tasks.length > 0 ? (
                                        <div className="space-y-3">
                                            {tasks.map(task => (
                                                <div 
                                                    key={task.id} 
                                                    className={`flex items-center p-3 rounded-lg border border-gray-100 ${
                                                        task.completed ? 'bg-gray-50' : 
                                                        task.priority === 'high' ? 'bg-red-50 border-red-100' :
                                                        task.priority === 'medium' ? 'bg-yellow-50 border-yellow-100' :
                                                        'bg-green-50 border-green-100'
                                                    }`}
                                                >
                                                    <div className="mr-3 flex-shrink-0">
                                                        <input 
                                                            type="checkbox" 
                                                            id={`task-${task.id}`}
                                                            checked={task.completed}
                                                            onChange={() => toggleTask(task.id)}
                                                            className={`h-5 w-5 rounded border-gray-300 focus:outline-none ${
                                                                task.priority === 'high' ? 'text-red-600 focus:ring-red-500' :
                                                                task.priority === 'medium' ? 'text-yellow-500 focus:ring-yellow-500' :
                                                                'text-green-600 focus:ring-green-500'
                                                            }`}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label 
                                                            htmlFor={`task-${task.id}`}
                                                            className={`block font-medium ${
                                                                task.completed ? 'line-through text-gray-500' : 
                                                                task.priority === 'high' ? 'text-red-700' :
                                                                task.priority === 'medium' ? 'text-yellow-700' :
                                                                'text-green-700'
                                                            }`}
                                                        >
                                                            {task.title}
                                                        </label>
                                                        {task.crop_name && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                Crop: {task.crop_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {task.priority && (
                                                        <div className="ml-2">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-gray-500 mb-1">No tasks for today</p>
                                            <p className="text-sm text-gray-400">Your daily tasks will appear here</p>
                                        </div>
                                    )}
                                    
                                    <Link 
                                        href={safeRoute('tasks.create')}
                                        className="mt-4 text-amber-600 hover:text-amber-800 text-sm flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Add new task
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h2m4 0h12M5 7a2 2 0 100 4h14a2 2 0 100-4H5zm0 0V5a2 2 0 012-2h10a2 2 0 012 2v2m-2 4v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6m2 4h10" />
                                        </svg>
                                        Farm Overview
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <h4 className="text-sm font-medium text-gray-700">Total Crops</h4>
                                                <p className="text-2xl font-bold text-green-700">{crops?.length || 0}</p>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <h4 className="text-sm font-medium text-gray-700">Tasks Completed</h4>
                                                <p className="text-2xl font-bold text-blue-700">
                                                    {tasks.filter(t => t.completed).length}/{tasks.length}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Farming Tip</h4>
                                            <p className="text-sm text-gray-600">
                                                {weatherData?.main?.temp > 30 ? 
                                                    "High temperature alert: Ensure crops have adequate water today." : 
                                                weatherData?.main?.temp < 15 ? 
                                                    "Cool conditions: Watch for temperature drops and protect sensitive crops." : 
                                                weatherData?.weather?.[0]?.main === "Rain" ? 
                                                    "Rainfall expected: Prepare drainage systems and delay fertilizer application." : 
                                                    "Good growing conditions today for most crops. Stay hydrated while working outdoors."
                                                }
                                            </p>
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
