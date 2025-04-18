import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

const CreateCrop = ({ auth }) => {
    const [photoPreview, setPhotoPreview] = useState(null);
    
    // Initialize form data
    const { data, setData, post, processing, errors } = useForm({
        crop_name: '',
        crop_type: '',
        variety: '',
        planting_date: '',
        location: '',
        soil_type: '',
        soil_ph: '',
        soil_moisture: '',
        seed_source: '',
        seed_treatment: '',
        weather_conditions: '',
        irrigation_method: '',
        irrigation_frequency: '',
        fertilizer_details: '',
        pesticide_details: '',
        initial_plant_count: '',
        growth_goals: '',
        equipment_used: '',
        notes: '',
        photo: null
    });

    const handlePhotoChange = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setData('photo', file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting form data:', data);
        
        // Replace direct URL with route helper
        post(route('crops.store'), {
            onSuccess: () => {
                console.log('Form submitted successfully');
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            }
        });
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
                        <Link href="/disease-detection" className="hover:underline">Disease Detection</Link>
                        <Link href="/weather" className="hover:underline">Weather</Link>
                        <Link href="/blog" className="hover:underline">Blog</Link>
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
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-green-700 mb-6">Add New Crop</h1>
                    
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Crop Information */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-green-600">Basic Information</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                                    <input
                                        type="text"
                                        value={data.crop_name}
                                        onChange={e => setData('crop_name', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                    {errors.crop_name && <p className="text-red-500 text-xs mt-1">{errors.crop_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Crop Type</label>
                                    <select
                                        value={data.crop_type}
                                        onChange={e => setData('crop_type', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        required
                                    >
                                        <option value="">Select Crop Type</option>
                                        <option value="vegetable">Vegetable</option>
                                        <option value="fruit">Fruit</option>
                                        <option value="grain">Grain</option>
                                        <option value="legume">Legume</option>
                                        <option value="root">Root Crop</option>
                                        <option value="herb">Herb</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.crop_type && <p className="text-red-500 text-xs mt-1">{errors.crop_type}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Variety</label>
                                    <input
                                        type="text"
                                        value={data.variety}
                                        onChange={e => setData('variety', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Planting Date</label>
                                    <input
                                        type="date"
                                        value={data.planting_date}
                                        onChange={e => setData('planting_date', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={e => setData('location', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="Farm name or location"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Initial Plant Count</label>
                                    <input
                                        type="number"
                                        value={data.initial_plant_count}
                                        onChange={e => setData('initial_plant_count', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        min="1"
                                    />
                                </div>
                            </div>

                            {/* Soil and Weather Conditions */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-green-600">Growing Conditions</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Soil Type</label>
                                    <select
                                        value={data.soil_type}
                                        onChange={e => setData('soil_type', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">Select Soil Type</option>
                                        <option value="clay">Clay</option>
                                        <option value="sandy">Sandy</option>
                                        <option value="silty">Silty</option>
                                        <option value="peaty">Peaty</option>
                                        <option value="chalky">Chalky</option>
                                        <option value="loamy">Loamy</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Soil pH</label>
                                    <input
                                        type="number"
                                        value={data.soil_ph}
                                        onChange={e => setData('soil_ph', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        step="0.1"
                                        min="0"
                                        max="14"
                                        placeholder="e.g. 6.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Soil Moisture</label>
                                    <input
                                        type="text"
                                        value={data.soil_moisture}
                                        onChange={e => setData('soil_moisture', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="e.g. Moderately moist"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Weather Conditions</label>
                                    <input
                                        type="text"
                                        value={data.weather_conditions}
                                        onChange={e => setData('weather_conditions', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="Recent weather patterns"
                                    />
                                </div>
                            </div>

                            {/* Seed/Planting Material */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-green-600">Planting Material</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Seed Source</label>
                                    <input
                                        type="text"
                                        value={data.seed_source}
                                        onChange={e => setData('seed_source', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="Where seeds/seedlings were acquired"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Seed Treatment</label>
                                    <input
                                        type="text"
                                        value={data.seed_treatment}
                                        onChange={e => setData('seed_treatment', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="Any pre-planting treatments"
                                    />
                                </div>
                            </div>

                            {/* Management Practices */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-green-600">Management Plan</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Irrigation Method</label>
                                    <select
                                        value={data.irrigation_method}
                                        onChange={e => setData('irrigation_method', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">Select Irrigation Method</option>
                                        <option value="drip">Drip Irrigation</option>
                                        <option value="sprinkler">Sprinkler</option>
                                        <option value="flood">Flood Irrigation</option>
                                        <option value="manual">Manual Watering</option>
                                        <option value="none">Rainfed (No Irrigation)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Irrigation Frequency</label>
                                    <input
                                        type="text"
                                        value={data.irrigation_frequency}
                                        onChange={e => setData('irrigation_frequency', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="e.g. Daily, Twice a week, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fertilizer Details</label>
                                    <textarea
                                        value={data.fertilizer_details}
                                        onChange={e => setData('fertilizer_details', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        rows="2"
                                        placeholder="Types, amounts, frequency, etc."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pesticide Details</label>
                                    <textarea
                                        value={data.pesticide_details}
                                        onChange={e => setData('pesticide_details', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        rows="2"
                                        placeholder="Types, schedule, etc."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-green-600">Additional Details</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Growth Goals / Benchmarks</label>
                                    <textarea
                                        value={data.growth_goals}
                                        onChange={e => setData('growth_goals', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        rows="2"
                                        placeholder="Expected yield, timeline, etc."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Equipment Used</label>
                                    <input
                                        type="text"
                                        value={data.equipment_used}
                                        onChange={e => setData('equipment_used', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="Tools and machinery used"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        rows="3"
                                        placeholder="Additional notes about this crop"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-green-600">Visual Records</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Upload Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="mt-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-green-50 file:text-green-700
                                        hover:file:bg-green-100"
                                    />
                                    {photoPreview && (
                                        <div className="mt-2">
                                            <img src={photoPreview} alt="Preview" className="h-32 w-auto object-cover rounded-md" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 flex justify-end">
                            <Link
                                href="/my-crops"
                                className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Crop'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-green-800 text-white mt-16">
                <div className="container mx-auto px-6 py-8">
                    <div className="text-center">
                        <p className="mb-4">
                            © {new Date().getFullYear()} SmaFarm. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CreateCrop;
