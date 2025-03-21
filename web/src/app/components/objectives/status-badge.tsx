import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'on-track' | 'at-risk' | 'behind';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    'on-track': {
      color: 'bg-green-50 text-green-700',
      label: 'On Track',
    },
    'at-risk': {
      color: 'bg-yellow-50 text-yellow-700',
      label: 'At Risk',
    },
    behind: {
      color: 'bg-red-50 text-red-700',
      label: 'Behind',
    },
  };

  const { color, label } = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors duration-200',
        color,
        className,
      )}
    >
      {label}
    </span>
  );
}
