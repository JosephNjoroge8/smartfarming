import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FaEdit, FaTrash, FaEye, FaSearch, FaPlus, FaTachometerAlt } from 'react-icons/fa';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';

export default function Index({ users, admin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };
  
  const handleDelete = () => {
    router.delete(route('admin.users.destroy', userToDelete.id), {
      onSuccess: () => {
        setShowDeleteModal(false);
      },
      onError: (errors) => {
        console.error(errors);
      }
    });
  };
  
  // Filter users based on search term
  const filteredUsers = users.data.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout
      user={admin}
    >
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Added Back to Dashboard button */}
          <div className="mb-4">
            <Link
              href={route('admin.dashboard')}
              className="flex items-center text-green-700 hover:text-green-900 w-fit"
            >
              <FaTachometerAlt className="mr-2" /> Back to Dashboard
            </Link>
          </div>
        
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center w-1/3">
              <div className="relative w-full">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full ps-10 p-2.5"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Link href={route('admin.users.create')} className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              <FaPlus className="mr-2" /> Add User
            </Link>
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-full object-cover" src={user.profile_photo || '/images/default-avatar.png'} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.email_verified_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {user.email_verified_at ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_admin && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link href={route('admin.users.show', user.id)} className="text-blue-600 hover:text-blue-900">
                              <FaEye />
                            </Link>
                            <Link href={route('admin.users.edit', user.id)} className="text-indigo-600 hover:text-indigo-900">
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => confirmDelete(user)}
                              className={`text-red-600 hover:text-red-900 ${user.id === admin.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={user.id === admin.id}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <Pagination links={users.links} />
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Delete User</h2>
          <p className="mt-1 text-sm text-gray-600">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          
          {userToDelete && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p><strong>Name:</strong> {userToDelete.name}</p>
              <p><strong>Email:</strong> {userToDelete.email}</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="bg-white px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-red-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete User
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Updated Footer with background color */}
      <div className="py-8 border-t border-gray-200 mt-12 bg-slate-50">
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