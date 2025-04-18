import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '../Layouts/AdminLayout';
import { FaTachometerAlt } from 'react-icons/fa';

export default function Create({ admin }) {
  const { data, setData, errors, post, processing } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    location: '',
    send_welcome_email: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.users.store'));
  };

  return (
    <AdminLayout title="Create User" admin={admin}>
      <div className="mb-6 flex space-x-4">
        <Link
          href={route('admin.users')}
          className="text-green-600 hover:text-green-700"
        >
          &larr; Back to Users
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
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
                Confirm Password
              </label>
              <input
                type="password"
                id="password_confirmation"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number (optional)
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
                Location (optional)
              </label>
              <input
                type="text"
                id="location"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.location ? 'border-red-500' : ''}`}
                value={data.location}
                onChange={(e) => setData('location', e.target.value)}
                placeholder="e.g. Nairobi, Kenya"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <input
                id="send_welcome_email"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={data.send_welcome_email}
                onChange={(e) => setData('send_welcome_email', e.target.checked)}
              />
              <label htmlFor="send_welcome_email" className="ml-2 block text-sm text-gray-700">
                Send welcome email with login details
              </label>
            </div>
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
              {processing ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}