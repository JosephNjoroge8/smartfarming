import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function CreateTask({ auth }) {
    const { data, setData, errors, post, processing } = useForm({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // This would normally post to the server
        alert('Task creation would be processed here. Returning to tasks list.');
        window.history.back();
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-green-800">
                    Create New Task
                </h2>
            }
        >
            <Head title="Create Task" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <InputLabel htmlFor="title" value="Task Title" />
                                    <TextInput
                                        id="title"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>
                                
                                <div className="mb-4">
                                    <InputLabel htmlFor="description" value="Description (Optional)" />
                                    <textarea
                                        id="description"
                                        className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                        rows="3"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    ></textarea>
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                                
                                <div className="mb-4">
                                    <InputLabel htmlFor="due_date" value="Due Date" />
                                    <TextInput
                                        id="due_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.due_date} className="mt-2" />
                                </div>
                                
                                <div className="mb-6">
                                    <InputLabel htmlFor="priority" value="Priority" />
                                    <select
                                        id="priority"
                                        className="mt-1 block w-full border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <InputError message={errors.priority} className="mt-2" />
                                </div>
                                
                                <div className="flex items-center justify-end">
                                    <Link
                                        href="/tasks"
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 mr-2"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                                        disabled={processing}
                                    >
                                        Create Task
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}