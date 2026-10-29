import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUp01Icon } from '@hugeicons/core-free-icons';

interface ScrollToTopProps {
  isMessagesActive?: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ isMessagesActive = false }) => {
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
          className={`fixed z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-lg hover:shadow-xl border border-slate-700/60 backdrop-blur-md active:scale-90 transition-all group ${
            isMessagesActive
              ? 'hidden sm:flex sm:bottom-[92px] sm:right-8'
              : 'bottom-[138px] right-5 sm:bottom-[94px] sm:right-8 flex'
          }`}
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
