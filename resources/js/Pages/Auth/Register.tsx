import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Create Account" />
            <AuthLayout title="Create your account" subtitle="Start tracking your receipts and tax deductions">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="name"
                        label="Full Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="Your full name"
                        autoComplete="name"
                        autoFocus
                    />

                    <Input
                        id="email"
                        type="email"
                        label="Email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        placeholder="you@example.com"
                        autoComplete="email"
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        placeholder="Create a password"
                        autoComplete="new-password"
                    />

                    <Input
                        id="password_confirmation"
                        type="password"
                        label="Confirm Password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        error={errors.password_confirmation}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                    />

                    <Button type="submit" loading={processing} className="w-full">
                        Create Account
                    </Button>

                    <p className="text-center text-sm text-[var(--color-text-muted)]">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
                            Sign in
                        </Link>
                    </p>
                </form>
            </AuthLayout>
        </>
    );
}
