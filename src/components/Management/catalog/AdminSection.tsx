import type { ReactNode } from 'react';

type AdminSectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function AdminSection({ title, action, children }: AdminSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-semibold">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  );
}
