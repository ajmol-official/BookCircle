import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  SparklesIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  Layers01Icon,
} from '@hugeicons/core-free-icons';

interface GuestShelfShowcaseProps {
  onSignIn: () => void;
  onExploreBooks?: () => void;
}

export const GuestShelfShowcase: React.FC<GuestShelfShowcaseProps> = ({
  onSignIn,
  onExploreBooks,
}) => {
  return (
    <div className="w-full py-8 sm:py-12 space-y-12 animate-in fade-in duration-300">
      {/* ─── Hero Pitch ────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold tracking-wide">
          <HugeiconsIcon icon={SparklesIcon} size={14} />
          <span>Your Personal Bookshelf</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
          Build Your Reading Identity on BookCircle
        </h1>

        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
          Catalog every book you own, showcase your reading taste on a public reader profile, and
          decide book-by-book whether to lend, donate, or simply display.
        </p>

        {/* CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onSignIn}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-brand hover:bg-brand-dark text-white font-medium text-sm sm:text-base shadow-sm hover:shadow transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Start Your Bookshelf — It&apos;s Free (30 secs)</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>

          {onExploreBooks && (
            <button
              type="button"
              onClick={onExploreBooks}
              className="w-full sm:w-auto px-5 py-3 rounded-full border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-medium text-sm transition-all duration-200"
            >
              Explore Community Books
            </button>
          )}
        </div>
      </div>

      {/* ─── 3 Value Pillars ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <HugeiconsIcon icon={Layers01Icon} size={20} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-900">
            Complete Shelf Control
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Showcase books on your profile or make them available for lending — you choose the mode
            for every book and can switch it anytime.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <HugeiconsIcon icon={UserGroupIcon} size={20} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-900">
            Meet Readers Nearby
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Connect with readers in your neighborhood for in-person book exchanges. No shipping, no
            packaging — just walk over and swap.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <HugeiconsIcon icon={ShieldCheckIcon} size={20} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-900">
            Zero Fees & Mutual Trust
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            No late fines, subscriptions, or transactional fees. Readers treat every book with care
            backed by community reputation.
          </p>
        </div>
      </div>

      {/* ─── Bottom CTA Banner ─────────────────────────────────── */}
      <div className="bg-brand text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
          Your books tell your story
        </h2>
        <p className="text-sm sm:text-base text-cream/90 max-w-lg mx-auto font-normal">
          Start cataloging what you own, discover readers who share your taste, and decide later
          whether to lend or gift. It takes under a minute.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onSignIn}
            className="px-6 py-3.5 rounded-full bg-white text-brand hover:bg-cream font-semibold text-sm sm:text-base transition-all duration-200 shadow-md active:scale-95 inline-flex items-center gap-2"
          >
            <span>Create Your Free Bookshelf</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
