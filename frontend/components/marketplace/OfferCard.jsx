import React from 'react';
import { DollarSign, Clock, Star, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/foundation/Button';

export function OfferCard({ offer, onAccept, onDecline, isProcessing }) {
  const expertName = offer.expert_name || offer.expert?.name || 'Local Expert';
  const price = offer.price || offer.offered_price || 0;
  const status = offer.status?.toLowerCase() || 'pending';

  return (
    <div className="p-6 rounded-xl border border-border bg-background-primary shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
            {expertName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-text-primary text-base">{expertName}</h4>
            <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" /> {offer.rating || '4.9'}
              </span>
              <span>•</span>
              <span>{offer.completed_jobs || '12'} jobs completed</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <div className="text-xs text-text-muted">Price Quote</div>
            <div className="text-xl font-extrabold text-primary flex items-center justify-end">
              <DollarSign className="w-5 h-5 shrink-0" />
              <span>PKR {Number(price).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-sm text-text-secondary leading-relaxed">
        {offer.notes || offer.proposal_text || 'No proposal notes provided.'}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs">
        <div className="flex items-center gap-2 text-text-muted">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span>
            Proposed Timeline:{' '}
            <strong className="text-text-primary">{offer.delivery_days || '3'} days</strong>
          </span>
        </div>

        {status === 'pending' && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-error hover:bg-red-50"
              onClick={() => onDecline(offer.offer_id || offer.id)}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4 mr-1" /> Decline
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={() => onAccept(offer.offer_id || offer.id)}
              isLoading={isProcessing}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Accept Offer
            </Button>
          </div>
        )}

        {status === 'accepted' && (
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs">
            ✓ Accepted
          </span>
        )}

        {status === 'declined' && (
          <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-bold border border-red-200 text-xs">
            Declined
          </span>
        )}
      </div>
    </div>
  );
}
