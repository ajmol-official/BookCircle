import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Location01Icon,
  ShieldCheckIcon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  BookOpen01Icon
} from '@hugeicons/core-free-icons';
import type { Reader } from '../types';

interface ReaderCardProps {
  reader: Reader;
  onBrowseShelf: (reader: Reader) => void;
}

interface LocationDetails {
  area: string | null;
  distanceFormatted: string | null;
}

export const ReaderCard: React.FC<ReaderCardProps> = ({ reader, onBrowseShelf }) => {
  const [avatarError, setAvatarError] = useState(false);

  // Fallback initials if avatar is missing or fails to load
  const initials = useMemo(() => {
    if (!reader.name) return 'BC';
    const parts = reader.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [reader.name]);

  // Derived joined year for secondary metadata
  const joinedYear = useMemo(() => {
    if (!reader.memberSince) return null;
    const match = reader.memberSince.match(/\d{4}/);
    return match ? match[0] : reader.memberSince;
  }, [reader.memberSince]);

  // Location & distance parsing adhering to privacy rules
  const locationDetails = useMemo<LocationDetails>(() => {
    let area: string | null = null;
    let distanceFormatted: string | null = null;

    if (reader.location) {
      if (reader.location.includes('·')) {
        const parts = reader.location.split('·').map((s) => s.trim());
        area = parts[0] || null;
        if (parts[1] && /\d/.test(parts[1])) {
          distanceFormatted = parts[1].toLowerCase().includes('away')
            ? parts[1]
            : `${parts[1]} away`;
        }
      } else {
        area = reader.location.trim();
      }
    }

    if (!distanceFormatted && reader.distance && reader.distance.trim()) {
      const d = reader.distance.trim();
      distanceFormatted = d.toLowerCase().includes('away') ? d : `${d} away`;
    }

    return { area, distanceFormatted };
  }, [reader.location, reader.distance]);

  // Number of books currently available to borrow (preferred over historical total shared)
  const booksAvailableCount = useMemo(() => {
    if (typeof reader.booksAvailable === 'number' && reader.booksAvailable >= 0) {
      return reader.booksAvailable;
    }
    const lending = reader.booksForLending || 0;
    const donation = reader.booksForDonation || 0;
    return lending + donation;
  }, [reader.booksAvailable, reader.booksForLending, reader.booksForDonation]);

  // Completed transactions / successful returns
  const successfulReturns = useMemo(() => {
    return (reader as any).totalReturns ?? reader.totalBorrows ?? 0;
  }, [reader]);

  // Trust system & reliability metrics
  const trustInfo = useMemo(() => {
    const tier = (reader.trustTier || '').toLowerCase();
    const borrows = (reader as any).totalReturns ?? reader.totalBorrows ?? 0;

    // Handle new readers with limited history fairly
    if (borrows < 3 && !tier.includes('tier 3') && !tier.includes('tier 4') && !tier.includes('tier 5')) {
      return {
        label: 'New reader',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200/80',
        iconClass: 'text-slate-500',
        isNew: true,
        reliabilityMetric: borrows > 0 ? `${borrows} returns completed` : null
      };
    }

    // Derive on-time return rate percentage
    let onTimePercent = '100%';
    if (reader.trustScore) {
      const match = reader.trustScore.match(/(\d+)%/);
      if (match) onTimePercent = `${match[1]}%`;
    } else if (tier.includes('tier 4')) {
      onTimePercent = '98%';
    } else if (tier.includes('tier 3')) {
      onTimePercent = '93%';
    } else if (tier.includes('tier 2')) {
      onTimePercent = '88%';
    }

    if (tier.includes('tier 5')) {
      return {
        label: 'Highly trusted',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        iconClass: 'text-emerald-700',
        isNew: false,
        reliabilityMetric: `${onTimePercent} on-time`
      };
    }

    if (tier.includes('tier 4')) {
      return {
        label: 'Highly Reliable',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        iconClass: 'text-emerald-700',
        isNew: false,
        reliabilityMetric: `${onTimePercent} on-time`
      };
    }

    if (tier.includes('tier 3')) {
      return {
        label: 'Punctual Neighbor',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
        iconClass: 'text-amber-700',
        isNew: false,
        reliabilityMetric: `${onTimePercent} on-time`
      };
    }

    if (tier.includes('tier 2')) {
      return {
        label: 'Reliable Reader',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
        iconClass: 'text-blue-700',
        isNew: false,
        reliabilityMetric: `${onTimePercent} on-time`
      };
    }

    return {
      label: 'Highly trusted',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      iconClass: 'text-emerald-700',
      isNew: false,
      reliabilityMetric: `${onTimePercent} on-time`
    };
  }, [reader.trustTier, reader.trustScore, reader.totalBorrows]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onBrowseShelf(reader)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onBrowseShelf(reader);
        }
      }}
      className="group bg-white rounded-2xl p-4 sm:p-5 lg:p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none transition-all duration-300 cursor-pointer"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_auto] items-center gap-3.5 sm:gap-y-3.5 lg:gap-6">
        
        {/* =========================================================================
            SECTION A: Reader Identity, Location & Distance (Left Section)
            Order: 1 across all viewports
            ========================================================================= */}
        <div className="order-1 flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
          {/* Avatar (56px on mobile, 60px on tablet, 64px on desktop) */}
          <div className="relative flex-shrink-0">
            {reader.avatar && !avatarError ? (
              <img
                src={reader.avatar}
                alt={reader.name}
                onError={() => setAvatarError(true)}
                className="w-14 h-14 sm:w-15 sm:h-15 lg:w-16 lg:h-16 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-brand/30 transition-all duration-300 shadow-xs"
                loading="lazy"
              />
            ) : (
              <div
                className="w-14 h-14 sm:w-15 sm:h-15 lg:w-16 lg:h-16 rounded-full bg-brand/10 border-2 border-brand/20 text-brand font-serif font-bold text-sm sm:text-base lg:text-lg flex items-center justify-center shadow-xs"
                aria-label={reader.name}
              >
                {initials}
              </div>
            )}
            {/* Active / Online Neighborhood Indicator */}
            <span
              className="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-2xs"
              title="Active in neighborhood"
            />
          </div>

          {/* Details (Name, Location, Distance, Trust) */}
          <div className="flex flex-col min-w-0 flex-1">
            {/* Row 1: Name + Verification badge */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-serif text-base sm:text-lg lg:text-lg font-semibold text-slate-900 group-hover:text-brand transition-colors truncate">
                {reader.name}
              </h3>
              {reader.verified && (
                <span
                  className="inline-flex items-center justify-center text-emerald-600 flex-shrink-0"
                  title="Verified Neighbor"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                </span>
              )}
            </div>

            {/* Row 2: Location and Distance (Strong Visual Emphasis) */}
            {(locationDetails.area || locationDetails.distanceFormatted) && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5 flex-wrap">
                <HugeiconsIcon icon={Location01Icon} size={14} className="text-brand flex-shrink-0" />
                {locationDetails.area && (
                  <span className="font-medium text-slate-700 truncate">
                    {locationDetails.area}
                  </span>
                )}
                {locationDetails.area && locationDetails.distanceFormatted && (
                  <span className="text-slate-300">·</span>
                )}
                {locationDetails.distanceFormatted && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-brand/8 text-brand font-semibold text-[11px] whitespace-nowrap">
                    {locationDetails.distanceFormatted}
                  </span>
                )}
              </div>
            )}

            {/* Row 3: Trust Badge & Secondary Metadata (Joined Year) */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${trustInfo.badgeClass}`}
              >
                <HugeiconsIcon icon={ShieldCheckIcon} size={12} className={trustInfo.iconClass} />
                <span>{trustInfo.label}</span>
              </span>

              {joinedYear && (
                <>
                  <span className="text-[11px] text-slate-300 hidden sm:inline">·</span>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    Joined {joinedYear}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION C: Primary Action (Right Section)
            Single "View profile" button with right arrow icon
            Order: 4 on Mobile (bottom), 2 on Tablet (top right), 3 on Desktop (far right)
            ========================================================================= */}
        <div className="order-4 sm:order-2 lg:order-3 w-full sm:w-auto flex-shrink-0 sm:self-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBrowseShelf(reader);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 active:scale-95 group-hover:bg-brand-dark"
          >
            <span>View profile</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>

        {/* =========================================================================
            SECTION B: Trust, Availability & Reliability (Middle Section)
            Focuses on current availability to borrow and on-time reliability
            Order: 2 on Mobile (row 3), 3 on Tablet (spans 2 cols), 2 on Desktop (middle col)
            ========================================================================= */}
        <div className="order-2 sm:order-3 lg:order-2 sm:col-span-2 lg:col-span-1">
          {/* Mobile concise inline strip vs Desktop/Tablet structured cards */}
          <div className="flex sm:hidden items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
            {/* Book Availability */}
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <HugeiconsIcon icon={BookOpen01Icon} size={14} className="text-brand flex-shrink-0" />
              <span>{booksAvailableCount} available</span>
            </div>

            {/* Reliability Metric */}
            {trustInfo.reliabilityMetric && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <HugeiconsIcon icon={ShieldCheckIcon} size={12} />
                <span>{trustInfo.reliabilityMetric}</span>
              </div>
            )}
          </div>

          {/* Desktop & Tablet compact 2-column stats with divider */}
          <div className="hidden sm:flex items-center divide-x divide-slate-200/80 sm:bg-slate-50/60 lg:bg-transparent rounded-xl lg:rounded-none sm:py-2 sm:px-3 lg:p-0 flex-shrink-0">
            {/* Item 1: Books Currently Available to Borrow */}
            <div className="text-center sm:px-4 lg:px-5">
              <div className="flex items-center justify-center gap-1.5 font-serif text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-none">
                <HugeiconsIcon icon={BookOpen01Icon} size={15} className="text-brand hidden lg:inline" />
                <span>{booksAvailableCount}</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">
                books available
              </div>
            </div>

            {/* Item 2: Return Reliability Metric */}
            <div className="text-center sm:px-4 lg:px-5">
              <div className="flex items-center justify-center gap-1 font-serif text-base sm:text-lg lg:text-xl font-bold text-emerald-700 leading-none">
                <span>{trustInfo.reliabilityMetric || '100%'}</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">
                {successfulReturns > 0 ? `${successfulReturns} returns` : 'reliability'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
