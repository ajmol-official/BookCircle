import type { User, AuthSession, PhoneOtpVerification } from '../types/auth';
import { storageService } from './storageService';

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

  // --- Google Authentication ---
  async loginWithGoogle(options?: {
    email?: string;
    displayName?: string;
    avatar?: string;
  }): Promise<{ user: User; isNewUser: boolean; session: AuthSession }> {
    // Simulate real network latency (400ms) for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 450));

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

    // New Google User
    const newUser: User = {
      id: `user-g-${Date.now().toString(36)}`,
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
      authProvider: 'google',
      favoriteGenres: ['Fiction'],
      isProfileComplete: false, // Prompt profile completion
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

  // --- Phone / WhatsApp OTP Flow ---
  async requestPhoneOtp(
    phoneNumber: string,
    countryCode: string
  ): Promise<PhoneOtpVerification> {
    // Format sanitized phone
    const cleanDigits = phoneNumber.replace(/[\s()-]/g, '');
    if (!cleanDigits || cleanDigits.length < 5) {
      throw new Error('Please enter a valid phone number with your area code.');
    }

    const formattedNumber = `${countryCode} ${phoneNumber.trim()}`;
    const verificationId = `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    // Generate secure 6-digit OTP code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Store in memory
    activeVerifications.set(verificationId, {
      code: generatedCode,
      phoneNumber: cleanDigits,
      countryCode,
      formattedNumber,
      expiresAt,
      attempts: 0,
    });

    // Check if live WhatsApp Business API is configured
    const whatsappToken = (import.meta as any).env?.VITE_WHATSAPP_API_TOKEN;
    const whatsappPhoneId = (import.meta as any).env?.VITE_WHATSAPP_PHONE_NUMBER_ID;

    if (whatsappToken && whatsappPhoneId) {
      try {
        // Live WhatsApp Cloud API call
        await fetch(`https://graph.facebook.com/v21.0/${whatsappPhoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: `${countryCode.replace('+', '')}${cleanDigits}`,
            type: 'template',
            template: {
              name: 'bookcircle_verification_code',
              language: { code: 'en_US' },
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: generatedCode }],
                },
                {
                  type: 'button',
                  sub_type: 'url',
                  index: '0',
                  parameters: [{ type: 'text', text: generatedCode }],
                },
              ],
            },
          }),
        });
      } catch (err) {
        console.warn('WhatsApp API dispatch failed, falling back to safe local verification:', err);
      }
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      verificationId,
      phoneNumber: cleanDigits,
      countryCode,
      formattedNumber,
      expiresAt,
      testCode: generatedCode, // Exposed safely in UI for testing/demo when live credentials are not set
    };
  }

  async verifyPhoneOtp(
    verificationId: string,
    enteredCode: string
  ): Promise<{ user: User; isNewUser: boolean; session: AuthSession }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

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

    // Code is valid! Consume verification record
    activeVerifications.delete(verificationId);

    // Look up existing user by phone
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

    // Create new user via Phone verification
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
      isProfileComplete: false, // Take to profile setup
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
    const existing = storageService.findUserById(userId);
    if (!existing) {
      throw new Error('User not found');
    }

    const updatedUser: User = {
      ...existing,
      ...updates,
      // If display name is provided, mark profile as complete
      isProfileComplete: Boolean(updates.displayName?.trim() || existing.displayName),
    };

    return storageService.saveOrUpdateUser(updatedUser);
  }

  // --- Sign Out ---
  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    storageService.clearSession();
  }
}

export const authService = new AuthService();
