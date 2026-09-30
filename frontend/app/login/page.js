'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import { TextInput } from '@/components/forms/TextInput';
import { Button } from '@/components/foundation/Button';
import { authService } from '@/services/auth.service';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function LoginPage() {
  const router = Router();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function Router() {
    return useRouter();
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Check if input is email or phone
      const payload = {
        password: data.password,
      };

      if (data.email.includes('@')) {
        payload.email = data.email;
      } else {
        payload.phone = data.email;
      }

      const result = await authService.login(payload);

      if (result.success) {
        toast.success(result.message || 'Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(result.message || 'Invalid credentials');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
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
        <h2 className="mt-4 text-2xl font-bold text-text-primary tracking-tight">Welcome back</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Log in to your buyer portal account to manage service requests & offers
        </p>
      </div>

      <div className="w-full max-w-md bg-background-primary p-8 rounded-xl border border-border shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextInput
            label="Email or Phone Number"
            placeholder="e.g. ahmed.khan@mail.com or +923001234567"
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <TextInput
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-text-secondary">
          Don&apos;t have a buyer account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
