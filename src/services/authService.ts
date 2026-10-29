import type { User, AuthSession, PhoneOtpVerification } from '../types/auth';
import { storageService } from './storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Active in-memory OTP verification store
const activeVerifications = new Map<
  string,
  {
    code: string;
    phoneNumber: string;
    countryCode: string;
    formattedNumber: string;
    expiresAt: number;
    attempts: number;
  }
>();

export class AuthService {
  // --- Session Restoration ---
  getCurrentSession(): AuthSession | null {
    return storageService.getSession();
  }

  getCurrentUser(): User | null {
    const session = this.getCurrentSession();
    return session ? session.user : null;
  }

  // =========================================================================
  // Real Supabase Email & Password Authentication
  // =========================================================================

  /**
   * Real Supabase Email & Password Sign-Up
   */
  async signUpWithEmail(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ user: User | null; isNewUser: boolean; session?: AuthSession; needsEmailConfirmation?: boolean }> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured yet. Please check environment variables.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || cleanEmail.split('@')[0];

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('An account with this email already exists. Please switch to the Sign In tab.');
      }
      if (error.message.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long.');
      }
      throw new Error(error.message);
    }

    if (data.session?.user) {
      // Auto-logged in!
      const syncResult = await this.syncSupabaseSession(data.session.user);
      return { ...syncResult, needsEmailConfirmation: false };
    }

    if (data.user) {
      // User created, but requires email confirmation before session is granted
      return { user: null, isNewUser: true, needsEmailConfirmation: true };
    }

    throw new Error('Could not create account. Please try again.');
  }

  /**
   * Real Supabase Email & Password Sign-In
   */
  async signInWithEmail(
    email: string,
    password: string
  ): Promise<{ user: User; session: AuthSession }> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured yet. Please check environment variables.');
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      if (error.message?.includes('Email not confirmed')) {
        throw new Error(
          'Email not confirmed yet! In your Supabase Dashboard -> Authentication -> Providers -> Email, turn OFF "Confirm email" for instant login, or check your email for the confirmation link.'
        );
      }
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please verify your credentials and try again.');
      }
      throw new Error(error.message || 'Failed to sign in.');
    }

    if (!data.session?.user) {
      throw new Error('No user session received from Supabase.');
    }

    const { user, session } = await this.syncSupabaseSession(data.session.user);
    return { user, session };
  }

  // =========================================================================
  // Real Supabase Google OAuth Sign-In (Optional)
  // =========================================================================
  async signInWithGoogle(redirectDestination?: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured yet. Please check environment variables.');
    }

    const destination = redirectDestination || window.location.pathname || '/';
    try {
      sessionStorage.setItem('bookcircle_auth_redirect', destination);
    } catch {}

    const redirectTo = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      const msg = error.message || '';
      if (
        msg.toLowerCase().includes('not enabled') ||
        msg.toLowerCase().includes('unsupported provider')
      ) {
        throw new Error(
          'Google Sign-In is not yet enabled in your Supabase project. We recommend using Email & Password sign-in instead!'
        );
      }
      throw new Error(msg || 'Failed to initialize Google authentication.');
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  }

  /**
   * Synchronizes an authenticated Supabase user into BookCircle's User format.
   * Checks public.profiles table or safely upserts a default profile.
   */
  async syncSupabaseSession(supabaseUser: any): Promise<{ user: User; isNewUser: boolean; session: AuthSession }> {
    const userId = supabaseUser.id;
    const email = supabaseUser.email || '';
    const meta = supabaseUser.user_metadata || {};
    const displayName =
      meta.full_name || meta.name || (email ? email.split('@')[0].replace(/[._-]/g, ' ') : 'Community Reader');
    const avatar =
      meta.avatar_url ||
      meta.picture ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

    let profile: any = null;
    let isNewUser = false;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.warn('Could not query public.profiles:', error.message);
        } else if (data) {
          profile = data;
        }

        // If no profile row exists, create one now
        if (!profile) {
          isNewUser = true;
          const newProfilePayload = {
            id: userId,
            full_name: displayName,
            avatar_url: avatar,
            location: 'Nearby Neighborhood',
            member_since: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            trust_tier: 'Tier 1 · Verified Member',
            trust_score: '100% on schedule',
            total_borrows: 0,
            books_available: 0,
            verified: true,
          };

          const { data: inserted, error: insertError } = await supabase
            .from('profiles')
            .upsert(newProfilePayload, { onConflict: 'id' })
            .select()
            .maybeSingle();

          if (!insertError && inserted) {
            profile = inserted;
          }
        }
      } catch (err) {
        console.warn('Error reading or inserting profile row:', err);
      }
    }

    const provider = supabaseUser.app_metadata?.provider === 'google' ? 'google' : 'email';
    const localUser = storageService.findUserById(userId);

    // Map to canonical BookCircle User object
    const user: User = {
      id: userId,
      email,
      displayName: profile?.full_name || displayName,
      avatar: profile?.avatar_url || avatar,
      location: profile?.location || 'Local Community Reader',
      bio: profile?.bio || '',
      memberSince:
        profile?.member_since ||
        new Date(supabaseUser.created_at || Date.now()).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      trustScore: 5.0,
      lendsCount: profile?.books_for_lending || 0,
      borrowsCount: profile?.total_borrows || 0,
      authProvider: provider,
      favoriteGenres: localUser?.favoriteGenres?.length
        ? localUser.favoriteGenres
        : ['Fiction', 'Non-fiction'],
      isProfileComplete: Boolean(profile?.full_name && profile?.location),
      notificationPreferences: {
        email: true,
        push: true,
        whatsapp: false,
      },
    };

    // Cache locally for offline and fast reloads
    storageService.saveOrUpdateUser(user);

    const session: AuthSession = {
      user,
      token: `supabase_${userId}`,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };
    storageService.saveSession(session);

    return { user, isNewUser, session };
  }

  // --- Quick Demo Accounts (for offline & instant UI review) ---
  async loginWithDemo(options?: {
    email?: string;
    displayName?: string;
    avatar?: string;
  }): Promise<{ user: User; isNewUser: boolean; session: AuthSession }> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const email = options?.email || 'reader.demo@bookcircle.org';
    const existing = storageService.findUserByEmail(email);

    if (existing) {
      const session: AuthSession = {
        user: existing,
        token: `bc_tok_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS,
      };
      storageService.saveSession(session);
      return { user: existing, isNewUser: false, session };
    }

    const newUser: User = {
      id: `user-demo-${Date.now().toString(36)}`,
      email,
      displayName: options?.displayName || email.split('@')[0].replace(/[._-]/g, ' '),
      avatar:
        options?.avatar ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
      location: 'Local Community Reader',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      trustScore: 5.0,
      lendsCount: 0,
      borrowsCount: 0,
      authProvider: 'demo',
      favoriteGenres: ['Fiction'],
      isProfileComplete: false,
      notificationPreferences: {
        email: true,
        push: true,
        whatsapp: false,
      },
    };

    storageService.saveOrUpdateUser(newUser);

    const session: AuthSession = {
      user: newUser,
      token: `bc_tok_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };
    storageService.saveSession(session);

    return { user: newUser, isNewUser: true, session };
  }

  async loginWithGoogle(options?: {
    email?: string;
    displayName?: string;
    avatar?: string;
  }): Promise<{ user: User; isNewUser: boolean; session: AuthSession } | void> {
    if (options?.email) {
      return this.loginWithDemo(options);
    }
    await this.signInWithGoogle();
  }

  // --- Phone / WhatsApp OTP Flow ---
  async requestPhoneOtp(
    phoneNumber: string,
    countryCode: string
  ): Promise<PhoneOtpVerification> {
    const cleanDigits = phoneNumber.replace(/[\s()-]/g, '');
    if (!cleanDigits || cleanDigits.length < 5) {
      throw new Error('Please enter a valid phone number with your area code.');
    }

    const formattedNumber = `${countryCode} ${phoneNumber.trim()}`;
    const verificationId = `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    activeVerifications.set(verificationId, {
      code: generatedCode,
      phoneNumber: cleanDigits,
      countryCode,
      formattedNumber,
      expiresAt,
      attempts: 0,
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      verificationId,
      phoneNumber: cleanDigits,
      countryCode,
      formattedNumber,
      expiresAt,
      testCode: generatedCode,
    };
  }

  async verifyPhoneOtp(
    verificationId: string,
    enteredCode: string
  ): Promise<{ user: User; isNewUser: boolean; session: AuthSession }> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const record = activeVerifications.get(verificationId);
    if (!record) {
      throw new Error('Verification session expired or not found. Please request a new code.');
    }

    if (Date.now() > record.expiresAt) {
      activeVerifications.delete(verificationId);
      throw new Error('This verification code has expired. Please request a new code.');
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      activeVerifications.delete(verificationId);
      throw new Error('Too many failed attempts. Please request a new code.');
    }

    if (record.code !== enteredCode.trim()) {
      throw new Error('Invalid verification code. Please check and try again.');
    }

    activeVerifications.delete(verificationId);

    const fullPhone = `${record.countryCode} ${record.phoneNumber}`;
    const existing = storageService.findUserByPhone(fullPhone);

    if (existing) {
      const session: AuthSession = {
        user: existing,
        token: `bc_tok_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION_MS,
      };
      storageService.saveSession(session);
      return { user: existing, isNewUser: false, session };
    }

    const newUser: User = {
      id: `user-p-${Date.now().toString(36)}`,
      phoneNumber: fullPhone,
      countryCode: record.countryCode,
      displayName: `Reader ${record.phoneNumber.slice(-4)}`,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      location: 'Local Neighborhood',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      trustScore: 5.0,
      lendsCount: 0,
      borrowsCount: 0,
      authProvider: 'phone',
      favoriteGenres: ['Fiction', 'Non-fiction'],
      isProfileComplete: false,
      notificationPreferences: {
        email: false,
        push: true,
        whatsapp: true,
      },
    };

    storageService.saveOrUpdateUser(newUser);

    const session: AuthSession = {
      user: newUser,
      token: `bc_tok_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };
    storageService.saveSession(session);

    return { user: newUser, isNewUser: true, session };
  }

  // --- Profile Completion & Updates ---
  async updateProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    const existing = storageService.findUserById(userId) || this.getCurrentUser();
    if (!existing) {
      throw new Error('User not found');
    }

    const updatedUser: User = {
      ...existing,
      ...updates,
      isProfileComplete: Boolean(updates.displayName?.trim() || existing.displayName),
    };

    const saved = storageService.saveOrUpdateUser(updatedUser);

    if (isSupabaseConfigured() && userId && userId.includes('-') && !userId.startsWith('user-')) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updatedUser.displayName,
            avatar_url: updatedUser.avatar,
            location: updatedUser.location,
            bio: updatedUser.bio,
          })
          .eq('id', userId);
      } catch (err) {
        console.warn('Could not sync profile update to Supabase:', err);
      }
    }

    return saved;
  }

  // --- Sign Out ---
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    storageService.clearSession();
    try {
      sessionStorage.removeItem('bookcircle_auth_redirect');
    } catch {}
  }
}

export const authService = new AuthService();
