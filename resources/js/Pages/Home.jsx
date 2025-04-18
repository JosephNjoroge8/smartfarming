import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Home() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url, component } = usePage();

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Add these functions at the top of your component
    const getLoginUrl = () => {
        try {
            return route('login');
        } catch (e) {
            return '/login';
        }
    };

    const getRegisterUrl = () => {
        try {
            return route('register');
        } catch (e) {
            return '/register';
        }
    };

    // Auth buttons with proper navigation
    const AuthButtons = ({ className = '', buttonClassName = '' }) => (
        <div className={className}>
            <Link 
                href={getLoginUrl()}
                className={`${buttonClassName} inline-block px-5 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition`}
                as="button"
                type="button"
            >
                Login
            </Link>

            <Link 
                href={getRegisterUrl()}
                className={`${buttonClassName} inline-block px-5 py-2 rounded-md border border-green-600 text-white font-medium hover:bg-green-700 transition`}
                as="button"
                type="button"
            >
                Register
            </Link>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-green-600 text-white py-4 px-4 sm:px-6 shadow-md">
                <div className="flex justify-between items-center">
                    <div className="text-xl sm:text-2xl font-bold">🌱 SmaFarm</div>
                    
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={toggleMobileMenu}
                            className="text-white focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:block">
                        <ul className="flex space-x-8 lg:space-x-12">
                            <li><Link href="/" className="hover:underline">Home</Link></li>
                            <li><Link href="/blog" className="hover:text-blue-200 transition-colors">Blog</Link></li>
                            <li><Link href="/crop-manual" className="hover:underline">Crop Manual</Link></li>
                            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
                        </ul>
                    </nav>
                    
                    {/* Desktop Auth Buttons */}
                    <AuthButtons className="hidden md:flex space-x-4" />
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-green-500">
                        <nav className="flex flex-col space-y-3 mb-4">
                            <Link href="/" className="hover:bg-green-700 px-2 py-1 rounded">Home</Link>
                            <Link href="/blog" className="hover:bg-green-700 px-2 py-1 rounded">Blog</Link>
                            <Link href="/crop-manual" className="hover:bg-green-700 px-2 py-1 rounded">Crop Manual</Link>
                            <Link href="/contact" className="hover:bg-green-700 px-2 py-1 rounded">Contact</Link>
                        </nav>
                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                            <Link 
                                href={getLoginUrl()}
                                className="w-full text-center px-4 py-2 rounded-md bg-white text-green-600 font-medium hover:bg-gray-100 transition"
                                as="button"
                            >
                                Login
                            </Link>
                            <Link 
                                href={getRegisterUrl()}
                                className="w-full text-center px-4 py-2 rounded-md bg-green-700 text-white font-medium hover:bg-green-800 transition"
                                as="button"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                )}
            </header>
            
            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-16 md:pt-24 flex-grow">
                {/* Hero Section */}
                <section className="text-center py-8 sm:py-12 md:py-20">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-800 mb-4 sm:mb-6">
                        Welcome to Smart Farming Management System
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                        Upgrade your farming experience with AI-powered crop management, 
                        real-time weather data, and expert farming guidance.
                    </p>
                    
                    {/* CTA Buttons for Mobile */}
                    <div className="md:hidden flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
                        <Link 
                            href={getLoginUrl()}
                            className="w-full sm:w-auto text-center px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
                            as="button"
                        >
                            Login
                        </Link>
                        <Link 
                            href={getRegisterUrl()}
                            className="w-full sm:w-auto text-center px-6 py-3 rounded-lg border-2 border-green-600 text-green-600 font-medium hover:bg-green-50 transition"
                            as="button"
                        >
                            Register
                        </Link>
                    </div>
                </section>

                {/* Tutorial Section */}
                <section className="py-10 sm:py-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-green-800 mb-6 sm:mb-12">
                        Getting Started Guide
                    </h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="bg-white p-5 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-green-600 font-bold text-xl">{step}</span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                                    {step === 1 && 'Create Your Account'}
                                    {step === 2 && 'Set Up Your Farm'}
                                    {step === 3 && 'Start Tracking'}
                                </h3>
                                <p className="text-gray-600">
                                    {step === 1 && 'Register for a free account to access all smart farming features.'}
                                    {step === 2 && 'Add your crops and configure your farming location details.'}
                                    {step === 3 && 'Monitor activities, get AI insights, and track progress.'}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* Features Section - Added for better mobile experience */}
                <section className="py-10 sm:py-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-green-800 mb-8">
                        Key Features
                    </h2>
                    <div className="space-y-6">
                        {/* Feature cards */}
                        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row items-center">
                            <div className="bg-green-100 p-3 rounded-full mb-4 sm:mb-0 sm:mr-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-center sm:text-left">Crop Health Monitoring</h3>
                                <p className="text-gray-600">Detect diseases early with our AI-powered image analysis. Get instant diagnostics and treatment recommendations.</p>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row items-center">
                            <div className="bg-green-100 p-3 rounded-full mb-4 sm:mb-0 sm:mr-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-center sm:text-left">Real-time Weather Insights</h3>
                                <p className="text-gray-600">Get localized weather forecasts and alerts to plan your farming activities optimally.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
            {/* Footer - Using improved auth links */}
            <footer className="bg-green-800 text-white mt-12 sm:mt-16">
                <div className="container mx-auto px-4 sm:px-6 py-8">
                    <div className="text-center">
                        <p className="mb-4">
                            © {new Date().getFullYear()} SmaFarm. All rights reserved.
                        </p>
                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-center sm:space-x-6">
                            <Link href="/about" className="hover:text-green-200">
                                About Us
                            </Link>
                            <Link href="/contact" className="hover:text-green-200">
                                Contact
                            </Link>
                            <Link href="/terms" className="hover:text-green-200">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}