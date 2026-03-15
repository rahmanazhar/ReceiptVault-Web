import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip';

interface HelpTooltipProps {
    text: string;
    className?: string;
}

export default function HelpTooltip({ text, className = '' }: HelpTooltipProps) {
    return (
        <Tooltip content={text} position="top">
            <QuestionMarkCircleIcon
                className={`h-4 w-4 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors cursor-help ${className}`}
            />
        </Tooltip>
    );
}
