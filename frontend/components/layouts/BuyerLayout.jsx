'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';
import { authService } from '@/services/auth.service';

export function BuyerLayout({ children, buyerName = 'Buyer' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', 'demo_jwt_token');
        localStorage.setItem('buyer_id', '550e8400-e29b-41d4-a716-446655440000');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background-secondary flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header buyerName={buyerName} onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
