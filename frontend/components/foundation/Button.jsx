import React from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-md',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
        outline: 'border border-border bg-transparent text-text-primary hover:bg-slate-50',
        ghost: 'bg-transparent text-text-primary hover:bg-slate-100',
        danger: 'bg-error text-white hover:bg-red-700 active:bg-red-800',
        success: 'bg-success text-white hover:bg-emerald-700 active:bg-emerald-800',
      },
      size: {
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-10 px-4 text-base gap-2',
        lg: 'h-12 px-6 text-lg gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const Button = React.forwardRef(
  ({ className, variant, size, isLoading, children, disabled, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
