import React from 'react';
import { Link } from '@inertiajs/react';
import Navigation from '@/Components/Navigation';
import Footer from '@/Components/Footer';

export default function AppLayout({ children, user, headerClass = "bg-green-600", footerClass = "bg-green-600" }) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className={`${headerClass} shadow-md text-white py-4 px-6`}>
                {/* Your header content */}
                <div className="container mx-auto flex justify-between items-center">
                    <div className="text-2xl font-bold">🌱 SmartFarm</div>
                    <div className="flex items-center space-x-4">
                        {/* User info */}
                        {user && (
                            <>
                                <span>Welcome, {user.name}</span>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="px-3 py-1 bg-white text-green-600 rounded-md hover:bg-gray-100"
                                >
                                    Logout
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <footer className={`${footerClass} text-white py-4 px-6`}>
                <div className="container mx-auto">
                    <p className="text-center">&copy; {new Date().getFullYear()} SmartFarm. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}