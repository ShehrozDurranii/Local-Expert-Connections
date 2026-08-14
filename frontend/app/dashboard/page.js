'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BuyerLayout } from '@/components/layouts/BuyerLayout';
import { StatisticsCard } from '@/components/marketplace/StatisticsCard';
import { RequestCard } from '@/components/marketplace/RequestCard';
import { EmptyState } from '@/components/data-display/EmptyState';
import { CardSkeleton } from '@/components/feedback/SkeletonLoader';
import { Button } from '@/components/foundation/Button';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { requestService } from '@/services/request.service';
import { FileText, Tag, CheckCircle2, Plus, Clock, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      const buyerId = authService.getBuyerId();
      if (!buyerId) return;

      setIsLoading(true);
      setError(null);

      try {
        const profileRes = await profileService.getProfile(buyerId).catch(() => null);
        if (profileRes?.data) {
          setProfile(profileRes.data);
        }

        const requestsRes = await requestService.getBuyerRequests(buyerId).catch(() => null);
        if (requestsRes?.data) {
          setRequests(requestsRes.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalRequests = requests.length;
  const activeRequests = requests.filter((r) =>
    ['submitted', 'offered', 'accepted', 'in_progress', 'funded'].includes(r.status?.toLowerCase())
  ).length;
  const completedServices = requests.filter((r) => r.status?.toLowerCase() === 'completed').length;

  return (
    <BuyerLayout buyerName={profile?.name || 'Buyer'}>
      <div className="space-y-8">
        {/* WELCOME BANNER & QUICK ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {profile?.name || 'Valued Buyer'} 👋
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Manage your local inspection requests, review expert quotes, and track active orders.
            </p>
          </div>
          <Link href="/requests/create">
            <Button variant="secondary" size="md" className="font-semibold gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Create Request
            </Button>
          </Link>
        </div>

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatisticsCard
            title="Total Requests"
            value={isLoading ? '...' : totalRequests}
            icon={FileText}
            colorClass="bg-blue-50 text-primary"
          />
          <StatisticsCard
            title="Active Requests"
            value={isLoading ? '...' : activeRequests}
            icon={Clock}
            colorClass="bg-amber-50 text-warning"
          />
          <StatisticsCard
            title="Offers Received"
            value={isLoading ? '...' : '0'}
            icon={Tag}
            colorClass="bg-indigo-50 text-indigo-600"
          />
          <StatisticsCard
            title="Completed Services"
            value={isLoading ? '...' : completedServices}
            icon={CheckCircle2}
            colorClass="bg-emerald-50 text-success"
          />
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

        {/* RECENT REQUESTS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">Recent Requests</h2>
            {requests.length > 0 && (
              <Link href="/requests" className="text-sm font-semibold text-primary hover:underline">
                View All Requests &rarr;
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Requests Created Yet"
              description="You haven't posted any inspection or verification requests yet. Post a request to receive offers from verified experts."
              actionLabel="Create Your First Request"
              onAction={() => (window.location.href = '/requests/create')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.slice(0, 4).map((req) => (
                <RequestCard key={req.request_id || req.id} request={req} />
              ))}
            </div>
          )}
        </div>
      </div>
    </BuyerLayout>
  );
}
