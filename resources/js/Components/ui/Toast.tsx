import { useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const styles = {
        success: 'border-[var(--color-success)]/30 bg-[var(--color-success-muted)]',
        error: 'border-[var(--color-error)]/30 bg-[var(--color-error-muted)]',
        warning: 'border-[var(--color-warning)]/30 bg-[var(--color-warning-muted)]',
        info: 'border-[var(--color-info)]/30 bg-[var(--color-info-muted)]',
    };

    const icons = {
        success: <CheckCircleIcon className="h-5 w-5 text-[var(--color-success)]" />,
        error: <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-error)]" />,
        warning: <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning)]" />,
        info: <CheckCircleIcon className="h-5 w-5 text-[var(--color-info)]" />,
    };

    return (
        <div
            className={cn(
                'fixed top-4 left-4 right-4 sm:left-auto sm:max-w-sm z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg',
                'animate-[slideIn_0.2s_ease-out]',
                styles[type]
            )}
        >
            {icons[type]}
            <p className="text-sm text-[var(--color-text-primary)]">{message}</p>
            <button onClick={onClose} className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                <XMarkIcon className="h-4 w-4" />
            </button>
        </div>
    );
}
