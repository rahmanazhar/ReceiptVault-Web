import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon,
    DocumentTextIcon,
    BanknotesIcon,
    CalculatorIcon,
    Cog6ToothIcon,
    ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types/models';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Receipts', href: '/receipts', icon: DocumentTextIcon },
    { name: 'Transactions', href: '/transactions', icon: BanknotesIcon },
    { name: 'Tax Tracking', href: '/tax', icon: CalculatorIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 px-6 border-b border-[var(--color-border)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]">
                    <DocumentTextIcon className="h-5 w-5 text-[var(--color-text-inverse)]" />
                </div>
                <span className="text-lg font-bold text-[var(--color-text-primary)]">
                    Receipting
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = url.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                                isActive
                                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="border-t border-[var(--color-border)] p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-sm font-medium text-[var(--color-accent)]">
                        {auth.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                            {auth.user.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                            {auth.user.email}
                        </p>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-error)] transition-colors"
                    >
                        <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </aside>
    );
}
