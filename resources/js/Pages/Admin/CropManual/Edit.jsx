import React, { useState, useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Layouts/AdminLayout';
import { FaTachometerAlt } from 'react-icons/fa';
import RichTextEditor from '../../../Components/RichTextEditor';

export default function Edit({ cropManual, admin }) {
  const [imagePreview, setImagePreview] = useState(cropManual.image_url || null);
  
  const { data, setData, patch, processing, errors } = useForm({
    name: cropManual.name || '',
    scientific_name: cropManual.scientific_name || '',
    description: cropManual.description || '',
    planting_instructions: cropManual.planting_instructions || '',
    growing_conditions: cropManual.growing_conditions || '',
    pest_management: cropManual.pest_management || '',
    harvesting_info: cropManual.harvesting_info || '',
    nutritional_value: cropManual.nutritional_value || '',
    image: null,
    icon: cropManual.icon || '',
    growing_season: cropManual.growing_season || '',
    water_needs: cropManual.water_needs || '',
    soil_type: cropManual.soil_type || '',
    time_to_harvest: cropManual.time_to_harvest || '',
    growing_steps: cropManual.growing_steps || '',
    dos: cropManual.dos || '',
    donts: cropManual.donts || '',
    is_published: cropManual.is_published || false,
    allow_comments: cropManual.allow_comments || true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    patch(route('admin.crop-manual.update', cropManual.id));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setData('image', file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AdminLayout title={`Edit Crop Manual: ${cropManual.name}`} admin={admin}>
      <div className="mb-6 flex space-x-4">
        <Link
          href={route('admin.crop-manual.index')}
          className="text-green-600 hover:text-green-700"
        >
          &larr; Back to Crop Manuals
        </Link>
        
        <Link
          href={route('admin.dashboard')}
          className="flex items-center text-green-700 hover:text-green-900"
        >
          <FaTachometerAlt className="mr-2" /> Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Same form fields as in Create.jsx, but pre-populated with cropManual data */}
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h2>
            </div>
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Crop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.name ? 'border-red-500' : ''}`}
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            {/* Scientific Name */}
            <div>
              <label htmlFor="scientific_name" className="block text-sm font-medium text-gray-700">
                Scientific Name
              </label>
              <input
                type="text"
                id="scientific_name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={data.scientific_name}
                onChange={(e) => setData('scientific_name', e.target.value)}
              />
            </div>
            
            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                id="description"
                value={data.description}
                onChange={(content) => setData('description', content)}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Growing Information */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Growing Information</h2>
            </div>
            
            {/* Growing Season */}
            <div>
              <label htmlFor="growing_season" className="block text-sm font-medium text-gray-700">
                Growing Season
              </label>
              <input
                type="text"
                id="growing_season"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={data.growing_season}
                onChange={(e) => setData('growing_season', e.target.value)}
                placeholder="e.g. Spring, Summer"
              />
            </div>
            
            {/* Water Needs */}
            <div>
              <label htmlFor="water_needs" className="block text-sm font-medium text-gray-700">
                Water Needs
              </label>
              <input
                type="text"
                id="water_needs"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={data.water_needs}
                onChange={(e) => setData('water_needs', e.target.value)}
                placeholder="e.g. Low, Medium, High"
              />
            </div>
            
            {/* Soil Type */}
            <div>
              <label htmlFor="soil_type" className="block text-sm font-medium text-gray-700">
                Soil Type
              </label>
              <input
                type="text"
                id="soil_type"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={data.soil_type}
                onChange={(e) => setData('soil_type', e.target.value)}
                placeholder="e.g. Sandy, Loamy, Clay"
              />
            </div>
            
            {/* Time to Harvest */}
            <div>
              <label htmlFor="time_to_harvest" className="block text-sm font-medium text-gray-700">
                Time to Harvest
              </label>
              <input
                type="text"
                id="time_to_harvest"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={data.time_to_harvest}
                onChange={(e) => setData('time_to_harvest', e.target.value)}
                placeholder="e.g. 60-90 days"
              />
            </div>
            
            {/* Growing Steps */}
            <div className="md:col-span-2">
              <label htmlFor="growing_steps" className="block text-sm font-medium text-gray-700">
                Growing Steps
              </label>
              <RichTextEditor
                id="growing_steps"
                value={data.growing_steps}
                onChange={(content) => setData('growing_steps', content)}
              />
            </div>
            
            {/* Planting Instructions */}
            <div className="md:col-span-2">
              <label htmlFor="planting_instructions" className="block text-sm font-medium text-gray-700">
                Planting Instructions
              </label>
              <RichTextEditor
                id="planting_instructions"
                value={data.planting_instructions}
                onChange={(content) => setData('planting_instructions', content)}
              />
            </div>
            
            {/* Growing Conditions */}
            <div className="md:col-span-2">
              <label htmlFor="growing_conditions" className="block text-sm font-medium text-gray-700">
                Growing Conditions
              </label>
              <RichTextEditor
                id="growing_conditions"
                value={data.growing_conditions}
                onChange={(content) => setData('growing_conditions', content)}
              />
            </div>

            {/* Pest Management */}
            <div className="md:col-span-2">
              <label htmlFor="pest_management" className="block text-sm font-medium text-gray-700">
                Pest Management
              </label>
              <RichTextEditor
                id="pest_management"
                value={data.pest_management}
                onChange={(content) => setData('pest_management', content)}
              />
            </div>

            {/* Harvesting Info */}
            <div className="md:col-span-2">
              <label htmlFor="harvesting_info" className="block text-sm font-medium text-gray-700">
                Harvesting Information
              </label>
              <RichTextEditor
                id="harvesting_info"
                value={data.harvesting_info}
                onChange={(content) => setData('harvesting_info', content)}
              />
            </div>

            {/* Nutritional Value */}
            <div className="md:col-span-2">
              <label htmlFor="nutritional_value" className="block text-sm font-medium text-gray-700">
                Nutritional Value
              </label>
              <RichTextEditor
                id="nutritional_value"
                value={data.nutritional_value}
                onChange={(content) => setData('nutritional_value', content)}
              />
            </div>

            {/* Dos and Don'ts */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Best Practices</h2>
            </div>
            
            {/* Dos */}
            <div>
              <label htmlFor="dos" className="block text-sm font-medium text-gray-700">
                Dos (Best Practices)
              </label>
              <RichTextEditor
                id="dos"
                value={data.dos}
                onChange={(content) => setData('dos', content)}
              />
            </div>
            
            {/* Don'ts */}
            <div>
              <label htmlFor="donts" className="block text-sm font-medium text-gray-700">
                Don'ts (Things to Avoid)
              </label>
              <RichTextEditor
                id="donts"
                value={data.donts}
                onChange={(content) => setData('donts', content)}
              />
            </div>

            {/* Media */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Media</h2>
            </div>
            
            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Crop Image
              </label>
              <div className="mt-1 flex items-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setData('image', null);
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-gray-500 text-sm">Upload Image</span>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="mt-1 text-sm text-red-500">{errors.image}</p>
              )}
            </div>
            
            {/* Icon */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
                Icon (CSS class or URL)
              </label>
              <input
                type="text"
                id="icon"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={data.icon}
                onChange={(e) => setData('icon', e.target.value)}
                placeholder="e.g. fa-leaf or URL to icon"
              />
            </div>

            {/* Publishing Options */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Publishing Options</h2>
            </div>
            
            {/* Publication Status */}
            <div>
              <div className="flex items-center">
                <input
                  id="is_published"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={data.is_published}
                  onChange={(e) => setData('is_published', e.target.checked)}
                />
                <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>
            </div>
            
            {/* Allow Comments */}
            <div>
              <div className="flex items-center">
                <input
                  id="allow_comments"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={data.allow_comments}
                  onChange={(e) => setData('allow_comments', e.target.checked)}
                />
                <label htmlFor="allow_comments" className="ml-2 block text-sm text-gray-700">
                  Allow comments
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-3"
              onClick={() => window.history.back()}
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={processing}
            >
              {processing ? 'Saving...' : 'Update Crop Manual'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}