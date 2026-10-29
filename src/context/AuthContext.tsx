import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, PhoneOtpVerification, AuthPromptContext } from '../types/auth';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  loginWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ user: User | null; needsEmailConfirmation?: boolean }>;
  loginWithDemo: (email: string, displayName?: string) => Promise<User>;
  loginWithGoogle: (options?: { email?: string; displayName?: string }) => Promise<User | null>;
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
  wishlist: string[];
  toggleWishlist: (bookId: string) => boolean;
  isWishlisted: (bookId: string) => boolean;
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

  const handleAuthSuccess = useCallback(
    (user: User, isNewUser: boolean) => {
      setCurrentUser(user);
      setIsAuthModalOpen(false);

      if (isNewUser || !user.isProfileComplete) {
        setIsProfileSetupOpen(true);
      } else {
        if (pendingAuthorizedCallback) {
          const cb = pendingAuthorizedCallback;
          setPendingAuthorizedCallback(null);
          setAuthPromptContext(null);
          setTimeout(() => cb(), 100);
        } else {
          setAuthPromptContext(null);
        }
      }
    },
    [pendingAuthorizedCallback]
  );

  // Restore authenticated session on initial load and listen to Supabase auth events
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);
      try {
        // 1. Check if Supabase client has an active authenticated session
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data?.session?.user && isMounted) {
            const { user } = await authService.syncSupabaseSession(data.session.user);
            setCurrentUser(user);
            setIsLoading(false);
            return;
          }
        }

        // 2. Fallback to cached local session (for demo accounts or offline preview)
        const localSession = authService.getCurrentSession();
        if (localSession?.user && isMounted) {
          setCurrentUser(localSession.user);
        } else if (isMounted) {
          const dismissed = storageService.isOnboardingDismissed();
          if (!dismissed) {
            setIsOnboardingOpen(true);
          }
        }
      } catch (e) {
        console.error('Session restoration error:', e);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    // 3. Supabase Auth State Change Listener
    let authSubscription: { unsubscribe: () => void } | null = null;

    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (
          session?.user &&
          (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')
        ) {
          try {
            const { user, isNewUser } = await authService.syncSupabaseSession(session.user);
            handleAuthSuccess(user, isNewUser);

            if (window.location.hash && window.location.hash.includes('access_token')) {
              const redirectPath = sessionStorage.getItem('bookcircle_auth_redirect') || window.location.pathname;
              sessionStorage.removeItem('bookcircle_auth_redirect');
              window.history.replaceState(null, '', redirectPath);
            }
          } catch (syncErr) {
            console.error('Failed to sync Supabase user session:', syncErr);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          storageService.clearSession();
        }
      });

      authSubscription = data?.subscription;
    }

    return () => {
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [handleAuthSuccess]);

  // Real Email & Password Login
  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<User> => {
      setIsLoading(true);
      try {
        const { user } = await authService.signInWithEmail(email, password);
        handleAuthSuccess(user, false);
        return user;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  // Real Email & Password Sign-Up
  const signUpWithEmail = useCallback(
    async (
      email: string,
      password: string,
      fullName: string
    ): Promise<{ user: User | null; needsEmailConfirmation?: boolean }> => {
      setIsLoading(true);
      try {
        const result = await authService.signUpWithEmail(email, password, fullName);
        if (result.user) {
          handleAuthSuccess(result.user, true);
        }
        return { user: result.user, needsEmailConfirmation: result.needsEmailConfirmation };
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  // Quick Demo Account Login
  const loginWithDemo = useCallback(
    async (email: string, displayName?: string): Promise<User> => {
      setIsLoading(true);
      try {
        const result = await authService.loginWithDemo({ email, displayName });
        handleAuthSuccess(result.user, result.isNewUser);
        return result.user;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  // Google Sign-In Handler
  const loginWithGoogle = useCallback(
    async (options?: { email?: string; displayName?: string }): Promise<User | null> => {
      setIsLoading(true);
      try {
        if (options?.email) {
          const result = await authService.loginWithDemo(options);
          handleAuthSuccess(result.user, result.isNewUser);
          return result.user;
        }

        await authService.signInWithGoogle();
        return null;
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

  const dismissOnboarding = useCallback((_neverShowAgain?: boolean) => {
    setIsOnboardingOpen(false);
    storageService.setOnboardingDismissed(true);
  }, []);

  const reopenOnboarding = useCallback(() => {
    setIsOnboardingOpen(true);
  }, []);

  // --- Wishlist Management ---
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return storageService.getWishlist();
  });

  const isWishlisted = useCallback((bookId: string) => {
    return wishlist.includes(bookId);
  }, [wishlist]);

  const toggleWishlist = useCallback((bookId: string): boolean => {
    let added = false;
    setWishlist((prev) => {
      let next: string[];
      if (prev.includes(bookId)) {
        next = prev.filter((id) => id !== bookId);
        added = false;
      } else {
        next = [...prev, bookId];
        added = true;
      }
      storageService.saveWishlist(next);

      if (currentUser) {
        const updatedUser: User = { ...currentUser, wishlist: next };
        storageService.saveOrUpdateUser(updatedUser);
      }
      return next;
    });
    return added;
  }, [currentUser]);

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
        loginWithEmail,
        signUpWithEmail,
        loginWithDemo,
        loginWithGoogle,
        requestPhoneOtp,
        verifyPhoneOtp,
        updateProfile,
        logout,
        requireAuth,
        wishlist,
        toggleWishlist,
        isWishlisted,
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
