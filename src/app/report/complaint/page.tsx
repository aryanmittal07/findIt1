'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertCircle,
  CheckCircle,
  FileText,
  Paperclip,
  ArrowRight,
  Loader2,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ComplaintPage() {
  const { user, loading: authLoading } = useAuth();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'FRAUD' | 'HARASSMENT' | 'UNRESPONSIVE' | 'WRONG_ITEM' | 'OTHER'>('FRAUD');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [itemReference, setItemReference] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to submit a support request or complaint.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          priority,
          description: description.trim(),
          itemReference: itemReference.trim() || undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit complaint');
      }

      setSubmittedComplaint(data.complaint);
    } catch (err: any) {
      setError(err.message || 'Error submitting complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Authenticating session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign In to File a Ticket</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Complaints and support requests are bound to authenticated accounts to provide an audit trail and allow staff to resolve inquiries safely.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/login?redirect=/report/complaint"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            Log In
          </Link>
          <Link
            href="/signup?redirect=/report/complaint"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-indigo-600"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  if (submittedComplaint) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full uppercase tracking-wider">
            Ticket Successfully Created
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reference: {submittedComplaint.referenceId}
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Our safety and trust team has queued your ticket &ldquo;{submittedComplaint.subject}&rdquo;. You can review updates and staff responses from your dashboard.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Ticket Reference:</span>
            <span className="font-mono font-bold text-slate-900">{submittedComplaint.referenceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Category:</span>
            <span className="font-semibold text-slate-800">{submittedComplaint.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className="font-semibold text-amber-700">Pending Review</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Priority:</span>
            <span className="font-semibold text-slate-800">{submittedComplaint.priority}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard?tab=complaints"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-colors"
          >
            Track in My Complaints
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <span>Trust & Safety Resolution</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Submit a Complaint or Support Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Report suspicious activity, harassment, listing errors, or request administrative assistance.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Suspicious off-platform payment request received"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-800"
            >
              <option value="FRAUD">Fraud / Scams</option>
              <option value="HARASSMENT">Harassment / Inappropriate Behavior</option>
              <option value="UNRESPONSIVE">Unresponsive Party After Verification</option>
              <option value="WRONG_ITEM">Incorrect or Fake Listing</option>
              <option value="OTHER">Other / General Support</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-800"
            >
              <option value="LOW">Low (General Inquiry)</option>
              <option value="MEDIUM">Medium (Standard Issue)</option>
              <option value="HIGH">High (Potential Scam)</option>
              <option value="URGENT">Urgent (Immediate Safety Risk)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Relevant Listing Reference ID (Optional)
          </label>
          <input
            type="text"
            value={itemReference}
            onChange={(e) => setItemReference(e.target.value)}
            placeholder="e.g. FID-2026-1042"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Include the reference number if this dispute concerns an existing post.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail what happened, timestamps, communication transcripts, and any suspicious actions..."
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Attachment Link (Optional)
          </label>
          <input
            type="url"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="e.g. https://... (Screenshot link or proof)"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <Link
            href="/report"
            className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Filing Ticket...</span>
              </>
            ) : (
              <>
                <span>Submit Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
