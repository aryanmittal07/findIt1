import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
          Legal Agreement
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          FindIt Terms of Service
        </h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="prose prose-slate text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using FindIt, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Community Conduct & Honesty</h2>
          <p>
            FindIt is built upon honesty and community trust. You agree to submit only truthful, accurate, and non-misleading reports of lost or found property. Fabricating claims, requesting upfront ransom or fraudulent courier fees, or attempting to obtain items that do not belong to you is strictly prohibited and subject to account termination and law enforcement referral.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Contact Privacy & Messaging</h2>
          <p>
            You agree to route all initial inquiries through FindIt’s secure messaging framework. You must not extract personal user identifiers to harass, advertise to, or solicit other users.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Handover Responsibility</h2>
          <p>
            FindIt provides the technological platform to facilitate matches. We do not inspect items directly nor guarantee the veracity of items returned. Users are strongly urged to meet in public daylight venues, such as transit kiosks or police precincts.
          </p>
        </section>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Link href="/" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
          ← Return to FindIt Home
        </Link>
      </div>
    </div>
  );
}
