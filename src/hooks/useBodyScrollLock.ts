import { useEffect } from 'react';

// Module-level reference counter for active scroll locks
let activeLocks = 0;

/**
 * Locks document body scrolling by setting overflow: 'hidden'.
 * Increments reference count so multiple overlapping modals/drawers don't conflict.
 */
export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  activeLocks++;
  if (activeLocks === 1) {
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Decrements reference count and restores body scrolling only when all locks are released.
 */
export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return;
  activeLocks = Math.max(0, activeLocks - 1);
  if (activeLocks === 0) {
    document.body.style.overflow = '';
  }
}

/**
 * Unconditionally resets activeLocks to 0 and clears document.body.style.overflow.
 * Critical fail-safe for route transitions or unhandled exceptions.
 */
export function forceResetBodyScroll(): void {
  if (typeof document === 'undefined') return;
  activeLocks = 0;
  document.body.style.overflow = '';
}

/**
 * React hook to lock body scroll while a modal, bottom sheet, or overlay is open.
 * Safely handles unmounts, re-renders, and prevents stale closure bugs.
 *
 * @param isLocked boolean indicating if the lock should be active (defaults to true)
 */
export function useBodyScrollLock(isLocked: boolean = true): void {
  useEffect(() => {
    if (!isLocked) return;

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [isLocked]);
}

export default useBodyScrollLock;

