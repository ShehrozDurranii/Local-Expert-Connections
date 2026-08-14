import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-secondary text-text-secondary">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
              <ShieldCheck className="w-6 h-6" />
              <span>Local Expert-Connect</span>
            </Link>
            <p className="text-sm text-text-muted">
              Connecting buyers with trusted local experts for inspection, verification, and
              consultation services.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-3 text-sm">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#categories" className="hover:text-primary transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Buyer Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Trust & Safety
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-text-muted">
          © {new Date().getFullYear()} Local Expert-Connect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
