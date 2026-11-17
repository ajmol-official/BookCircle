import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Location01Icon,
  PencilEdit02Icon,
  Share01Icon,
  Message01Icon,
  Camera01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';

export interface ProfileHeaderCardProps {
  name: string;
  location: string;
  memberSince?: string;
  bio: string;
  avatar?: string;
  initials: string;
  stats: {
    totalBooks: number;
    availableLending: number;
    availableDonation: number;
    lentOut: number;
  };
  trustStats: {
    onTimeReturnsRatio: string;
    communityContributions: number;
    activeBorrows: number;
    generousListerBooks: number;
  };
  isOwnProfile: boolean;
  onEditProfile?: () => void;
  onShareProfile: () => void;
  onSendMessage?: () => void;
  onOpenReliabilityModal: () => void;
  copiedLink?: boolean;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  name,
  location,
  memberSince = 'February 2024',
  bio,
  avatar,
  initials,
  stats,
  trustStats,
  isOwnProfile,
  onEditProfile,
  onShareProfile,
  onSendMessage,
  onOpenReliabilityModal,
  copiedLink = false,
}) => {
  const [avatarError, setAvatarError] = React.useState(false);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/90 shadow-card transition-all">
      {/* Top Identity Block */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7 min-w-0 flex-1">
          {/* Avatar with Camera or Online Indicator */}
          <div className="relative flex-shrink-0 group">
            {avatar && !avatarError ? (
              <img
                src={avatar}
                alt={name}
                onError={() => setAvatarError(true)}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-[132px] md:h-[132px] rounded-full object-cover ring-4 ring-slate-100 shadow-md"
              />
            ) : (
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-[132px] md:h-[132px] rounded-full bg-gradient-to-br from-brand/20 via-brand/10 to-amber-500/15 border-2 border-brand/20 text-brand font-serif font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-md select-none"
                aria-label={name}
              >
                {initials}
              </div>
            )}

            {isOwnProfile ? (
              <button
                type="button"
                onClick={onEditProfile}
                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-brand text-white shadow-md hover:bg-brand-dark transition transform group-hover:scale-110 active:scale-95 cursor-pointer"
                title="Change profile picture"
                aria-label="Change profile picture"
              >
                <HugeiconsIcon icon={Camera01Icon} size={16} />
              </button>
            ) : (
              <span
                className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
                title="Active in neighborhood"
              />
            )}
          </div>

          {/* User Details & Stat Strip */}
          <div className="min-w-0 flex-1 space-y-2 sm:space-y-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-[32px] font-semibold text-slate-800 tracking-tight leading-tight">
              {name}
            </h1>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 flex-wrap">
              <HugeiconsIcon icon={Location01Icon} size={16} className="text-brand flex-shrink-0" />
              <span>
                {location} · Member since {memberSince}
              </span>
            </div>

            {/* Stat Strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-medium pt-1 text-slate-700">
              <span className="text-brand font-semibold">{stats.totalBooks} Books</span>
              <span className="text-slate-300">|</span>
              <span className="text-brand font-semibold">{stats.availableLending} Available for lending</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-semibold">{stats.availableDonation} Available for donation</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-700 font-semibold">{stats.lentOut} Lend out</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-stretch sm:self-auto justify-end">
          {isOwnProfile ? (
            <>
              <button
                type="button"
                onClick={onEditProfile}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={onShareProfile}
                className={`p-2.5 rounded-xl border transition shadow-xs active:scale-95 flex items-center justify-center cursor-pointer ${
                  copiedLink
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                    : 'border-brand/20 bg-[#F3F0FC] hover:bg-[#ebe6fa] text-brand'
                }`}
                title={copiedLink ? 'Profile link copied!' : 'Share Profile'}
                aria-label="Share profile"
              >
                <HugeiconsIcon
                  icon={copiedLink ? CheckmarkCircle02Icon : Share01Icon}
                  size={18}
                  className={copiedLink ? 'text-emerald-600' : ''}
                />
              </button>
            </>
          ) : (
            <>
              {onSendMessage && (
                <button
                  type="button"
                  onClick={onSendMessage}
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <HugeiconsIcon icon={Message01Icon} size={16} />
                  <span>Message {name.split(' ')[0]}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onShareProfile}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl border transition shadow-xs active:scale-95 cursor-pointer text-xs sm:text-sm font-semibold ${
                  copiedLink
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                    : 'border-brand/20 bg-[#F3F0FC] hover:bg-[#ebe6fa] text-brand'
                }`}
                title={copiedLink ? 'Profile link copied!' : 'Share Profile'}
                aria-label="Share profile"
              >
                <HugeiconsIcon
                  icon={copiedLink ? CheckmarkCircle02Icon : Share01Icon}
                  size={16}
                  className={copiedLink ? 'text-emerald-600' : ''}
                />
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bio Text */}
      {bio && (
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed mt-4 font-sans line-clamp-3">
          {bio}
        </p>
      )}

      {/* Horizontal Divider */}
      <div className="my-6 border-t border-slate-200/80" />

      {/* Trust & Activity Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Badge 1: Always returned on time */}
        <div
          onClick={onOpenReliabilityModal}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer group"
          title="Click to view 5-Tier Return Reliability System"
        >
          <span className="w-3.5 h-3.5 rounded-full bg-[#0F6E56] flex-shrink-0 shadow-2xs group-hover:scale-110 transition-transform" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-brand transition-colors">
              Always returned on time
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {trustStats.onTimeReturnsRatio} on schedule
            </p>
          </div>
        </div>

        {/* Badge 2: Community Contribution */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl">
          <span className="w-3.5 h-3.5 rounded-full bg-[#3C3489] flex-shrink-0 shadow-2xs" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">Community Contribution</p>
            <p className="text-xs text-slate-500 font-medium">
              {trustStats.communityContributions} Books shared
            </p>
          </div>
        </div>

        {/* Badge 3: Active Borrower */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl">
          <span className="w-3.5 h-3.5 rounded-full bg-[#EF9F27] flex-shrink-0 shadow-2xs" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">Active borrower</p>
            <p className="text-xs text-slate-500 font-medium">
              {trustStats.activeBorrows} Borrows completed
            </p>
          </div>
        </div>

        {/* Badge 4: Generous Lister */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl">
          <span className="w-3.5 h-3.5 rounded-full bg-[#3C3489] flex-shrink-0 shadow-2xs" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-700">Generous Lister</p>
            <p className="text-xs text-slate-500 font-medium">
              {trustStats.generousListerBooks} Books listed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
