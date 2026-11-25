import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Location01Icon,
  BookOpen01Icon,
  GiftIcon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import { cleanAvatarUrl, getUserInitials } from '../../utils/avatarUtils';

export interface FormattedCopy {
  id: string;
  copyId: string;
  name: string;
  avatar: string;
  distance: string;
  memberSince?: string;
  condition?: string;
  status: 'available' | 'donation' | 'lent_out' | 'claimed' | 'unavailable';
  availabilityMode?: 'borrow' | 'donation' | 'personal';
  bookCopy: Book;
}

interface ReaderCopyCardProps {
  copy: FormattedCopy;
  onRequestBorrow: (book: Book, ownerName?: string) => void;
  onSelectOwner?: (ownerName: string) => void;
}

export const ReaderCopyCard: React.FC<ReaderCopyCardProps> = ({
  copy,
  onRequestBorrow,
  onSelectOwner
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = cleanAvatarUrl(copy.avatar);

  useEffect(() => {
    setAvatarError(false);
  }, [copy.avatar]);

  const isDonation = copy.status === 'donation' || copy.availabilityMode === 'donation';
  const isLentOut = copy.status === 'lent_out';
  const isAvailable = copy.status === 'available' || isDonation;

  const conditionLabel = copy.condition || 'Like New';

  // Format clean distance string without duplicate "away"
  const cleanDistance = copy.distance
    ? copy.distance.toLowerCase().includes('away') || copy.distance.toLowerCase().includes('nearby')
      ? copy.distance
      : `${copy.distance} away`
    : '2.1 km away';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between group">
      <div>
        {/* 1. Owner Identity */}
        <div
          onClick={() => onSelectOwner?.(copy.name)}
          className="flex items-center gap-3 mb-3 cursor-pointer group/owner"
          title={`View ${copy.name}'s profile & shelf`}
        >
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt={copy.name}
              onError={() => setAvatarError(true)}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 group-hover/owner:ring-brand/40 group-hover/owner:scale-105 transition-all flex-shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 text-brand font-serif font-bold text-xs flex items-center justify-center ring-2 ring-slate-100 flex-shrink-0 select-none">
              {getUserInitials(copy.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-sm font-semibold text-slate-800 group-hover/owner:text-brand transition-colors truncate">
              {copy.name}
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Member since {copy.memberSince || '2025'}
            </p>
          </div>
        </div>

        {/* 2. Condition & Status Pill */}
        <div className="mb-4">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span>Available ({conditionLabel})</span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
              Currently lent out
            </span>
          )}
        </div>
      </div>

      {/* 3. Bottom Row: Proximity & Action CTA matching Figma */}
      <div className="pt-3 border-t border-slate-100">
        {isAvailable ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium min-w-0 truncate">
              <HugeiconsIcon icon={Location01Icon} size={13} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{cleanDistance}</span>
            </div>

            {isDonation ? (
              <button
                type="button"
                onClick={() => onRequestBorrow(copy.bookCopy, copy.name)}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                title="Claim this free community copy"
              >
                <HugeiconsIcon icon={GiftIcon} size={14} />
                <span>Claim</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onRequestBorrow(copy.bookCopy, copy.name)}
                className="h-8 px-3.5 rounded-lg bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                title="Request to borrow this copy"
              >
                <HugeiconsIcon icon={BookOpen01Icon} size={14} />
                <span>Borrow</span>
              </button>
            )}
          </div>
        ) : isLentOut ? (
          <button
            type="button"
            disabled
            className="w-full h-8 rounded-lg bg-purple-50/80 text-brand text-xs font-semibold flex items-center justify-center cursor-not-allowed"
          >
            Available Soon
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full h-8 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium flex items-center justify-center cursor-not-allowed"
          >
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
};
