import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/80', className)} {...props} />;
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-border bg-background-primary space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
