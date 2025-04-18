import React from 'react';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

export default function Contact() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="bg-green-600 text-white py-4 px-4 sm:px-6 shadow-md">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-xl sm:text-2xl font-bold">🌱 SmaFarm</Link>
                    
                    <nav className="hidden md:block">
                        <ul className="flex space-x-8 lg:space-x-12">
                            <li><Link href="/" className="hover:underline">Home</Link></li>
                            <li><Link href="/blog" className="hover:text-blue-200 transition-colors">Blog</Link></li>
                            <li><Link href="/crop-manual" className="hover:underline">Crop Manual</Link></li>
                            <li><Link href="/contact" className="hover:underline font-bold">Contact</Link></li>
                        </ul>
                    </nav>
                    
                    <div className="hidden md:flex space-x-4">
                        <Link 
                            href={route('login')} 
                            className="inline-block px-5 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition"
                        >
                            Login
                        </Link>

                        <Link 
                            href={route('register')} 
                            className="inline-block px-5 py-2 rounded-md border border-green-600 text-white font-medium hover:bg-green-700 transition"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto px-4 sm:px-6 pt-8 flex-grow">
                <Head title="Contact Us" />
                
                <div className="max-w-3xl mx-auto py-8">
                    <h1 className="text-3xl font-bold text-green-800 mb-6">Contact Us</h1>
                    
                    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                        <form>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name</label>
                                <input 
                                    type="text"
                                    id="name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                                <input 
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                    placeholder="john@example.com"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                                <input 
                                    type="text"
                                    id="subject"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                    placeholder="How can we help?"
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message</label>
                                <textarea
                                    id="message"
                                    rows="5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                    placeholder="Please describe your question or feedback..."
                                ></textarea>
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-green-800 mb-4">Contact Information</h2>
                            <div className="space-y-3">
                                <p>
                                    <span className="font-medium">Email:</span><br />
                                    contact@smafarm.com
                                </p>
                                <p>
                                    <span className="font-medium">Phone:</span><br />
                                    +254 712 345 678
                                </p>
                                <p>
                                    <span className="font-medium">Address:</span><br />
                                    Nairobi, Kenya
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-green-800 mb-4">Business Hours</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">Monday - Friday:</span> 8:00 AM to 5:00 PM</p>
                                <p><span className="font-medium">Saturday:</span> 9:00 AM to 1:00 PM</p>
                                <p><span className="font-medium">Sunday:</span> Closed</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <footer className="bg-green-800 text-white mt-12">
                <div className="container mx-auto px-4 sm:px-6 py-8">
                    <div className="text-center">
                        <p className="mb-4">
                            © {new Date().getFullYear()} SmaFarm. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}