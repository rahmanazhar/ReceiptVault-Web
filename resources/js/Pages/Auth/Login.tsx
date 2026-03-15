import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Sign In" />
            <AuthLayout title="Welcome back" subtitle="Sign in to your Receipting Online account">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="email"
                        type="email"
                        label="Email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        placeholder="you@example.com"
                        autoComplete="email"
                        autoFocus
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                    />

                    <div className="flex items-center justify-between">
                        <Link
                            href="/forgot-password"
                            className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" loading={processing} className="w-full">
                        Sign In
                    </Button>

                    <p className="text-center text-sm text-[var(--color-text-muted)]">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
                            Sign up
                        </Link>
                    </p>
                </form>
            </AuthLayout>
        </>
    );
}
