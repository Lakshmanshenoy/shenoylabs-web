'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      {
        variants: {
          variant: {
            default: 'bg-primary text-white hover:bg-primary-400',
            outline: 'border border-border bg-white text-foreground hover:bg-background',
            ghost: 'bg-transparent hover:bg-zinc-100',
          },
          size: {
            sm: 'h-8 px-3',
            default: 'h-10 px-4',
            lg: 'h-12 px-6',
          },
        },
        defaultVariants: {
          variant: 'default',
          size: 'default',
        },
      }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  }
);

Button.displayName = 'Button';
