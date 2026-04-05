import React from 'react';
import { cn } from '../../lib/utils';

export default function Card({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('rounded-lg border border-zinc-100 bg-white p-4 shadow-sm', className)}>
      {children}
    </div>
  );
}
