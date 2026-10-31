import React, { useState, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Coffee02Icon,
  Cancel01Icon,
  FavouriteIcon,
  Tick01Icon
} from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoffeeModal: React.FC<CoffeeModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number>(3);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Lock body scroll and listen for Escape key when open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const amounts = [1, 3, 5];

  const handleSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="coffee-modal-title"
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-badge flex items-center justify-center shadow-inner mb-4">
            <HugeiconsIcon icon={Coffee02Icon} size={28} />
          </div>

          <h3 id="coffee-modal-title" className="font-serif text-2xl font-semibold text-slate-800">
            Buy Us a Coffee
          </h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            BookCircle is a 100% community-driven, ad-free project. Your support helps us keep the servers running and books circulating freely!
          </p>
        </div>

        {isSubmitted ? (
          <div className="my-8 py-6 rounded-2xl bg-emerald-50 text-emerald-800 flex flex-col items-center gap-2 animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <HugeiconsIcon icon={Tick01Icon} size={20} />
            </div>
            <p className="font-semibold text-base">
              Thank you so much, {currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'neighbor'}!
            </p>
            <p className="text-xs text-emerald-700">Your love fuels the reading circle.</p>
          </div>
        ) : (
          <form onSubmit={handleSupport} className="mt-6">
            {/* Amount Selection */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {amounts.map((count) => {
                const isSelected = selectedAmount === count && !customAmount;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(count);
                      setCustomAmount('');
                    }}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                      isSelected
                        ? 'bg-amber-badge text-slate-900 border-amber-badge shadow-sm ring-2 ring-amber-badge/30'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ☕ ${count * 3}
                  </button>
                );
              })}
            </div>

            {/* Custom note */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Say something nice (optional)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={FavouriteIcon} size={18} className="text-amber-badge fill-amber-badge" />
              <span>Support with ${selectedAmount * 3}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
