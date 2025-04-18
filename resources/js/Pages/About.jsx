import React from 'react';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

export default function About() {
    return (
        <div className="flex flex-col min-h-screen">
            <Head title="About Us" />
            <header className="bg-green-600 text-white py-4 px-4 sm:px-6 shadow-md">
                <Link href="/" className="text-xl sm:text-2xl font-bold">🌱 SmaFarm</Link>
            </header>
            
            <main className="container mx-auto px-4 sm:px-6 py-12 flex-grow">
                <h1 className="text-3xl font-bold text-green-800 mb-6">About Us</h1>
                <p className="text-gray-600">Coming soon...</p>
                <div className="mt-6">
                    <Link href="/" className="text-green-600 hover:underline">Back to Home</Link>
                </div>
            </main>
            
            <footer className="bg-green-800 text-white py-4">
                <div className="container mx-auto px-4">
                    <p className="text-center">© {new Date().getFullYear()} SmaFarm</p>
                </div>
            </footer>
        </div>
    );
}