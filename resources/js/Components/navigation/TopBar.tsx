import { Link } from '@inertiajs/react';
import { PlusIcon, BellIcon } from '@heroicons/react/24/outline';
import Button from '@/Components/ui/Button';

interface TopBarProps {
    title: string;
    subtitle?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export default function TopBar({ title, subtitle, action }: TopBarProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 px-6 backdrop-blur-md">
            <div>
                <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button className="relative rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                    <BellIcon className="h-5 w-5" />
                </button>

                {action && (
                    action.href ? (
                        <Link href={action.href}>
                            <Button size="sm">
                                <PlusIcon className="h-4 w-4 mr-1.5" />
                                {action.label}
                            </Button>
                        </Link>
                    ) : (
                        <Button size="sm" onClick={action.onClick}>
                            <PlusIcon className="h-4 w-4 mr-1.5" />
                            {action.label}
                        </Button>
                    )
                )}
            </div>
        </header>
    );
}
