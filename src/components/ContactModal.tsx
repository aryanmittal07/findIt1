'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Send, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface ContactModalProps {
  item: {
    id: string;
    referenceId: string;
    title: string;
    type: string;
    city: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ContactModal({
  item,
  isOpen,
  onClose,
  onSuccess,
}: ContactModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [verificationDetails, setVerificationDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!message.trim() || message.trim().length < 10) {
      setError('Please provide a message of at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/listings/${item.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialMessage: message.trim(),
          verificationDetails: verificationDetails.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send contact request');
      }

      setSuccessSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Protected Contact Request</h3>
              <p className="text-[11px] text-slate-400">Reference: {item.referenceId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!user ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
                <Lock className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Sign in to Connect Safely</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  To prevent fraud and maintain protected records, you must be signed in to message the reporter.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-indigo-600"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          ) : successSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-slate-900 text-lg">Inquiry Sent Successfully</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your message has been safely delivered to the reporter. When they reply, you will receive an in-app notification in your FindIt dashboard.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                <Link
                  href="/dashboard?tab=requests"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  View My Message Threads
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
                <p className="font-medium text-slate-900 mb-0.5">Item: {item.title}</p>
                <p className="text-slate-500">
                  {item.type === 'LOST'
                    ? 'Found this item? Let the owner know how you can help return it.'
                    : 'Think this is yours? Describe unique identifying features to verify ownership.'}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message to Reporter <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    item.type === 'LOST'
                      ? 'e.g. Hello, I found an item matching your description near...'
                      : 'e.g. Hello, I believe this is my item that went missing on...'
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Verification Proof / Distinguishing Marks (Optional)
                </label>
                <textarea
                  rows={2}
                  value={verificationDetails}
                  onChange={(e) => setVerificationDetails(e.target.value)}
                  placeholder="e.g. Serial numbers, specific engravings, wallpaper description, or distinct contents not shown in public listing."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Never wire money upfront. FindIt recommends verifying details before meeting in public safe exchange zones.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending Request...' : 'Send Protected Message'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
