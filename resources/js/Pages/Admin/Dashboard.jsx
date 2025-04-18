import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';

export default function Dashboard({ auth, stats }) {
    // Add logout form handler
    const { post } = useForm();
    
    const handleLogout = (e) => {
        e.preventDefault();
        post(route('admin.logout'));
    };
    
    // Default values in case stats aren't fully provided
    const userStats = {
        totalUsers: stats?.userCount || 0,
        newUsersToday: stats?.newUsersToday || 0,
        blogPosts: stats?.blogCount || 0,
        cropManuals: stats?.cropManualCount || 0
    };

    return (
        <AdminLayout
            admin={auth.user || {}}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-green-800">Admin Dashboard</h2>
                    {/* Add logout button */}
                    <form onSubmit={handleLogout}>
                        <button 
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Logout Admin
                        </button>
                    </form>
                </div>
            }
        >
         

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                    <p className="text-3xl font-bold text-green-600">{userStats.totalUsers}</p>
                    <p className="text-sm text-gray-500">New today: {userStats.newUsersToday}</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Blog Posts</h3>
                    <p className="text-3xl font-bold text-green-600">{userStats.blogPosts}</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Crop Manuals</h3>
                    <p className="text-3xl font-bold text-green-600">{userStats.cropManuals}</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-700">System Status</h3>
                    <p className="text-lg font-medium text-green-600">Online</p>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow mb-8">
                <h2 className="text-xl font-bold mb-4 text-green-800">User Growth</h2>
                <div className="h-64">
                    {/* Placeholder for chart */}
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-500">User growth chart placeholder</p>
                            <p className="text-sm text-gray-400">Monthly new registrations</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={route('admin.users')}  className="block p-4 bg-green-100 hover:bg-green-200 rounded-lg text-center text-green-800 font-semibold">
                    Manage Users
                </Link>
                
                {/* Temporarily disabled until route is created */}
                <span className="block p-4 bg-gray-100 text-center text-gray-500 font-semibold cursor-not-allowed">
                    Manage Blogs
                </span>
                
                <Link 
                    href={route('admin.crop-manuals.index')}
                    className="block p-4 bg-green-100 hover:bg-green-200 rounded-lg text-center text-green-800 font-semibold"
                >
                    Manage Crop Manuals
                </Link>
            </div>
        </AdminLayout>
    );
}