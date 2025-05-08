import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

const CropManual = ({ auth = { user: null } }) => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Choose the appropriate layout based on authentication
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                // Fetch crop manuals from the database via API
                const response = await axios.get('/api/crop-manuals');
                
                if (response.status === 200 && response.data) {
                    setCrops(response.data);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error) {
                console.error('Error fetching crops:', error);
                setError('Failed to load crop manuals from the database');
            } finally {
                setLoading(false);
            }
        };

        fetchCrops();
    }, []);

    // Loading state component
    const LoadingState = () => (
        <Layout user={auth?.user}>
            <Head title="Crop Manuals - Loading" />
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading crop manuals from database...</p>
                </div>
            </div>
        </Layout>
    );

    // Error state component
    const ErrorState = () => (
        <Layout user={auth?.user}>
            <Head title="Crop Manuals - Error" />
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                        <h3 className="font-bold mb-2">Error</h3>
                        <p>{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );

    if (loading) return <LoadingState />;
    if (error) return <ErrorState />;

    return (
        <Layout user={auth?.user}>
            <Head title="Crop Manuals" />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Crop Manuals</h1>
                    {auth?.user && (
                        <Link
                            href="/crop-manuals/create"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                        >
                            Add New Crop Manual
                        </Link>
                    )}
                </div> 
                
                {crops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {crops.map(crop => (
                            <div 
                                key={crop.id} 
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {crop.image_url ? (
                                    <img 
                                        src={crop.image_url} 
                                        alt={crop.name} 
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/600x400?text=No+Image";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">No image available</span>
                                    </div>
                                )}
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-2">{crop.name}</h2>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {crop.description || 'No description available'}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <Link 
                                            href={`/crop-manuals/${crop.id}`}
                                            className="text-green-600 hover:text-green-700 font-medium flex items-center"
                                        >
                                            View Details 
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                        
                                        {auth?.user && (
                                            <Link
                                                href={`/crop-manuals/${crop.id}/edit`}
                                                className="text-blue-600 hover:text-blue-700 text-sm"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No crop manuals available in the database.</p>
                        {auth?.user && (
                            <Link 
                                href="/crop-manuals/create"
                                className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            >
                                Create your first crop manual
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CropManual;