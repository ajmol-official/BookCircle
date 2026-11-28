import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon,
  Bookmark02Icon,
  RepeatIcon,
  UserCheck01Icon,
} from '@hugeicons/core-free-icons';

/**
 * Minimal vector graphic illustrating how a single physical book
 * circulates locally across multiple readers on BookCircle.
 */
export const BookJourneyGraphic: React.FC = () => {
  return (
    <div
      className="relative rounded-3xl bg-gradient-to-br from-cream/80 via-white to-brand-50/70 border border-slate-200/90 shadow-card p-5 sm:p-6 overflow-hidden"
      aria-label="Book journey diagram showing one book shared across local readers"
    >
      {/* Top subtle label strip */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          The Book Journey
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold">
          Local Loop
        </span>
      </div>

      {/* Minimal SVG Orbit + Nodes */}
      <div className="relative w-full max-w-[360px] mx-auto aspect-[360/252]">
        <svg
          viewBox="0 0 360 252"
          className="w-full h-full overflow-visible"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="journey-arrow"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="5.5"
              markerHeight="5.5"
              orient="auto-start-reverse"
            >
              <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="#9189D0" />
            </marker>
          </defs>

          {/* Subtle center halo */}
          <circle
            cx="180"
            cy="132"
            r="52"
            fill="#F5F4FB"
            stroke="#E2E8F0"
            strokeWidth="1"
          />

          {/* Arc 1: Top -> Bottom-Right */}
          <path
            d="M 210.7 56.0 A 82 82 0 0 1 261.2 143.4"
            fill="none"
            stroke="#B8B3E2"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            markerEnd="url(#journey-arrow)"
          />

          {/* Arc 2: Bottom-Right -> Bottom-Left */}
          <path
            d="M 230.5 196.6 A 82 82 0 0 1 129.5 196.6"
            fill="none"
            stroke="#B8B3E2"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            markerEnd="url(#journey-arrow)"
          />

          {/* Arc 3: Bottom-Left -> Top */}
          <path
            d="M 98.8 143.4 A 82 82 0 0 1 149.3 56.0"
            fill="none"
            stroke="#B8B3E2"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            markerEnd="url(#journey-arrow)"
          />

          {/* Node 1 backing circle (Top: 180, 50) */}
          <circle cx="180" cy="50" r="21" fill="#FFFFFF" stroke="#D7D4EF" strokeWidth="1.5" />
          {/* Node 2 backing circle (Bottom-Right: 251, 173) */}
          <circle cx="251" cy="173" r="21" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="1.5" />
          {/* Node 3 backing circle (Bottom-Left: 109, 173) */}
          <circle cx="109" cy="173" r="21" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1.5" />

          {/* Labels positioned cleanly outside nodes */}
          <text
            x="180"
            y="18"
            textAnchor="middle"
            className="fill-slate-700 text-[11px] font-semibold"
          >
            Listed on Shelf
          </text>
          <text
            x="251"
            y="214"
            textAnchor="middle"
            className="fill-slate-700 text-[11px] font-semibold"
          >
            Borrowed Nearby
          </text>
          <text
            x="109"
            y="214"
            textAnchor="middle"
            className="fill-slate-700 text-[11px] font-semibold"
          >
            Passed On
          </text>
        </svg>

        {/* Crisp HTML Icon Overlays aligned to SVG coordinates */}
        {/* Center Physical Book Emblem (180/360 = 50%, 132/252 = 52.38%) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          style={{ left: '50%', top: '52.38%' }}
        >
          <div className="w-12 h-14 rounded-xl bg-brand text-white shadow-md flex items-center justify-center border border-brand-dark/20">
            <HugeiconsIcon icon={BookOpen01Icon} size={22} />
          </div>
          <span className="mt-1.5 font-serif text-xs font-semibold text-slate-800">
            One Book
          </span>
        </div>

        {/* Node 1 Icon (Top: 180/360 = 50%, 50/252 = 19.84%) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center pointer-events-none"
          style={{ left: '50%', top: '19.84%' }}
        >
          <HugeiconsIcon icon={Bookmark02Icon} size={17} />
        </div>

        {/* Node 2 Icon (Bottom-Right: 251/360 = 69.72%, 173/252 = 68.65%) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center pointer-events-none"
          style={{ left: '69.72%', top: '68.65%' }}
        >
          <HugeiconsIcon icon={UserCheck01Icon} size={17} />
        </div>

        {/* Node 3 Icon (Bottom-Left: 109/360 = 30.28%, 173/252 = 68.65%) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center pointer-events-none"
          style={{ left: '30.28%', top: '68.65%' }}
        >
          <HugeiconsIcon icon={RepeatIcon} size={17} />
        </div>
      </div>

      {/* Bottom concise takeaway */}
      <div className="mt-2 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>1 physical copy</span>
        <span className="text-slate-300">·</span>
        <span>Multiple readers</span>
        <span className="text-slate-300">·</span>
        <span>Zero shipping</span>
      </div>
    </div>
  );
};
