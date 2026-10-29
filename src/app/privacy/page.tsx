import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
          Data Governance
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          FindIt Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="prose prose-slate text-xs sm:text-sm text-slate-600 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            We collect the information you explicitly provide when creating an account (such as name, email address, optional phone number, and city) and the details you provide in lost and found listings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. How We Protect Your Contact Info</h2>
          <p>
            Unlike public classified boards, FindIt does not expose your email address or telephone number in search results or public listing pages. Communication between claimants and finders is routed through an encrypted in-app messaging interface where users maintain pseudonymity until they choose to arrange a physical exchange.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Moderation & Audit Trails</h2>
          <p>
            To prevent abuse, spam, and identity theft, administrative moderators review flagged reports, complaints, and audit logs. All administrative changes are logged to maintain compliance and community integrity.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Data Retention and Deletion</h2>
          <p>
            You may request deletion or closure of your account and reports at any time through your dashboard or by filing a support ticket.
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
