'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Ban,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { BuyerLayout } from '@/components/layouts/BuyerLayout';
import { OfferCard } from '@/components/marketplace/OfferCard';
import { EmptyState } from '@/components/data-display/EmptyState';
import { CardSkeleton } from '@/components/feedback/SkeletonLoader';
import { Button } from '@/components/foundation/Button';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { requestService } from '@/services/request.service';
import { offerService } from '@/services/offer.service';
import { STATUS_MAP } from '@/constants/status';

export default function RequestDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const requestId = unwrappedParams.id;
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      const buyerId = authService.getBuyerId();
      if (!buyerId) return;

      setIsLoading(true);
      setError(null);

      try {
        profileService
          .getProfile(buyerId)
          .then((res) => setProfile(res?.data))
          .catch(() => null);

        const reqRes = await requestService.getRequestById(requestId);
        if (reqRes?.data) {
          setRequest(reqRes.data);
        }

        const offersRes = await offerService.getOffersForRequest(requestId).catch(() => null);
        if (offersRes?.data) {
          setOffers(offersRes.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load request details');
      } finally {
        setIsLoading(false);
      }
    }

    if (requestId) {
      loadData();
    }
  }, [requestId]);

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this service request?')) return;
    setIsProcessing(true);
    try {
      const res = await requestService.cancelRequest(requestId);
      toast.success(res.message || 'Request cancelled successfully');
      setRequest((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    setIsProcessing(true);
    try {
      const res = await offerService.acceptOffer(offerId);
      toast.success(res.message || 'Offer accepted! Order created.');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept offer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineOffer = async (offerId) => {
    setIsProcessing(true);
    try {
      const res = await offerService.declineOffer(offerId);
      toast.success(res.message || 'Offer declined');
      setOffers((prev) =>
        prev.map((o) =>
          o.offer_id === offerId || o.id === offerId ? { ...o, status: 'declined' } : o
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline offer');
    } finally {
      setIsProcessing(false);
    }
  };

  const statusInfo = request
    ? STATUS_MAP[request.status?.toLowerCase()] || {
        label: request.status || 'Draft',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      }
    : null;

  return (
    <BuyerLayout buyerName={profile?.name || 'Buyer'}>
      <div className="space-y-8">
        {/* HEADER & BREADCRUMB */}
        <div>
          <Link
            href="/requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Requests
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">
                {request?.title || 'Service Request Details'}
              </h1>
              {statusInfo && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}
                >
                  {statusInfo.label}
                </span>
              )}
            </div>

            {request && ['draft', 'submitted'].includes(request.status?.toLowerCase()) && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-error hover:bg-red-50 gap-2 shrink-0"
                onClick={handleCancelRequest}
                isLoading={isProcessing}
              >
                <Ban className="w-4 h-4" /> Cancel Request
              </Button>
            )}
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-error text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* REQUEST SUMMARY CARD */}
        {isLoading ? (
          <CardSkeleton />
        ) : request ? (
          <div className="p-6 md:p-8 rounded-xl border border-border bg-background-primary shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-border">
              <div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Target Budget
                </div>
                <div className="text-xl font-extrabold text-primary flex items-center">
                  <DollarSign className="w-5 h-5" />
                  <span>PKR {Number(request.budget || 0).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Location / City
                </div>
                <div className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-secondary" />
                  <span>{request.city || 'Location unspecified'}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Desired Deadline
                </div>
                <div className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-secondary" />
                  <span>
                    {request.timeline
                      ? new Date(request.timeline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Flexible'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                Detailed Description
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {request.description || 'No description provided.'}
              </p>
            </div>

            {request.item_links && (
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Reference / Item Link
                </h4>
                <a
                  href={request.item_links}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  {request.item_links} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        ) : null}

        {/* OFFERS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> Received Expert Offers ({offers.length})
            </h2>
          </div>

          {isLoading ? (
            <CardSkeleton />
          ) : offers.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No Offers Received Yet"
              description="Local experts in your city are currently reviewing your request. Offers will appear here as soon as they submit proposals."
            />
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <OfferCard
                  key={offer.offer_id || offer.id}
                  offer={offer}
                  onAccept={handleAcceptOffer}
                  onDecline={handleDeclineOffer}
                  isProcessing={isProcessing}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </BuyerLayout>
  );
}
