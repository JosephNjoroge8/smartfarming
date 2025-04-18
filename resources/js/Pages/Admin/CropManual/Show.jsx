import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../Layouts/AdminLayout';
import { FaTachometerAlt, FaEdit, FaTrash } from 'react-icons/fa';

export default function Show({ cropManual, admin }) {
  return (
    <AdminLayout title={`Crop Manual: ${cropManual.name}`} admin={admin}>
      <div className="mb-6 flex justify-between items-center">
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
            <FaTachometerAlt className="mr-2" /> Back to Dashboard
          </Link>
        </div>
        
        <div className="flex space-x-2">
          <Link
            href={route('admin.crop-manual.edit', cropManual.id)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700"
          >
            <FaEdit className="mr-2" /> Edit
          </Link>
          
          <Link
            href={route('admin.crop-manual.destroy', cropManual.id)}
            method="delete"
            as="button"
            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-white hover:bg-red-700"
          >
            <FaTrash className="mr-2" /> Delete
          </Link>
        </div>
      </div>

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
        </div>
      </div>
    </AdminLayout>
  );
}