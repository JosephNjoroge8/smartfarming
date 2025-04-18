import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, crop }) {
    const { data, setData, errors, post, processing } = useForm({
        crop_name: crop.crop_name || '',
        crop_type: crop.crop_type || '',
        variety: crop.variety || '',
        planting_date: crop.planting_date || '',
        location: crop.location || '',
        soil_type: crop.soil_type || '',
        soil_ph: crop.soil_ph || '',
        soil_moisture: crop.soil_moisture || '',
        seed_source: crop.seed_source || '',
        seed_treatment: crop.seed_treatment || '',
        weather_conditions: crop.weather_conditions || '',
        irrigation_method: crop.irrigation_method || '',
        irrigation_frequency: crop.irrigation_frequency || '',
        fertilizer_details: crop.fertilizer_details || '',
        pesticide_details: crop.pesticide_details || '',
        initial_plant_count: crop.initial_plant_count || '',
        growth_goals: crop.growth_goals || '',
        equipment_used: crop.equipment_used || '',
        notes: crop.notes || '',
        photo: null,
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(`/crops/${crop.id}?_method=PUT`, {
            forceFormData: true
        });
    }

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
            <main className="max-w-4xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link href="/my-crops" className="text-green-600 hover:underline">
                        &larr; Back to My Crops
                    </Link>
                </div>
                
                <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
                    <h1 className="text-2xl font-bold text-green-700 mb-6">Edit Crop: {crop.crop_name}</h1>
                    
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        {/* Form fields go here - create input fields for each property */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="crop_name">
                                Crop Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="crop_name"
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                value={data.crop_name}
                                onChange={e => setData('crop_name', e.target.value)}
                                required
                            />
                            {errors.crop_name && <div className="text-red-500 text-sm">{errors.crop_name}</div>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="crop_type">
                                Crop Type <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="crop_type"
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                value={data.crop_type}
                                onChange={e => setData('crop_type', e.target.value)}
                                required
                            />
                            {errors.crop_type && <div className="text-red-500 text-sm">{errors.crop_type}</div>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="variety">
                                Variety
                            </label>
                            <input
                                id="variety"
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                value={data.variety}
                                onChange={e => setData('variety', e.target.value)}
                            />
                            {errors.variety && <div className="text-red-500 text-sm">{errors.variety}</div>}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="planting_date">
                                Planting Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="planting_date"
                                type="date"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                value={data.planting_date}
                                onChange={e => setData('planting_date', e.target.value)}
                                required
                            />
                            {errors.planting_date && <div className="text-red-500 text-sm">{errors.planting_date}</div>}
                        </div>

                        {/* CRITICAL - ADD THIS LOCATION FIELD */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="location">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="location"
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                value={data.location}
                                onChange={e => setData('location', e.target.value)}
                                required
                                placeholder="e.g. Maseno"
                            />
                            {errors.location && <div className="text-red-500 text-sm">{errors.location}</div>}
                            <p className="text-xs text-gray-500 mt-1">
                                Enter the location name only. The system will automatically handle formatting.
                            </p>
                        </div>

                        {/* Add other form fields for each property */}
                        
                        <div className="flex justify-end mt-6 space-x-3">
                            <Link
                                href={`/crops/${crop.id}`}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                disabled={processing}
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}