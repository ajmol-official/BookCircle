import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  UserCircle02Icon,
  Location01Icon,
  CheckmarkCircle02Icon,
  ShieldCheckIcon
} from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import { modalBackdropVariants, modalContentVariants } from '../../animations/motionVariants';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
];

export const ProfileSetupModal: React.FC = () => {
  const { isProfileSetupOpen, setIsProfileSetupOpen, currentUser, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setSelectedAvatar(currentUser.avatar || PRESET_AVATARS[0]);
      setLocation(currentUser.location || '');
      setBio(currentUser.bio || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage('Please enter a display name so neighbors recognize you.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        avatar: selectedAvatar,
        location: location.trim() || 'Local Neighborhood',
        bio: bio.trim(),
        isProfileComplete: true,
      });
      setIsProfileSetupOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        displayName: displayName.trim() || currentUser?.displayName || 'Book Lover',
        isProfileComplete: true,
      });
      setIsProfileSetupOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isProfileSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleSkip}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 max-h-[90vh] overflow-y-auto z-10"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-amber-400 to-brand" />

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
            Welcome New Reader
          </span>
          <h3 className="font-serif text-2xl font-semibold text-slate-900 mt-1">
            Complete Your Reader Profile
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Introduce yourself to neighbors who are sharing and borrowing books.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Choose an Avatar (Optional)
            </label>
            <div className="flex items-center gap-3">
              <img
                src={selectedAvatar}
                alt="Selected avatar"
                className="w-16 h-16 rounded-full object-cover ring-4 ring-brand/20 shadow-md flex-shrink-0"
              />
              <div className="flex flex-wrap gap-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${
                      selectedAvatar === url
                        ? 'border-brand ring-2 ring-brand/20 scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Display Name (Required) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Display Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={UserCircle02Icon}
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                required
                placeholder="e.g. Maya Lin"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full py-2.5 pl-10 pr-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Visible to other community readers.</p>
          </div>

          {/* Location / Neighborhood (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Neighborhood or Area (Optional)
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={Location01Icon}
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="e.g. Elm Park, North London"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full py-2.5 pl-10 pr-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200/50">
              <HugeiconsIcon icon={ShieldCheckIcon} size={14} className="flex-shrink-0" />
              <span>Used only to estimate book walking distance. Your exact address is never shown.</span>
            </div>
          </div>

          {/* Short Bio (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Short Bio (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Avid fiction reader who loves discussing good stories over coffee..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Public vs Private Notice */}
          <div className="p-3 bg-cream rounded-xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">🔒 Privacy Promise: </span>
            Your phone number, email address, and tokens remain strictly private and will never appear on public profiles or book listings.
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSkip}
              className="w-full sm:w-1/3 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs sm:text-sm transition text-center"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-2/3 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold text-xs sm:text-sm shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
              <span>Save & Get Started</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>
);
};
