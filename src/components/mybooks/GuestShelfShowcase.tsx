import React, { useState } from 'react';
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'lending' | 'personal' | 'donation'>('all');

  const sampleBooks = [
    {
      id: 'sample-1',
      title: 'The Midnight Library',
      author: 'Matt Haig',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
      mode: 'lending',
      modeLabel: 'Lending to Neighbors',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dotColor: 'bg-emerald-500',
      description: 'Available for neighbors to borrow for 14 or 30 days with an in-person handover.',
      genre: 'Fiction / Philosophical',
    },
    {
      id: 'sample-2',
      title: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
      mode: 'personal',
      modeLabel: 'On Shelf · Unavailable',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200/90',
      dotColor: 'bg-slate-400',
      description: 'Showcased on your reader profile. Others can see you love it, but borrowing is disabled.',
      genre: 'Literary Sci-Fi',
    },
    {
      id: 'sample-3',
      title: 'Atomic Habits',
      author: 'James Clear',
      cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
      mode: 'donation',
      modeLabel: 'Free Community Gift',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
      dotColor: 'bg-amber-500',
      description: 'Gifted forward permanently. A reader can collect it to keep forever without returning.',
      genre: 'Self-Improvement',
    },
  ];

  const filteredBooks = sampleBooks.filter((book) => {
    if (activeFilter === 'all') return true;
    return book.mode === activeFilter;
  });

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

      {/* ─── Interactive Shelf Preview ─────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900">
                Three Modes, One Shelf
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                You choose per book
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Every book gets its own mode. Switch anytime — no limits, no fees.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('lending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeFilter === 'lending'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lending (1)
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('personal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeFilter === 'personal'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personal (1)
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('donation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                activeFilter === 'donation'
                  ? 'bg-white text-amber-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Free Gift (1)
            </button>
          </div>
        </div>

        {/* Book Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-cream/40 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition duration-200 group"
            >
              <div className="space-y-3.5">
                {/* Book Header Image & Badge */}
                <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-inner">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-sm ${book.badgeColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${book.dotColor}`} />
                      <span>{book.modeLabel}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {book.genre}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-900 line-clamp-1 mt-0.5">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">by {book.author}</p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {book.description}
                </p>
              </div>

              {/* Sample Action Simulation */}
              <div className="pt-4 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  {book.mode === 'lending'
                    ? 'Borrowable'
                    : book.mode === 'donation'
                      ? 'Free to collect'
                      : 'Showcase only'}
                </span>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="text-brand hover:text-brand-dark font-semibold text-xs flex items-center gap-1 hover:underline"
                >
                  <span>Add yours</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                </button>
              </div>
            </div>
          ))}
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
