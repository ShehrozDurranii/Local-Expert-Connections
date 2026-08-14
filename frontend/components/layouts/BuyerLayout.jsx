'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { authService } from '@/services/auth.service';

export function BuyerLayout({ children, buyerName = 'Buyer' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', 'demo_jwt_token');
        localStorage.setItem('buyer_id', '550e8400-e29b-41d4-a716-446655440000');
        setIsAuthChecked(true);
      }
    } else {
      setIsAuthChecked(true);
    }
  }, [router]);

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} buyerName={buyerName} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-container mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
