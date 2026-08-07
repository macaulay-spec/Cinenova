import type { ReactNode } from 'react';
import { AlertTriangle, CloudOff, Loader2, SearchX, UserX } from 'lucide-react';
import { cn } from '../cn';

export type StateKind = 'loading' | 'empty' | 'error' | 'offline' | 'unauthorized';

interface StateCardProps {
  kind: StateKind;
  title: string;
  description?: string;
  /** e.g. error code, shown only in expandable details. */
  detail?: string;
  children?: ReactNode;
  className?: string;
}

const ICONS: Record<StateKind, typeof Loader2> = {
  loading: Loader2,
  empty: SearchX,
  error: AlertTriangle,
  offline: CloudOff,
  unauthorized: UserX,
};

/**
 * Reusable UI state card covering the five product states: loading (skeleton),
 * empty, error (with retry/back), offline, and unauthorized. Color is never the
 * only indicator — every state has a clear icon + title + action.
 */
export function StateCard({ kind, title, description, detail, children, className }: StateCardProps) {
  const Icon = ICONS[kind];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-md border border-border bg-surface p-10 text-center',
        className,
      )}
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live={kind === 'loading' ? 'polite' : 'assertive'}
    >
      {kind === 'loading' ? (
        <Loader2 aria-hidden="true" className="h-8 w-8 animate-spin text-primary" />
      ) : (
        <Icon aria-hidden="true" className="h-8 w-8 text-muted" />
      )}
      <div className="space-y-1">
        <p className="font-display text-lg text-foreground">{title}</p>
        {description ? <p className="mx-auto max-w-sm text-sm text-muted">{description}</p> : null}
      </div>
      {detail ? (
        <details className="text-left text-xs text-muted">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-md bg-black/30 p-3">{detail}</pre>
        </details>
      ) : null}
      {children ? <div className="flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}
