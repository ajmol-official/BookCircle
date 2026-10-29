import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  FavouriteIcon,
  BookOpen01Icon,
  Location01Icon,
  Notification01Icon,
  Delete02Icon,
  ArrowRight01Icon,
  SparklesIcon,
  GiftIcon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import { modalBackdropVariants, modalContentVariants } from '../../animations/motionVariants';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistBookIds: string[];
  allBooks: Book[];
  onSelectBook: (book: Book) => void;
  onRequestBorrow: (book: Book, ownerName?: string) => void;
  onRemoveWishlist: (bookId: string) => void;
  onSimulateReturn?: (book: Book) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistBookIds,
  allBooks,
  onSelectBook,
  onRequestBorrow,
  onRemoveWishlist,
  onSimulateReturn
}) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'lent_out'>('all');

  // Filter books in user's wishlist
  const wishlistedBooks = allBooks.filter((b) => wishlistBookIds.includes(b.id));

  const availableBooks = wishlistedBooks.filter((b) => b.status === 'available');
  const lentOutBooks = wishlistedBooks.filter((b) => b.status === 'lent_out');

  const displayedBooks = wishlistedBooks.filter((b) => {
    if (filter === 'available') return b.status === 'available';
    if (filter === 'lent_out') return b.status === 'lent_out';
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 max-h-[88vh] flex flex-col z-10 overflow-hidden"
          >
            {/* Top Gradient Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-brand" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-rose-100">
                  <HugeiconsIcon icon={FavouriteIcon} size={20} className="fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-900">
                      My Wishlist & Alerts
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {wishlistedBooks.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Saved books you want to borrow, with instant notifications when lent copies return.
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Close"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            {/* Filter Tabs */}
            {wishlistedBooks.length > 0 && (
              <div className="flex items-center gap-2 py-3 flex-shrink-0 border-b border-slate-100">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    filter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({wishlistedBooks.length})
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    filter === 'available'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Available Now ({availableBooks.length})</span>
                </button>
                <button
                  onClick={() => setFilter('lent_out')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    filter === 'lent_out'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-300" />
                  <span>Lent Out / Waiting ({lentOutBooks.length})</span>
                </button>
              </div>
            )}

            {/* Books List Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              {displayedBooks.length === 0 ? (
                <div className="text-center py-12 px-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                    <HugeiconsIcon icon={FavouriteIcon} size={28} className="fill-rose-400" />
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-slate-800">
                    {wishlistedBooks.length === 0 ? 'Your Wishlist is Empty' : 'No books in this filter'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 leading-relaxed">
                    {wishlistedBooks.length === 0
                      ? 'Save books you want to read. When a lent copy becomes available from a neighbor, we’ll notify you automatically!'
                      : 'Switch tabs to see all your saved books.'}
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs shadow-sm transition active:scale-95 flex items-center gap-2"
                  >
                    <span>Browse Books</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  </button>
                </div>
              ) : (
                displayedBooks.map((book) => {
                  const isAvailable = book.status === 'available';

                  return (
                    <motion.div
                      key={book.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Left Book Identity */}
                      <div
                        onClick={() => {
                          onSelectBook(book);
                          onClose();
                        }}
                        className="flex items-center gap-3.5 cursor-pointer group flex-1 min-w-0"
                      >
                        <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {book.category}
                            </span>
                            {isAvailable ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                Available now
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                                <HugeiconsIcon icon={Notification01Icon} size={11} className="text-amber-700" />
                                Lent out · Alert active
                              </span>
                            )}
                          </div>

                          <h4 className="font-serif text-base font-semibold text-slate-900 group-hover:text-brand transition-colors truncate">
                            {book.title}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">
                            by <span className="text-slate-700 font-medium">{book.author}</span>
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <HugeiconsIcon icon={Location01Icon} size={12} className="text-brand" />
                              {book.distance}
                            </span>
                            <span>• Owner: {book.ownerName}</span>
                            {book.wishlistCount && (
                              <span className="text-rose-500 font-medium">
                                • {book.wishlistCount} readers wishlisted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {book.status === 'claimed' ? (
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} className="text-emerald-600" />
                            <span>Claimed</span>
                          </span>
                        ) : (book.availabilityMode === 'donation' || book.status === 'donation') ? (
                          <button
                            type="button"
                            onClick={() => {
                              onRequestBorrow(book, book.ownerName);
                              onClose();
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
                          >
                            <HugeiconsIcon icon={GiftIcon} size={14} />
                            <span>Claim Gift</span>
                          </button>
                        ) : isAvailable ? (
                          <button
                            type="button"
                            onClick={() => {
                              onRequestBorrow(book, book.ownerName);
                              onClose();
                            }}
                            className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
                          >
                            <HugeiconsIcon icon={BookOpen01Icon} size={14} />
                            <span>Borrow</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>Due back soon</span>
                            </span>

                            {/* Demo Return Simulator for development testing */}
                            {import.meta.env.DEV && onSimulateReturn && (
                              <button
                                type="button"
                                onClick={() => onSimulateReturn(book)}
                                title="Test Notification: Simulate borrower returning this book"
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold transition active:scale-95 flex items-center gap-1"
                              >
                                <HugeiconsIcon icon={SparklesIcon} size={12} className="text-emerald-600" />
                                <span>Simulate Return</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Remove from Wishlist button */}
                        <button
                          type="button"
                          onClick={() => onRemoveWishlist(book.id)}
                          aria-label="Remove from wishlist"
                          title="Remove from wishlist"
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
              <span className="flex items-center gap-1.5 text-slate-600">
                <HugeiconsIcon icon={Notification01Icon} size={14} className="text-brand" />
                <span>You'll get a notification the instant a wishlisted title is returned.</span>
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
