import React from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';

export function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary text-text-primary">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
