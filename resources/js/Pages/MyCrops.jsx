import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

const MyCrops = ({ auth, crops = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('planting_date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [isGridView, setIsGridView] = useState(true);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { flash } = usePage().props;
    
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        setIsVisible(true);
    }, []);

    const filteredCrops = [...crops]
        .filter(crop => {
            const matchesSearch = searchTerm === '' || 
                crop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                crop.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                crop.crop_type?.toLowerCase().includes(searchTerm.toLowerCase());
                
            const matchesType = filterType === 'all' || 
                crop.type === filterType ||
                crop.crop_type === filterType;
                
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
    const cropTypes = ['all', ...new Set(crops.map(crop => crop.crop_type || crop.type).filter(Boolean))];
    
    const calculateCropProgress = (crop) => {
        if (!crop.planting_date || !(crop.harvest_date || crop.expected_harvest_date)) return 0;
        
        const today = new Date();
        const plantingDate = new Date(crop.planting_date);
        const harvestDate = new Date(crop.harvest_date || crop.expected_harvest_date);
        
        const totalDays = Math.max(1, (harvestDate - plantingDate) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.max(0, (today - plantingDate) / (1000 * 60 * 60 * 24));
        
        return Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
    };
    
    const cropStats = {
        totalCrops: crops.length,
        activeCrops: crops.filter(crop => {
            const harvestDate = (crop.harvest_date || crop.expected_harvest_date) ? 
                new Date(crop.harvest_date || crop.expected_harvest_date) : null;
            return !harvestDate || harvestDate > new Date();
        }).length,
        harvestedCrops: crops.filter(crop => {
            const harvestDate = (crop.harvest_date || crop.expected_harvest_date) ? 
                new Date(crop.harvest_date || crop.expected_harvest_date) : null;
            return harvestDate && harvestDate <= new Date();
        }).length,
        cropTypes: new Set(crops.map(crop => crop.crop_type || crop.type).filter(Boolean)).size
    };
    
    const cropTypeData = Array.from(
        crops.reduce((acc, crop) => {
            const type = crop.crop_type || crop.type || 'Unknown';
            acc.set(type, (acc.get(type) || 0) + 1);
            return acc;
        }, new Map())
    ).map(([name, value]) => ({ name, value }));

    const handleDelete = () => {
        if (selectedCrop) {
            router.delete(`/crops/${selectedCrop.id}`, {
                onSuccess: () => {
                    setSelectedCrop(null);
                    setShowDeleteModal(false);
                }
            });
        }
    };

    const renderFlashMessage = () => {
        if (flash && flash.message) {
            return (
                <div className={`mb-4 p-4 rounded ${flash.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {flash.message}
                </div>
            );
        }
        return null;
    };
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Crops</h2>}
        >
            <Head title="My Crops" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {renderFlashMessage()}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <div className="text-gray-500 text-sm">Total Crops</div>
                            <div className="text-2xl font-bold">{cropStats.totalCrops}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <div className="text-gray-500 text-sm">Active Crops</div>
                            <div className="text-2xl font-bold">{cropStats.activeCrops}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <div className="text-gray-500 text-sm">Harvested</div>
                            <div className="text-2xl font-bold">{cropStats.harvestedCrops}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <div className="text-gray-500 text-sm">Crop Types</div>
                            <div className="text-2xl font-bold">{cropStats.cropTypes}</div>
                        </div>
                    </div>
                    
                    {cropTypeData.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            <h3 className="text-lg font-medium mb-4">Crop Types Distribution</h3>
                            <div className="space-y-3">
                                {cropTypeData.map((item, index) => {
                                    const maxValue = Math.max(...cropTypeData.map(d => d.value));
                                    const percentage = (item.value / maxValue) * 100;
                                    
                                    return (
                                        <div key={index} className="flex items-center">
                                            <div className="w-24 text-sm truncate">{item.name}</div>
                                            <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                                                <div 
                                                    className="h-6 bg-green-500 rounded-md transition-all duration-500 ease-out"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="w-12 text-right text-sm font-medium ml-2">{item.value}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search crops..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-200"
                                />
                            </div>
                            <div className="w-full sm:w-auto">
                                <select 
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-200"
                                >
                                    {cropTypes.map(type => (
                                        <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full sm:w-auto">
                                <Link 
                                    href="/crops/create" 
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add Crop
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            {crops && crops.length > 0 ? (
                                <div className={`${isGridView ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'} gap-6 p-6`}>
                                    {filteredCrops.map((crop, index) => (
                                        <div 
                                            key={crop.id} 
                                            className="border rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
                                            style={{ transitionDelay: `${index * 0.05}s` }}
                                        >
                                            {/* Image section with fallback for crops without photos */}
                                            {crop.photo_path ? (
                                                <div className="h-40 overflow-hidden">
                                                    <img 
                                                        src={`/storage/${crop.photo_path}`}
                                                        alt={crop.crop_name || crop.name || crop.crop_type}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-40 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-center">
                                                    <div className="text-center p-4">
                                                        <div className="text-green-600 mb-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-lg font-medium text-green-800 truncate">
                                                            {crop.crop_name || crop.name || crop.crop_type || 'New Crop'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="p-4">
                                                {/* Crop Title with Type */}
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-semibold">{crop.crop_name || crop.name || crop.crop_type}</h3>
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                                        {crop.type || crop.crop_type || 'Unknown'}
                                                    </span>
                                                </div>

                                                {/* Add crop status badge */}
                                                <div className="mb-3">
                                                    {(() => {
                                                        const progress = calculateCropProgress(crop);
                                                        if (progress < 25) {
                                                            return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Early Stage</span>;
                                                        } else if (progress < 75) {
                                                            return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Growing</span>;
                                                        } else if (progress < 100) {
                                                            return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">Near Harvest</span>;
                                                        } else {
                                                            return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Ready for Harvest</span>;
                                                        }
                                                    })()}
                                                    
                                                    {/* If there's an icon field, show it */}
                                                    {crop.crop_icon && (
                                                        <span className="ml-2 text-lg">{crop.crop_icon}</span>
                                                    )}
                                                </div>
                                                
                                                {/* Crop Overview - Key Information */}
                                                <div className="space-y-2 mb-4">
                                                    {crop.planting_date && (
                                                        <p className="text-gray-600 flex justify-between">
                                                            <span className="font-medium">Planted:</span> 
                                                            <span>{new Date(crop.planting_date).toLocaleDateString()}</span>
                                                        </p>
                                                    )}
                                                    
                                                    {(crop.harvest_date || crop.expected_harvest_date) && (
                                                        <p className="text-gray-600 flex justify-between">
                                                            <span className="font-medium">Expected harvest:</span>
                                                            <span>{new Date(crop.harvest_date || crop.expected_harvest_date).toLocaleDateString()}</span>
                                                        </p>
                                                    )}
                                                    
                                                    {(crop.field_location || crop.location) && (
                                                        <p className="text-gray-600 flex justify-between">
                                                            <span className="font-medium">Location:</span>
                                                            <span>{crop.field_location || crop.location}</span>
                                                        </p>
                                                    )}
                                                    
                                                    {/* Add variety if available */}
                                                    {crop.variety && (
                                                        <p className="text-gray-600 flex justify-between">
                                                            <span className="font-medium">Variety:</span>
                                                            <span>{crop.variety}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                {/* Growth Progress Bar */}
                                                <div className="mb-4">
                                                    <div className="text-sm text-gray-600 mb-1">Growth progress</div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div 
                                                            className="bg-green-600 h-2.5 rounded-full transition-all duration-1000"
                                                            style={{ width: `${calculateCropProgress(crop)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {calculateCropProgress(crop)}% complete
                                                    </div>
                                                </div>
                                                
                                                {/* Notes Preview (if available) */}
                                                {crop.notes && (
                                                    <div className="mt-2 mb-4">
                                                        <p className="text-sm text-gray-500 font-medium">Notes:</p>
                                                        <p className="text-gray-600 text-sm line-clamp-2">{crop.notes}</p>
                                                    </div>
                                                )}
                                                
                                                {/* View More Button */}
                                                <div className="mt-4 flex justify-end">
                                                    <Link
                                                        href={`/crops/${crop.id}`}
                                                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                                                    >
                                                        <span>View Details</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-lg">You haven't added any crops yet.</p>
                                    <Link 
                                        href="/crops/create" 
                                        className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Add Your First Crop
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default MyCrops;