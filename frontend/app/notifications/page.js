'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Bell, Tag, ShieldCheck, CheckCircle2, ArrowRight, Check } from 'lucide-react';
import { BuyerLayout } from '@/components/layouts/BuyerLayout';
import { EmptyState } from '@/components/data-display/EmptyState';
import { CardSkeleton } from '@/components/feedback/SkeletonLoader';
import { Button } from '@/components/foundation/Button';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { notificationService } from '@/services/notification.service';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const buyerId = authService.getBuyerId();
      if (!buyerId) return;

      setIsLoading(true);
      try {
        profileService
          .getProfile(buyerId)
          .then((res) => setProfile(res?.data))
          .catch(() => null);

        const res = await notificationService.getNotifications(buyerId);
        if (res?.data) {
          setNotifications(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'offer_received':
        return <Tag className="w-5 h-5 text-primary" />;
      case 'security_alert':
        return <ShieldCheck className="w-5 h-5 text-warning" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <BuyerLayout buyerName={profile?.name || 'Buyer'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-primary text-white">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary">
              Stay updated on your request offers, orders, and security alerts.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-1.5 shrink-0"
            >
              <Check className="w-4 h-4" /> Mark All as Read
            </Button>
          )}
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors',
              activeFilter === 'all'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-slate-100 hover:text-text-primary'
            )}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors',
              activeFilter === 'unread'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-slate-100 hover:text-text-primary'
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* NOTIFICATIONS LIST */}
        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description="When you receive expert offers or order updates, they will appear here."
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'p-4 md:p-5 rounded-xl border transition-all flex items-start gap-4 shadow-xs',
                  notif.is_read
                    ? 'border-border bg-background-primary'
                    : 'border-blue-200 bg-blue-50/40'
                )}
              >
                <div className="p-2.5 rounded-lg bg-background-primary border border-border shrink-0 shadow-2xs">
                  {getNotifIcon(notif.notification_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                      {notif.title}
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                      )}
                    </h4>
                    <span className="text-xs text-text-muted shrink-0">
                      {notif.created_at
                        ? new Date(notif.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed">{notif.message}</p>

                  {notif.link && (
                    <div className="mt-3">
                      <Link
                        href={notif.link}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
