import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUp01Icon } from '@hugeicons/core-free-icons';

export const ScrollToTop: React.FC = () => {
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
          className="fixed bottom-24 right-5 sm:bottom-8 sm:right-8 z-40 p-3 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white shadow-xl hover:shadow-2xl border border-slate-700/50 backdrop-blur-md active:scale-90 transition-all group"
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
