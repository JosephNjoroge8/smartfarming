import React from 'react';
import { Link, usePage } from '@inertiajs/react';

const AdminLayout = ({ children, title, admin }) => {
    const { errors } = usePage().props;
    
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Header/Navigation */}
            <nav className="bg-gray-800 text-white py-3 px-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="text-xl font-bold">SmFarm Admin</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <span className="text-sm">{admin.name}</span>
                        <Link
                            href={route('admin.logout')}
                            method="post"
                            as="button"
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            </nav>
            
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-md h-screen fixed">
                    <div className="p-4">
                        <div className="mb-6">
                            <Link
                                href={route('admin.dashboard')}
                                className="block py-2 px-4 rounded hover:bg-gray-100"
                            >
                                Dashboard
                            </Link>
                            
                            <Link
                                href={route('admin.users')}
                                className="block py-2 px-4 rounded hover:bg-gray-100"
                            >
                                User Management
                            </Link>
                            
                            <Link
                                href={route('admin.crop-manuals.index')}
                                className="block py-2 px-4 rounded hover:bg-gray-100"
                            >
                                Crop Manuals
                            </Link>
                            
                            {admin.is_super_admin && (
                                <span className="block py-2 px-4 rounded text-gray-400">
                                    Admin Management
                                </span>
                            )}
                            
                            <span className="block py-2 px-4 rounded text-gray-400">
                                My Profile
                            </span>
                            
                            <Link
                                href="/"
                                className="block py-2 px-4 rounded hover:bg-gray-100"
                                target="_blank"
                            >
                                View Website
                            </Link>
                        </div>
                    </div>
                </aside>
                
                {/* Main Content */}
                <main className="ml-64 w-full p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">{title}</h1>
                    </div>
                    
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            <p className="font-bold">Please correct the following errors:</p>
                            <ul className="list-disc pl-5">
                                {Object.entries(errors).map(([key, value]) => (
                                    <li key={key}>{value}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;