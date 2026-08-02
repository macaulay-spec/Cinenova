import { cn } from '../cn';

/** CineNova wordmark: "Cine" in ivory, "Nova" in amber-red. Uppercase, wide tracking. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('wordmark text-foreground', className)}>
      <span className="text-foreground">Cine</span>
      <span className="text-primary">Nova</span>
    </span>
  );
}
