import { Star } from 'lucide-react';
import { cn } from '../cn';

interface RatingStarsProps {
  /** 0–10 rating (e.g. IMDb). Rendered as a single gold star + numeric value. */
  value?: string | number | null;
  className?: string;
}

/** Gold star rating chip. The only place the reserved `gold` token appears. */
export function RatingStars({ value, className }: RatingStarsProps) {
  const parsed = typeof value === 'number' ? value : value ? Number.parseFloat(String(value)) : NaN;
  const show = Number.isFinite(parsed) && parsed > 0;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold text-gold', className)}>
      <Star aria-hidden="true" className="h-4 w-4 fill-gold text-gold" />
      {show ? <span>{parsed.toFixed(1)}</span> : <span>N/A</span>}
    </span>
  );
}
