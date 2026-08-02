import type { CSSProperties } from 'react';
import { cn } from '../cn';

interface AvatarProps {
  initial: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tint?: string;
  selected?: boolean;
  className?: string;
}

const sizeClass = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl',
  xl: 'h-24 w-24 text-3xl sm:h-28 sm:w-28 sm:text-4xl',
};

/** Circular profile avatar with a per-profile dark tinted hue. */
export function Avatar({ initial, size = 'md', tint = '#5a4a3a', selected, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'grid place-items-center rounded-full font-display leading-none',
        sizeClass[size],
        selected ? 'ring-2 ring-primary' : 'ring-1 ring-border',
        className,
      )}
      style={{ backgroundColor: tint } as CSSProperties}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
