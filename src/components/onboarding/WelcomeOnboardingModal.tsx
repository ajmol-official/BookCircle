import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon,
  Search01Icon,
  UserCircle02Icon,
  FavouriteIcon,
  Cancel01Icon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import { modalBackdropVariants, modalContentVariants } from '../../animations/motionVariants';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onExplore: (dontShowAgain: boolean) => void;
  onGetStarted: () => void;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onExplore,
  onGetStarted,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => onExplore(true)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content Dialog */}
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 overflow-hidden z-10"
          >
            {/* Decorative Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-amber-400 to-brand" />

            {/* Close Button */}
            <button
              onClick={() => onExplore(true)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close welcome message"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>

            {/* Header with App Brand */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-brand flex items-center justify-center text-white shadow-md">
                <HugeiconsIcon icon={BookOpen01Icon} size={22} />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  Hyperlocal Community
                </span>
                <h2 id="onboarding-title" className="font-serif text-2xl sm:text-3xl font-semibold text-slate-900 mt-0.5">
                  Welcome to BookCircle
                </h2>
              </div>
            </div>

            <p className="font-serif italic text-sm sm:text-base text-slate-600 mb-6">
              Good books are meant to be shared.
            </p>

            {/* 3 Core Value Pillars */}
            <div className="space-y-3.5 mb-6">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-cream border border-amber-100/80">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Search01Icon} size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800">
                    1. Discover books from your community
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Explore shelves within walking or biking distance. Real copies from neighbors right around you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-cream border border-brand/10">
                <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HugeiconsIcon icon={FavouriteIcon} size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800">
                    2. Borrow books from other readers
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Meet at friendly local cafes or spots. Zero rental fees, protected by a mutual trust & return score.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-cream border border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HugeiconsIcon icon={UserCircle02Icon} size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800">
                    3. Share books you own with people who will appreciate them
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Give your favorite finished books another life. Keep track of your lent library effortlessly.
                  </p>
                </div>
              </div>
            </div>

            {/* Helper Note for First-Time Visitors */}
            <p className="text-xs text-slate-400 text-center mb-6">
              ✨ This introduction only appears on your first visit. You can explore all books freely.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => onExplore(true)}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition active:scale-[0.98] text-center"
              >
                Explore Books as Guest
              </button>
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold text-xs sm:text-sm shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOnboardingModal;
