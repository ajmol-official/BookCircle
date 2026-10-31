import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Compass01Icon,
  Home01Icon,
  UserGroupIcon,
  BookOpen01Icon
} from '@hugeicons/core-free-icons';

interface NotFoundPageProps {
  onGoHome: () => void;
  onGoBooks?: () => void;
  onGoReaders?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onGoHome,
  onGoBooks,
  onGoReaders
}) => {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-16 animate-in fade-in zoom-in-95 duration-200">
      {/* 404 Visual Motif */}
      <div className="relative mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-inner">
          <HugeiconsIcon icon={Compass01Icon} size={48} className="text-brand" />
        </div>
        <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-xs font-bold shadow-md">
          404
        </div>
      </div>

      {/* Heading & Subtext */}
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight mb-2">
        Lost Between Chapters
      </h1>
      <p className="text-sm sm:text-base text-slate-500 max-w-md mb-8 leading-relaxed">
        The page or section you were looking for doesn't seem to exist on this shelf. Let's get you back to discovering great books with your neighbors.
      </p>

      {/* Primary Action Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onGoHome}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
        >
          <HugeiconsIcon icon={Home01Icon} size={18} />
          <span>Return to Homepage</span>
        </button>

        {onGoBooks && (
          <button
            type="button"
            onClick={onGoBooks}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm shadow-xs transition hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={BookOpen01Icon} size={18} className="text-brand" />
            <span>Browse Shelf</span>
          </button>
        )}

        {onGoReaders && (
          <button
            type="button"
            onClick={onGoReaders}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm shadow-xs transition hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={UserGroupIcon} size={18} className="text-brand" />
            <span>Explore Readers</span>
          </button>
        )}
      </div>

      {/* Quick Links Footer */}
      <div className="mt-12 pt-8 border-t border-slate-200/80 max-w-sm w-full text-xs text-slate-500">
        <p>BookCircle · Sharing books within your local neighborhood</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
