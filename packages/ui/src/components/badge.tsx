import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cinenova-muted',
        className,
      )}
      {...props}
    />
  );
}
