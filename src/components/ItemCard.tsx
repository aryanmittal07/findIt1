import React from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Award, Camera } from 'lucide-react';

export interface ItemCardProps {
  item: {
    id: string;
    referenceId: string;
    type: 'LOST' | 'FOUND' | string;
    title: string;
    description: string;
    brand?: string | null;
    dateLostFound: string | Date;
    approxLocation: string;
    city: string;
    rewardAmount?: string | null;
    status: string;
    category?: {
      name: string;
      slug: string;
    } | null;
    images?: Array<{ url: string; isPrimary?: boolean }> | null;
    user?: {
      name: string;
      city?: string | null;
    } | null;
  };
}

export default function ItemCard({ item }: ItemCardProps) {
  const isLost = item.type === 'LOST';
  const hasImage = item.images && item.images.length > 0;

  return (
    <Link
      href={`/listings/${item.id}`}
      className="group block bg-white rounded-2xl border border-[#e8e4da] hover:border-[#193227] hover:shadow-md transition-all duration-200 p-6 sm:p-7 relative flex flex-col justify-between"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest uppercase rounded-md ${
                isLost
                  ? 'bg-[#faedd9] text-[#894323]'
                  : 'bg-[#e2eee5] text-[#214b34]'
              }`}
            >
              {isLost ? 'LOST' : 'FOUND'}
            </span>

            {item.rewardAmount && isLost && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#faedd9] text-[#70381f] rounded-md flex items-center gap-1">
                <Award className="w-3 h-3" />
                {item.rewardAmount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasImage && (
              <span className="text-[#7e8f85] flex items-center gap-1 text-[11px]" title="Photo attached">
                <Camera className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="text-[11px] font-mono text-[#8a9990]">
              {item.referenceId}
            </span>
          </div>
        </div>

        {/* Card Title in Editorial Serif */}
        <h3 className="font-serif font-bold text-2xl text-[#173024] tracking-tight group-hover:text-[#2d5843] transition-colors leading-snug">
          {item.title}
        </h3>

        {/* Category & Location Subtitle */}
        <p className="mt-2 text-xs sm:text-sm text-[#55695e] font-normal leading-relaxed">
          <span>{item.category?.name || 'Item'}</span>
          <span className="mx-1.5 text-[#9cb1a4]">·</span>
          <span>{item.approxLocation || item.city}</span>
        </p>

        {/* Description snippet if present */}
        {item.description && (
          <p className="mt-2 text-xs text-[#708076] line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Date at the bottom */}
      <div className="mt-6 pt-4 border-t border-[#f4f0e6] flex items-center justify-between text-xs text-[#809186]">
        <span>{formatDate(item.dateLostFound)}</span>
        <span className="text-[11px] font-medium text-[#193227] opacity-0 group-hover:opacity-100 transition-opacity">
          View details →
        </span>
      </div>
    </Link>
  );
}
