'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Tag, ArrowRight, Filter } from 'lucide-react';
import { BuyerLayout } from '@/components/layouts/BuyerLayout';
import { OfferCard } from '@/components/marketplace/OfferCard';
import { EmptyState } from '@/components/data-display/EmptyState';
import { CardSkeleton } from '@/components/feedback/SkeletonLoader';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { offerService } from '@/services/offer.service';

export default function OffersPage() {
  const [profile, setProfile] = useState(null);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      const buyerId = authService.getBuyerId();
      if (!buyerId) return;

      setIsLoading(true);
      try {
        profileService
          .getProfile(buyerId)
          .then((res) => setProfile(res?.data))
          .catch(() => null);

        // Fetch received offers
        const res = await offerService.getOffersForRequest('demo-request-123');
        if (res?.data) {
          setOffers(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load offers');
      } finally {
        setIsLoading(false);
      }
    }

    loadOffers();
  }, []);

  const handleAcceptOffer = async (offerId) => {
    try {
      const res = await offerService.acceptOffer(offerId);
      toast.success(res.message || 'Offer accepted!');
      setOffers((prev) =>
        prev.map((o) =>
          o.offer_id === offerId || o.id === offerId ? { ...o, status: 'accepted' } : o
        )
      );
    } catch (err) {
      toast.error('Failed to accept offer');
    }
  };

  const handleDeclineOffer = async (offerId) => {
    try {
      const res = await offerService.declineOffer(offerId);
      toast.success(res.message || 'Offer declined');
      setOffers((prev) =>
        prev.map((o) =>
          o.offer_id === offerId || o.id === offerId ? { ...o, status: 'declined' } : o
        )
      );
    } catch (err) {
      toast.error('Failed to decline offer');
    }
  };

  return (
    <BuyerLayout buyerName={profile?.name || 'Buyer'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Received Expert Offers</h1>
          <p className="text-sm text-text-secondary">
            Review price quotes and proposals submitted by verified local experts.
          </p>
        </div>

        {/* OFFERS LIST */}
        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : offers.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No Received Offers Yet"
            description="When local experts submit proposals for your inspection requests, they will appear here."
            actionLabel="View Active Requests"
            onAction={() => (window.location.href = '/requests')}
          />
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.offer_id || offer.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-text-muted px-1">
                  <span>
                    Request:{' '}
                    <strong className="text-text-primary">Pre-Purchase Vehicle Inspection</strong>
                  </span>
                  <Link
                    href="/requests/demo-request-123"
                    className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View Full Request <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <OfferCard
                  offer={offer}
                  onAccept={() => handleAcceptOffer(offer.offer_id || offer.id)}
                  onDecline={() => handleDeclineOffer(offer.offer_id || offer.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
