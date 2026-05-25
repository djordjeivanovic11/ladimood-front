import type { LucideIcon } from 'lucide-react';

interface AccountSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function AccountSectionHeader({
  icon: Icon,
  title,
  description,
}: AccountSectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1 text-left">
        <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}
