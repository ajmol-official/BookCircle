import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon,
  Mail01Icon,
  LockIcon,
  ViewIcon,
  ViewOffSlashIcon,
  UserCircle02Icon,
  Cancel01Icon,
  ShieldCheckIcon,
  CheckmarkCircle02Icon,
  GiftIcon
} from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import { modalBackdropVariants, modalContentVariants } from '../../animations/motionVariants';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authPromptContext,
    setAuthPromptContext,
    loginWithEmail,
    signUpWithEmail,
    loginWithDemo,
  } = useAuth();

  // Tab: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Status feedback
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isAuthModalOpen) {
      setEmail('');
      setPassword('');
      setFullName('');
      setErrorMessage(null);
      setSuccessNotice(null);
      setIsLoading(false);
      setShowPassword(false);
    }
  }, [isAuthModalOpen]);

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setAuthPromptContext(null);
  };

  // --- Submit Handler (Sign In or Sign Up) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'signup') {
        const result = await signUpWithEmail(email, password, fullName);
        if (result.needsEmailConfirmation) {
          setSuccessNotice(
            `Account created for ${email}! Please check your email inbox to confirm, or if "Confirm email" is turned off in your Supabase dashboard, switch to Sign In tab and log in.`
          );
          setActiveTab('signin');
        }
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 1-Click Demo Login Handler ---
  const handleDemoSignIn = async (demoEmail: string, demoName: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);
    try {
      await loginWithDemo(demoEmail, demoName);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not sign in as demo user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Dialog */}
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Top Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-amber-400 to-brand" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>

            {/* Context Notice (if triggered by a specific action like borrow/claim) */}
            {authPromptContext && (
              <div
                className={`mb-5 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs animate-in fade-in ${
                  authPromptContext.targetAction === 'claim'
                    ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-950'
                    : 'bg-amber-50/80 border border-amber-200/70 text-amber-900'
                }`}
              >
                <HugeiconsIcon
                  icon={authPromptContext.targetAction === 'claim' ? GiftIcon : LockIcon}
                  size={16}
                  className={`${
                    authPromptContext.targetAction === 'claim' ? 'text-emerald-700' : 'text-amber-700'
                  } flex-shrink-0 mt-0.5`}
                />
                <div>
                  <p className="font-semibold">{authPromptContext.title || 'Account Required'}</p>
                  <p
                    className={`${
                      authPromptContext.targetAction === 'claim'
                        ? 'text-emerald-800'
                        : 'text-amber-800/90'
                    } mt-0.5 leading-relaxed`}
                  >
                    {authPromptContext.message}
                  </p>
                </div>
              </div>
            )}

            {/* Modal Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                <HugeiconsIcon icon={BookOpen01Icon} size={24} />
              </div>
              <h3 className="font-serif text-2xl font-semibold text-slate-900 tracking-tight">
                {activeTab === 'signin' ? 'Welcome Back' : 'Join BookCircle'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'signin'
                  ? 'Sign in to access your personal shelf and circle'
                  : 'Share, lend, and borrow real physical books with neighbors'}
              </p>
            </div>

            {/* Segmented Tab Switcher: Sign In vs Create Account */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 border border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                  activeTab === 'signin'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                  activeTab === 'signup'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Success Notification */}
            {successNotice && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in leading-relaxed">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in leading-relaxed">
                <span className="font-bold flex-shrink-0">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name Field (Sign Up only) */}
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <HugeiconsIcon
                      icon={UserCircle02Icon}
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Lin"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* Email Address Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={LockIcon}
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <HugeiconsIcon icon={showPassword ? ViewOffSlashIcon : ViewIcon} size={16} />
                  </button>
                </div>
                {activeTab === 'signup' && (
                  <p className="text-[11px] text-slate-400 mt-1">Must be at least 6 characters</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>{activeTab === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <span>{activeTab === 'signin' ? 'Sign In to BookCircle' : 'Create My Account'}</span>
                )}
              </button>
            </form>

            {/* Quick 1-Click Demo Accounts (Fast Testing) */}
            <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <HugeiconsIcon icon={ShieldCheckIcon} size={14} className="text-brand" />
                <span>1-Click Test Accounts:</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoSignIn('maya.reader@bookcircle.org', 'Maya Lin')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand text-slate-700 font-medium hover:text-brand transition text-[11px] text-center shadow-2xs active:scale-95"
                >
                  Maya Lin
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleDemoSignIn('arif.ahmed@example.com', 'Arif Ahmed')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-brand text-slate-700 font-medium hover:text-brand transition text-[11px] text-center shadow-2xs active:scale-95"
                >
                  Arif Ahmed
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 text-center text-[11px] text-slate-400">
              <span>By continuing, you agree to BookCircle's community trust guidelines.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
