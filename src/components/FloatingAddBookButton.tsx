import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.94, y: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
      className={`fixed z-30 group shadow-xl hover:shadow-2xl shadow-brand/30 ${
        isMessagesActive
          ? 'hidden sm:flex bottom-8 right-8'
          : 'bottom-[76px] right-4 sm:bottom-8 sm:right-8 flex'
      } items-center justify-center sm:justify-start gap-2.5 w-13 h-13 sm:w-auto sm:h-auto w-[52px] h-[52px] sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-brand via-[#483EA3] to-brand hover:from-brand-dark hover:to-brand-dark text-white font-semibold text-xs sm:text-sm border border-white/25 ring-4 ring-brand/15 active:ring-brand/30 transition-all duration-200`}
      aria-label="Add a book to your shelf"
      title="Add a book to your shelf"
    >
      <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-full bg-amber-badge text-slate-900 flex items-center justify-center font-bold shadow-xs transition-transform duration-200 group-hover:rotate-90 flex-shrink-0">
        <HugeiconsIcon icon={Add01Icon} size={15} className="text-slate-900 stroke-[2.5]" />
      </span>
      <span className="hidden sm:inline-block tracking-tight whitespace-nowrap font-sans font-semibold text-white text-sm pr-0.5">
        Add Book
      </span>
    </motion.button>
  );
};

export default FloatingAddBookButton;
