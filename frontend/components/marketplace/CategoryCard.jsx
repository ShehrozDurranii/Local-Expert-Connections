import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CategoryCard({ icon: Icon, title, description, count }) {
  return (
    <div className="group p-6 rounded-lg border border-border bg-background-primary hover:border-primary hover:shadow-md transition-all">
      <div className="w-12 h-12 rounded-md bg-blue-50 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-4">{description}</p>
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs font-medium text-text-muted group-hover:text-primary">
        <span>{count ? `${count} experts` : 'Explore'}</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
