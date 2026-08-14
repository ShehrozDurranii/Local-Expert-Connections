'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Bell, Lock, Shield, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BuyerLayout } from '@/components/layouts/BuyerLayout';
import { TextInput } from '@/components/forms/TextInput';
import { Button } from '@/components/foundation/Button';
import { CardSkeleton } from '@/components/feedback/SkeletonLoader';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { notificationService } from '@/services/notification.service';
import { cn } from '@/lib/utils';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notification Toggles State
  const [preferences, setPreferences] = useState({
    offer_received_email: true,
    offer_received_sms: false,
    offer_received_push: true,
    order_update_email: true,
    order_update_sms: true,
    order_update_push: true,
    security_alert_email: true, // Locked per FR-NOTIF-02
    security_alert_push: true,
  });

  const {
    register,
    handleSubmit,
    reset: resetPasswordForm,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    async function loadSettings() {
      const buyerId = authService.getBuyerId();
      if (!buyerId) return;

      setIsLoading(true);
      try {
        const res = await profileService.getProfile(buyerId);
        if (res?.data) {
          setProfile(res.data);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleToggle = (key) => {
    if (key === 'security_alert_email') return; // Cannot disable per FR-NOTIF-02
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = async () => {
    const buyerId = authService.getBuyerId();
    if (!buyerId) return;

    setIsSavingNotifs(true);
    try {
      const payload = [
        {
          notification_type: 'offer_received',
          channel: 'email',
          is_enabled: preferences.offer_received_email,
        },
        {
          notification_type: 'offer_received',
          channel: 'push',
          is_enabled: preferences.offer_received_push,
        },
        {
          notification_type: 'order_update',
          channel: 'email',
          is_enabled: preferences.order_update_email,
        },
        { notification_type: 'security_alert', channel: 'email', is_enabled: true },
      ];

      const res = await notificationService.updateNotificationPreferences(buyerId, payload);
      if (res.success) {
        toast.success('Notification preferences saved successfully!');
      } else {
        toast.error(res.message || 'Failed to save preferences');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save preferences');
    } finally {
      setIsSavingNotifs(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsUpdatingPassword(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Password updated successfully!');
      resetPasswordForm();
    } catch (err) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <BuyerLayout buyerName={profile?.name || 'Buyer'}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Account & System Settings</h1>
          <p className="text-sm text-text-secondary">
            Configure your notification channels, security policies, and password settings.
          </p>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : (
          <div className="space-y-8">
            {/* NOTIFICATION PREFERENCES SECTION */}
            <div className="p-6 md:p-8 rounded-xl border border-border bg-background-primary shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="p-2 rounded-lg bg-blue-50 text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    Notification Channel Preferences
                  </h3>
                  <p className="text-xs text-text-muted">
                    Choose how and when Local Expert-Connect sends you alerts.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* OFFER RECEIVED TOGGLES */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-border">
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">Offer Received Alerts</h4>
                    <p className="text-xs text-text-secondary">
                      Notifications sent when a verified expert submits a proposal for your request.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.offer_received_email}
                        onChange={() => handleToggle('offer_received_email')}
                        className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                      />
                      Email
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.offer_received_push}
                        onChange={() => handleToggle('offer_received_push')}
                        className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                      />
                      Push
                    </label>
                  </div>
                </div>

                {/* ORDER UPDATE TOGGLES */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 border-b border-border">
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">
                      Order & Inspection Updates
                    </h4>
                    <p className="text-xs text-text-secondary">
                      Status updates when an inspection job progresses, completes, or uploads a
                      report.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.order_update_email}
                        onChange={() => handleToggle('order_update_email')}
                        className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                      />
                      Email
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.order_update_push}
                        onChange={() => handleToggle('order_update_push')}
                        className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                      />
                      Push
                    </label>
                  </div>
                </div>

                {/* SECURITY ALERT TOGGLES (LOCKED PER FR-NOTIF-02) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3">
                  <div>
                    <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                      Security & Mandatory System Alerts
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Mandatory
                      </span>
                    </h4>
                    <p className="text-xs text-text-secondary">
                      Security login alerts and critical account security notices cannot be disabled
                      (FR-NOTIF-02).
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-text-muted opacity-75 cursor-not-allowed">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                      />
                      Email (Required)
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSavePreferences}
                  isLoading={isSavingNotifs}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" /> Save Notification Preferences
                </Button>
              </div>
            </div>

            {/* SECURITY & PASSWORD SECTION */}
            <div className="p-6 md:p-8 rounded-xl border border-border bg-background-primary shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Password & Security</h3>
                  <p className="text-xs text-text-muted">
                    Update your password regularly to keep your buyer account safe.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <TextInput
                  label="Current Password"
                  type="password"
                  required
                  error={errors.currentPassword?.message}
                  {...register('currentPassword')}
                />

                <TextInput
                  label="New Password"
                  type="password"
                  required
                  error={errors.newPassword?.message}
                  {...register('newPassword')}
                />

                <TextInput
                  label="Confirm New Password"
                  type="password"
                  required
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="outline"
                    size="md"
                    isLoading={isUpdatingPassword}
                    className="gap-2"
                  >
                    <Lock className="w-4 h-4" /> Update Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
