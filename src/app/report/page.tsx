import React from 'react';
import Link from 'next/link';
import { Compass, Search, PlusCircle, AlertCircle, ShieldCheck, ArrowRight, MessageSquareQuote } from 'lucide-react';

export default function ReportHubPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
          FindIt Reporting Center
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          What would you like to report?
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Choose a path below. Every submission generates a unique tracking reference code and keeps your identity strictly protected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Option 1: I Lost an Item */}
        <Link
          href="/report/lost"
          className="group bg-white rounded-2xl border-2 border-slate-200/90 hover:border-rose-400 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-5 group-hover:scale-105 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold bg-rose-100 text-rose-800 rounded-md mb-2">
              Missing Property
            </span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              I Lost an Item
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Report an item you misplaced. Specify location, time, identifying marks, and optional reward.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-600">
            <span>Begin Lost Report</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Option 2: I Found an Item */}
        <Link
          href="/report/found"
          className="group bg-white rounded-2xl border-2 border-slate-200/90 hover:border-emerald-400 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-5 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-md mb-2">
              Found Property
            </span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              I Found an Item
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Help return someone’s belongings safely. Keep custody details private while matching with owners.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
            <span>Register Found Item</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Option 3: Support / Complaint */}
        <Link
          href="/report/complaint"
          className="group bg-white rounded-2xl border-2 border-slate-200/90 hover:border-indigo-400 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-5 group-hover:scale-105 transition-transform">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold bg-indigo-100 text-indigo-800 rounded-md mb-2">
              Support & Safety
            </span>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Submit Complaint
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Report suspected fraud, unresponsive parties, harassment, or submit general support tickets to our operations team.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
            <span>File a Ticket</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Safety Reassurance Notice */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-indigo-400 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold">Your Information is Protected</h4>
            <p className="text-xs text-slate-400">
              Only verified members can request contact, and initial inquiries never reveal your personal phone or email.
            </p>
          </div>
        </div>
        <Link
          href="/safety"
          className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg shrink-0 border border-slate-700"
        >
          Learn More About Safety
        </Link>
      </div>
    </div>
  );
}
