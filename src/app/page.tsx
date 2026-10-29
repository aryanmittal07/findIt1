'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Search,
  ShieldCheck,
  Lock,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  MapPin,
  CheckCircle,
  FileText,
  Key,
  Laptop,
  Briefcase,
  Watch,
  Shirt,
  Heart,
  ChevronRight,
  Sparkles,
  Users,
  Eye,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import ItemCard from '@/components/ItemCard';

export default function HomePage() {
  const router = useRouter();
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('ALL');

  useEffect(() => {
    async function fetchData() {
      try {
        const [itemsRes, catRes] = await Promise.all([
          fetch('/api/listings?limit=6'),
          fetch('/api/categories'),
        ]);

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          setRecentItems(itemsData.items || []);
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (searchType !== 'ALL') params.set('type', searchType);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Editorial Hero Section */}
      <section className="pt-12 sm:pt-20 pb-8 sm:pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e2eee5] text-[#214b34] text-[11px] font-extrabold tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#214b34]" />
          <span>A calmer way to find your way back</span>
        </div>

        <h1 className="font-serif font-black text-4xl sm:text-6xl lg:text-7xl text-[#173024] tracking-tight leading-[1.08] max-w-3xl mx-auto">
          Find what you lost.<br className="hidden sm:inline" />
          <span className="text-[#32634c]">Return what you found.</span>
        </h1>

        <p className="text-sm sm:text-lg text-[#55695e] max-w-xl mx-auto leading-relaxed font-normal">
          A dignified lost-and-found noticeboard for campuses and communities.
          Protected contact details, verified handovers, zero recovery scams.
        </p>

        {/* Floating Search Pill */}
        <div className="pt-4 max-w-2xl mx-auto">
          <form
            onSubmit={handleHeroSearch}
            className="bg-white rounded-2xl border border-[#e8e4da] shadow-sm p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="flex-1 flex items-center px-4 py-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item, category, or place"
                className="w-full text-sm sm:text-base text-[#173024] placeholder-[#8a9990] bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-[#f0ece3] pt-2 sm:pt-0 pl-2">
              <div className="relative">
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="appearance-none bg-transparent pr-7 pl-2 py-2 text-xs font-medium text-[#3b4c42] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All reports</option>
                  <option value="LOST">Lost only</option>
                  <option value="FOUND">Found only</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#6c8074] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#193227] hover:bg-[#254536] rounded-xl transition-all shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick links below search */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs font-medium text-[#55695e]">
            <Link href="/report/lost" className="hover:text-[#193227] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#cc6e29]" />
              <span>Report lost item</span>
            </Link>
            <span className="text-[#c7d5cd]">·</span>
            <Link href="/report/found" className="hover:text-[#193227] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#32634c]" />
              <span>Report found item</span>
            </Link>
            <span className="text-[#c7d5cd]">·</span>
            <Link href="/listings" className="hover:text-[#193227]">
              Browse noticeboard →
            </Link>
          </div>
        </div>
      </section>

      {/* Noticeboard Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e8e4da] pb-4">
          <div>
            <span className="text-[11px] font-extrabold tracking-widest text-[#32634c] uppercase">
              THE NOTICEBOARD
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#173024] tracking-tight mt-1">
              Recent reports.
            </h2>
          </div>
          <Link
            href="/listings"
            className="text-xs font-bold text-[#193227] hover:underline underline-offset-4 flex items-center gap-1"
          >
            <span>View all noticeboard reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 rounded-2xl bg-[#f2eee6] animate-pulse border border-[#e8e4da]"
              />
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e8e4da] p-12 text-center space-y-3">
            <p className="text-xs text-[#6c8074]">No noticeboard listings yet.</p>
            <Link
              href="/report"
              className="inline-block px-5 py-2 text-xs font-semibold text-white bg-[#193227] rounded-full"
            >
              Post the first report
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* 3 Step Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f3eee4] rounded-3xl p-8 sm:p-14 border border-[#e4dcce] space-y-10">
          <div className="max-w-xl space-y-2">
            <span className="text-[11px] font-extrabold tracking-widest text-[#32634c] uppercase">
              HOW IT WORKS
            </span>
            <h3 className="font-serif font-bold text-3xl sm:text-4xl text-[#173024]">
              Three steps to a safe return.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white rounded-2xl p-6 border border-[#e4dcce] space-y-3">
              <span className="w-7 h-7 rounded-full bg-[#193227] text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h4 className="font-serif font-bold text-lg text-[#173024]">Post notice</h4>
              <p className="text-xs text-[#5e7065] leading-relaxed">
                Describe the item and where you saw or lost it. Photos and approximate timestamps are kept protected.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#e4dcce] space-y-3">
              <span className="w-7 h-7 rounded-full bg-[#32634c] text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h4 className="font-serif font-bold text-lg text-[#173024]">Smart match</h4>
              <p className="text-xs text-[#5e7065] leading-relaxed">
                FindIt correlates matching descriptions across the campus. Inquiries require verification proof before meeting.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#e4dcce] space-y-3">
              <span className="w-7 h-7 rounded-full bg-[#894323] text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h4 className="font-serif font-bold text-lg text-[#173024]">Protected handover</h4>
              <p className="text-xs text-[#5e7065] leading-relaxed">
                Coordinate exchange at official campus desks or security reception areas. Mark resolved when complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#193227] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] font-extrabold tracking-widest text-[#a1c4ad] uppercase">
              SAFETY GUARANTEE
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              Your contact details stay private until you choose to connect.
            </h3>
            <p className="text-xs sm:text-sm text-[#b9d3c2] leading-relaxed">
              No spammers, no telephone harassment, no upfront ransom scams.
              Everything is securely kept within the in-app noticeboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/safety"
              className="px-6 py-3 text-xs font-bold text-[#193227] bg-[#fbf8f3] hover:bg-white rounded-full transition-colors text-center"
            >
              Read safety rules
            </Link>
            <Link
              href="/report/lost"
              className="px-6 py-3 text-xs font-bold text-white border border-[#4d8567] hover:bg-[#254536] rounded-full transition-colors text-center"
            >
              Report an item
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
