'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { User, Mail, Phone, Globe, Bell, Save, ShieldCheck } from 'lucide-react';
import { BuyerLayout } from '@/components/layouts/BuyerLayout';
import { TextInput } from '@/components/forms/TextInput';
import { Button } from '@/components/foundation/Button';
import { CardSkeleton } from '@/components/feedback/SkeletonLoader';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  photo_url: z.string().optional(),
  languages: z.string().min(1, 'Please specify your preferred languages'),
  contact_preferences: z.string().min(1, 'Please specify contact preferences'),
});

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      photo_url: '',
      languages: 'en,ur',
      contact_preferences: 'email,push',
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      const buyerId = authService.getBuyerId();
      if (!buyerId) return;

      setIsLoading(true);
      try {
        const res = await profileService.getProfile(buyerId);
        if (res?.data) {
          setProfile(res.data);
          reset({
            name: res.data.name || '',
            photo_url: res.data.photo_url || '',
            languages: res.data.languages || 'en,ur',
            contact_preferences: res.data.contact_preferences || 'email,push',
          });
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    const buyerId = authService.getBuyerId();
    if (!buyerId) return;

    setIsSaving(true);
    try {
      const payload = {
        name: data.name,
        photo_url: data.photo_url || null,
        languages: data.languages,
        contact_preferences: data.contact_preferences,
      };

      const res = await profileService.updateProfile(buyerId, payload);
      if (res.success) {
        toast.success(res.message || 'Profile updated successfully!');
        setProfile((prev) => (prev ? { ...prev, ...payload } : null));
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'B';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <BuyerLayout buyerName={profile?.name || 'Buyer'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Buyer Profile</h1>
          <p className="text-sm text-text-secondary">
            Manage your personal profile, languages, and contact preferences.
          </p>
        </div>

        {isLoading ? (
          <CardSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PROFILE SIDE CARD */}
            <div className="p-6 rounded-xl border border-border bg-background-primary shadow-xs flex flex-col items-center text-center space-y-4 h-fit">
              <div className="w-24 h-24 rounded-full bg-primary text-white font-black text-2xl flex items-center justify-center shadow-md">
                {getInitials(profile?.name)}
              </div>

              <div>
                <h3 className="font-bold text-lg text-text-primary">
                  {profile?.name || 'Ahmed Khan'}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {profile?.email || 'ahmed.khan@mail.com'}
                </p>
              </div>

              <div className="w-full pt-4 border-t border-border space-y-2 text-xs text-left">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Account Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 capitalize">
                    {profile?.status || 'Active'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Member Since:</span>
                  <span className="font-medium text-text-primary">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Jan 2026'}
                  </span>
                </div>
              </div>
            </div>

            {/* EDIT PROFILE FORM */}
            <div className="lg:col-span-2 p-6 md:p-8 rounded-xl border border-border bg-background-primary shadow-xs">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <h3 className="text-base font-bold text-text-primary border-b border-border pb-3">
                  Personal Information
                </h3>

                <TextInput
                  label="Full Name"
                  required
                  error={errors.name?.message}
                  {...register('name')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput
                    label="Email Address"
                    value={profile?.email || ''}
                    disabled
                    helperText="Email is linked to your account login"
                  />

                  <TextInput
                    label="Phone Number"
                    value={profile?.phone || ''}
                    disabled
                    helperText="Phone number is verified"
                  />
                </div>

                <h3 className="text-base font-bold text-text-primary border-b border-border pb-3 pt-2">
                  Preferences & Localization
                </h3>

                <TextInput
                  label="Preferred Languages"
                  placeholder="e.g. en,ur,ps"
                  helperText="Comma-separated language codes (e.g. en for English, ur for Urdu)"
                  error={errors.languages?.message}
                  {...register('languages')}
                />

                <TextInput
                  label="Contact Preferences"
                  placeholder="e.g. email,push"
                  helperText="Comma-separated notification channels (e.g. email, push)"
                  error={errors.contact_preferences?.message}
                  {...register('contact_preferences')}
                />

                <TextInput
                  label="Profile Photo URL (Optional)"
                  placeholder="https://cdn.example.com/photo.jpg"
                  error={errors.photo_url?.message}
                  {...register('photo_url')}
                />

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSaving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Changes
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
