import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ 
    value, 
    defaultValue = [0], 
    onValueChange, 
    max = 100, 
    min = 0, 
    step = 1, 
    disabled = false, 
    className,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || defaultValue);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const currentValue = value || internalValue;
    
    const updateValue = (clientX: number) => {
      if (!sliderRef.current) return;
      
      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newValue = min + percentage * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      
      const updatedValue = [clampedValue];
      setInternalValue(updatedValue);
      onValueChange?.(updatedValue);
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return;
      setIsDragging(true);
      updateValue(e.clientX);
    };
    
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          updateValue(e.clientX);
        }
      };
      
      const handleMouseUp = () => {
        setIsDragging(false);
      };
      
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging]);
    
    const percentage = ((currentValue[0] - min) / (max - min)) * 100;
    
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        {...props}
      >
        <div
          ref={sliderRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200 cursor-pointer"
          onMouseDown={handleMouseDown}
        >
          <div 
            className="absolute h-full bg-blue-600 transition-all"
            style={{ width: `${percentage}%` }}
          />
          <div
            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-blue-600 shadow-lg transition-all hover:scale-110"
            style={{ left: `calc(${percentage}% - 10px)` }}
          />
        </div>
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };