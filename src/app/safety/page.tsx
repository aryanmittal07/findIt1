import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  MapPin,
  EyeOff,
  UserCheck,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
          FindIt Trust & Security
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Safety Guidelines & Exchange Rules
        </h1>
        <p className="text-sm text-slate-600">
          Protecting our community from fraud, identity theft, and recovery scams is our highest priority.
        </p>
      </div>

      {/* 4 Pillars of Safety */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">1. Contact Information Privacy</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Never post your private telephone number, home address, or personal email address in public descriptions. All correspondence should be conducted through the FindIt protected message center.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">2. Beware of Upfront Courier Scams</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            A common online scam involves a party claiming they found your item but requesting upfront wire transfers, gift cards, or courier postage. FindIt recommends in-person public handover or leaving items with official transit kiosks.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">3. Safe Public Exchange Zones</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            When meeting in person, always select a well-lit, busy public venue during daylight hours. Ideal locations include municipal police precinct lobbies, library information counters, and transit customer service kiosks.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">4. Proof of Ownership Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            If you found an item, withhold one key detail (such as a lock screen wallpaper, a specific scratch, or a card brand inside a wallet) and ask the claimant to describe it before meeting.
          </p>
        </div>
      </div>

      {/* Handover Safe Points Directory */}
      <div id="handover" className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Recommended Public Exchange Protocols</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold">Safe Exchange Checklist</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <span className="font-semibold text-white">Bring a Companion</span>
            <p className="text-slate-400">Whenever possible, bring a friend or colleague along to the meeting.</p>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <span className="font-semibold text-white">Daylight Hours</span>
            <p className="text-slate-400">Schedule meetings between 9 AM and 5 PM in high-traffic public lobbies.</p>
          </div>
          <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <span className="font-semibold text-white">Trust Your Instincts</span>
            <p className="text-slate-400">If a situation feels uncomfortable or suspicious, cancel and report the user.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center text-xs">
          <span className="text-slate-400">Suspicious interaction or scam attempt?</span>
          <Link
            href="/report/complaint"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors"
          >
            File an Immediate Complaint
          </Link>
        </div>
      </div>
    </div>
  );
}
