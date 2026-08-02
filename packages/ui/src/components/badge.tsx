import type { ReactNode } from 'react';
import { cn } from '../cn';

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider ring-1 ring-inset ring-border text-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}
