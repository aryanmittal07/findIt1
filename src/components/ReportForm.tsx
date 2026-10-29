'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Tag,
  DollarSign,
  ArrowRight,
  Eye,
  Lock,
  Loader2,
  FileText,
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';
import { useAuth } from '@/context/AuthContext';

interface ReportFormProps {
  initialType: 'LOST' | 'FOUND';
}

export default function ReportForm({ initialType }: ReportFormProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submittedItem, setSubmittedItem] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [dateLostFound, setDateLostFound] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [approxLocation, setApproxLocation] = useState('');
  const [city, setCity] = useState(user?.city || 'Downtown Seattle');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'IN_APP' | 'PHONE' | 'EMAIL'>('IN_APP');
  const [privacyPreference, setPrivacyPreference] = useState<'STRICT_IN_APP' | 'VERIFIED_ONLY' | 'MASKED_PUBLIC'>('STRICT_IN_APP');
  const [rewardAmount, setRewardAmount] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          if (data.categories?.length > 0 && !categoryId) {
            setCategoryId(data.categories[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    }
    loadCategories();
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to submit a report.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const payload = {
        type: initialType,
        title: title.trim(),
        categoryId,
        description: description.trim(),
        brand: brand.trim() || undefined,
        dateLostFound: new Date(dateLostFound).toISOString(),
        approxLocation: approxLocation.trim(),
        city: city.trim(),
        preferredContactMethod,
        privacyPreference,
        rewardAmount: initialType === 'LOST' && rewardAmount.trim() ? rewardAmount.trim() : undefined,
        images,
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        throw new Error(data.error || 'Failed to submit report');
      }

      setSubmittedItem(data.item);
    } catch (err: any) {
      setError(err.message || 'Error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Checking credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to Submit a Report</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          FindIt requires a verified account to file reports. This keeps our community protected against spam, fraudulent claims, and identity theft.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href={`/login?redirect=/report/${initialType.toLowerCase()}`}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            Log In
          </Link>
          <Link
            href={`/signup?redirect=/report/${initialType.toLowerCase()}`}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-indigo-600"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  // Confirmation Success Screen
  if (submittedItem) {
    return (
      <div className="max-w-xl mx-auto my-8 p-8 bg-white rounded-2xl border border-slate-200 shadow-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full uppercase tracking-wider">
            Report Registered Successfully
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reference: {submittedItem.referenceId}
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your {initialType.toLowerCase()} report for &ldquo;{submittedItem.title}&rdquo; is now live.
            FindIt has begun correlating with matching items in {submittedItem.city}.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Tracking Reference:</span>
            <span className="font-mono font-bold text-slate-900">{submittedItem.referenceId}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Current Status:</span>
            <span className="font-semibold text-emerald-700">Active / Approved</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Contact Privacy:</span>
            <span className="font-medium text-slate-800">{submittedItem.privacyPreference}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/listings/${submittedItem.id}`}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-colors"
          >
            View Live Listing
          </Link>
          <Link
            href="/dashboard?tab=reports"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Manage in Dashboard
          </Link>
          <button
            onClick={() => {
              setSubmittedItem(null);
              setTitle('');
              setDescription('');
              setImages([]);
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800"
          >
            Submit Another Item
          </button>
        </div>
      </div>
    );
  }

  const isLost = initialType === 'LOST';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Form Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider bg-slate-100 text-slate-800">
          <span
            className={`w-2 h-2 rounded-full ${
              isLost ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          />
          <span>{isLost ? 'Report a Lost Item' : 'Register a Found Item'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {isLost
            ? 'Report What You Lost'
            : 'Found Something? Help Return It Safely'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {isLost
            ? 'Provide as much accurate detail as possible. Your contact information will not be made public.'
            : 'Register custody of a found item. Distinguishing features will be verified with the rightful owner.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Item Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              isLost
                ? 'e.g. Bellroy Slim Leather Wallet (Charcoal Black)'
                : 'e.g. Toyota Car Smart Key Fob with braided lanyard'
            }
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {fieldErrors.title && (
            <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.title[0]}</p>
          )}
        </div>

        {/* Category & Brand Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-slate-800"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Brand or Make (Optional)
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Apple, Bellroy, Sony, Nike"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Date & Location Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Date {isLost ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dateLostFound}
              onChange={(e) => setDateLostFound(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Approximate Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={approxLocation}
              onChange={(e) => setApproxLocation(e.target.value)}
              placeholder="e.g. Platform 4 Ticket Hall"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              City or Area <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Downtown Seattle"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              isLost
                ? 'Describe colors, stickers, scratches, unique cards, or distinguishing features...'
                : 'Describe general physical appearance. To prevent fraud, avoid mentioning sensitive serial numbers or private engraving details publicly.'
            }
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {fieldErrors.description && (
            <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.description[0]}</p>
          )}
        </div>

        {/* Photo Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Photographs (Recommended)
          </label>
          <ImageUploader images={images} onChange={setImages} maxImages={4} />
        </div>

        {/* Reward Option for Lost Items */}
        {isLost && (
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-amber-900">
              Optional Reward Offer
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700">$</span>
              <input
                type="text"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                placeholder="e.g. $50 Reward, or No Reward"
                className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
              />
            </div>
            <p className="text-[11px] text-amber-800">
              FindIt encourages goodwill handovers; rewards are optional and handled upon safe return.
            </p>
          </div>
        )}

        {/* Privacy & Contact Preference */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Privacy & Communication Rules
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Preferred Contact Channel
              </label>
              <select
                value={preferredContactMethod}
                onChange={(e: any) => setPreferredContactMethod(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800"
              >
                <option value="IN_APP">FindIt In-App Messaging (Recommended)</option>
                <option value="PHONE">Phone (Masked until verified)</option>
                <option value="EMAIL">Email (Masked until verified)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Details Visibility
              </label>
              <select
                value={privacyPreference}
                onChange={(e: any) => setPrivacyPreference(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-800"
              >
                <option value="STRICT_IN_APP">Strictly Private (In-App Only)</option>
                <option value="VERIFIED_ONLY">Show After Claimant Verification</option>
                <option value="MASKED_PUBLIC">Masked Public Hint</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
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
                <span>Publishing Report...</span>
              </>
            ) : (
              <>
                <span>Publish {isLost ? 'Lost Item Report' : 'Found Item Record'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
