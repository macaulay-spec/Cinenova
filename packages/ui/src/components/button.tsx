import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '../cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';

const base =
  'inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-bold transition-[color,opacity,background-color] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50';

const variantClass: Record<ButtonVariant, string> = {
  // Solid amber-red primary action
  primary: 'bg-primary text-primary-foreground hover:opacity-80',
  // Translucent bordered (hero secondary action)
  secondary: 'bg-white/5 text-foreground ring-1 ring-inset ring-border hover:bg-white/10',
  // Ghost bordered (tertiary action)
  ghost: 'bg-transparent text-foreground ring-1 ring-inset ring-border hover:bg-white/5',
  // Inert track / soft button
  outline: 'bg-secondary text-foreground hover:opacity-80',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(base, variantClass[variant], className)} {...props} />
  );
}

export interface AnchorButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function AnchorButton({ className, variant = 'primary', ...props }: AnchorButtonProps) {
  return (
    <a className={cn(base, variantClass[variant], className)} {...props} />
  );
}
