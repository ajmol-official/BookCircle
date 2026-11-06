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
  ArrowLeft01Icon,
  SparklesIcon,
  Globe02Icon,
  Compass01Icon,
} from '@hugeicons/core-free-icons';

interface WhoWeArePageProps {
  onExploreBooks?: () => void;
  onSupportMission?: () => void;
  onGoHome?: () => void;
}

export const WhoWeArePage: React.FC<WhoWeArePageProps> = ({
  onExploreBooks,
  onSupportMission,
  onGoHome,
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

  const handleHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate('/');
    }
  };

  const steps = [
    {
      number: '01',
      title: 'List Your Books',
      description: 'Add books and choose whether to lend, donate, or keep them private.',
      icon: BookOpen02Icon,
    },
    {
      number: '02',
      title: 'Discover Books',
      description: 'Find books and readers within your community.',
      icon: Search01Icon,
    },
    {
      number: '03',
      title: 'Connect & Exchange',
      description: 'Request books and coordinate convenient exchanges.',
      icon: BubbleChatIcon,
    },
    {
      number: '04',
      title: 'Read & Pass It On',
      description: 'Enjoy the book and help it reach another reader.',
      icon: RepeatIcon,
    },
  ];

  const commitments = [
    {
      title: 'Privacy First',
      description:
        'We protect your personal data, never sell contact details, and only reveal meetup coordinates when you mutually agree to exchange.',
      icon: LockIcon,
    },
    {
      title: 'Safe Exchanges',
      description:
        'We encourage public, well-lit meetup locations like local libraries and neighborhood cafes, supported by clear handover tracking.',
      icon: Location01Icon,
    },
    {
      title: 'Community Respect',
      description:
        'Readers treat borrowed copies with genuine care and honor agreed return dates so fellow neighbors can enjoy them too.',
      icon: UserCheck01Icon,
    },
    {
      title: 'Transparency',
      description:
        'Honest condition ratings, straightforward lending terms, and clear mutual expectations throughout every interaction.',
      icon: CheckmarkBadge01Icon,
    },
    {
      title: 'Accessible Reading',
      description:
        'Removing financial friction so great literature remains freely accessible to curious minds across every neighborhood.',
      icon: BookOpen01Icon,
    },
  ];

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto space-y-16 sm:space-y-24">
      {/* Top Breadcrumb / Back Link */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={handleHome}
          className="inline-flex items-center gap-1.5 font-medium hover:text-slate-900 transition py-1"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          <span>Back to Home</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-700">Who We Are</span>
      </nav>

      {/* 01. Hero / Our Story */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold tracking-wide">
            <HugeiconsIcon icon={SparklesIcon} size={13} />
            <span>Our Story</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-[1.18]">
            A book deserves more than one reader.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal pt-1">
            Millions of books sit unread on shelves while someone nearby is searching for their next
            great read. BookCircle brings readers together to make books more accessible through
            sharing, lending, and giving.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={handleExplore}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm shadow-sm transition active:scale-95"
            >
              <span>Explore Books</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>

            {onSupportMission && (
              <button
                onClick={handleSupport}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200/90 shadow-sm transition"
              >
                <HugeiconsIcon icon={FavouriteIcon} size={15} className="text-red-500 fill-red-500" />
                <span>Support Our Mission</span>
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-card aspect-[4/3] sm:aspect-[16/11]">
            <img
              src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=1000"
              alt="Books arranged neatly on a wooden table beside a window"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-5 sm:p-6">
              <p className="text-xs sm:text-sm font-medium text-white/95">
                Connecting local readers, one book at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 02. Our Mission & Vision */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <HugeiconsIcon icon={Compass01Icon} size={13} />
            <span>Guiding Principles</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Our Purpose & Path Forward
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission Card */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-5">
                <HugeiconsIcon icon={BookOpen01Icon} size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                Our Mission
              </span>
              <p className="font-serif text-xl sm:text-2xl text-slate-900 font-medium leading-snug mt-3">
                &ldquo;Make reading more accessible by connecting people through the simple act of
                sharing books.&rdquo;
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-6 pt-5 border-t border-slate-100">
              Removing cost and convenience barriers so every reader has access to the titles they love.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 shadow-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-5">
                <HugeiconsIcon icon={Globe02Icon} size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Our Vision
              </span>
              <p className="font-serif text-xl sm:text-2xl text-slate-900 font-medium leading-snug mt-3">
                &ldquo;A world where books continue their journey from one reader to another, building
                stronger reading communities along the way.&rdquo;
              </p>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-6 pt-5 border-t border-slate-100">
              Transforming private shelves into active local lending circles across neighborhoods worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* 03. How BookCircle Works */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <HugeiconsIcon icon={RepeatIcon} size={13} />
            <span>Simple Workflow</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            How BookCircle Works
          </h2>
          <p className="text-sm text-slate-500 font-normal">
            Four straightforward steps to keep stories circulating in your local community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between hover:border-slate-300 transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-brand transition">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition">
                      <HugeiconsIcon icon={Icon} size={20} />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 04. How We Sustain BookCircle */}
      <section className="bg-white rounded-3xl p-7 sm:p-10 lg:p-12 border border-slate-200/90 shadow-card space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <HugeiconsIcon icon={ShieldCheckIcon} size={13} />
            <span>Sustainability &amp; Transparency</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Community-powered. Built to last.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            We are dedicated to long-term sustainability while keeping the core book-sharing
            experience accessible to everyone. Here is how we maintain and fund the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Pillar 1 */}
          <div className="p-5 rounded-2xl bg-cream/70 border border-slate-200/70 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <HugeiconsIcon icon={Coffee02Icon} size={20} />
            </div>
            <h3 className="font-serif text-base font-semibold text-slate-900">
              Community Contributions
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              BookCircle welcomes voluntary contributions from people who believe in its mission.
              Users can support the platform through a Buy Us a Coffee-style contribution system.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-2xl bg-cream/70 border border-slate-200/70 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center">
              <HugeiconsIcon icon={ShieldCheckIcon} size={20} />
            </div>
            <h3 className="font-serif text-base font-semibold text-slate-900">
              Future Advertising
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If community contributions are insufficient to cover operational expenses, BookCircle
              may introduce carefully selected and relevant advertisements.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-2xl bg-cream/70 border border-slate-200/70 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
            </div>
            <h3 className="font-serif text-base font-semibold text-slate-900">
              Our Commitment
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our goal is to keep the essential book-sharing experience accessible without making
              donations mandatory.
            </p>
          </div>
        </div>

        {/* Sustainability CTA Row */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Open, voluntary support with no paywalls or required subscriptions.
          </p>
          {onSupportMission && (
            <button
              onClick={handleSupport}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95"
            >
              <HugeiconsIcon icon={FavouriteIcon} size={14} className="text-red-300 fill-red-300" />
              <span>Support Our Mission</span>
            </button>
          )}
        </div>
      </section>

      {/* 05. Our Community Commitments */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={13} />
            <span>Standards &amp; Safety</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Built on trust, respect, and shared responsibility.
          </h2>
          <p className="text-sm text-slate-500 font-normal">
            The commitments that ensure every exchange is enjoyable, transparent, and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {commitments.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <HugeiconsIcon icon={Icon} size={20} />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 06. Join the Circle (Closing CTA) */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        {/* Subtle decorative background accent */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-brand/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
            <HugeiconsIcon icon={BookOpen01Icon} size={22} />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight">
            Every book has another story to share.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Be part of a community that believes great books should keep moving.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleExplore}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm shadow-sm transition active:scale-95"
            >
              <span>Explore Books</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>

            {onSupportMission && (
              <button
                onClick={handleSupport}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition"
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

