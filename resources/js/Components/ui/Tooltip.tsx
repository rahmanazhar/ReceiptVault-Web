import { useState, useRef, type ReactNode } from 'react';

interface TooltipProps {
    children: ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export default function Tooltip({ children, content, position = 'top', delay = 200 }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = () => {
        timerRef.current = setTimeout(() => setVisible(true), delay);
    };

    const hide = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setVisible(false);
    };

    const positionClasses: Record<string, string> = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses: Record<string, string> = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-bg-active)] border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-bg-active)] border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-bg-active)] border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-bg-active)] border-y-transparent border-l-transparent',
    };

    return (
        <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
            {children}
            {visible && content && (
                <div
                    className={`absolute z-50 pointer-events-none ${positionClasses[position]}`}
                    role="tooltip"
                >
                    <div className="whitespace-nowrap rounded-lg bg-[var(--color-bg-active)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-primary)] shadow-lg border border-[var(--color-border)] animate-[tooltipFadeIn_0.15s_ease-out]">
                        {content}
                    </div>
                    <div className={`absolute border-4 ${arrowClasses[position]}`} />
                </div>
            )}
        </div>
    );
}
