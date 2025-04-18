import React from 'react';
import { Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FaArrowLeft, FaEdit, FaTrash, FaEnvelope, FaCalendar, FaIdCard, FaExclamationTriangle, FaTachometerAlt } from 'react-icons/fa';

export default function Show({ user, admin }) {
  return (
    <AdminLayout 
      user={admin}
      header={<h2 className="font-semibold text-xl text-green-800">User Details</h2>}
    >
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Back buttons row */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex space-x-4">
              <Link
                href={route('admin.users')}
                className="flex items-center text-green-700 hover:text-green-900"
              >
                <FaArrowLeft className="mr-2" /> Back to Users
              </Link>
              
              {/* Added Back to Dashboard button */}
              <Link
                href={route('admin.dashboard')}
                className="flex items-center text-green-700 hover:text-green-900"
              >
                <FaTachometerAlt className="mr-2" /> Back to Dashboard
              </Link>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {/* User Header */}
            <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 mr-4">
                  <img 
                    src={user.profile_photo || '/images/default-avatar.png'} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                  <p className="text-gray-500 flex items-center">
                    <FaEnvelope className="mr-2" /> {user.email}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  href={route('admin.users.edit', user.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                >
                  <FaEdit className="mr-2" /> Edit User
                </Link>
                
                {user.id !== admin.id && (
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
                    onClick={() => confirm('Are you sure you want to delete this user?')}
                  >
                    <FaTrash className="mr-2" /> Delete
                  </button>
                )}
              </div>
            </div>
            
            {/* User Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="font-semibold text-lg mb-4 text-gray-700">Account Information</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-32 text-gray-600 font-medium">User ID:</div>
                      <div className="flex items-center">
                        <FaIdCard className="mr-2 text-gray-400" />
                        {user.id}
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-32 text-gray-600 font-medium">Joined:</div>
                      <div className="flex items-center">
                        <FaCalendar className="mr-2 text-gray-400" />
                        {new Date(user.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long',
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-32 text-gray-600 font-medium">Status:</div>
                      <div>
                        {user.email_verified_at ? (
                          <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Pending Verification
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-32 text-gray-600 font-medium">Role:</div>
                      <div>
                        {user.is_admin ? (
                          <span className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            User
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="font-semibold text-lg mb-4 text-gray-700">Activity</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-32 text-gray-600 font-medium">Last Login:</div>
                      <div>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-32 text-gray-600 font-medium">Crops:</div>
                      <div>{user.crops_count || 0}</div>
                    </div>
                    
                    {/* Additional activity metrics could be added here */}
                  </div>
                </div>
              </div>
              
              {/* User actions section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="font-semibold text-lg mb-4 text-gray-700">Account Actions</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {!user.email_verified_at && (
                    <button className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 flex items-center justify-center">
                      <FaEnvelope className="mr-2" /> Send Verification Email
                    </button>
                  )}
                  
                  <button className="bg-yellow-600 text-white p-3 rounded hover:bg-yellow-700 flex items-center justify-center">
                    <FaExclamationTriangle className="mr-2" /> Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Added Footer */}
      <div className="py-8 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Smart Farming. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-green-700 text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-green-700 text-sm">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-green-700 text-sm">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}