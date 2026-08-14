import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { STATUS_MAP } from '@/constants/status';

export function RequestCard({ request }) {
  const statusInfo = STATUS_MAP[request.status?.toLowerCase()] || {
    label: request.status || 'Draft',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const formattedDate = request.created_at
    ? new Date(request.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="p-6 rounded-xl border border-border bg-background-primary hover:border-primary/50 transition-all flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-lg text-text-primary line-clamp-1">{request.title}</h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
          >
            {statusInfo.label}
          </span>
        </div>

        <p className="text-sm text-text-secondary line-clamp-2 mb-4">
          {request.description || 'No description provided.'}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-text-muted mb-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold text-text-primary">
              PKR {Number(request.budget || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-secondary shrink-0" />
            <span>{request.city || 'Location unspecified'}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="w-4 h-4 text-text-disabled shrink-0" />
            <span>Posted on {formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Link
          href={`/requests/${request.request_id || request.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
