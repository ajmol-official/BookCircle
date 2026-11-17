import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  Award01Icon,
  Globe02Icon,
  Share01Icon,
  SparklesIcon,
  FavouriteIcon,
  ArrowUpRight03Icon,
} from '@hugeicons/core-free-icons';
import type { Author } from '../../types/author';

export interface AuthorHeaderCardProps {
  author: Author;
  worksCount: number;
  copiesCount: number;
  followersCount: number;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onShare: () => void;
  isOwner?: boolean;
  onEditProfile?: () => void;
  onClaimProfile?: () => void;
}

export const AuthorHeaderCard: React.FC<AuthorHeaderCardProps> = ({
  author,
  worksCount,
  copiesCount,
  followersCount,
  isFollowing,
  onToggleFollow,
  onShare,
  isOwner = false,
  onEditProfile,
  onClaimProfile,
}) => {
  const [photoError, setPhotoError] = React.useState(false);

  // Generate initials for photo fallback
  const initials = React.useMemo(() => {
    if (!author.name) return 'A';
    const parts = author.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [author.name]);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/90 shadow-card mb-8 sm:mb-10 transition-all">
      {/* ─── Top Section: Portrait + Bio & Actions ─── */}
      <div className="flex flex-col md:flex-row items-start gap-6 sm:gap-8">
        {/* Author Portrait (200x240px rectangular format matching Figma) */}
        <div className="relative flex-shrink-0 self-center md:self-start">
          {author.photo && !photoError ? (
            <img
              src={author.photo}
              alt={author.name}
              onError={() => setPhotoError(true)}
              className="w-40 h-48 sm:w-[200px] sm:h-[240px] rounded-xl sm:rounded-2xl object-cover ring-4 ring-slate-100 shadow-md"
            />
          ) : (
            <div
              className="w-40 h-48 sm:w-[200px] sm:h-[240px] rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#3C3489] via-[#4F46E5] to-[#7C3AED] text-white flex flex-col items-center justify-center ring-4 ring-slate-100 shadow-md select-none"
              aria-label={author.name}
            >
              <span className="font-serif font-bold text-3xl sm:text-4xl tracking-wider">
                {initials}
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-purple-200 mt-2">
                Author
              </span>
            </div>
          )}

          {/* Verified Badge Icon on Avatar */}
          {author.isVerified && (
            <div
              className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border border-slate-200"
              title="Verified Author Profile"
            >
              <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="fill-white" />
              </span>
            </div>
          )}
        </div>

        {/* Author Identity & Metadata */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl md:text-[32px] font-semibold text-slate-800 tracking-tight leading-tight">
                  {author.name}
                </h1>
                {author.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-brand text-xs font-semibold border border-purple-200/80">
                    <HugeiconsIcon icon={SparklesIcon} size={12} className="text-brand" />
                    <span>Verified Author</span>
                  </span>
                )}
              </div>

              {author.profession && (
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                  {author.profession}
                </p>
              )}
            </div>

            {/* Follow & Share Actions */}
            <div className="flex items-center gap-2.5 self-start flex-wrap">
              {isOwner ? (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-50 text-brand border border-purple-200 text-xs sm:text-sm font-semibold hover:bg-purple-100 transition shadow-xs active:scale-95 cursor-pointer"
                >
                  <HugeiconsIcon icon={SparklesIcon} size={15} />
                  <span>Edit Writer Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onToggleFollow}
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-xs cursor-pointer ${
                    isFollowing
                      ? 'bg-purple-100 text-brand border border-brand/30'
                      : 'bg-brand text-white hover:bg-brand-dark'
                  }`}
                >
                  <HugeiconsIcon
                    icon={FavouriteIcon}
                    size={15}
                    className={isFollowing ? 'fill-brand text-brand' : 'text-white'}
                  />
                  <span>{isFollowing ? 'Following' : '+ Follow Author'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onShare}
                className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-brand hover:border-brand/40 bg-white transition shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center"
                title="Share Author Profile"
                aria-label="Share author profile"
              >
                <HugeiconsIcon icon={Share01Icon} size={18} />
              </button>
            </div>
          </div>

          {/* Metadata Row matching Figma: Born | Place | Works | Copies | Followers */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-slate-500 pt-1">
            {author.born && (
              <>
                <span>
                  Born <strong className="font-semibold text-slate-700">{author.born}</strong>
                </span>
                <span className="text-slate-300">|</span>
              </>
            )}
            {author.birthPlace && (
              <>
                <span className="text-slate-600">{author.birthPlace}</span>
                <span className="text-slate-300">|</span>
              </>
            )}
            <span>
              <strong className="font-semibold text-slate-700">{worksCount}</strong> {worksCount === 1 ? 'work' : 'works'} in catalogue
            </span>
            <span className="text-slate-300">|</span>
            <span>
              <strong className="font-semibold text-slate-700">{copiesCount}</strong> community {copiesCount === 1 ? 'copy' : 'copies'}
            </span>
            <span className="text-slate-300">|</span>
            <span>
              <strong className="font-semibold text-slate-700">{followersCount}</strong> readers following
            </span>
          </div>

          {/* Divider */}
          <div className="my-3 border-t border-slate-200/80" />

          {/* Bio text */}
          {author.bio ? (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-3xl">
              {author.bio}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-400 italic">
              Biographical details for this author are currently curated by the BookCircle community.
            </p>
          )}
        </div>
      </div>

      {/* ─── Bottom Section: Literary Achievements & Recognition ─── */}
      {author.literaryAchievements && author.literaryAchievements.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200/80 space-y-3.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand">
            <HugeiconsIcon icon={Award01Icon} size={18} className="text-amber-500" />
            <span>Literary achievements & Recognition</span>
          </div>

          {/* Award Pills Row */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {author.literaryAchievements.map((achievement, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#FFFCEF] border border-amber-200/80 text-amber-900 text-xs font-medium shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span>{achievement}</span>
              </div>
            ))}
          </div>

          {/* Official Website link */}
          {author.websiteUrl && (
            <div className="pt-1">
              <a
                href={author.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-brand hover:underline transition"
              >
                <HugeiconsIcon icon={Globe02Icon} size={15} className="text-slate-500" />
                <span>Official Author Website</span>
                <HugeiconsIcon icon={ArrowUpRight03Icon} size={13} className="text-slate-400" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Unclaimed Profile Invitation Banner */}
      {!author.isClaimed && !isOwner && onClaimProfile && (
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <p className="text-slate-500">
            Are you <strong>{author.name}</strong> or their official literary representative?
          </p>
          <button
            type="button"
            onClick={onClaimProfile}
            className="text-brand font-semibold hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Claim this official profile</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};
