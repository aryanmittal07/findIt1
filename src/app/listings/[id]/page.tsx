'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  Award,
  Lock,
  MessageSquare,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Share2,
  ExternalLink,
  Edit3,
  CheckSquare,
  XCircle,
} from 'lucide-react';
import { formatDate, formatDateTime, getStatusStyle } from '@/lib/utils';
import ContactModal from '@/components/ContactModal';
import ItemCard from '@/components/ItemCard';
import { useAuth } from '@/context/AuthContext';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [item, setItem] = useState<any>(null);
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchItem = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${id}`);
      if (!res.ok) {
        throw new Error('Listing not found or has been removed');
      }
      const data = await res.json();
      setItem(data.item);
      setPotentialMatches(data.potentialMatches || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!item) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/listings/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchItem();
      }
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading verified listing details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Listing Not Available</h2>
        <p className="text-xs text-slate-600">{error || 'This listing does not exist.'}</p>
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Browse Listings</span>
        </Link>
      </div>
    );
  }

  const isLost = item.type === 'LOST';
  const statusStyle = getStatusStyle(item.status);
  const images = item.images && item.images.length > 0 ? item.images : [];
  const isOwner = user?.id === item.userId;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Back link & breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to all listings</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Images + Key Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            {images.length > 0 ? (
              <img
                src={images[activeImageIndex]?.url || images[0].url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Tag className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
                <span className="text-xs font-medium">No photograph uploaded</span>
              </div>
            )}

            {/* Badges on main image */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span
                className={`px-3 py-1 text-xs font-bold rounded-lg shadow-xs ${
                  isLost ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isLost ? 'LOST ITEM' : 'FOUND ITEM'}
              </span>

              {item.rewardAmount && isLost && (
                <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-500 text-white rounded-lg shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  {item.rewardAmount}
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4">
              <span className="px-2.5 py-1 text-xs font-mono font-medium bg-slate-950/75 text-white backdrop-blur-md rounded-lg">
                Ref: {item.referenceId}
              </span>
            </div>
          </div>

          {/* Multiple thumbnails if available */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImageIndex === idx
                      ? 'border-indigo-600 ring-2 ring-indigo-100'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-2xs">
            <h3 className="font-semibold text-slate-900 text-base">Detailed Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>

            {item.brand && (
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                <span className="text-slate-500">Brand / Make:</span>
                <span className="font-semibold text-slate-800">{item.brand}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Contact Hub */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  {item.category?.name || 'Category'}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                  {statusStyle.label}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {item.title}
              </h1>
            </div>

            {/* Meta Table */}
            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-start justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Date {isLost ? 'Lost' : 'Found'}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatDate(item.dateLostFound)}
                </span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Approx. Location
                </span>
                <span className="font-semibold text-slate-900 text-right max-w-[60%]">
                  {item.approxLocation}
                </span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">City / Area</span>
                <span className="font-semibold text-slate-900">{item.city}</span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Reported</span>
                <span className="text-slate-600">{formatDateTime(item.createdAt)}</span>
              </div>
            </div>

            {/* Reporter Protection Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    {item.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Reported by {item.user?.name}
                    </p>
                    <p className="text-[11px] text-slate-500">{item.user?.city || 'Verified User'}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  ID Verified
                </span>
              </div>

              {/* Masked info preview to show zero leakage */}
              <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span>Phone Number:</span>
                  <span className="font-mono text-slate-700">
                    {item.user?.phone ? item.user.phone : item.user?.maskedPhone}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email:</span>
                  <span className="font-mono text-slate-700">
                    {item.user?.email ? item.user.email : item.user?.maskedEmail}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * Contact details stay encrypted. All communication is routed safely through FindIt messaging.
              </p>
            </div>

            {/* Owner Actions vs Visitor Actions */}
            {isOwner ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                  <p className="font-semibold mb-0.5">You are the author of this report.</p>
                  <p className="text-indigo-700">
                    Close this listing when no longer needed. Admin will mark it as Resolved once verified.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {item.status !== 'CLOSED' && (
                    <button
                      disabled={statusUpdating}
                      onClick={() => handleStatusChange('CLOSED')}
                      className="w-full py-2.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Close Listing</span>
                    </button>
                  )}
                </div>

                <Link
                  href="/dashboard"
                  className="block text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-1"
                >
                  View in My Dashboard →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(true)}
                  className="w-full py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {isLost ? 'I Found This Item / Contact Owner' : 'I Think This Is Mine / Claim Item'}
                  </span>
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  Protected in-app inquiry. Proof of ownership will be requested.
                </p>
              </div>
            )}
          </div>

          {/* Quick Safety Reminder Box */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-1.5">
            <h4 className="font-semibold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Handover Safety Reminder
            </h4>
            <p className="text-amber-800 leading-relaxed">
              Always meet in a daylight, well-lit public space such as transit stations or municipal service centers. Never wire cash or courier fees in advance.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Potential Matches Section */}
      {potentialMatches.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Automated Correlation
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Potential Matches for this Item
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Showing opposite {item.type === 'LOST' ? 'Found' : 'Lost'} items in same category
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {potentialMatches.map((matched) => (
              <ItemCard key={matched.id} item={matched} />
            ))}
          </div>
        </div>
      )}

      {/* Contact Reporter Modal */}
      <ContactModal
        item={item}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}
