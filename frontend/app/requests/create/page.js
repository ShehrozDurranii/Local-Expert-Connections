'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Send } from 'lucide-react';
import { BuyerLayout } from '@/components/layouts/BuyerLayout';
import { TextInput } from '@/components/forms/TextInput';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/foundation/Button';
import { authService } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { requestService } from '@/services/request.service';

const CATEGORIES = [
  { value: '550e8400-e29b-41d4-a716-446655440001', label: 'Vehicle Inspection' },
  { value: '550e8400-e29b-41d4-a716-446655440002', label: 'Real Estate & Property Audit' },
  { value: '550e8400-e29b-41d4-a716-446655440003', label: 'Electronics & Gadget Check' },
  { value: '550e8400-e29b-41d4-a716-446655440004', label: 'Document & Legal Verification' },
  { value: '550e8400-e29b-41d4-a716-446655440005', label: 'Custom Field Inspection' },
];

const CITIES = [
  { value: '550e8400-e29b-41d4-a716-446655440101', label: 'Lahore' },
  { value: '550e8400-e29b-41d4-a716-446655440102', label: 'Karachi' },
  { value: '550e8400-e29b-41d4-a716-446655440103', label: 'Islamabad' },
  { value: '550e8400-e29b-41d4-a716-446655440104', label: 'Rawalpindi' },
  { value: '550e8400-e29b-41d4-a716-446655440105', label: 'Faisalabad' },
  { value: '550e8400-e29b-41d4-a716-446655440106', label: 'Multan' },
];

const createRequestSchema = z.object({
  category_id: z.string().min(1, 'Please select a service category'),
  city_id: z.string().min(1, 'Please select a city'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  budget: z.coerce.number().min(0, 'Budget must be a non-negative number'),
  timeline: z.string().min(1, 'Please specify your desired deadline date'),
  item_links: z.string().optional(),
});

export default function CreateRequestPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const buyerId = authService.getBuyerId();
    if (buyerId) {
      profileService
        .getProfile(buyerId)
        .then((res) => setProfile(res?.data))
        .catch(() => null);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      category_id: CATEGORIES[0].value,
      city_id: CITIES[0].value,
      description: '',
      budget: 5000,
      timeline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      item_links: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        category_id: data.category_id,
        city_id: data.city_id,
        description: data.description,
        budget: Number(data.budget),
        timeline: new Date(data.timeline).toISOString(),
        item_links: data.item_links || null,
      };

      const result = await requestService.createRequest(payload);

      if (result.success) {
        toast.success(result.message || 'Service request created successfully!');
        router.push('/requests');
      } else {
        toast.error(result.message || 'Failed to create request');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to create request. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BuyerLayout buyerName={profile?.name || 'Buyer'}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* BREADCRUMB & HEADER */}
        <div>
          <Link
            href="/requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Requests
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Create New Service Request</h1>
          <p className="text-sm text-text-secondary">
            Fill out the details below to publish your request to verified local experts.
          </p>
        </div>

        {/* FORM CONTAINER */}
        <div className="p-6 md:p-8 rounded-xl border border-border bg-background-primary shadow-xs">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Service Category"
                required
                error={errors.category_id?.message}
                options={CATEGORIES}
                {...register('category_id')}
              />

              <Select
                label="City / Location"
                required
                error={errors.city_id?.message}
                options={CITIES}
                {...register('city_id')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                label="Budget (PKR)"
                type="number"
                placeholder="e.g. 15000"
                required
                error={errors.budget?.message}
                {...register('budget')}
              />

              <TextInput
                label="Desired Completion Deadline"
                type="date"
                required
                error={errors.timeline?.message}
                {...register('timeline')}
              />
            </div>

            <Textarea
              label="Detailed Request Description"
              rows={5}
              placeholder="Describe the task, specific items to verify, physical locations to visit, or exact inspection criteria..."
              required
              helperText="Minimum 20 characters. Be clear and specific to receive accurate expert proposals."
              error={errors.description?.message}
              {...register('description')}
            />

            <TextInput
              label="Item / Listing URLs (Optional)"
              placeholder="https://example.com/item/123"
              helperText="Add links to online marketplace listings or reference items."
              error={errors.item_links?.message}
              {...register('item_links')}
            />

            <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
              <Link href="/requests">
                <Button variant="ghost" size="md">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="gap-2"
              >
                <Send className="w-4 h-4" /> Submit Request
              </Button>
            </div>
          </form>
        </div>
      </div>
    </BuyerLayout>
  );
}
