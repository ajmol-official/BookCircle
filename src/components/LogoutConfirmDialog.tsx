import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout01Icon, Cancel01Icon, BookOpen01Icon } from '@hugeicons/core-free-icons';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Cancel"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <HugeiconsIcon icon={Logout01Icon} size={26} />
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="font-serif text-xl font-semibold text-slate-800">Log out of BookCircle?</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            You'll need to sign back in to access your shelf, messages, and borrowing activity.
          </p>
        </div>

        {/* Branding reminder */}
        <div className="p-3 bg-cream rounded-xl border border-slate-200/80 flex items-center gap-2.5 mb-5 text-xs text-slate-600">
          <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center text-white flex-shrink-0">
            <HugeiconsIcon icon={BookOpen01Icon} size={14} />
          </div>
          <span>Your books and history are safe — they're stored in your account.</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} />
            <span>Yes, log me out</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
