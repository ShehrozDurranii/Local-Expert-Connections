'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Bell, User } from 'lucide-react';

export function Header({ onMenuClick, buyerName = 'Buyer' }) {
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
    <header className="sticky top-0 z-30 h-16 bg-background-primary/95 backdrop-blur border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md text-text-muted hover:text-text-primary lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <nav className="text-xs text-text-muted hidden sm:block">
            Buyer Portal &gt; <span className="text-text-primary font-medium">Dashboard</span>
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          className="p-2 rounded-full text-text-muted hover:bg-slate-100 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
        </Link>

        <Link href="/profile" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {getInitials(buyerName)}
          </div>
          <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors hidden md:block">
            {buyerName}
          </span>
        </Link>
      </div>
    </header>
  );
}
