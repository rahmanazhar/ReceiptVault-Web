import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/navigation/Sidebar';
import Toast from '@/Components/ui/Toast';
import { useSidebarStore } from '@/hooks/useSidebarState';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types/models';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { flash } = usePage<PageProps>().props;
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const { isOpen, isCollapsed, toggle, collapse, close } = useSidebarStore();

    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ message: flash.error, type: 'error' });
        }
    }, [flash]);

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)]">
            <Sidebar
                isOpen={isOpen}
                isCollapsed={isCollapsed}
                onClose={close}
                onCollapse={collapse}
            />

            <main className={cn(
                'transition-all duration-300',
                isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
            )}>
                {children}
            </main>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
