import React from 'react';
import { cn } from '@/lib/utils';

export const TextInput = React.forwardRef(
  ({ label, error, helperText, required, className, id, type = 'text', ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label} {required && <span className="text-error">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-border bg-background-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all',
            error && 'border-error focus:ring-error',
            className
          )}
          {...props}
        />
        {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
        {error && <p className="text-xs text-error font-medium">{error}</p>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
