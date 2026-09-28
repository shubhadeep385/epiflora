import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-forest-700 text-white hover:bg-forest-600 active:bg-forest-800',
  secondary:
    'bg-surface text-forest-700 ring-1 ring-inset ring-forest-200 hover:bg-forest-50 active:bg-forest-100',
  ghost: 'text-forest-700 hover:bg-forest-50',
  danger: 'bg-risk-high text-white hover:brightness-110',
};

/* min-h keeps every target at or above the 44px touch guideline. */
const SIZES: Record<Size, string> = {
  md: 'min-h-11 px-4 text-sm gap-2',
  lg: 'min-h-13 px-6 text-base gap-2.5',
};

const BASE =
  'inline-flex items-center justify-center rounded-xl font-medium transition-[background-color,box-shadow,filter] duration-150 disabled:cursor-not-allowed disabled:opacity-55';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

function classes({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: Omit<CommonProps, 'children'>): string {
  return [BASE, VARIANTS[variant], SIZES[size], fullWidth ? 'w-full' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

export function Button({ variant, size, fullWidth, className, children, ...rest }: ButtonProps) {
  return (
    <button {...rest} className={classes({ variant, size, fullWidth, className })}>
      {children}
    </button>
  );
}

interface ButtonLinkProps extends CommonProps {
  to: string;
}

export function ButtonLink({ to, variant, size, fullWidth, className, children }: ButtonLinkProps) {
  return (
    <Link to={to} className={classes({ variant, size, fullWidth, className })}>
      {children}
    </Link>
  );
}
