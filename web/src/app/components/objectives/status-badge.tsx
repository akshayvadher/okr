import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'on-track' | 'at-risk' | 'behind';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    'on-track': {
      color: 'bg-green-100 text-green-800',
      label: 'On Track'
    },
    'at-risk': {
      color: 'bg-yellow-100 text-yellow-800',
      label: 'At Risk'
    },
    'behind': {
      color: 'bg-red-100 text-red-800',
      label: 'Behind'
    }
  };

  const { color, label } = statusConfig[status];

  return (
      <span
          className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              color,
              className
          )}
      >
      {label}
    </span>
  );
}
