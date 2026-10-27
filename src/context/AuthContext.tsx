import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, PhoneOtpVerification, AuthPromptContext } from '../types/auth';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authPromptContext: AuthPromptContext | null;
  setAuthPromptContext: (ctx: AuthPromptContext | null) => void;
  isProfileSetupOpen: boolean;
  setIsProfileSetupOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  dismissOnboarding: (neverShowAgain?: boolean) => void;
  reopenOnboarding: () => void;
  loginWithGoogle: (options?: { email?: string; displayName?: string }) => Promise<User>;
  requestPhoneOtp: (phoneNumber: string, countryCode: string) => Promise<PhoneOtpVerification>;
  verifyPhoneOtp: (verificationId: string, code: string) => Promise<User>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  requireAuth: (options: {
    title?: string;
    message: string;
    targetAction?: AuthPromptContext['targetAction'];
    bookTitle?: string;
    ownerName?: string;
    onAuthorized: () => void;
  }) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authPromptContext, setAuthPromptContext] = useState<AuthPromptContext | null>(null);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Pending callback after authentication succeeds
  const [pendingAuthorizedCallback, setPendingAuthorizedCallback] = useState<(() => void) | null>(null);

  // Restore authenticated session on initial load
  useEffect(() => {
    try {
      const session = authService.getCurrentSession();
      if (session && session.user) {
        setCurrentUser(session.user);
      } else {
        // If unauthenticated guest and onboarding was never dismissed, open onboarding
        const dismissed = storageService.isOnboardingDismissed();
        if (!dismissed) {
          setIsOnboardingOpen(true);
        }
      }
    } catch (e) {
      console.error('Session restoration error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAuthSuccess = useCallback(
    (user: User, isNewUser: boolean) => {
      setCurrentUser(user);
      setIsAuthModalOpen(false);

      if (isNewUser || !user.isProfileComplete) {
        // Take to short profile setup
        setIsProfileSetupOpen(true);
      } else {
        // Resume pending user action if one was queued
        if (pendingAuthorizedCallback) {
          const cb = pendingAuthorizedCallback;
          setPendingAuthorizedCallback(null);
          setAuthPromptContext(null);
          // Execute callback in next frame
          setTimeout(() => cb(), 100);
        } else {
          setAuthPromptContext(null);
        }
      }
    },
    [pendingAuthorizedCallback]
  );

  const loginWithGoogle = useCallback(
    async (options?: { email?: string; displayName?: string }) => {
      setIsLoading(true);
      try {
        const result = await authService.loginWithGoogle(options);
        handleAuthSuccess(result.user, result.isNewUser);
        return result.user;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const requestPhoneOtp = useCallback(
    async (phoneNumber: string, countryCode: string) => {
      return authService.requestPhoneOtp(phoneNumber, countryCode);
    },
    []
  );

  const verifyPhoneOtp = useCallback(
    async (verificationId: string, code: string) => {
      setIsLoading(true);
      try {
        const result = await authService.verifyPhoneOtp(verificationId, code);
        handleAuthSuccess(result.user, result.isNewUser);
        return result.user;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!currentUser) throw new Error('No authenticated user');
      const updated = await authService.updateProfile(currentUser.id, data);
      setCurrentUser(updated);

      // If completing profile setup, close modal and resume pending action
      if (isProfileSetupOpen) {
        setIsProfileSetupOpen(false);
        if (pendingAuthorizedCallback) {
          const cb = pendingAuthorizedCallback;
          setPendingAuthorizedCallback(null);
          setAuthPromptContext(null);
          setTimeout(() => cb(), 100);
        }
      }

      return updated;
    },
    [currentUser, isProfileSetupOpen, pendingAuthorizedCallback]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
      setPendingAuthorizedCallback(null);
      setAuthPromptContext(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requireAuth = useCallback(
    (options: {
      title?: string;
      message: string;
      targetAction?: AuthPromptContext['targetAction'];
      bookTitle?: string;
      ownerName?: string;
      onAuthorized: () => void;
    }): boolean => {
      if (currentUser) {
        options.onAuthorized();
        return true;
      }

      // Guest user: open Auth Modal with action context and queue callback
      setAuthPromptContext({
        title: options.title,
        message: options.message,
        targetAction: options.targetAction,
        bookTitle: options.bookTitle,
        ownerName: options.ownerName,
        onAuthorized: options.onAuthorized,
      });
      setPendingAuthorizedCallback(() => options.onAuthorized);
      setIsAuthModalOpen(true);
      return false;
    },
    [currentUser]
  );

  const dismissOnboarding = useCallback((neverShowAgain = true) => {
    setIsOnboardingOpen(false);
    if (neverShowAgain) {
      storageService.setOnboardingDismissed(true);
    }
  }, []);

  const reopenOnboarding = useCallback(() => {
    setIsOnboardingOpen(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authPromptContext,
        setAuthPromptContext,
        isProfileSetupOpen,
        setIsProfileSetupOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        dismissOnboarding,
        reopenOnboarding,
        loginWithGoogle,
        requestPhoneOtp,
        verifyPhoneOtp,
        updateProfile,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
