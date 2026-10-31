import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { useMessaging } from '../context/MessagingContext';

interface FloatingAddBookButtonProps {
  onClick: () => void;
  isMessagesActive?: boolean;
}

export const FloatingAddBookButton: React.FC<FloatingAddBookButtonProps> = ({
  onClick,
  isMessagesActive = false,
}) => {
  const { activeFloatingChat } = useMessaging();
  const chatState = activeFloatingChat?.state || 'closed';

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1200;
  });

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth < 640;

  // Dynamic positioning calculation based on Chat Widget State & Viewport
  const { right, bottom, opacity, pointerEvents, scale } = React.useMemo(() => {
    // 1. Mobile rules (< 640px)
    if (isMobile) {
      if (chatState !== 'closed') {
        // Bottom sheet is open: hide FAB completely to prevent collisions
        return {
          right: 16,
          bottom: 76,
          opacity: 0,
          pointerEvents: 'none' as const,
          scale: 0.85,
        };
      }
      // Mobile closed
      return {
        right: 16,
        bottom: 76,
        opacity: isMessagesActive ? 0 : 1,
        pointerEvents: isMessagesActive ? ('none' as const) : ('auto' as const),
        scale: 1,
      };
    }

    // 2. Desktop rules (>= 640px)
    // Full messages page (/messages): keep FAB in default spot or hide if needed
    if (isMessagesActive) {
      return {
        right: 32,
        bottom: 32,
        opacity: 1,
        pointerEvents: 'auto' as const,
        scale: 1,
      };
    }

    // A. Chat Expanded State:
    // Move FAB smoothly to the left of the chat window (approx 16-20px spacing)
    if (chatState === 'expanded') {
      const chatRightOffset = 24;
      const chatWidth = 360;
      const horizontalSpacing = 18;
      const fabWidth = buttonRef.current?.offsetWidth || 140;
      const calculatedRight = chatRightOffset + chatWidth + horizontalSpacing; // 402px

      // Sensible fallback if horizontal space is constrained (e.g. tablet view)
      const hasHorizontalSpace = viewportWidth >= calculatedRight + fabWidth + 24;

      if (!hasHorizontalSpace) {
        // Fallback: sit smoothly right above the chat window
        const chatHeight = 460;
        const verticalSpacing = 16;
        return {
          right: 24,
          bottom: chatRightOffset + chatHeight + verticalSpacing,
          opacity: 1,
          pointerEvents: 'auto' as const,
          scale: 1,
        };
      }

      return {
        right: calculatedRight,
        bottom: 32, // Normal resting baseline
        opacity: 1,
        pointerEvents: 'auto' as const,
        scale: 1,
      };
    }

    // B. Chat Minimized State:
    // Sits directly above the minimized chat bar, aligned to its right edge
    if (chatState === 'minimized') {
      const chatRightOffset = 24;
      const chatHeight = 48;
      const verticalSpacing = 14;
      const calculatedBottom = chatRightOffset + chatHeight + verticalSpacing; // 86px

      return {
        right: 24,
        bottom: calculatedBottom,
        opacity: 1,
        pointerEvents: 'auto' as const,
        scale: 1,
      };
    }

    // C. Chat Closed State:
    // Default resting bottom-right position
    return {
      right: 32,
      bottom: 32,
      opacity: 1,
      pointerEvents: 'auto' as const,
      scale: 1,
    };
  }, [isMobile, chatState, isMessagesActive, viewportWidth]);

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      style={{ pointerEvents }}
      animate={{
        right,
        bottom,
        opacity,
        scale,
      }}
      initial={false}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.94, y: 1 }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 28,
        mass: 0.8,
      }}
      className="fixed z-30 group shadow-xl hover:shadow-2xl shadow-brand/30 flex items-center justify-center sm:justify-start gap-2.5 w-[52px] h-[52px] sm:w-auto sm:h-auto sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-brand via-[#483EA3] to-brand hover:from-brand-dark hover:to-brand-dark text-white font-semibold text-xs sm:text-sm border border-white/25 ring-4 ring-brand/15 active:ring-brand/30 select-none"
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
