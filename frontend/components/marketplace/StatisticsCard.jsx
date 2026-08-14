import React from 'react';

export function StatisticsCard({
  title,
  value,
  icon: Icon,
  colorClass = 'bg-blue-50 text-primary',
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-background-primary flex items-center justify-between shadow-xs">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
          {title}
        </p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary">{value}</h3>
      </div>
      {Icon && (
        <div className={`p-3 rounded-lg ${colorClass} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
