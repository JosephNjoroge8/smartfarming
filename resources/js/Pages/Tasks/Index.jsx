import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [calendarActivities, setCalendarActivities] = useState([]);
    const [combinedTasks, setCombinedTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [crops, setCrops] = useState([]);
    const [filterCrop, setFilterCrop] = useState('all');
    const [showCompleted, setShowCompleted] = useState(true);
    
    // Get user from page props
    const { auth } = usePage().props;
    
    // Function to format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };
    
    // Check if date is today
    const isToday = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const taskDate = new Date(dateString);
        taskDate.setHours(0, 0, 0, 0);
        
        return today.getTime() === taskDate.getTime();
    };
    
    // Check if date is overdue
    const isOverdue = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const taskDate = new Date(dateString);
        taskDate.setHours(0, 0, 0, 0);
        
        return taskDate < today;
    };
    
    // Mark task as complete
    const markAsCompleted = async (task, isCalendarTask = false) => {
        try {
            if (isCalendarTask) {
                // Update calendar activity
                await axios.put(`/api/crop/${task.crop_id}/activities/${task.id}`, {
                    ...task,
                    completed: true
                });
                
                // Update local state for calendar activities
                setCalendarActivities(prev => prev.map(activity => 
                    activity.id === task.id
                        ? { ...activity, completed: true }
                        : activity
                ));
            } else {
                // Update regular task
                await axios.put(`/api/tasks/${task.id}`, {
                    ...task,
                    status: 'completed'
                });
                
                // Update local state for tasks
                setTasks(prev => prev.map(t => 
                    t.id === task.id
                        ? { ...t, status: 'completed' }
                        : t
                ));
            }
            
            // Update combined list
            combineTasks();
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };
    
    // Combine regular tasks and calendar activities
    const combineTasks = () => {
        // Convert calendar activities to task format
        const activitiesAsTasks = calendarActivities.map(activity => ({
            id: activity.id,
            title: activity.text,
            description: `Calendar activity for ${activity.crop_name || 'crop'}`,
            due_date: activity.date,
            status: activity.completed ? 'completed' : 'pending',
            crop_id: activity.crop_id,
            crop_name: activity.crop_name,
            isCalendarTask: true
        }));
        
        // Combine with regular tasks
        const combined = [...tasks, ...activitiesAsTasks];
        
        // Sort by date (most recent first)
        combined.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        
        setCombinedTasks(combined);
    };
    
    // Fetch all user crops
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                // Using the user-crops API endpoint which is already defined in your API routes
                const response = await axios.get('/api/user-crops');
                
                if (Array.isArray(response.data)) {
                    // Make sure we have crop_name or crop_type for display
                    const processedCrops = response.data.map(crop => ({
                        ...crop,
                        display_name: crop.crop_name || crop.crop_type || `Crop #${crop.id}`
                    }));
                    setCrops(processedCrops);
                    console.log("Fetched crops:", processedCrops);
                } else {
                    console.error("Invalid crops data format:", response.data);
                    setCrops([]);
                }
            } catch (error) {
                console.error('Error fetching crops:', error);
                setCrops([]);
            }
        };
        
        fetchCrops();
    }, []);
    
    // Fetch tasks and calendar activities
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            try {
                // Fetch regular tasks
                const tasksResponse = await axios.get('/api/tasks');
                setTasks(tasksResponse.data || []);
                
                // Fetch calendar activities for all user crops
                const activitiesPromises = [];
                if (crops.length > 0) {
                    crops.forEach(crop => {
                        activitiesPromises.push(
                            axios.get(`/api/crop/${crop.id}/activities`)
                                .then(response => {
                                    // Format activities from object to array with date included
                                    const formattedActivities = [];
                                    
                                    if (response.data.success && response.data.activities) {
                                        Object.keys(response.data.activities).forEach(date => {
                                            response.data.activities[date].forEach(activity => {
                                                formattedActivities.push({
                                                    ...activity,
                                                    date,
                                                    crop_id: crop.id,
                                                    crop_name: crop.crop_name || crop.crop_type || `Crop #${crop.id}`
                                                });
                                            });
                                        });
                                    }
                                    
                                    return formattedActivities;
                                })
                                .catch(error => {
                                    console.error(`Error fetching activities for crop ${crop.id}:`, error);
                                    return [];
                                })
                        );
                    });
                    
                    // Wait for all activities to be fetched
                    const allActivitiesArrays = await Promise.all(activitiesPromises);
                    
                    // Flatten array of arrays into a single array
                    const allActivities = allActivitiesArrays.flat();
                    setCalendarActivities(allActivities);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        if (crops.length > 0) {
            fetchData();
        }
    }, [crops]);
    
    // Combine tasks whenever the source data changes
    useEffect(() => {
        combineTasks();
    }, [tasks, calendarActivities]);
    
    // Filter tasks based on selected filters
    const filteredTasks = combinedTasks.filter(task => {
        // For debugging
        if (filterCrop !== 'all' && task.crop_id !== parseInt(filterCrop)) {
            console.log(`Filtering out task: ${task.title}, crop_id: ${task.crop_id}, filterCrop: ${filterCrop}`);
        }

        // Filter by crop - making sure to convert string IDs to integers for comparison
        if (filterCrop !== 'all' && parseInt(task.crop_id) !== parseInt(filterCrop)) {
            return false;
        }
        
        // Filter by completion status
        if (!showCompleted && 
            (task.status === 'completed' || 
            (task.isCalendarTask && task.completed))) {
            return false;
        }
        
        return true;
    });
    
    // Group tasks by date for better organization
    const groupedTasks = {
        today: [],
        upcoming: [],
        overdue: [],
        completed: []
    };
    
    filteredTasks.forEach(task => {
        const isCompleted = task.status === 'completed' || 
                          (task.isCalendarTask && task.completed);
        
        if (isCompleted) {
            groupedTasks.completed.push(task);
        } else if (isToday(task.due_date)) {
            groupedTasks.today.push(task);
        } else if (isOverdue(task.due_date)) {
            groupedTasks.overdue.push(task);
        } else {
            groupedTasks.upcoming.push(task);
        }
    });
    
    if (loading) return (
        <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            <span className="ml-2">Loading tasks...</span>
        </div>
    );
    
    return (
        <div>
            {/* Debug information - remove in production */}
            {/* <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                <p>Available crops: {JSON.stringify(crops)}</p>
                <p>Current filter: {filterCrop}</p>
            </div> */}

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <div>
                    <label htmlFor="crop-filter" className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Crop
                    </label>
                    <select
                        id="crop-filter"
                        className="rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        value={filterCrop}
                        onChange={(e) => {
                            console.log("Setting filter crop to:", e.target.value);
                            setFilterCrop(e.target.value);
                        }}
                    >
                        <option value="all">All Crops</option>
                        {crops.map(crop => (
                            <option key={crop.id} value={crop.id.toString()}>
                                {crop.crop_name || crop.crop_type || `Crop #${crop.id}`}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="flex items-center ml-4">
                    <input
                        type="checkbox"
                        id="show-completed"
                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        checked={showCompleted}
                        onChange={(e) => setShowCompleted(e.target.checked)}
                    />
                    <label htmlFor="show-completed" className="ml-2 block text-sm text-gray-700">
                        Show completed tasks
                    </label>
                </div>
            </div>

            {combinedTasks.length === 0 ? (
                <div className="text-center py-10">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new task or adding activities in your crop calendar.</p>
                    <div className="mt-6">
                        <Link
                            href="/tasks/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add task
                        </Link>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Today's tasks */}
                    {groupedTasks.today.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                Today ({groupedTasks.today.length})
                            </h4>
                            <ul className="space-y-3">
                                {groupedTasks.today.map(task => (
                                    <TaskItem 
                                        key={`${task.isCalendarTask ? 'cal-' : ''}${task.id}`}
                                        task={task}
                                        markAsCompleted={markAsCompleted}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Overdue tasks */}
                    {groupedTasks.overdue.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                Overdue ({groupedTasks.overdue.length})
                            </h4>
                            <ul className="space-y-3">
                                {groupedTasks.overdue.map(task => (
                                    <TaskItem 
                                        key={`${task.isCalendarTask ? 'cal-' : ''}${task.id}`}
                                        task={task}
                                        markAsCompleted={markAsCompleted}
                                        isOverdue={true}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Upcoming tasks */}
                    {groupedTasks.upcoming.length > 0 && (
                        <div className="mb-8">
                            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                Upcoming ({groupedTasks.upcoming.length})
                            </h4>
                            <ul className="space-y-3">
                                {groupedTasks.upcoming.map(task => (
                                    <TaskItem 
                                        key={`${task.isCalendarTask ? 'cal-' : ''}${task.id}`}
                                        task={task}
                                        markAsCompleted={markAsCompleted}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Completed tasks */}
                    {showCompleted && groupedTasks.completed.length > 0 && (
                        <div>
                            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                                <span className="inline-block w-3 h-3 bg-gray-300 rounded-full mr-2"></span>
                                Completed ({groupedTasks.completed.length})
                            </h4>
                            <ul className="space-y-3">
                                {groupedTasks.completed.map(task => (
                                    <TaskItem 
                                        key={`${task.isCalendarTask ? 'cal-' : ''}${task.id}`}
                                        task={task}
                                        markAsCompleted={markAsCompleted}
                                        isCompleted={true}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Task Item Component
const TaskItem = ({ task, markAsCompleted, isOverdue = false, isCompleted = false }) => {
    const taskCompleted = isCompleted || task.status === 'completed' || (task.isCalendarTask && task.completed);
    
    return (
        <li className={`border rounded-md ${
            taskCompleted ? 'bg-gray-50 border-gray-200' : 
            isOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
        }`}>
            <div className="p-4">
                <div className="flex items-start">
                    {/* Task checkbox */}
                    {!taskCompleted && (
                        <button
                            onClick={() => markAsCompleted(task, task.isCalendarTask)}
                            className={`mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full border-2 ${
                                isOverdue ? 'border-red-500' : 'border-green-500'
                            }`}
                            aria-label="Mark as completed"
                        ></button>
                    )}
                    
                    {taskCompleted && (
                        <div className="mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    
                    <div className="flex-1">
                        {/* Task title & description */}
                        <div className={taskCompleted ? 'text-gray-500' : ''}>
                            <h3 className={`text-lg font-medium ${taskCompleted ? 'line-through' : ''}`}>
                                {task.title}
                            </h3>
                            {task.description && (
                                <p className={`text-sm mt-1 ${taskCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {task.description}
                                </p>
                            )}
                        </div>
                        
                        {/* Task metadata */}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {/* Due date */}
                            <span className={`px-2 py-1 rounded-full ${
                                taskCompleted ? 'bg-gray-200 text-gray-700' :
                                isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                            
                            {/* Crop badge */}
                            {task.crop_name && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                    {task.crop_name}
                                </span>
                            )}
                            
                            {/* Source badge */}
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                                {task.isCalendarTask ? 'Calendar' : 'Task'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Task actions */}
                    {!taskCompleted && (
                        <div className="ml-4 flex-shrink-0 flex">
                            <Link
                                href={task.isCalendarTask 
                                    ? `/crops/${task.crop_id}#calendar` 
                                    : `/tasks/${task.id}/edit`}
                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                                {task.isCalendarTask ? 'View in Calendar' : 'Edit Task'}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
};

export default function Tasks({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-green-800">
                    Farm Tasks
                </h2>
            }
        >
            <Head title="Farm Tasks" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium">Task List</h3>
                                <div className="space-x-2">
                                    <Link 
                                        href="/tasks/create"
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                    >
                                        Add New Task
                                    </Link>
                                    <Link 
                                        href="/my-crops"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                    >
                                        Crop Calendars
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-4 mb-6">
                                <h4 className="font-medium mb-1">Task Management</h4>
                                <p className="text-sm text-gray-600">
                                    This page displays all your farming tasks, including those created directly and activities from your crop calendars. 
                                    Mark tasks as complete to track your progress.
                                </p>
                            </div>
                            
                            <TaskList />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}