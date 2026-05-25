import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AdminEntityListItemProps = {
  selected: boolean;
  onClick?: () => void;
  title: string;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function AdminEntityListItem({
  selected,
  onClick,
  title,
  subtitle,
  leading,
  trailing,
}: AdminEntityListItemProps) {
  const itemClass = cn(
    'w-full rounded-lg border p-3 text-left text-sm transition-colors',
    onClick ? 'hover:bg-muted/60' : '',
    selected && 'bg-accent/50 ring-2 ring-primary/40'
  );

  const content = (
    <div className="flex items-center gap-3">
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );

  if (!onClick) {
    return <div className={itemClass}>{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} className={itemClass}>
      {content}
    </button>
  );
}
