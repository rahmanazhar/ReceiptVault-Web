import {
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronUpDownIcon,
} from '@heroicons/react/24/outline';

interface SortHeaderProps {
    column: string;
    label: string;
    sorting: { sort_by: string; sort_dir: 'asc' | 'desc' };
    onSort: (column: string) => void;
    align?: 'left' | 'center' | 'right';
}

export default function SortHeader({ column, label, sorting, onSort, align = 'left' }: SortHeaderProps) {
    const isActive = sorting.sort_by === column;
    const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

    return (
        <th className={`text-${align} text-xs font-medium uppercase px-4 py-3`}>
            <button
                onClick={() => onSort(column)}
                className={`inline-flex items-center gap-1 ${alignClass} hover:text-[var(--color-text-primary)] transition-colors ${
                    isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
                }`}
            >
                {label}
                {isActive ? (
                    sorting.sort_dir === 'asc'
                        ? <ChevronUpIcon className="h-3.5 w-3.5" />
                        : <ChevronDownIcon className="h-3.5 w-3.5" />
                ) : (
                    <ChevronUpDownIcon className="h-3.5 w-3.5 opacity-40" />
                )}
            </button>
        </th>
    );
}
