import { Link } from '@inertiajs/react';
import { PlusIcon, BellIcon, Bars3Icon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Button from '@/Components/ui/Button';
import Tooltip from '@/Components/ui/Tooltip';
import { useSidebarStore } from '@/hooks/useSidebarState';

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
    const { toggle } = useSidebarStore();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 px-4 lg:px-6 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
                {/* Mobile hamburger */}
                <button
                    onClick={toggle}
                    className="lg:hidden rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                    <Bars3Icon className="h-5 w-5" />
                </button>

                <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-[var(--color-text-primary)] truncate">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-[var(--color-text-muted)] truncate">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <Tooltip content="Help & Support" position="bottom">
                    <button className="relative rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                        <QuestionMarkCircleIcon className="h-5 w-5" />
                    </button>
                </Tooltip>

                <Tooltip content="Notifications" position="bottom">
                    <button className="relative rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                        <BellIcon className="h-5 w-5" />
                    </button>
                </Tooltip>

                {action && (
                    action.href ? (
                        <Link href={action.href}>
                            <Button size="sm">
                                <PlusIcon className="h-4 w-4 sm:mr-1.5" />
                                <span className="hidden sm:inline">{action.label}</span>
                            </Button>
                        </Link>
                    ) : (
                        <Button size="sm" onClick={action.onClick}>
                            <PlusIcon className="h-4 w-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">{action.label}</span>
                        </Button>
                    )
                )}
            </div>
        </header>
    );
}
