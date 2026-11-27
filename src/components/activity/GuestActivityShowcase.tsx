import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  RepeatIcon,
  ArrowRight01Icon,
  SparklesIcon,
  ShieldCheckIcon,
  BubbleChatIcon,
  Location01Icon,
} from '@hugeicons/core-free-icons';

interface GuestActivityShowcaseProps {
  onSignIn: () => void;
  onExploreBooks?: () => void;
  onViewGuide?: () => void;
}

export const GuestActivityShowcase: React.FC<GuestActivityShowcaseProps> = ({
  onSignIn,
  onExploreBooks,
  onViewGuide,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      number: 1,
      title: 'Request',
      subtitle: 'Find & Request a Copy',
      description:
        'Browse local shelves in your neighborhood radius. Send a borrow request with an optional note about why you want to read it.',
      badge: 'Step 1 of 4',
      highlight: 'Zero cost or subscription needed',
    },
    {
      number: 2,
      title: 'Accept',
      subtitle: 'Owner Accepts & Sets Meetup',
      description:
        'The book owner receives your request, accepts it, and suggests a convenient, safe neighborhood spot (like a local cafe or front porch).',
      badge: 'Step 2 of 4',
      highlight: 'Direct in-app coordination',
    },
    {
      number: 3,
      title: 'Meetup',
      subtitle: 'Handover & Start Reading',
      description:
        'Meet your neighbor, say hello, and confirm the handover with one tap in your Activity tab to start your reading period.',
      badge: 'Step 3 of 4',
      highlight: 'Real community connections',
    },
    {
      number: 4,
      title: 'Return',
      subtitle: 'Read, Extend, or Pass On',
      description:
        'Keep the book for 14 or 30 days. Need more time? Request a 14-day extension. When done, hand it back in great condition.',
      badge: 'Step 4 of 4',
      highlight: 'Keep stories circulating locally',
    },
  ];

  return (
    <div className="w-full py-8 sm:py-12 space-y-12 animate-in fade-in duration-300">
      {/* ─── Hero Pitch ────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide">
          <HugeiconsIcon icon={RepeatIcon} size={14} />
          <span>Community Borrowing & Lending</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.15]">
          How Book Exchanges Work on BookCircle
        </h1>

        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
          A neighbor-to-neighbor book circle powered by local trust. No shipping fees, no late
          fines, and zero commercial hassle.
        </p>

        {/* Action CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onSignIn}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-brand hover:bg-brand-dark text-white font-medium text-sm sm:text-base shadow-sm hover:shadow transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Join BookCircle to Start Borrowing</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>

          {onExploreBooks && (
            <button
              type="button"
              onClick={onExploreBooks}
              className="w-full sm:w-auto px-5 py-3 rounded-full border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-medium text-sm transition-all duration-200"
            >
              Browse Nearby Books
            </button>
          )}
        </div>
      </div>

      {/* ─── Interactive 4-Step Timeline ───────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-card space-y-8">
        <div className="text-center max-w-lg mx-auto space-y-1">
          <h2 className="font-serif text-2xl font-semibold text-slate-900">
            The 4-Step Exchange Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Click through each step to see how an exchange flows from request to return:
          </p>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {steps.map((s) => {
            const isSelected = activeStep === s.number;
            return (
              <button
                key={s.number}
                type="button"
                onClick={() => setActiveStep(s.number)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-brand/5 border-brand/40 shadow-sm ring-1 ring-brand/20'
                    : 'bg-cream/30 border-slate-200/80 hover:border-slate-300 hover:bg-cream/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-brand text-white'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    0{s.number}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-serif text-base font-semibold ${
                      isSelected ? 'text-brand' : 'text-slate-800'
                    }`}
                  >
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {s.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Detail */}
        {(() => {
          const current = steps.find((s) => s.number === activeStep) || steps[0];
          return (
            <div className="bg-cream/50 rounded-2xl p-6 sm:p-8 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in duration-200">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium">
                  <HugeiconsIcon icon={SparklesIcon} size={12} className="text-amber-500" />
                  <span>{current.badge}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-700 font-semibold">{current.highlight}</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900">
                  {current.subtitle}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {current.description}
                </p>
              </div>

              <div className="w-full md:w-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={onSignIn}
                  className="w-full md:w-auto px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>Experience this live</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ─── 3 Trust Highlights ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <HugeiconsIcon icon={Location01Icon} size={20} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-900">
            Safe Local Handover
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Choose public meetup spots (cafes, transit hubs, libraries) or porch pickups convenient
            to both readers.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <HugeiconsIcon icon={ShieldCheckIcon} size={20} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-900">
            Reputation & Trust
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Every reader builds trust through successful exchanges and punctuality ratings. Stories
            stay respected.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <HugeiconsIcon icon={BubbleChatIcon} size={20} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-900">
            In-App Messaging
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Coordinate times and drop-offs privately in the app without needing to share phone
            numbers or personal email.
          </p>
        </div>
      </div>

      {/* ─── Bottom CTA Banner ─────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
          Keep stories circulating in your community
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto font-normal">
          Join BookCircle today and discover thousands of books waiting on shelves right around the
          corner.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onSignIn}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-brand hover:bg-brand-dark text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-md active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <span>Create Your Free Account</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>
          {onViewGuide && (
            <button
              type="button"
              onClick={onViewGuide}
              className="w-full sm:w-auto px-5 py-3 rounded-full border border-slate-700 hover:border-slate-600 bg-slate-800 text-slate-200 font-medium text-sm transition"
            >
              Read Community Commitments
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
