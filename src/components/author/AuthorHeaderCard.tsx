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
                  <span
                    title="Verified Author"
                    aria-label="Verified Author"
                    className="inline-flex items-center justify-center flex-shrink-0 text-[#0F5BFF]"
                  >
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                        fill="currentColor"
                      />
                      <path
                        d="M8.5 12.5L10.8 14.8L15.5 9.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                  <span>Edit Profile</span>
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
    </div>
  );
};
