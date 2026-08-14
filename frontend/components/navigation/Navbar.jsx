import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/foundation/Button';
import { ShieldCheck } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background-primary/95 backdrop-blur supports-[backdrop-filter]:bg-background-primary/60">
      <div className="max-w-container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <ShieldCheck className="w-7 h-7 text-primary" />
          <span>Local Expert-Connect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <Link href="#categories" className="hover:text-primary transition-colors">
            Categories
          </Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="#testimonials" className="hover:text-primary transition-colors">
            Testimonials
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
