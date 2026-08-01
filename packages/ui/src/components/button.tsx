import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-cinenova-accent text-white shadow-glow hover:bg-cinenova-accent-strong focus-visible:outline-cinenova-accent',
  secondary:
    'bg-white/10 text-cinenova-ivory ring-1 ring-white/15 hover:bg-white/15 focus-visible:outline-cinenova-accent',
  ghost: 'bg-transparent text-cinenova-ivory hover:bg-white/10 focus-visible:outline-cinenova-accent',
  danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-300',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}

export interface AnchorButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function AnchorButton({ className, variant = 'primary', ...props }: AnchorButtonProps) {
  return (
    <a
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
