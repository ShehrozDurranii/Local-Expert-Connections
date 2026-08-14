import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { SearchBar } from '@/components/forms/SearchBar';
import { CategoryCard } from '@/components/marketplace/CategoryCard';
import { Button } from '@/components/foundation/Button';
import {
  Car,
  Home,
  Laptop,
  FileCheck,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  {
    icon: Car,
    title: 'Vehicle Inspection',
    description: 'Physical pre-purchase inspection of cars, bikes, & commercial vehicles.',
    count: '24+',
  },
  {
    icon: Home,
    title: 'Real Estate & Property',
    description: 'Site verification, property condition audit, and location check.',
    count: '18+',
  },
  {
    icon: Laptop,
    title: 'Electronics & Hardware',
    description: 'Verification of used laptops, smartphones, & specialized machinery.',
    count: '30+',
  },
  {
    icon: FileCheck,
    title: 'Document & Legal Verification',
    description: 'Physical verification of certificates, deeds, and official papers.',
    count: '15+',
  },
  {
    icon: Wrench,
    title: 'Custom Field Inspection',
    description: 'Tailored local verification requests specified by you.',
    count: '40+',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Post Your Service Request',
    description: 'Specify your task requirements, city, and preferred budget.',
  },
  {
    step: '02',
    title: 'Receive & Compare Offers',
    description: 'Verified local experts send competitive proposals with timelines.',
  },
  {
    step: '03',
    title: 'Fund Escrow & Track',
    description: 'Safely fund your order in escrow while the expert completes the job.',
  },
  {
    step: '04',
    title: 'Approve & Release Payment',
    description: 'Inspect submitted proof photos & documents before releasing payment.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Found a qualified mechanic in Lahore to inspect a used car before I bought it remotely. Saved me from a bad purchase!',
    author: 'Zainab Ahmed',
    role: 'Verified Buyer',
  },
  {
    quote: 'Fast turnaround and clear proof photos. Escrow protection gave me total peace of mind.',
    author: 'Bilal Hassan',
    role: 'Verified Buyer',
  },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-blue-50/50 to-background-primary pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-primary text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Trusted Local Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight max-w-4xl leading-tight mb-6">
            Connect with Verified <span className="text-primary">Local Experts</span> Near You
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mb-8 leading-relaxed">
            Post inspection, verification, or service requests and receive transparent, competitive
            offers from verified local professionals in your city.
          </p>

          <SearchBar />

          {/* STATS STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pt-8 border-t border-border/60 w-full max-w-3xl">
            <div className="flex items-center justify-center gap-3 text-left">
              <div className="p-2.5 rounded-lg bg-blue-50 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold text-text-primary">500+</div>
                <div className="text-xs text-text-muted">Verified Experts</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-left">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-success">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold text-text-primary">100%</div>
                <div className="text-xs text-text-muted">Escrow Protected</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 text-left">
              <div className="p-2.5 rounded-lg bg-amber-50 text-warning">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold text-text-primary">4.9 / 5</div>
                <div className="text-xs text-text-muted">Buyer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section
        id="categories"
        className="py-16 md:py-24 bg-background-primary border-t border-border/40"
      >
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                Popular Categories
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Browse specialized local verification and field service categories.
              </p>
            </div>
            <Link href="/register" className="mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                View All Categories <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, i) => (
              <CategoryCard
                key={i}
                icon={cat.icon}
                title={cat.title}
                description={cat.description}
                count={cat.count}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="py-16 md:py-24 bg-background-secondary border-t border-border/60"
      >
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
              How Local Expert-Connect Works
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              A transparent 4-step workflow designed to guarantee safety, quality, and
              accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="relative p-6 rounded-xl bg-background-primary border border-border flex flex-col"
              >
                <div className="text-3xl font-black text-primary/20 mb-3">{s.step}</div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        id="testimonials"
        className="py-16 md:py-20 bg-background-primary border-t border-border/40"
      >
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              Trusted by Buyers Across Cities
            </h2>
            <p className="text-text-secondary text-sm">
              See how Local Expert-Connect delivers reliable local verifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-6 rounded-xl bg-background-secondary border border-border">
                <p className="text-sm text-text-secondary italic mb-4">"{t.quote}"</p>
                <div className="font-semibold text-text-primary text-sm">{t.author}</div>
                <div className="text-xs text-text-muted">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
            Ready to Get Expert Assistance in Your City?
          </h2>
          <p className="text-blue-100 max-w-xl mb-8 text-sm sm:text-base">
            Create your buyer account today to post service requests and receive quotes from
            verified local professionals.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="font-bold">
                Create Buyer Account
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
