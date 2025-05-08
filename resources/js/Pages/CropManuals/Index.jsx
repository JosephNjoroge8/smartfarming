import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
// Check if AppLayout exists, if not use GuestLayout instead
import GuestLayout from '@/Layouts/GuestLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

// Use parameter default value instead of defaultProps
const CropManual = ({ auth = { user: null } }) => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Choose the appropriate layout based on authentication
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                // First try the API endpoint
                const response = await axios.get('/api/crop-manuals')
                    .catch(() => {
                        // Fallback to demo data if API fails
                        return { 
                            data: [
                                {
                                    id: 1,
                                    name: "Tomatoes",
                                    description: "Guide for growing healthy tomatoes in various conditions",
                                    image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                },
                                {
                                    id: 2,
                                    name: "Maize",
                                    description: "Complete guide for maize cultivation in East Africa",
                                    image_url: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                },
                                {
                                    id: 3,
                                    name: "Beans",
                                    description: "Best practices for growing beans with high yield",
                                    image_url: "https://images.unsplash.com/photo-1604409855095-3654c3be7a7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                }
                            ]
                        };
                    });
                
                setCrops(response.data);
            } catch (error) {
                console.error('Error fetching crops:', error);
                setError('Failed to load crop manuals');
            } finally {
                setLoading(false);
            }
        };

        fetchCrops();
    }, []);

    const LoadingState = () => (
        <Layout user={auth?.user}>
            <Head title="Crop Manuals - Loading" />
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading crop manuals...</p>
                </div>
            </div>
        </Layout>
    );

    const ErrorState = () => (
        <Layout user={auth?.user}>
            <Head title="Crop Manuals - Error" />
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-2 text-sm underline hover:no-underline"
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
                <h1 className="text-3xl font-bold mb-8">Crop Manuals</h1>
                
                {crops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {crops.map(crop => (
                            <div 
                                key={crop.id} 
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {crop.image_url && (
                                    <img 
                                        src={crop.image_url} 
                                        alt={crop.name} 
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-2">{crop.name}</h2>
                                    <p className="text-gray-600 text-sm mb-4">{crop.description}</p>
                                    <Link 
                                        href={`/crop-manuals/${crop.id}`}
                                        className="text-green-600 hover:text-green-700 font-medium"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        No crop manuals available.
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CropManual;