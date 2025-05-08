import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props; // Proper way to access auth data
    const user = auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // Update the safeRoute function to avoid excessive logging
    const safeRoute = (name, fallbackUrl = '#') => {
        // Only log warnings once per session
        if (!window.warnedRoutes) window.warnedRoutes = {};
        
        try {
            return route(name);
        } catch (error) {
            // Only log warning once per route
            if (!window.warnedRoutes[name]) {
                console.warn(`Route ${name} not found, using fallback URL`);
                window.warnedRoutes[name] = true;
            }
            return fallbackUrl;
        }
    };
    
    // Same function but for checking active state
    const isCurrentRoute = (name) => {
        try {
            return route().current(name);
        } catch (error) {
            return false;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <nav className="bg-green-600 border-b border-green-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Dashboard link - Left side */}
                        <div className="flex items-center">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <div className="text-white text-xl font-bold">🌱 SmaFarm</div>
                                </Link>
                            </div>

                            <div className="hidden sm:ml-10 sm:flex">
                                <NavLink href={safeRoute('dashboard')} active={isCurrentRoute('dashboard')}>
                                    Dashboard
                                </NavLink>
                            </div>
                        </div>

                        {/* Main navigation - Right side, moved closer to user profile */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-4">
                            <NavLink href="/my-crops" active={route().current('crops.show')}>
                                My Crops
                            </NavLink>
                            <NavLink href="/weather" active={route().current('weather')}>
                                Weather
                            </NavLink>
                            <NavLink href="/tasks" active={route().current('tasks')}>
                                Tasks
                            </NavLink>
                            <NavLink href="/crop-manual" active={route().current('crop-manual.index')}>
                                Crop Manual
                            </NavLink>
                            <NavLink href="/blog" active={route().current('blog.index')}>
                                Blog
                            </NavLink>

                            {/* User dropdown - kept separate for visual distinction */}
                            <div className="ml-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-800 hover:bg-green-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {user.name}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={safeRoute('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={safeRoute('dashboard')}>My Dashboard</Dropdown.Link>
                                        {user.is_admin && (
                                            <Dropdown.Link href={safeRoute('admin.dashboard')}>Admin Dashboard</Dropdown.Link>
                                        )}
                                        <Dropdown.Link 
                                            href={route('logout')} 
                                            method="post" 
                                            as="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                // Manual form submission as fallback
                                                const form = document.createElement('form');
                                                form.method = 'POST';
                                                form.action = '/logout';
                                                
                                                // Add CSRF token
                                                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                                                const csrfInput = document.createElement('input');
                                                csrfInput.type = 'hidden';
                                                csrfInput.name = '_token';
                                                csrfInput.value = csrfToken;
                                                
                                                form.appendChild(csrfInput);
                                                document.body.appendChild(form);
                                                form.submit();
                                            }}
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-100 hover:bg-green-700 focus:outline-none focus:bg-green-700 focus:text-white transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={safeRoute('dashboard')} active={isCurrentRoute('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/my-crops" active={route().current('crops.show')}>
                            My Crops
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/weather" active={route().current('weather')}>
                            Weather
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/tasks" active={route().current('tasks')}>
                            Tasks
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/crop-manual" active={route().current('crop-manual.index')}>
                            Crop Manual
                        </ResponsiveNavLink>
            
                    </div>

                    <div className="pt-4 pb-1 border-t border-green-700">
                        <div className="px-4">
                            <div className="font-medium text-base text-white">{user.name}</div>
                            <div className="font-medium text-sm text-green-200">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={safeRoute('profile.edit')}>Profile</ResponsiveNavLink>
                            {user.is_admin && (
                                <ResponsiveNavLink href={safeRoute('admin.dashboard')}>Admin Dashboard</ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink method="post" href={safeRoute('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main className="flex-grow">{children}</main>

            {/* Added footer */}
            <footer className="bg-green-200 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex justify-center space-x-6 md:order-2">
                            <Link href={safeRoute('help')} className="text-gray-500 hover:text-green-600 transition">
                                Help & Support
                            </Link>
                            <Link href={safeRoute('contact')} className="text-gray-500 hover:text-green-600 transition">
                                Contact Us
                            </Link>
                            <Link href={safeRoute('terms')} className="text-gray-500 hover:text-green-600 transition">
                                Terms of Service
                            </Link>
                        </div>
                        <div className="mt-8 md:mt-0 md:order-1">
                            <p className="text-center text-base text-gray-500">
                                &copy; {new Date().getFullYear()} SmaFarm. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
