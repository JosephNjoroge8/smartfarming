import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import DownloadPdfButton from '@/Components/DownloadPdfButton';

const CropManualDetail = ({ auth = { user: null }, params }) => {
    const [crop, setCrop] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('description');
    const contentRef = useRef(null);
    
    // Comment form handling
    const { data, setData, post, processing, reset, errors } = useForm({
        content: '',
    });
    
    // Choose the appropriate layout based on authentication
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

    useEffect(() => {
        const fetchCropDetails = async () => {
            try {
                console.log(`Fetching crop manual with ID: ${params.id}`);
                const response = await axios.get(`/api/crop-manuals/${params.id}`);
                
                if (response.status === 200 && response.data) {
                    console.log('Crop data received successfully');
                    setCrop(response.data);
                    
                    // Also fetch comments if they exist
                    if (response.data.allow_comments) {
                        fetchComments(params.id);
                    }
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error) {
                console.error('Error fetching crop details:', error);
                setError(`Failed to load crop manual: ${error.message || 'Unknown error'}`);
            } finally {
                setLoading(false);
            }
        };
        
        const fetchComments = async (cropId) => {
            try {
                const commentsResponse = await axios.get(`/api/crop-manuals/${cropId}/comments`);
                if (commentsResponse.status === 200) {
                    setComments(commentsResponse.data || []);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
                // We don't set the main error state here to avoid preventing the crop manual display
            }
        };

        if (params?.id) {
            fetchCropDetails();
        } else {
            setError('Missing crop ID parameter');
            setLoading(false);
        }
    }, [params?.id]);
    
    const submitComment = (e) => {
        e.preventDefault();
        
        post(`/api/crop-manuals/${params.id}/comments`, {
            preserveScroll: true,
            onSuccess: (response) => {
                // Add new comment to the list
                setComments([response.comment, ...comments]);
                reset('content');
            },
        });
    };
    
    // Function to scroll to a specific section
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setActiveSection(sectionId);
    };

    if (loading) {
        return (
            <Layout user={auth?.user}>
                <Head title="Loading Crop Details" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading crop information...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !crop) {
        return (
            <Layout user={auth?.user}>
                <Head title="Error | Crop Manual" />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        <h3 className="font-bold">Error Loading Crop Manual</h3>
                        <p>{error || "Crop not found"}</p>
                    </div>
                    <Link 
                        href="/crop-manuals"
                        className="text-green-600 hover:underline"
                    >
                        &larr; Back to Crop Manuals
                    </Link>
                </div>
            </Layout>
        );
    }

    // Helper function to get image URL with fallback
    const getImageUrl = () => {
        if (crop.image_url) return crop.image_url;
        
        // If image_path exists but not image_url
        if (crop.image_path) {
            return `/storage/${crop.image_path}`;
        }
        
        return "https://placehold.co/1200x600?text=No+Image";
    };
    
    // Build an array of available sections for navigation
    const availableSections = [
        { id: 'description', name: 'Description', available: !!crop.description },
        { id: 'planting', name: 'Planting Instructions', available: !!crop.planting_instructions },
        { id: 'growing', name: 'Growing Conditions', available: !!crop.growing_conditions },
        { id: 'pests', name: 'Pest Management', available: !!crop.pest_management },
        { id: 'harvesting', name: 'Harvesting', available: !!crop.harvesting_info },
        { id: 'nutrition', name: 'Nutrition', available: !!crop.nutritional_value },
        { id: 'steps', name: 'Growing Steps', available: !!crop.growing_steps },
        { id: 'practices', name: 'Best Practices', available: !!(crop.dos || crop.donts) },
        { id: 'comments', name: 'Comments', available: !!crop.allow_comments }
    ].filter(section => section.available);

    return (
        <Layout user={auth?.user}>
            <Head title={`${crop.name} | Crop Manual`} />
            
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <Link 
                        href="/crop-manuals" 
                        className="text-green-600 hover:underline flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Back to Crop Manuals
                    </Link>
                    
                    {/* Show edit button only for admin users */}
                    {auth?.user?.is_admin && (
                        <div className="flex space-x-3">
                            <Link
                                href={`/crop-manuals/${crop.id}/edit`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                            >
                                Edit Manual
                            </Link>
                        </div>
                    )}
                </div>
                
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">{crop.name}</h1>
                    <DownloadPdfButton 
                        contentRef={contentRef}
                        fileName={`crop-manual-${crop.name.toLowerCase().replace(/\s+/g, '-')}`}
                        documentTitle={`${crop.name} Growing Guide`}
                    />
                </div>
                
                {/* Content that will be captured in PDF */}
                <div ref={contentRef} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Table of Contents - Sidebar */}
                        <aside className="md:w-64">
                            <div className="bg-white p-4 rounded-lg shadow-md sticky top-20">
                                <h2 className="font-bold text-lg mb-4 text-gray-700 pb-2 border-b">Contents</h2>
                                <nav>
                                    <ul className="space-y-2">
                                        {availableSections.map((section) => (
                                            <li key={section.id}>
                                                <button
                                                    onClick={() => scrollToSection(section.id)}
                                                    className={`w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${
                                                        activeSection === section.id ? 'font-semibold text-green-700 bg-green-50' : 'text-gray-600'
                                                    }`}
                                                >
                                                    {section.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </aside>
                        
                        {/* Main Content */}
                        <div className="flex-1">
                            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="relative h-80 md:h-96">
                                    <img 
                                        src={getImageUrl()} 
                                        alt={crop.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/1200x600?text=No+Image";
                                        }}
                                    />
                                </div>
                                
                                <div className="p-6 md:p-8">
                                    {/* Header Section */}
                                    <div className="border-b pb-6 mb-6">
                                        <h1 className="text-3xl md:text-4xl font-bold mb-3">{crop.name}</h1>
                                        
                                        {crop.scientific_name && (
                                            <p className="text-lg italic text-gray-600 mb-4">{crop.scientific_name}</p>
                                        )}
                                        
                                        <div className="flex flex-wrap gap-3 mb-4">
                                            {crop.growing_season && (
                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                                    Season: {crop.growing_season}
                                                </span>
                                            )}
                                            
                                            {crop.water_needs && (
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                    Water: {crop.water_needs}
                                                </span>
                                            )}
                                            
                                            {crop.soil_type && (
                                                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                                                    Soil: {crop.soil_type}
                                                </span>
                                            )}
                                            
                                            {crop.time_to_harvest && (
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                                    Harvest: {crop.time_to_harvest}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="text-gray-500 text-sm">
                                            Last updated: {new Date(crop.updated_at).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    {/* Description Section */}
                                    {crop.description && (
                                        <div id="description" className="mb-8 scroll-mt-20">
                                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: crop.description }} />
                                        </div>
                                    )}
                                    
                                    {/* Planting Instructions */}
                                    {crop.planting_instructions && (
                                        <div id="planting" className="mb-8 p-6 bg-green-50 rounded-lg border border-green-100 scroll-mt-20">
                                            <h2 className="text-2xl font-bold mb-4">Planting Instructions</h2>
                                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: crop.planting_instructions }} />
                                        </div>
                                    )}
                                    
                                    {/* Growing Conditions */}
                                    {crop.growing_conditions && (
                                        <div id="growing" className="mb-8 scroll-mt-20">
                                            <h2 className="text-2xl font-bold mb-4">Growing Conditions</h2>
                                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: crop.growing_conditions }} />
                                        </div>
                                    )}
                                    
                                    {/* Pest Management */}
                                    {crop.pest_management && (
                                        <div id="pests" className="mb-8 p-6 bg-amber-50 rounded-lg border border-amber-100 scroll-mt-20">
                                            <h2 className="text-2xl font-bold mb-4">Pest Management</h2>
                                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: crop.pest_management }} />
                                        </div>
                                    )}
                                    
                                    {/* Harvesting Information */}
                                    {crop.harvesting_info && (
                                        <div id="harvesting" className="mb-8 scroll-mt-20">
                                            <h2 className="text-2xl font-bold mb-4">Harvesting Information</h2>
                                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: crop.harvesting_info }} />
                                        </div>
                                    )}
                                    
                                    {/* Nutritional Value */}
                                    {crop.nutritional_value && (
                                        <div id="nutrition" className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100 scroll-mt-20">
                                            <h2 className="text-2xl font-bold mb-4">Nutritional Value</h2>
                                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: crop.nutritional_value }} />
                                        </div>
                                    )}
                                    
                                    {/* Growing Steps */}
                                    {crop.growing_steps && (
                                        <div id="steps" className="mb-8 scroll-mt-20">
                                            <h2 className="text-2xl font-bold mb-4">Growing Steps</h2>
                                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: crop.growing_steps }} />
                                        </div>
                                    )}
                                    
                                    {/* Best Practices */}
                                    {(crop.dos || crop.donts) && (
                                        <div id="practices" className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 scroll-mt-20">
                                            {crop.dos && (
                                                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                                                    <h2 className="text-xl font-bold mb-3">Best Practices (Dos)</h2>
                                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: crop.dos }} />
                                                </div>
                                            )}
                                            
                                            {crop.donts && (
                                                <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                                                    <h2 className="text-xl font-bold mb-3">Things to Avoid (Don'ts)</h2>
                                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: crop.donts }} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Comments Section */}
                                    {crop.allow_comments && (
                                        <div id="comments" className="mt-12 pt-8 border-t scroll-mt-20">
                                            <h2 className="text-2xl font-bold mb-6">Comments & Questions</h2>
                                            
                                            {/* Comment Form for authenticated users */}
                                            {auth?.user ? (
                                                <form onSubmit={submitComment} className="mb-8">
                                                    <div className="mb-4">
                                                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                                                            Share your experience or ask a question
                                                        </label>
                                                        <textarea
                                                            id="comment"
                                                            rows="4"
                                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
                                                            placeholder="Write your comment here..."
                                                            value={data.content}
                                                            onChange={e => setData('content', e.target.value)}
                                                        ></textarea>
                                                        {errors.content && (
                                                            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="submit"
                                                            disabled={processing}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                                                        >
                                                            {processing ? 'Posting...' : 'Post Comment'}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="bg-gray-50 p-4 rounded-md mb-8 text-center">
                                                    <p className="text-gray-600">
                                                        <Link href="/login" className="text-green-600 font-medium hover:underline">Log in</Link> or{' '}
                                                        <Link href="/register" className="text-green-600 font-medium hover:underline">create an account</Link> to post comments.
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Comments List */}
                                            <div className="space-y-6">
                                                {comments.length > 0 ? (
                                                    comments.map(comment => (
                                                        <div key={comment.id} className="bg-white border rounded-lg p-4 shadow-sm">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                                                                        {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                                    </div>
                                                                    <span className="ml-2 font-medium text-gray-800">
                                                                        {comment.user?.name || 'Anonymous'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700">{comment.content}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <p>No comments yet. Be the first to share your thoughts!</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CropManualDetail;