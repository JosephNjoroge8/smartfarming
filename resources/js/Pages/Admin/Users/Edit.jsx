import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ user, admin }) {
  const { data, setData, errors, put, processing } = useForm({
    name: user.name || '',
    email: user.email || '',
    phone_number: user.phone_number || '',
    location: user.location || '',
    password: '',
    password_confirmation: '',
    is_admin: user.is_admin || false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('admin.users.update', user.id));
  };

  const handleDelete = () => {
    router.delete(route('admin.users.destroy', userToDelete.id), {
      onSuccess: () => {
        setShowDeleteModal(false);
      },
      onError: (errors) => {
        console.error('Delete failed:', errors);
        // Optionally display error message
      }
    });
  };

  return (
    <AdminLayout
      user={admin}
      header={<h2 className="font-semibold text-xl text-green-800">User Management</h2>}
    >
      <div className="mb-6">
        <Link
          href={route('admin.users.index')}
          className="text-green-600 hover:text-green-700"
        >
          &larr; Back to Users
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
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

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.email ? 'border-red-500' : ''}`}
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                id="phone_number"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.phone_number ? 'border-red-500' : ''}`}
                value={data.phone_number}
                onChange={(e) => setData('phone_number', e.target.value)}
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-500">{errors.phone_number}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.location ? 'border-red-500' : ''}`}
                value={data.location}
                onChange={(e) => setData('location', e.target.value)}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-500">Leave blank to keep the current password</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.password ? 'border-red-500' : ''}`}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_admin"
                checked={data.is_admin}
                onChange={e => setData('is_admin', e.target.checked)}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-gray-700">Administrator Privileges</span>
            </label>
            {errors.is_admin && <div className="text-red-500 text-xs mt-1">{errors.is_admin}</div>}
          </div>

          <div className="mt-6 flex items-center justify-end">
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
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}