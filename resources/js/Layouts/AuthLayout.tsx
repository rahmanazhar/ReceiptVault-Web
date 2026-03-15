import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] px-4">
            <div className="w-full max-w-md">
                {/* Logo & title */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]">
                        <DocumentTextIcon className="h-7 w-7 text-[var(--color-text-inverse)]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{title}</h1>
                    {subtitle && (
                        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
                    )}
                </div>

                {/* Form card */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
                    {children}
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
                    receipting.online
                </p>
            </div>
        </div>
    );
}
