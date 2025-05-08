import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AdminLayout from '../Layouts/AdminLayout';
import { FaTachometerAlt, FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaComments, FaChartBar } from 'react-icons/fa';

export default function Show({ cropManual, admin, stats = {} }) {
  const [showAdminControls, setShowAdminControls] = useState(true);
  
  // Form for quick updates
  const { data, setData, post, processing } = useForm({
    is_published: cropManual.is_published,
    allow_comments: cropManual.allow_comments
  });

  // Handle quick publish toggle
  const togglePublishStatus = () => {
    post(route('admin.crop-manual.toggle-publish', cropManual.id), {
      preserveScroll: true,
      onSuccess: () => {
        setData('is_published', !data.is_published);
      }
    });
  };

  // Handle quick comments toggle
  const toggleCommentsStatus = () => {
    post(route('admin.crop-manual.toggle-comments', cropManual.id), {
      preserveScroll: true,
      onSuccess: () => {
        setData('allow_comments', !data.allow_comments);
      }
    });
  };

  return (
    <AdminLayout title={`Crop Manual: ${cropManual.name}`} admin={admin}>
      {/* Admin Control Bar */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
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
              <FaTachometerAlt className="mr-2" /> Dashboard
            </Link>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={() => setShowAdminControls(!showAdminControls)}
              className="mr-4 text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FaEye className="mr-1" /> {showAdminControls ? "Hide Controls" : "Show Controls"}
            </button>
            
            <Link
              href={route('crop-manual.public.show', cropManual.slug || cropManual.id)}
              className="mr-4 text-purple-600 hover:text-purple-800 flex items-center"
              target="_blank"
            >
              <FaEye className="mr-1" /> View as User
            </Link>
          </div>
        </div>
        
        {/* Admin Controls Section - Collapsible */}
        {showAdminControls && (
          <div className="mt-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Actions */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-700">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={route('admin.crop-manual.edit', cropManual.id)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-xs text-white hover:bg-blue-700"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </Link>
                  
                  <Link
                    href={route('admin.crop-manual.destroy', cropManual.id)}
                    method="delete"
                    as="button"
                    className="inline-flex items-center px-3 py-2 bg-red-600 border border-transparent rounded-md font-medium text-xs text-white hover:bg-red-700"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </Link>
                  
                  <button
                    onClick={togglePublishStatus}
                    disabled={processing}
                    className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md font-medium text-xs text-white ${data.is_published ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {data.is_published ? (
                      <><FaTimes className="mr-1" /> Unpublish</>
                    ) : (
                      <><FaCheck className="mr-1" /> Publish</>
                    )}
                  </button>
                  
                  <button
                    onClick={toggleCommentsStatus}
                    disabled={processing}
                    className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md font-medium text-xs text-white ${data.allow_comments ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    <FaComments className="mr-1" /> {data.allow_comments ? 'Disable Comments' : 'Enable Comments'}
                  </button>
                </div>
              </div>
              
              {/* Status */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-700">Status</h3>
                <div className="flex flex-wrap gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${data.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {data.is_published ? 'Published' : 'Draft'}
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${data.allow_comments ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {data.allow_comments ? 'Comments Enabled' : 'Comments Disabled'}
                  </div>
                  
                  <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    Created: {new Date(cropManual.created_at).toLocaleDateString()}
                  </div>
                  
                  {cropManual.updated_at && (
                    <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      Updated: {new Date(cropManual.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Statistics */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-700">Statistics</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <FaEye className="text-gray-500 mr-2" />
                    <span>{stats.views || 0} Views</span>
                  </div>
                  <div className="flex items-center">
                    <FaComments className="text-gray-500 mr-2" />
                    <span>{stats.comments || 0} Comments</span>
                  </div>
                  <div className="flex items-center">
                    <FaChartBar className="text-gray-500 mr-2" />
                    <span>{stats.completions || 0} Completions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crop Manual Content - Same as user view but with admin context */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row">
            {cropManual.image_url && (
              <div className="sm:w-1/3 mb-4 sm:mb-0 sm:pr-6">
                <img 
                  src={cropManual.image_url} 
                  alt={cropManual.name}
                  className="w-full h-auto rounded-lg shadow-md object-cover"
                />
              </div>
            )}
            
            <div className={cropManual.image_url ? "sm:w-2/3" : "w-full"}>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{cropManual.name}</h1>
              
              {cropManual.scientific_name && (
                <p className="text-lg italic text-gray-600 mb-4">{cropManual.scientific_name}</p>
              )}
              
              <div className="flex flex-wrap gap-3 mb-6">
                {cropManual.is_published ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Published
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Draft
                  </span>
                )}
                
                {cropManual.allow_comments && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Comments Allowed
                  </span>
                )}
                
                {cropManual.growing_season && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    Season: {cropManual.growing_season}
                  </span>
                )}
                
                {cropManual.water_needs && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Water: {cropManual.water_needs}
                  </span>
                )}
                
                {cropManual.soil_type && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                    Soil: {cropManual.soil_type}
                  </span>
                )}
                
                {cropManual.time_to_harvest && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                    Harvest: {cropManual.time_to_harvest}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cropManual.description }} />
          </div>
          
          {cropManual.growing_steps && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Growing Steps</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cropManual.growing_steps }} />
            </div>
          )}
          
          {cropManual.planting_instructions && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Planting Instructions</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cropManual.planting_instructions }} />
            </div>
          )}
          
          {cropManual.growing_conditions && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Growing Conditions</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cropManual.growing_conditions }} />
            </div>
          )}
          
          {cropManual.pest_management && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Pest Management</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cropManual.pest_management }} />
            </div>
          )}
          
          {cropManual.harvesting_info && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Harvesting Information</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cropManual.harvesting_info }} />
            </div>
          )}
          
          {cropManual.nutritional_value && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Nutritional Value</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: cropManual.nutritional_value }} />
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {cropManual.dos && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-3">Best Practices (Dos)</h2>
                <div className="prose max-w-none text-green-800" dangerouslySetInnerHTML={{ __html: cropManual.dos }} />
              </div>
            )}
            
            {cropManual.donts && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-red-900 mb-3">Things to Avoid (Don'ts)</h2>
                <div className="prose max-w-none text-red-800" dangerouslySetInnerHTML={{ __html: cropManual.donts }} />
              </div>
            )}
          </div>
          
          {/* Admin Quick Edit Buttons */}
          {showAdminControls && (
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-end">
                <Link
                  href={route('admin.crop-manual.edit', cropManual.id)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700"
                >
                  <FaEdit className="mr-2" /> Edit Crop Manual
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}