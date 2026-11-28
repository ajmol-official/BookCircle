import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon,
  BookOpen02Icon,
  Search01Icon,
  BubbleChatIcon,
  RepeatIcon,
  FavouriteIcon,
  ShieldCheckIcon,
  LockIcon,
  Location01Icon,
  UserCheck01Icon,
  CheckmarkBadge01Icon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
  Coffee02Icon,
} from '@hugeicons/core-free-icons';

interface WhoWeArePageProps {
  onExploreBooks?: () => void;
  onSupportMission?: () => void;
  onGoHome?: () => void;
}

export const WhoWeArePage: React.FC<WhoWeArePageProps> = ({
  onExploreBooks,
  onSupportMission,
  onGoHome: _onGoHome,
}) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    if (onExploreBooks) {
      onExploreBooks();
    } else {
      navigate('/books');
    }
  };

  const handleSupport = () => {
    if (onSupportMission) {
      onSupportMission();
    }
  };

  const steps = [
    {
      number: '01',
      title: 'List your books',
      description:
        'Add books from your shelf to lend locally, gift forward freely, or display on your profile.',
      icon: BookOpen02Icon,
    },
    {
      number: '02',
      title: 'Discover nearby',
      description:
        'Browse titles shared by readers in your neighborhood, filter by distance, and save favorites to your wishlist.',
      icon: Search01Icon,
    },
    {
      number: '03',
      title: 'Connect & exchange',
      description:
        'Send a borrow or claim request and arrange a comfortable pickup at a local cafe, library, or public spot.',
      icon: BubbleChatIcon,
    },
    {
      number: '04',
      title: 'Read & pass it on',
      description:
        'Enjoy the story, honor agreed return dates for loans, and help every book keep reaching its next reader.',
      icon: RepeatIcon,
    },
  ];

  const commitments = [
    {
      title: 'Privacy first',
      description:
        'We protect your personal details, never sell contact information, and reveal meetup specifics only after mutual confirmation.',
      icon: LockIcon,
    },
    {
      title: 'Safe local exchanges',
      description:
        'We encourage public, well-lit meetup spots like neighborhood cafes and libraries, supported by clear handover tracking.',
      icon: Location01Icon,
    },
    {
      title: 'Community respect',
      description:
        'Readers treat borrowed copies with genuine care and honor agreed return timelines so neighbors can enjoy them next.',
      icon: UserCheck01Icon,
    },
    {
      title: 'Clear transparency',
      description:
        'Honest book condition notes, straightforward lending or gifting terms, and clear mutual expectations on every copy.',
      icon: CheckmarkBadge01Icon,
    },
    {
      title: 'Accessible reading',
      description:
        'Removing financial barriers so good books remain easy to discover and share across neighborhoods without paywalls.',
      icon: BookOpen01Icon,
    },
  ];

  const pillars = [
    {
      title: 'Community contributions',
      description:
        'BookCircle welcomes voluntary contributions from people who believe in accessible neighborhood reading through a simple support system.',
      icon: Coffee02Icon,
      iconWrap: 'bg-amber-badge/15 text-accent-amber-text',
    },
    {
      title: 'Thoughtful sustainability',
      description:
        'If voluntary contributions do not cover hosting and operational costs, BookCircle may introduce carefully selected, reader-relevant sponsorships.',
      icon: ShieldCheckIcon,
      iconWrap: 'bg-brand-50 text-brand',
    },
    {
      title: 'No mandatory paywalls',
      description:
        'Our core commitment stays unchanged: listing, discovering, lending, and borrowing books remains open without forced subscriptions.',
      icon: CheckmarkCircle02Icon,
      iconWrap: 'bg-accent-sage-subtle text-accent-sage-text',
    },
  ];

  return (
    <div className="py-8 sm:py-12 w-full space-y-16 sm:space-y-24">
      {/* 1. Editorial Hero */}
      <section className="max-w-3xl mx-auto text-center space-y-6 pt-2 sm:pt-4">
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-ink-primary tracking-tight leading-[1.14] text-balance">
          A book deserves more than one reader.
        </h1>

        <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-2xl mx-auto">
          Millions of books sit quiet on home shelves while someone a few streets away is looking
          for their next great read. BookCircle connects local readers through simple lending,
          free gifting, and shared shelves.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleExplore}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm shadow-sm transition active:scale-[0.98]"
          >
            <span>Explore Books</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>

          {onSupportMission && (
            <button
              onClick={handleSupport}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-cream-50 text-ink-primary font-semibold text-sm border border-cream-300 shadow-sm transition active:scale-[0.98]"
            >
              <HugeiconsIcon icon={FavouriteIcon} size={15} className="text-red-500 fill-red-500" />
              <span>Support Our Mission</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Sustainability & Transparency */}
      <section className="bg-cream-100/75 rounded-3xl p-7 sm:p-10 lg:p-12 border border-cream-300/90 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-primary tracking-tight">
              Community-powered. Built to last.
            </h2>
            <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
              We want BookCircle to stay sustainable over the long haul while keeping book sharing
              open to every reader.
            </p>
          </div>

          {onSupportMission && (
            <button
              onClick={handleSupport}
              className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-[0.98] shrink-0"
            >
              <HugeiconsIcon icon={FavouriteIcon} size={14} className="text-red-300 fill-red-300" />
              <span>Support Our Mission</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl p-6 border border-cream-300/80 space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pillar.iconWrap}`}>
                  <HugeiconsIcon icon={Icon} size={19} />
                </div>
                <h3 className="font-serif text-lg font-semibold text-ink-primary">
                  {pillar.title}
                </h3>
                <p className="text-base text-ink-secondary leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Four-Step Exchange Rhythm */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-primary tracking-tight">
            How BookCircle works
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Four clear steps to keep physical books circulating smoothly within your neighborhood.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 shadow-card overflow-hidden bg-slate-200/75 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white p-6 sm:p-7 flex flex-col justify-start gap-8 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-semibold text-brand tabular-nums">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors duration-200">
                    <HugeiconsIcon icon={Icon} size={19} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-semibold text-ink-primary">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Our Community Commitments */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-primary tracking-tight text-balance">
            Built on trust, respect, and shared responsibility.
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            The commitments that ensure every exchange is enjoyable, transparent, and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
          {commitments.map((item, idx) => {
            const Icon = item.icon;
            const spanClass =
              idx < 3
                ? 'lg:col-span-2'
                : idx === 4
                  ? 'md:col-span-2 lg:col-span-3'
                  : 'lg:col-span-3';
            return (
              <div
                key={item.title}
                className={`bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between ${spanClass}`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <HugeiconsIcon icon={Icon} size={20} />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-ink-primary">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Closing Invitation */}
      <section className="bg-brand-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-card-hover">
        <div className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-brand-500/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight text-balance">
              Every book has another story to share.
            </h2>
            <p className="text-sm sm:text-base text-brand-100/90 leading-relaxed">
              Explore shelves around you or list a book you have already finished.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExplore}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-cream text-brand-900 font-semibold text-sm shadow-sm transition active:scale-[0.98]"
            >
              <span>Explore Books</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>

            {onSupportMission && (
              <button
                onClick={handleSupport}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition active:scale-[0.98]"
              >
                <HugeiconsIcon icon={FavouriteIcon} size={15} className="text-red-400 fill-red-400" />
                <span>Support Our Mission</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhoWeArePage;
