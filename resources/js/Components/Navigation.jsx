import React from 'react';
import { Link } from '@inertiajs/react';
import { FaSeedling } from 'react-icons/fa';

const Navigation = ({ user }) => {
    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold text-green-600">SmaFarm</span>
                        </Link>
                    </div>

                    <div className="flex items-center">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link 
                                    href={route('dashboard')} 
                                    className="text-gray-700 hover:text-green-600"
                                >
                                    Dashboard
                                </Link>
                                <Link 
                                    href={route('logout')} 
                                    method="post" 
                                    as="button" 
                                    className="text-gray-700 hover:text-green-600"
                                >
                                    Logout
                                </Link>
                                <Link 
                                    href={route('admin.crop-manual.index')} 
                                    className="text-gray-700 hover:text-green-600"
                                >
                                    <FaSeedling className="mr-2" /> Crop Manuals
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link 
                                    href={route('login')} 
                                    className="text-gray-700 hover:text-green-600"
                                >
                                    Login
                                </Link>
                                <Link 
                                    href={route('register')} 
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;