import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon,
  GoogleIcon,
  WhatsappIcon,
  SmartPhone01Icon,
  Cancel01Icon,
  ArrowLeft01Icon,
  ShieldCheckIcon,
  LockIcon,
  RefreshIcon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import type { PhoneOtpVerification } from '../../types/auth';
import { modalBackdropVariants, modalContentVariants } from '../../animations/motionVariants';

const COUNTRY_CODES = [
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'United States & Canada', flag: '🇺🇸' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authPromptContext,
    setAuthPromptContext,
    loginWithGoogle,
    requestPhoneOtp,
    verifyPhoneOtp,
  } = useAuth();

  // Mode: 'select' | 'google' | 'phone-input' | 'phone-otp'
  const [authMode, setAuthMode] = useState<'select' | 'phone-input' | 'phone-otp'>('select');
  const [countryCode, setCountryCode] = useState<string>('+44');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [activeVerification, setActiveVerification] = useState<PhoneOtpVerification | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // References for OTP input auto-advance
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isAuthModalOpen) {
      setAuthMode('select');
      setPhoneNumber('');
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMessage(null);
      setActiveVerification(null);
    }
  }, [isAuthModalOpen]);

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setAuthPromptContext(null);
  };

  // --- Google OAuth Handler ---
  const handleGoogleSignIn = async (presetEmail?: string, presetName?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle({ email: presetEmail, displayName: presetName });
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in was cancelled or encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Request WhatsApp OTP Handler ---
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const verification = await requestPhoneOtp(phoneNumber, countryCode);
      setActiveVerification(verification);
      setAuthMode('phone-otp');
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      // Focus first digit box
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not dispatch WhatsApp code. Please verify your phone number.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Resend OTP Handler ---
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !activeVerification) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const verification = await requestPhoneOtp(phoneNumber, countryCode);
      setActiveVerification(verification);
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- OTP Input Change ---
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto-advance
    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // --- Verify Phone OTP Handler ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!activeVerification) {
      setErrorMessage('Verification session expired. Please request a new code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await verifyPhoneOtp(activeVerification.verificationId, code);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid code. Please check and try again.');
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

          {/* Modal Content Dialog */}
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
            {/* Top Gradient Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-amber-400 to-brand" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Back Button (when inside phone flow) */}
        {authMode !== 'select' && (
          <button
            onClick={() => {
              setErrorMessage(null);
              setAuthMode(authMode === 'phone-otp' ? 'phone-input' : 'select');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand mb-4 transition"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            <span>Back</span>
          </button>
        )}

        {/* Intent-Aware Action Notice (if prompted by an action) */}
        {authPromptContext && (
          <div className="mb-5 p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
            <HugeiconsIcon icon={LockIcon} size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{authPromptContext.title || 'Account Required'}</p>
              <p className="text-amber-800/90 mt-0.5 leading-relaxed">{authPromptContext.message}</p>
            </div>
          </div>
        )}

        {/* Main Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <HugeiconsIcon icon={BookOpen01Icon} size={24} />
          </div>
          <h3 className="font-serif text-2xl font-semibold text-slate-900 tracking-tight">
            Welcome to BookCircle
          </h3>
          <p className="font-serif italic text-xs sm:text-sm text-slate-500 mt-1">
            Your next favorite book might be closer than you think.
          </p>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
            <span className="font-bold">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* --- VIEW 1: Primary Selection --- */}
        {authMode === 'select' && (
          <div className="space-y-3.5">
            {/* Option A: Continue with Google */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleGoogleSignIn()}
              className="w-full py-3 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-3 relative"
            >
              <HugeiconsIcon icon={GoogleIcon} size={18} className="text-[#4285F4]" />
              <span>Continue with Google</span>
            </button>

            {/* Quick Demo Google Switcher for Returning vs New testing */}
            <div className="p-3 bg-[#FDF8F2] rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <HugeiconsIcon icon={ShieldCheckIcon} size={14} className="text-brand" />
                Quick-test accounts:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('maya.reader@bookcircle.org', 'Maya Lin')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand text-slate-700 font-medium hover:text-brand transition text-[11px]"
                >
                  Maya Lin (Returning)
                </button>
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn('alex.chen@example.com', 'Alex Chen')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand text-slate-700 font-medium hover:text-brand transition text-[11px]"
                >
                  Alex Chen (New Account)
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Or
              </span>
            </div>

            {/* Option B: Continue with Phone Number (WhatsApp) */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setAuthMode('phone-input')}
              className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-sm shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2.5"
            >
              <HugeiconsIcon icon={WhatsappIcon} size={20} />
              <span>Continue with WhatsApp</span>
            </button>
          </div>
        )}

        {/* --- VIEW 2: Phone Number Input --- */}
        {authMode === 'phone-input' && (
          <form onSubmit={handleSendPhoneOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number (for WhatsApp Verification)
              </label>
              <div className="flex items-center gap-2">
                {/* Country Code Picker */}
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                >
                  {COUNTRY_CODES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag} {item.code}
                    </option>
                  ))}
                </select>

                {/* Phone Digits Input */}
                <div className="relative flex-1">
                  <HugeiconsIcon
                    icon={SmartPhone01Icon}
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="7700 900077"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full py-2.5 pl-9 pr-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                We'll send a 6-digit security code via WhatsApp to verify your account.
              </p>
            </div>

            {/* Returning Phone Quick Fill */}
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
              <span>Try existing user phone:</span>
              <button
                type="button"
                onClick={() => {
                  setCountryCode('+44');
                  setPhoneNumber('7700 900077');
                }}
                className="text-brand hover:underline font-medium"
              >
                +44 7700 900077 (Maya)
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-sm shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <span>Sending WhatsApp Code...</span>
              ) : (
                <>
                  <HugeiconsIcon icon={WhatsappIcon} size={18} />
                  <span>Send Verification Code</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* --- VIEW 3: OTP Verification Screen --- */}
        {authMode === 'phone-otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <p className="text-xs text-slate-600">
                Enter the 6-digit code sent to your WhatsApp at:
              </p>
              <p className="font-semibold text-sm text-slate-800 mt-0.5">
                {activeVerification?.formattedNumber || `${countryCode} ${phoneNumber}`}
              </p>
            </div>

            {/* Test Code Callout (shown clearly when live WhatsApp keys are pending setup) */}
            {activeVerification?.testCode && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  WhatsApp Verification Code
                </span>
                <div className="text-lg font-mono font-bold text-emerald-900 tracking-widest mt-0.5">
                  {activeVerification.testCode}
                </div>
                <p className="text-[10px] text-emerald-600 mt-1">
                  (Live provider: Meta WhatsApp Cloud API credentials can be set via <code className="bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-800">.env</code>)
                </p>
              </div>
            )}

            {/* 6-Digit OTP Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-10 sm:w-12 h-12 sm:h-14 text-center font-bold text-lg rounded-xl border ${
                    digit
                      ? 'border-brand bg-brand/5 text-brand ring-2 ring-brand/10'
                      : 'border-slate-300 text-slate-800'
                  } focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20`}
                />
              ))}
            </div>

            {/* Resend Controls */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Didn't receive the message?</span>
              {resendCooldown > 0 ? (
                <span className="font-medium text-slate-400">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-semibold text-brand hover:underline flex items-center gap-1"
                >
                  <HugeiconsIcon icon={RefreshIcon} size={14} />
                  <span>Resend via WhatsApp</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-brand hover:bg-brand/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Verifying Code...</span>
              ) : (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                  <span>Verify & Continue</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Privacy & Safety Notes */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 leading-relaxed">
          <span>By signing in, you agree to BookCircle's community trust guidelines. </span>
          <span className="text-slate-500">Phone numbers and emails remain strictly private.</span>
        </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
