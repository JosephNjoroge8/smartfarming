import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '../Layouts/AdminLayout';
import { FaPlus, FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import Pagination from '../../../Components/Pagination';

export default function Index({ cropManuals, admin }) {
  return (
    <AdminLayout title="Crop Manuals" admin={admin}>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Crop Manuals</h1>
        <Link
          href={route('admin.crop-manuals.create')}
          className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-white hover:bg-green-700"
        >
          <FaPlus className="mr-2" /> Add New Crop Manual
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scientific Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cropManuals.data.map((cropManual) => (
                <tr key={cropManual.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {cropManual.image_url && (
                        <div className="flex-shrink-0 h-10 w-10 mr-4">
                          <img
                            src={cropManual.image_url}
                            alt={cropManual.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cropManual.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cropManual.scientific_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cropManual.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {cropManual.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={route('admin.crop-manuals.show', cropManual.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        href={route('admin.crop-manuals.edit', cropManual.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FaEdit />
                      </Link>
                      <Link
                        href={route('admin.crop-manuals.destroy', cropManual.id)}
                        method="delete"
                        as="button"
                        type="button"
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination links={cropManuals.links} />
      </div>
    </AdminLayout>
  );
}