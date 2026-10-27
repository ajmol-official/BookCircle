import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import type { Reader } from '../types';

interface ReaderCardProps {
  reader: Reader;
  onBrowseShelf: (reader: Reader) => void;
}

export const ReaderCard: React.FC<ReaderCardProps> = ({ reader, onBrowseShelf }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Avatar & Header */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={reader.avatar}
              alt={reader.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-slate-100 group-hover:ring-brand/20 transition-all duration-300 shadow-sm"
              loading="lazy"
            />
            <span className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="flex flex-col">
            <h3 className="font-serif text-lg sm:text-xl font-semibold text-slate-800 group-hover:text-brand transition-colors">
              {reader.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {reader.distance} · Member since {reader.memberSince}
            </p>
          </div>
        </div>

        {/* Availability Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          {/* Books available badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-medium">
            <HugeiconsIcon icon={BookOpen01Icon} size={14} className="text-emerald-700" />
            <span>{reader.booksAvailable} books available</span>
          </div>

          {/* Due soon badge if present */}
          {reader.dueSoon && reader.dueSoon > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-xs font-medium">
              <HugeiconsIcon icon={Clock01Icon} size={14} className="text-amber-700" />
              <span>{reader.dueSoon} due soon</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {reader.totalBorrows} successful borrows
        </span>
        <button
          onClick={() => onBrowseShelf(reader)}
          className="px-5 py-2 rounded-xl bg-slate-50 hover:bg-brand text-brand hover:text-white border border-slate-200 hover:border-brand text-xs font-semibold tracking-wide transition-all duration-200 shadow-sm active:scale-95"
        >
          Browse
        </button>
      </div>
    </div>
  );
};
