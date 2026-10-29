import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Search,
  PlusCircle,
  ShieldCheck,
  Lock,
  HeartHandshake,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
          Platform Architecture & Process
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
          How FindIt Safely Reunites Belongings
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Traditional lost and found boards lead to spam, extortion, and security risks. FindIt combines privacy shielding, algorithmic matching, and verified community exchange zones.
        </p>
      </div>

      {/* 3 Step Visual Progression */}
      <div className="space-y-12">
        {/* Step 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="md:col-span-5 space-y-3">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              01
            </span>
            <h3 className="text-xl font-bold text-slate-900">Filing a Detailed Report</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Whether you misplaced a wallet or discovered a set of keys, you submit a categorized report with location approximations, timestamps, and photos. You immediately receive a permanent tracking reference (e.g. <code>FID-2026-1042</code>).
            </p>
            <div className="pt-2 text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Your personal phone & email remain strictly hidden.</span>
            </div>
          </div>
          <div className="md:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Report Form</span>
              <span className="text-emerald-600 font-semibold">Live Validation</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Title & Category</span>
                <p className="font-semibold text-slate-800">Bellroy Slim Leather Wallet • Bags & Wallets</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Location Hint</span>
                <p className="font-semibold text-slate-800">Central Station Ticket Hall, Platform 4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="md:col-span-5 md:order-2 space-y-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              02
            </span>
            <h3 className="text-xl font-bold text-slate-900">Cross-Correlation & Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              FindIt compares attributes—category, geographical keywords, brand, and temporal proximity. When a correlation score exceeds thresholds, both parties receive a private notification alert.
            </p>
            <div className="pt-2 text-xs text-indigo-700 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Claimants must provide distinguishing proof before handover.</span>
            </div>
          </div>
          <div className="md:col-span-7 md:order-1 bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-indigo-900">
              <span className="font-bold">Correlation Engine</span>
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px]">95% Match</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-indigo-200/80 space-y-2 text-xs">
              <p className="font-semibold text-slate-900">Opposite Pair Identified</p>
              <p className="text-slate-600 text-[11px]">
                Item Lost: Black Leather Wallet (Central Metro) ↔ Item Found: Black Bi-Fold Wallet (Gate 3 bench).
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="md:col-span-5 space-y-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              03
            </span>
            <h3 className="text-xl font-bold text-slate-900">Protected Handover</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Communication occurs securely within the FindIt messaging center. Parties coordinate safe meeting spots, such as transit customer desks or precinct safe-exchange areas.
            </p>
            <div className="pt-2 text-xs text-slate-700 flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark as resolved to close the record and celebrate return.</span>
            </div>
          </div>
          <div className="md:col-span-7 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">Safe Handover Recommendation</span>
              <span className="text-[11px] font-mono text-emerald-700">Verified Zone</span>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
              <p className="font-semibold text-slate-900">Central Station Information & Security Kiosk</p>
              <p className="text-slate-500 text-[11px]">
                Monitored 24/7 with municipal security and staff witness availability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Bottom Banner */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="text-2xl font-bold text-slate-900">Ready to Report or Search?</h3>
        <div className="flex justify-center gap-3">
          <Link
            href="/report"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-colors shadow-xs"
          >
            File a Report
          </Link>
          <Link
            href="/listings"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            Search Listings
          </Link>
        </div>
      </div>
    </div>
  );
}
