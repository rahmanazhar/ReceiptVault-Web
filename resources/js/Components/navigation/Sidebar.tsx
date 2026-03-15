import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    BanknotesIcon,
    CalculatorIcon,
    Cog6ToothIcon,
    ArrowRightStartOnRectangleIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import Tooltip from '@/Components/ui/Tooltip';
import type { PageProps } from '@/types/models';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Receipts', href: '/receipts', icon: DocumentTextIcon },
    { name: 'Medical Certs', href: '/medical-certificates', icon: ClipboardDocumentCheckIcon },
    { name: 'Transactions', href: '/transactions', icon: BanknotesIcon },
    { name: 'Tax Tracking', href: '/tax', icon: CalculatorIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onClose: () => void;
    onCollapse: () => void;
}

export default function Sidebar({ isOpen, isCollapsed, onClose, onCollapse }: SidebarProps) {
    const { url } = usePage();
    const { auth } = usePage<PageProps>().props;

    const sidebarContent = (collapsed: boolean) => (
        <aside
            className={cn(
                'flex h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className={cn(
                'flex h-16 items-center border-b border-[var(--color-border)]',
                collapsed ? 'justify-center px-2' : 'gap-2 px-6'
            )}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)]">
                    <DocumentTextIcon className="h-5 w-5 text-[var(--color-text-inverse)]" />
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold text-[var(--color-text-primary)]">
                        Receipting
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => {
                    const isActive = url.startsWith(item.href);
                    const linkEl = (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                'flex items-center rounded-lg text-sm font-medium transition-colors duration-150',
                                collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                                isActive
                                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!collapsed && item.name}
                        </Link>
                    );

                    return collapsed ? (
                        <Tooltip key={item.name} content={item.name} position="right">
                            {linkEl}
                        </Tooltip>
                    ) : (
                        <div key={item.name}>{linkEl}</div>
                    );
                })}
            </nav>

            {/* Collapse toggle (desktop only) */}
            <div className="hidden lg:block px-2 pb-2">
                <button
                    onClick={onCollapse}
                    className={cn(
                        'flex w-full items-center rounded-lg p-2.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors',
                        collapsed ? 'justify-center' : 'gap-3 px-3'
                    )}
                >
                    {collapsed ? (
                        <ChevronDoubleRightIcon className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronDoubleLeftIcon className="h-4 w-4" />
                            <span className="text-sm">Collapse</span>
                        </>
                    )}
                </button>
            </div>

            {/* User section */}
            <div className="border-t border-[var(--color-border)] p-3">
                <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-sm font-medium text-[var(--color-accent)]">
                        {auth.user.name.charAt(0).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                {auth.user.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)] truncate">
                                {auth.user.email}
                            </p>
                        </div>
                    )}
                    {!collapsed ? (
                        <Tooltip content="Sign Out" position="top">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-error)] transition-colors"
                            >
                                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                            </Link>
                        </Tooltip>
                    ) : (
                        <Tooltip content="Sign Out" position="right">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="absolute bottom-14 left-1/2 -translate-x-1/2 rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-error)] transition-colors"
                            >
                                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                            </Link>
                        </Tooltip>
                    )}
                </div>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <div className="hidden lg:block fixed left-0 top-0 z-40">
                {sidebarContent(isCollapsed)}
            </div>

            {/* Mobile drawer */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    {/* Drawer */}
                    <div className="relative z-10 h-full w-64 animate-[slideInLeft_0.3s_ease-out]">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-3 z-20 rounded-lg p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                        {sidebarContent(false)}
                    </div>
                </div>
            )}
        </>
    );
}
