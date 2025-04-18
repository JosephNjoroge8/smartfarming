import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={`w-full flex items-start pl-3 pr-4 py-2 border-l-4 ${
                active
                    ? 'border-white text-white bg-green-700 focus:text-white focus:bg-green-700'
                    : 'border-transparent text-green-100 hover:text-white hover:bg-green-700 hover:border-white'
            } text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
        >
            {children}
        </Link>
    );
}
