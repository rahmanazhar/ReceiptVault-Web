import Button from './Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {icon && <div className="mb-4 text-[var(--color-text-muted)]">{icon}</div>}
            <h3 className="text-lg font-medium text-[var(--color-text-primary)]">{title}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-sm">{description}</p>
            {action && (
                <Button onClick={action.onClick} className="mt-4">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
