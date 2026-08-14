'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BuyerLayout } from '@/components/layouts/BuyerLayout';
import { RequestCard } from '@/components/marketplace/RequestCard';
import { EmptyState } from '@/components/data-display/EmptyState';
import { Pagination } from '@/components/navigation/Pagination';
import { CardSkeleton } from '@/components/feedback/SkeletonLoader';
import { Button } from '@/components/foundation/Button';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { requestService } from '@/services/request.service';
import { Search, Plus, FileText, Filter, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'offered', label: 'Offered' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'closed', label: 'Closed' },
];

export default function RequestsPage() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async (page = 1, status = '') => {
    const buyerId = authService.getBuyerId();
    if (!buyerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;

      const response = await requestService.getBuyerRequests(buyerId, params);

      if (response?.data) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }

      if (response?.pagination) {
        setPagination({
          page: response.pagination.page || page,
          limit: response.pagination.limit || 10,
          total: response.pagination.total || 0,
          totalPages: response.pagination.total_pages || 1,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const buyerId = authService.getBuyerId();
      if (buyerId) {
        profileService
          .getProfile(buyerId)
          .then((res) => setProfile(res?.data))
          .catch(() => null);
      }
      fetchRequests(1, selectedStatus);
    }
    init();
  }, [fetchRequests, selectedStatus]);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    fetchRequests(1, newStatus);
  };

  const handlePageChange = (newPage) => {
    fetchRequests(newPage, selectedStatus);
  };

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.title?.toLowerCase().includes(query) ||
      r.category?.toLowerCase().includes(query) ||
      r.city?.toLowerCase().includes(query)
    );
  });

  return (
    <BuyerLayout buyerName={profile?.name || 'Buyer'}>
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Requests</h1>
            <p className="text-sm text-text-secondary">
              View, search, and manage all your field service and inspection requests.
            </p>
          </div>
          <Link href="/requests/create">
            <Button variant="primary" size="md" className="gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Create Request
            </Button>
          </Link>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl bg-background-primary border border-border shadow-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, category, or city..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-border bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-disabled"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Filter className="w-4 h-4 text-text-muted shrink-0" />
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="w-full sm:w-44 py-2 px-3 text-sm rounded-md border border-border bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-error text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchRequests(1, selectedStatus)}>
              Retry
            </Button>
          </div>
        )}

        {/* REQUESTS LIST GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={selectedStatus ? `No ${selectedStatus} requests found` : 'No requests found'}
            description={
              selectedStatus
                ? 'Try selecting a different status filter or clear your search query.'
                : 'You have not submitted any service requests yet.'
            }
            actionLabel="Create New Request"
            onAction={() => (window.location.href = '/requests/create')}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((req) => (
                <RequestCard key={req.request_id || req.id} request={req} />
              ))}
            </div>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
