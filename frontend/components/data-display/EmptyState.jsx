import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/foundation/Button';

export function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl border border-dashed border-border bg-background-primary">
      <div className="p-4 rounded-full bg-blue-50 text-primary mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
