import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { getWeatherIcon, getAgricultureAdvice } from '../../utils/weatherUtils';
import { formatLocation } from '../../utils/locationFormatter';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Show({ auth, crop }) {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [activities, setActivities] = useState({});
    const [newActivity, setNewActivity] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [weatherError, setWeatherError] = useState(null);
    const [syncingWithTasks, setSyncingWithTasks] = useState(false);
    const [activitySyncStatus, setActivitySyncStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

    // Fetch weather data based on crop location
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setLoading(true);
                
                if (!crop.location) {
                    setWeatherError("No location specified for this crop");
                    setLoading(false);
                    return;
                }
                
                // Standard API call without strict parameter
                const response = await axios.get(`/api/weather?location=${encodeURIComponent(crop.location)}`);
                
                if (response.data.error) {
                    console.error("Weather API error:", response.data.error);
                    setWeatherError(`Weather data unavailable for "${crop.location}"`);
                    setWeatherData(null);
                } else {
                    setWeatherData(response.data);
                    setWeatherError(null);
                }
            } catch (error) {
                setWeatherError(`Error loading weather data: ${error.message}`);
                setWeatherData(null);
            } finally {
                setLoading(false);
            }
        };
        
        fetchWeather();
    }, [crop]);

    // Load activities function - combines localStorage and server data
    const loadActivities = async () => {
        setActivitySyncStatus('loading');
        
        // First try to load from localStorage for immediate display
        const storedActivities = localStorage.getItem(`crop_${crop.id}_activities`);
        let localActivities = {};
        
        if (storedActivities) {
            try {
                localActivities = JSON.parse(storedActivities);
                setActivities(localActivities);
            } catch (error) {
                console.error("Error parsing stored activities:", error);
            }
        }
        
        // Then fetch from server for the most up-to-date data
        try {
            const response = await axios.get(`/api/crop/${crop.id}/activities`);
            if (response.data.success) {
                const serverActivities = response.data.activities;
                setActivities(serverActivities);
                
                // Update localStorage with server data
                localStorage.setItem(`crop_${crop.id}_activities`, JSON.stringify(serverActivities));
                setActivitySyncStatus('success');
            }
        } catch (error) {
            console.error("Error fetching activities from server:", error);
            setActivitySyncStatus('error');
        }
    };

    // Save activities to both localStorage and server
    const saveActivities = async (activitiesData) => {
        setActivitySyncStatus('loading');
        
        // Update localStorage immediately for responsive UI
        localStorage.setItem(`crop_${crop.id}_activities`, JSON.stringify(activitiesData));
        
        // Then sync with server
        try {
            const response = await axios.post(`/api/crop/${crop.id}/activities`, {
                activities: activitiesData
            });
            
            if (response.data.success) {
                setActivitySyncStatus('success');
                return true;
            } else {
                setActivitySyncStatus('error');
                return false;
            }
        } catch (error) {
            console.error("Error saving activities to server:", error);
            setActivitySyncStatus('error');
            return false;
        }
    };

    // Replace the useEffect that loads activities
    useEffect(() => {
        if (crop && crop.id) {
            loadActivities();
        }
    }, [crop.id]);

    // Calendar helper functions
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleAddActivity = () => {
        if (selectedDate && newActivity.trim()) {
            const dateKey = selectedDate.toISOString().split('T')[0];
            const updatedActivities = {
                ...activities,
                [dateKey]: [...(activities[dateKey] || []), newActivity]
            };
            setActivities(updatedActivities);
            setNewActivity('');
        }
    };

    // Add this helper function to your component
    const getDailyForecastFromList = (forecastList) => {
        if (!forecastList || !Array.isArray(forecastList)) return [];

        const dailyData = {};
        
        // Group the 3-hour forecasts by day
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            
            if (!dailyData[date]) {
                dailyData[date] = {
                    dt: item.dt,
                    temp: { min: item.main.temp, max: item.main.temp },
                    weather: item.weather[0],
                    pop: item.pop || 0
                };
            } else {
                // Update min/max temps
                dailyData[date].temp.min = Math.min(dailyData[date].temp.min, item.main.temp);
                dailyData[date].temp.max = Math.max(dailyData[date].temp.max, item.main.temp);
                
                // Take the highest precipitation probability
                if (item.pop > dailyData[date].pop) {
                    dailyData[date].pop = item.pop;
                }
            }
        });
        
        // Convert to array and take only the next 5 days
        return Object.values(dailyData).slice(0, 5);
    };

    // Replace your current renderCalendar function with this enhanced version
    const renderCalendar = () => {
        const [currentDate, setCurrentDate] = useState(new Date());
        const [selectedDate, setSelectedDate] = useState(null);
        const [activityText, setActivityText] = useState("");
        const [showActivityForm, setShowActivityForm] = useState(false);
        const [editingActivityId, setEditingActivityId] = useState(null);
        
        const daysInMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        ).getDate();
        
        const firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        ).getDay();

        const prevMonth = () => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setCurrentDate(newDate);
        };

        const nextMonth = () => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setCurrentDate(newDate);
        };

        const prevYear = () => {
            const newDate = new Date(currentDate);
            newDate.setFullYear(newDate.getFullYear() - 1);
            setCurrentDate(newDate);
        };

        const nextYear = () => {
            const newDate = new Date(currentDate);
            newDate.setFullYear(newDate.getFullYear() + 1);
            setCurrentDate(newDate);
        };

        const formatMonth = () => {
            return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
        };
        
        const formatDateString = (date) => {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };
        
        const handleDayClick = (date) => {
            setSelectedDate(date);
            setShowActivityForm(true);
            setEditingActivityId(null);
            setActivityText("");
        };
        
        const handleEditActivity = (activity) => {
            setActivityText(activity.text);
            setEditingActivityId(activity.id);
        };
        
        const handleSaveActivity = async () => {
            if (!selectedDate || !activityText.trim()) return;
            
            const dateKey = formatDateString(selectedDate);
            let newActivities = {...activities};
            
            if (editingActivityId) {
                // Update existing activity
                const activityIndex = newActivities[dateKey]?.findIndex(a => a.id === editingActivityId);
                if (activityIndex !== -1) {
                    newActivities[dateKey][activityIndex].text = activityText;
                    newActivities[dateKey][activityIndex].synced = false; // Mark for re-sync
                }
            } else {
                // Add new activity
                const newActivity = {
                    id: `temp_${Date.now()}`, // Temporary ID until server assigns one
                    text: activityText,
                    completed: false,
                    date: dateKey,
                    synced: false
                };
                
                // Add to local state
                if (!newActivities[dateKey]) {
                    newActivities[dateKey] = [];
                }
                newActivities[dateKey].push(newActivity);
            }
            
            // Update local state
            setActivities(newActivities);
            
            // Save to server and localStorage
            await saveActivities(newActivities);
            
            // Reset form
            setActivityText("");
            setShowActivityForm(false);
            setEditingActivityId(null);
        };
        
        const handleToggleComplete = (dateStr, idx) => {
            const newActivities = {...activities};
            const activity = newActivities[dateStr][idx];
            activity.completed = !activity.completed;
            
            // Update state
            setActivities(newActivities);
            
            // Update localStorage
            saveActivities(newActivities);
        };
        
        const handleDeleteActivity = (dateStr, idx) => {
            if (!confirm("Are you sure you want to delete this activity?")) return;
            
            const newActivities = {...activities};
            
            // Remove from array
            newActivities[dateStr].splice(idx, 1);
            
            // If no more activities for this date, remove the date key
            if (newActivities[dateStr].length === 0) {
                delete newActivities[dateStr];
            }
            
            // Update state
            setActivities(newActivities);
            
            // Update localStorage
            saveActivities(newActivities);
        };

        return (
            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
                <div className="bg-green-50 p-4 border-b border-green-100 flex items-center">
                    <h2 className="text-xl font-semibold text-green-700">Crop Calendar</h2>
                    <p className="text-sm text-gray-600 mt-1">Click on a date to add activities or view planned tasks</p>
                    {syncingWithTasks && <p className="text-sm text-blue-600 mt-1">Syncing with tasks...</p>}
                    
                    {/* Sync status indicators */}
                    <div className="ml-auto">
                        {activitySyncStatus === 'loading' && (
                            <div className="text-sm text-blue-600 flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Syncing...
                            </div>
                        )}
                        {activitySyncStatus === 'success' && (
                            <div className="text-sm text-green-600 flex items-center">
                                <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Saved
                            </div>
                        )}
                        {activitySyncStatus === 'error' && (
                            <div className="text-sm text-red-600 flex items-center">
                                <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Sync error
                                <button onClick={loadActivities} className="ml-2 underline text-xs">
                                    Retry
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                            {/* Year Navigation */}
                            <button 
                                onClick={prevYear} 
                                className="p-1 rounded-full hover:bg-gray-100"
                                aria-label="Previous Year"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.707 5.293a1 1 0 010 1.414L7.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            {/* Month Navigation */}
                            <button 
                                onClick={prevMonth} 
                                className="p-1 rounded-full hover:bg-gray-100"
                                aria-label="Previous Month"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        
                        <h3 className="text-lg font-medium">{formatMonth()} {currentDate.getFullYear()}</h3>
                        
                        <div className="flex items-center space-x-2">
                            {/* Month Navigation */}
                            <button 
                                onClick={nextMonth} 
                                className="p-1 rounded-full hover:bg-gray-100"
                                aria-label="Next Month"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            {/* Year Navigation */}
                            <button 
                                onClick={nextYear} 
                                className="p-1 rounded-full hover:bg-gray-100"
                                aria-label="Next Year"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.293 14.707a1 1 0 010-1.414L12.586 10 9.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                        {/* Day headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center font-semibold text-sm py-2">
                                {day}
                            </div>
                        ))}
                        
                        {/* Empty cells for days before the first day of the month */}
                        {Array.from({ length: firstDayOfMonth }, (_, i) => (
                            <div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50"></div>
                        ))}
                        
                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const dateString = formatDateString(date);
                            const isToday = new Date().toDateString() === date.toDateString();
                            const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                            const hasActivities = activities[dateString] && activities[dateString].length > 0;
                            
                            return (
                                <div 
                                    key={day}
                                    onClick={() => handleDayClick(date)}
                                    className={`min-h-24 h-auto border relative cursor-pointer transition-colors duration-200 ${
                                        isToday ? 'bg-green-50 border-green-300' : 
                                        isSelected ? 'bg-blue-50 border-blue-300' : 
                                        'border-gray-100 hover:bg-gray-50'
                                    } ${hasActivities ? 'ring-1 ring-green-400' : ''}`}
                                >
                                    <div className={`absolute top-1 left-1 w-6 h-6 flex items-center justify-center rounded-full ${
                                        isToday ? 'bg-green-600 text-white' : ''
                                    }`}>
                                        {day}
                                    </div>
                                    
                                    {/* Show activities for this day */}
                                    {hasActivities && (
                                        <div className="pt-8 px-1 text-xs">
                                            {activities[dateString].slice(0, 3).map((activity, idx) => (
                                                <div 
                                                    key={activity.id || idx}
                                                    className={`mb-1 truncate p-1 rounded ${
                                                        activity.completed ? 'line-through text-gray-400 bg-gray-50' : 'bg-green-50'
                                                    }`}
                                                >
                                                    {activity.text}
                                                </div>
                                            ))}
                                            {activities[dateString].length > 3 && (
                                                <div className="text-xs text-gray-500 text-center">
                                                    +{activities[dateString].length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Activity form */}
                    {showActivityForm && selectedDate && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <h3 className="font-medium text-lg mb-2">
                                {editingActivityId ? 'Edit Activity' : 'Add Activity'} for {selectedDate.toLocaleDateString()}
                            </h3>
                            
                            <div className="mb-4">
                                <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-1">
                                    Activity Details
                                </label>
                                <textarea
                                    id="activity"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., Apply fertilizer, Check for pests, Water plants..."
                                    value={activityText}
                                    onChange={(e) => setActivityText(e.target.value)}
                                    rows="3"
                                ></textarea>
                            </div>
                            
                            {/* Existing activities for this day */}
                            {activities[formatDateString(selectedDate)] && 
                             activities[formatDateString(selectedDate)].length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-medium text-sm mb-2">Planned Activities:</h4>
                                    <ul className="space-y-2">
                                        {activities[formatDateString(selectedDate)].map((activity, idx) => (
                                            <li key={activity.id || idx} className="flex items-center justify-between group">
                                                <div className="flex items-center flex-1">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={activity.completed}
                                                        onChange={() => handleToggleComplete(
                                                            formatDateString(selectedDate), 
                                                            idx
                                                        )}
                                                        className="mr-2"
                                                    />
                                                    <span className={activity.completed ? 'line-through text-gray-400' : ''}>
                                                        {activity.text}
                                                    </span>
                                                </div>
                                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleEditActivity(activity)}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteActivity(
                                                            formatDateString(selectedDate), 
                                                            idx
                                                        )}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => {
                                        setShowActivityForm(false);
                                        setEditingActivityId(null);
                                        setActivityText("");
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveActivity}
                                    disabled={!activityText.trim()}
                                    className={`px-4 py-2 rounded-md text-white ${
                                        activityText.trim() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {editingActivityId ? 'Update' : 'Add Activity'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-green-800">
                    {crop.crop_type} Details
                </h2>
            }
        >
            <Head title={`${crop.crop_type} Details`} />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Remove your custom nav header since AuthenticatedLayout provides it */}
                    
                    <div className="mb-6">
                        <Link href="/my-crops" className="text-green-600 hover:underline">
                            &larr; Back to My Crops
                        </Link>
                    </div>
                    
                    {/* Keep the rest of your component content - Weather, Crop Details, Calendar */}
                    {/* Weather Forecast Section */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
                        <div className="bg-blue-50 p-4 border-b border-blue-100">
                            <h2 className="text-xl font-semibold text-blue-700">Weather Forecast for {crop.location}</h2>
                        </div>
                        
                        <div className="p-4">
                            {loading ? (
                                <div className="flex justify-center items-center h-24">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : weatherData && weatherData.forecast?.list ? (
                                <div>
                                    {/* Current weather */}
                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="text-5xl mr-6">
                                                {weatherData.weather && weatherData.weather[0] && 
                                                    <img 
                                                        src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                                                        alt={weatherData.weather[0].description}
                                                        className="w-16 h-16"
                                                    />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-3xl font-bold">
                                                    {weatherData.main?.temp ? `${Math.round(weatherData.main.temp)}°C` : 'N/A'}
                                                </p>
                                                <p className="text-lg capitalize">
                                                    {weatherData.weather?.[0]?.description || 'No data'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Humidity: {weatherData.main?.humidity ?? 'N/A'}% | 
                                                    Wind: {weatherData.wind?.speed ? `${Math.round(weatherData.wind.speed * 3.6)} km/h` : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 5-day forecast */}
                                    <h3 className="font-medium text-gray-700 mb-3">5-Day Forecast</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                        {weatherData.forecast && getDailyForecastFromList(weatherData.forecast.list).map((day, index) => (
                                            <div key={index} className="bg-white p-3 rounded-lg shadow-sm text-center">
                                                <div className="text-sm font-medium">
                                                    {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                                                </div>
                                                <img 
                                                    src={`https://openweathermap.org/img/wn/${day.weather.icon}@2x.png`}
                                                    alt={day.weather.description}
                                                    className="w-12 h-12 mx-auto"
                                                />
                                                <div className="font-bold">{Math.round(day.temp.max)}°C</div>
                                                <div className="text-sm text-gray-500">{Math.round(day.temp.min)}°C</div>
                                                <div className="mt-1 text-xs">
                                                    {Math.round(day.pop * 100)}% rain
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-red-500 text-center py-4">
                                        Weather data unavailable for "{crop.location}".
                                    </div>
                                    <div className="mt-4 text-center">
                                        <button 
                                            onClick={() => fetchWeather()}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            )}
                            {weatherError && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                    <p className="text-sm text-yellow-700">
                                        {weatherError}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Crop Details Section */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
                        {crop.photo_path && (
                            <div className="h-64 overflow-hidden">
                                <img 
                                    src={`/storage/${crop.photo_path}`} 
                                    alt={crop.crop_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        
                        <div className="p-6">
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h2 className="font-semibold text-lg text-green-800 mb-3">Basic Information</h2>
                                    <div className="space-y-2">
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Crop Type:</span> 
                                            <span className="text-gray-800">{crop.crop_type}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Variety:</span> 
                                            <span className="text-gray-800">{crop.variety || 'Not specified'}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Planting Date:</span> 
                                            <span className="text-gray-800">{new Date(crop.planting_date).toLocaleDateString()}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Location:</span> 
                                            <span className="text-gray-800">{crop.location}</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h2 className="font-semibold text-lg text-blue-800 mb-3">Soil Information</h2>
                                    <div className="space-y-2">
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Soil Type:</span> 
                                            <span className="text-gray-800">{crop.soil_type || 'Not specified'}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Soil pH:</span> 
                                            <span className="text-gray-800">{crop.soil_ph || 'Not specified'}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Soil Moisture:</span> 
                                            <span className="text-gray-800">{crop.soil_moisture || 'Not specified'}</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h2 className="font-semibold text-lg text-yellow-800 mb-3">Seed Information</h2>
                                    <div className="space-y-2">
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Seed Source:</span> 
                                            <span className="text-gray-800">{crop.seed_source || 'Not specified'}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Seed Treatment:</span> 
                                            <span className="text-gray-800">{crop.seed_treatment || 'Not specified'}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Initial Plant Count:</span> 
                                            <span className="text-gray-800">{crop.initial_plant_count || 'Not specified'}</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h2 className="font-semibold text-lg text-purple-800 mb-3">Growth Management</h2>
                                    <div className="space-y-2">
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Weather Conditions:</span> 
                                            <span className="text-gray-800">{crop.weather_conditions || 'Not specified'}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Irrigation Method:</span> 
                                            <span className="text-gray-800">{crop.irrigation_method || 'Not specified'}</span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium text-gray-600">Irrigation Frequency:</span> 
                                            <span className="text-gray-800">{crop.irrigation_frequency || 'Not specified'}</span>
                                        </p>
                                    </div>
                                </div>
                            
                                <div className="space-y-6">
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <h2 className="font-semibold text-lg text-red-800 mb-3">Treatment Information</h2>
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="font-medium text-gray-700">Fertilizer Details:</h3>
                                                <p className="text-gray-800 whitespace-pre-wrap">{crop.fertilizer_details || 'No fertilizer details added'}</p>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-700">Pesticide Details:</h3>
                                                <p className="text-gray-800 whitespace-pre-wrap">{crop.pesticide_details || 'No pesticide details added'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-indigo-50 p-4 rounded-lg">
                                        <h2 className="font-semibold text-lg text-indigo-800 mb-3">Goals & Equipment</h2>
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="font-medium text-gray-700">Growth Goals:</h3>
                                                <p className="text-gray-800 whitespace-pre-wrap">{crop.growth_goals || 'No growth goals specified'}</p>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-700">Equipment Used:</h3>
                                                <p className="text-gray-800">{crop.equipment_used || 'No equipment information added'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {crop.notes && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h2 className="font-semibold text-lg text-gray-800 mb-3">Additional Notes</h2>
                                            <p className="text-gray-800 whitespace-pre-wrap">{crop.notes}</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex justify-end mt-6 space-x-3">
                                    <Link
                                        href={`/crops/${crop.id}/edit`}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Edit Crop
                                    </Link>
                                </div>
                        </div>
                    </div>
                    
                    {/* Calendar Section */}
                    {renderCalendar()}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}