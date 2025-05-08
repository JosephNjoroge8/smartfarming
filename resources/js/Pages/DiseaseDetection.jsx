import React, { useState, useRef } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import DownloadPdfButton from '@/Components/DownloadPdfButton';

const DiseaseDetection = ({ auth }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [previousScans, setPreviousScans] = useState([]);
    const fileInputRef = useRef(null);
    const resultContentRef = useRef(null);

    // Handle file selection
    const handleFileSelect = (file) => {
        if (!file) return;
        
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (JPEG, PNG)');
            return;
        }

        // Check file size (< 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
    };

    // Handle file input change
    const handleInputChange = (e) => {
        handleFileSelect(e.target.files[0]);
    };

    // Handle drag events
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dragging) setDragging(true);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    // Handle the analyze button click
    const handleAnalyze = async () => {
        if (!selectedImage) {
            setError('Please select an image to analyze');
            return;
        }

        setLoading(true);
        setResults(null);
        setError(null);

        // Create form data for file upload
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            // Send the image to your backend API
            const response = await axios.post('/api/disease-detection/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Set results
            setResults(response.data);
            
            // Add to previous scans
            setPreviousScans(prevScans => [
                {
                    id: Date.now(),
                    imageUrl: previewUrl,
                    disease: response.data.disease,
                    confidence: response.data.confidence,
                    date: new Date().toISOString()
                },
                ...prevScans.slice(0, 4) // Keep only the 5 most recent scans
            ]);
        } catch (err) {
            console.error("Error analyzing image:", err);
            setError('Error analyzing image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Clear the current selection
    const handleClear = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setResults(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header/Navigation */}
            <nav className="bg-green-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
                <div className="text-2xl font-bold"> 🌱 SmaFarm</div>
                <div className="flex items-center space-x-6">
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                        <Link href="/my-crops" className="hover:underline">My Crops</Link>
                        <Link href="/crop-manual" className="hover:underline">Crop Manual</Link>
                        <Link href="/disease-detection" className="hover:underline font-bold">Disease Detection</Link>
                        <Link href="/weather" className="hover:underline">Weather</Link>
                      {/*   <Link href="/blog" className="hover:underline">Blog</Link> */}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm">Welcome, {auth.user.name}</div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="px-3 py-1 bg-white text-green-600 font-semibold rounded-md shadow-sm hover:bg-gray-200"
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-green-800 mb-6">Plant Disease Detection</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Upload Section */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            <h2 className="text-xl font-semibold text-green-700 mb-4">Upload Plant Image</h2>
                            
                            {/* Drag and drop area */}
                            <div 
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${dragging ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleInputChange}
                                />
                                
                                {previewUrl ? (
                                    <div className="relative">
                                        <img 
                                            src={previewUrl} 
                                            alt="Preview" 
                                            className="max-w-full max-h-64 mx-auto rounded-lg"
                                        />
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClear();
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                            title="Remove image"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Drag and drop an image here, or click to select a file
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            JPG, PNG, GIF up to 5MB
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {error && (
                                <div className="text-red-500 text-sm mt-2">
                                    {error}
                                </div>
                            )}

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!selectedImage || loading}
                                    className={`px-4 py-2 rounded-md ${!selectedImage || loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing...
                                        </span>
                                    ) : "Analyze Image"}
                                </button>
                            </div>
                        </div>

                        {/* Results Section */}
                        {results && (
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold">Detection Results</h2>
                                    <DownloadPdfButton 
                                        contentRef={resultContentRef}
                                        fileName={`plant-disease-report-${new Date().toISOString().split('T')[0]}`}
                                        documentTitle="Plant Disease Detection Report"
                                    />
                                </div>
                                
                                <div ref={resultContentRef} className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="md:w-1/3">
                                            <img 
                                                src={previewUrl} 
                                                alt="Analyzed plant" 
                                                className="w-full rounded-lg"
                                            />
                                        </div>
                                        <div className="md:w-2/3">
                                            <h3 className="text-xl font-semibold mb-2">
                                                {results.disease || 'Unknown Disease'}
                                            </h3>
                                            <div className="mb-4">
                                                <p className="font-bold">Confidence:</p>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div 
                                                        className="bg-green-600 h-2.5 rounded-full" 
                                                        style={{ width: `${results.confidence}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-right text-sm">
                                                    {results.confidence}%
                                                </p>
                                            </div>
                                            <div className="prose max-w-none">
                                                <h4>Description:</h4>
                                                <p>{results.description || 'No description available.'}</p>
                                                
                                                <h4 className="mt-4">Treatment:</h4>
                                                <p>{results.recommendations?.join(', ') || 'No treatment information available.'}</p>
                                                
                                                <h4 className="mt-4">Prevention:</h4>
                                                <p>{results.preventiveMeasures?.join(', ') || 'No prevention information available.'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 text-sm text-gray-500">
                                        Report generated on {new Date().toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Info Box */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-green-700 mb-4">How it Works</h2>
                            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                                <li>Upload a clear image of the affected plant part (leaf, stem, or fruit)</li>
                                <li>Our AI model analyzes the image to identify diseases</li>
                                <li>View the results with treatment recommendations</li>
                                <li>Take action to protect your crops</li>
                            </ol>
                            <p className="mt-4 text-sm text-gray-600">
                                For best results, ensure the image is well-lit and focused on the affected area.
                            </p>
                        </div>
                        
                        {/* Previous Scans */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-green-700 mb-4">Previous Scans</h2>
                            {previousScans.length > 0 ? (
                                <div className="space-y-4">
                                    {previousScans.map(scan => (
                                        <div key={scan.id} className="flex items-center p-2 border border-gray-200 rounded-md">
                                            <img 
                                                src={scan.imageUrl} 
                                                alt="Scan" 
                                                className="h-16 w-16 object-cover rounded-md mr-3"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{scan.disease}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(scan.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No previous scans</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-green-800 text-white mt-16">
                <div className="container mx-auto px-6 py-8">
                    <div className="text-center">
                        <p className="mb-4">
                            © {new Date().getFullYear()} SmFarm. All rights reserved.
                        </p>
                        <div className="flex justify-center space-x-6">
                            <Link href="/about" className="hover:text-green-200">
                                About Us
                            </Link>
                            <Link href="/contact" className="hover:text-green-200">
                                Contact
                            </Link>
                            <Link href="/terms" className="hover:text-green-200">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DiseaseDetection;
