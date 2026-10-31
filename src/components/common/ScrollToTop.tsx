import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { useMessaging } from '../../context/MessagingContext';

interface ScrollToTopProps {
  isMessagesActive?: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ isMessagesActive = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { activeFloatingChat } = useMessaging();
  const chatState = activeFloatingChat?.state || 'closed';

  const [viewportWidth, setViewportWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1200;
  });

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const isMobile = viewportWidth < 640;

  // Coordinate position with FloatingAddBookButton and chat states
  const { right, bottom, opacity, pointerEvents } = React.useMemo(() => {
    if (isMobile) {
      if (chatState !== 'closed') {
        return { right: 16, bottom: 80, opacity: 0, pointerEvents: 'none' as const };
      }
      return { right: 16, bottom: 138, opacity: isMessagesActive ? 0 : 1, pointerEvents: 'auto' as const };
    }

    if (isMessagesActive) {
      return { right: 32, bottom: 94, opacity: 1, pointerEvents: 'auto' as const };
    }

    if (chatState === 'expanded') {
      // FAB is at right: 402px, bottom: 32px (width ~140px)
      // ScrollToTop sits directly above the relocated FAB
      const calculatedRight = 24 + 360 + 18 + 48; // 450px: centered over FAB
      return {
        right: calculatedRight,
        bottom: 94,
        opacity: 1,
        pointerEvents: 'auto' as const,
      };
    }

    if (chatState === 'minimized') {
      // Minimized bar at bottom: 24, FAB at bottom: 86. ScrollToTop sits directly above FAB at bottom: 148
      return {
        right: 32,
        bottom: 148,
        opacity: 1,
        pointerEvents: 'auto' as const,
      };
    }

    // Closed default: above FAB (FAB is bottom: 32, right: 32)
    return {
      right: 32,
      bottom: 94,
      opacity: 1,
      pointerEvents: 'auto' as const,
    };
  }, [isMobile, chatState, isMessagesActive]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity,
            right,
            bottom,
            scale: 1,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 28,
          }}
          style={{ pointerEvents }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
          className="fixed z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-lg hover:shadow-xl border border-slate-700/60 backdrop-blur-md active:scale-90 transition-transform group flex items-center justify-center select-none"
        >
          <HugeiconsIcon
            icon={ArrowUp01Icon}
            size={18}
            className="group-hover:-translate-y-0.5 transition-transform"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
