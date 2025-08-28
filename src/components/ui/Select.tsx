import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

const Select: React.FC<SelectProps> = ({ value, onValueChange, children, disabled, className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className={cn('relative', className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  
  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <svg
        className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const { isOpen } = React.useContext(SelectContext);
  
  if (!isOpen) return null;
  
  return (
    <div className={cn(
      'absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg',
      className
    )}>
      {children}
    </div>
  );
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children, className }) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext);
  
  return (
    <div
      className={cn(
        'relative flex cursor-pointer select-none items-center px-3 py-2 text-sm hover:bg-gray-100',
        className
      )}
      onClick={() => {
        onValueChange?.(value);
        setIsOpen(false);
      }}
    >
      {children}
    </div>
  );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);
  
  return (
    <span className="text-sm">
      {value || placeholder}
    </span>
  );
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };