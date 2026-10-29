'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  X,
  Compass,
  AlertCircle,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import ItemCard from '@/components/ItemCard';
import Link from 'next/link';

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter States
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'ALL');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [city, setCity] = useState(searchParams.get('city') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data States
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    }
    loadCategories();
  }, []);

  // Fetch Listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (type !== 'ALL') params.set('type', type);
      if (category !== 'all') params.set('category', category);
      if (city !== 'all') params.set('city', city);
      if (status !== 'ALL') params.set('status', status);
      params.set('sort', sort);
      params.set('page', page.toString());
      params.set('limit', '12');

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load listings');
      }

      const data = await res.json();
      setItems(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || 'Error loading listings');
    } finally {
      setLoading(false);
    }
  }, [query, type, category, city, status, sort, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const handleResetFilters = () => {
    setQuery('');
    setType('ALL');
    setCategory('all');
    setCity('all');
    setStatus('ALL');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Editorial Header Section matching user image */}
      <div className="space-y-3">
        <span className="text-[11px] font-extrabold tracking-widest text-[#32634c] uppercase">
          THE NOTICEBOARD
        </span>
        <h1 className="font-serif font-black text-4xl sm:text-6xl text-[#173024] tracking-tight leading-none">
          Browse reports.
        </h1>
      </div>

      {/* Floating Search Pill matching user image */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white rounded-2xl border border-[#e8e4da] shadow-sm p-2 sm:p-2.5 flex flex-col md:flex-row items-stretch md:items-center gap-2 max-w-4xl"
      >
        <div className="flex-1 flex items-center px-4 py-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by item, category, or place"
            className="w-full text-sm sm:text-base text-[#173024] placeholder-[#8a9990] bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pl-2 pr-1 border-t md:border-t-0 md:border-l border-[#f0ece3] pt-2 md:pt-0">
          <div className="relative">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="appearance-none bg-transparent pr-8 pl-3 py-2 text-xs sm:text-sm font-medium text-[#3b4c42] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All reports</option>
              <option value="LOST">Lost only</option>
              <option value="FOUND">Found only</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#6c8074] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#193227] hover:bg-[#254536] rounded-xl transition-all shadow-xs"
          >
            Search
          </button>

          {(query.trim() || type !== 'ALL' || category !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 text-[#708076] hover:text-[#193227] rounded-lg"
              title="Reset filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Category Pills Quick Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => {
            setCategory('all');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
            category === 'all'
              ? 'bg-[#193227] text-white font-semibold'
              : 'bg-white text-[#4a5c51] border border-[#e8e4da] hover:bg-[#f6f2e9]'
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCategory(c.slug);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 ${
              category === c.slug
                ? 'bg-[#193227] text-white font-semibold'
                : 'bg-white text-[#4a5c51] border border-[#e8e4da] hover:bg-[#f6f2e9]'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-[#f2eee6] animate-pulse border border-[#e8e4da]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-[#faedd9] border border-[#f4dab5] rounded-2xl text-[#894323] space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={() => fetchListings()}
            className="px-4 py-1.5 text-xs font-semibold bg-[#193227] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e8e4da] p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#f4efe4] flex items-center justify-center mx-auto text-[#6c8074]">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#173024] text-xl">No reports found</h3>
            <p className="text-xs text-[#6c8074] mt-1">
              We couldn’t find any listings matching your search.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-[#173024] border border-[#d8d0c2] rounded-full hover:bg-[#f6f2e9]"
            >
              Clear filters
            </button>
            <Link
              href="/report"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#193227] rounded-full hover:bg-[#254536]"
            >
              Report an item
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 text-xs font-semibold text-[#173024] bg-white border border-[#e8e4da] rounded-full hover:bg-[#f6f2e9] disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-xs text-[#6c8074]">
            Page {page} of {pagination.totalPages}
          </span>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 text-xs font-semibold text-[#173024] bg-white border border-[#e8e4da] rounded-full hover:bg-[#f6f2e9] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function BrowseListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Loader2 className="w-8 h-8 text-[#193227] animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#6c8074]">Loading the noticeboard...</p>
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
