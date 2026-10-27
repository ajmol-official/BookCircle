import type { Variants, Transition } from 'framer-motion';

/**
 * Shared Motion & Animation System for Framer Motion
 * Reusable across BookCircle and other projects.
 */

// --- Spring & Easing Presets ---
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

export const bouncySpring: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 20,
};

export const smoothEase: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
};

// --- Fade In Variants ---
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

// --- Modal & Dialog Variants (Backdrop & Content) ---
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: gentleSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

// --- Dropdown & Popover Variants ---
export const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 450,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -6,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

// --- Drawer / Slide-Over Variants ---
export const drawerRightVariants: Variants = {
  hidden: { x: '100%', opacity: 0.8 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 32,
    },
  },
  exit: {
    x: '100%',
    opacity: 0.8,
    transition: { duration: 0.22, ease: 'easeInOut' },
  },
};

// --- Staggered Lists & Grids (Cards, Books, Readers) ---
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: gentleSpring,
  },
};

// --- Hover & Tap Micro-Interactions ---
export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 500, damping: 25 },
};

export const floatingButtonSpring = {
  whileHover: { scale: 1.06, y: -2 },
  whileTap: { scale: 0.94, y: 1 },
  transition: { type: 'spring', stiffness: 400, damping: 18 },
};

export const cardHoverSpring = {
  whileHover: { y: -5, transition: { duration: 0.2, ease: 'easeOut' as const } },
  whileTap: { scale: 0.99 },
};

// --- Toast & Notification Alert ---
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: bouncySpring,
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};
