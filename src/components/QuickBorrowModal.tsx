import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Location01Icon,
  StarIcon,
  CheckmarkCircle02Icon,
  SentIcon
} from '@hugeicons/core-free-icons';
import type { Book } from '../types';

interface QuickBorrowModalProps {
  book: Book | null;
  onClose: () => void;
}

export const QuickBorrowModal: React.FC<QuickBorrowModalProps> = ({ book, onClose }) => {
  const [requested, setRequested] = useState(false);
  const [message, setMessage] = useState(
    '“Hi! I’ve been wanting to read this book for a while. I will take great care of it and return it within the borrow period!”'
  );
  const [selectedSpot, setSelectedSpot] = useState('Riverside Coffee, Rampura');

  if (!book) return null;

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequested(true);
    setTimeout(() => {
      setRequested(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex gap-5 pb-5 border-b border-slate-100">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-24 h-32 object-cover rounded-xl shadow-md flex-shrink-0"
          />
          <div className="flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-[11px] font-semibold mb-1">
                {book.category}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800 line-clamp-1">
                {book.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                by {book.author}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                <HugeiconsIcon icon={StarIcon} size={15} className="fill-amber-400 text-amber-500" />
                <span className="text-xs font-bold text-slate-800 ml-1">{book.rating}</span>
                <span className="text-[11px] text-slate-400 ml-0.5">({book.reviewsCount})</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                <HugeiconsIcon icon={Location01Icon} size={13} className="text-brand" />
                <span>{book.distance} away</span>
              </div>
            </div>
          </div>
        </div>

        {requested ? (
          <div className="py-12 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
            </div>
            <h4 className="font-serif text-2xl font-semibold text-slate-800">
              Borrow Request Sent!
            </h4>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              We notified <span className="font-semibold text-slate-700">{book.ownerName}</span>. You will receive a notification as soon as they accept.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendRequest} className="mt-5 space-y-4">
            {/* Owner & Trust Details */}
            <div className="p-3.5 rounded-2xl bg-cream border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={book.ownerAvatar}
                  alt={book.ownerName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Lender</p>
                  <p className="text-sm font-semibold text-slate-800">{book.ownerName}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                  {book.ownerTrust}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">30-day borrow loan</p>
              </div>
            </div>

            {/* Meetup Spot Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Suggested Public Meetup Spot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  'Riverside Coffee, Rampura',
                  'Elm Park Library entrance',
                  'Meadow Square bench'
                ].map((spot) => (
                  <button
                    key={spot}
                    type="button"
                    onClick={() => setSelectedSpot(spot)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition flex items-center gap-2 ${
                      selectedSpot === spot
                        ? 'bg-brand/10 border-brand text-brand font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <HugeiconsIcon icon={Location01Icon} size={14} className="flex-shrink-0" />
                    <span className="truncate">{spot}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note to Lender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Message to Owner
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow transition flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={SentIcon} size={16} />
                <span>Confirm Request</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
