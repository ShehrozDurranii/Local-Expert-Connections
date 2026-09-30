'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { TextInput } from '@/components/forms/TextInput';
import { Button } from '@/components/foundation/Button';
import { authService } from '@/services/auth.service';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm Password must be at least 8 characters'),
  })
  .refine((data) => data.email || data.phone, {
    message: 'At least one of Email or Phone Number must be provided',
    path: ['email'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        password: data.password,
      };

      if (data.email) payload.email = data.email;
      if (data.phone) payload.phone = data.phone;

      const result = await authService.register(payload);

      if (result.success) {
        toast.success(result.message || 'Account created successfully!');
        router.push('/dashboard');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please check your details.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-secondary flex flex-col justify-center items-center px-4 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-primary">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <span>Local Expert-Connect</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-text-primary tracking-tight">
          Create a Buyer Account
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Join Local Expert-Connect to post inspection & verification requests
        </p>
      </div>

      <div className="w-full max-w-md bg-background-primary p-8 rounded-xl border border-border shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInput
            label="Full Name"
            placeholder="e.g. Ahmed Khan"
            required
            error={errors.name?.message}
            {...register('name')}
          />

          <TextInput
            label="Email Address"
            type="email"
            placeholder="e.g. ahmed.khan@mail.com"
            helperText="Provide email or phone (or both)"
            error={errors.email?.message}
            {...register('email')}
          />

          <TextInput
            label="Phone Number"
            placeholder="e.g. +923001234567"
            helperText="Format: +923001234567"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <TextInput
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            required
            error={errors.password?.message}
            {...register('password')}
          />

          <TextInput
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-3"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-text-secondary">
          Already have a buyer account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
