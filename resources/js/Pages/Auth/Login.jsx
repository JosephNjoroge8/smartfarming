import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));  // This should now work correctly
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-green-700">SmaFarm</h1>
                <p className="text-gray-600 mt-1">Smart Farming Solutions</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex flex-col space-y-4">
                    <PrimaryButton className="w-full justify-center py-3 bg-green-600 hover:bg-green-700" disabled={processing}>
                        Log in
                    </PrimaryButton>
                    
                    <div className="flex items-center justify-between text-sm">
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-gray-600 hover:text-green-700 transition"
                            >
                                Forgot your password?
                            </Link>
                        )}
                        
                        <Link
                            href={route('register')}
                            className="text-gray-600 hover:text-green-700 transition"
                        >
                            Don't have an account?
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
