import React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        id={id}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white',
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        ref={ref}
        {...props}
      >
        {checked && (
          <svg
            className="h-3 w-3 fill-current"
            viewBox="0 0 12 12"
          >
            <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        )}
      </button>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };