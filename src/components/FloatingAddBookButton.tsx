import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

interface FloatingAddBookButtonProps {
  onClick: () => void;
  isMessagesActive?: boolean;
}

export const FloatingAddBookButton: React.FC<FloatingAddBookButtonProps> = ({
  onClick,
  isMessagesActive = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed z-30 transition-all duration-200 group active:scale-95 shadow-lg hover:shadow-2xl hover:scale-105 ${
        isMessagesActive
          ? 'hidden sm:flex bottom-7 right-7'
          : 'bottom-20 right-4 sm:bottom-7 sm:right-7 flex'
      } items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm border border-white/20 ring-4 ring-brand/10`}
      aria-label="Add Book to Community Library"
      title="Add a book to your shelf"
    >
      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-200 group-hover:rotate-90 flex-shrink-0">
        <HugeiconsIcon icon={Add01Icon} size={14} className="text-white" />
      </span>
      <span className="tracking-tight whitespace-nowrap font-sans font-semibold">
        Add Book
      </span>
    </button>
  );
};
