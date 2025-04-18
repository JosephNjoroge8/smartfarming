import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-white shadow mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">SmaFarm</h3>
                        <p className="text-gray-600 text-sm">
                            Empowering farmers with smart agricultural solutions.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/about" className="text-gray-600 hover:text-green-600 text-sm">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="text-gray-600 hover:text-green-600 text-sm">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="/privacy" className="text-gray-600 hover:text-green-600 text-sm">
                                    Privacy Policy
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Us</h3>
                        <ul className="space-y-2">
                            <li className="text-gray-600 text-sm">
                                Email: support@smafarm.com
                            </li>
                            <li className="text-gray-600 text-sm">
                                Phone: +254 797 094 805
                            </li>
                            <li className="text-gray-600 text-sm">
                                Location: Nyandarua, Kenya
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-8 pt-6">
                    <p className="text-center text-gray-500 text-sm">
                        © {new Date().getFullYear()} SmaFarm. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;