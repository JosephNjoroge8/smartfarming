import React from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Use named route instead of hardcoded URL
        post(route('admin.login'));
    };

    return (
        <>
            <Head title="Admin Login" />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-md">
                    <div className="bg-white shadow-md rounded-lg p-8">
                        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h1>
                        
                        {/* Add this if you have login errors */}
                        {errors.email && errors.email === 'auth' && (
                            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                                <p>Invalid login credentials</p>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                                    required
                                />
                                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                                    required
                                />
                                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                            </div>
                            
                            <div className="flex items-center mb-4">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                    Remember me
                                </label>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                                {processing ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}