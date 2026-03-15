import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Reset Password" />
            <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link">
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

                    <Button type="submit" loading={processing} className="w-full">
                        Send Reset Link
                    </Button>

                    <p className="text-center text-sm text-[var(--color-text-muted)]">
                        <Link href="/login" className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
                            Back to sign in
                        </Link>
                    </p>
                </form>
            </AuthLayout>
        </>
    );
}
