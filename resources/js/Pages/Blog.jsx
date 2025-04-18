import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const Blog = ({ auth, posts }) => {
    return (
        <AppLayout 
            user={auth?.user}
            headerClass="bg-green-600" // Match dashboard header color
            footerClass="bg-green-600" // Match dashboard footer color
        >
            <Head title="Blog" />
            
            <div className="container mx-auto px-4 py-8">
                {/* Add back navigation button */}
                <div className="mb-6">
                    <Link href="/dashboard" className="text-green-600 hover:underline flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>
                
                <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts && posts.length > 0 ? (
                        posts.map(post => (
                            <div key={post.id} className="rounded-lg shadow-md overflow-hidden">
                                <img 
                                    src={post.image_url || "/images/default-post.jpg"} 
                                    alt={post.title} 
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-2 text-green-800">{post.title}</h2>
                                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                                    
                                    <p className="text-sm text-gray-500">
                                        By: {post.user ? post.user.name : "Unknown author"}
                                        {" • "}
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                    
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {post.categories && post.categories.map(category => (
                                            <span 
                                                key={category.id} 
                                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No blog posts available.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

Blog.defaultProps = {
    auth: {
        user: null
    }
};

export default Blog;