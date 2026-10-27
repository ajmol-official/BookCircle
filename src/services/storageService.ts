import type { User, AuthSession } from '../types/auth';

const STORAGE_KEYS = {
  SESSION: 'bookcircle_auth_session',
  USERS: 'bookcircle_users_db',
  ONBOARDING_DISMISSED: 'bookcircle_onboarding_dismissed',
} as const;

// Default initial accounts for seamless local testing and rich demo data
export const INITIAL_USERS: User[] = [
  {
    id: 'user-maya-lin',
    email: 'maya.reader@bookcircle.org',
    phoneNumber: '+44 7700 900077',
    countryCode: '+44',
    displayName: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    location: 'Elm Park, North London',
    bio: 'Slow reader. Love novels that feel like long walks. Currently working through Elena Ferrante.',
    memberSince: 'February 2024',
    trustScore: 4.9,
    lendsCount: 18,
    borrowsCount: 24,
    authProvider: 'demo',
    favoriteGenres: ['Fiction', 'Non-fiction', 'History', 'Poetry'],
    isProfileComplete: true,
    notificationPreferences: {
      email: true,
      push: true,
      whatsapp: true,
    },
  },
  {
    id: 'user-arif-ahmed',
    email: 'arif.ahmed@example.com',
    phoneNumber: '+44 7700 900123',
    countryCode: '+44',
    displayName: 'Arif Ahmed',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    location: 'Highbury Fields, London',
    bio: 'Architecture student & bibliophile. Constantly sharing books on design, culture & fiction.',
    memberSince: 'January 2023',
    trustScore: 4.9,
    lendsCount: 52,
    borrowsCount: 30,
    authProvider: 'demo',
    favoriteGenres: ['Fiction', 'History', 'Science'],
    isProfileComplete: true,
  },
];

class StorageService {
  private memoryFallback: Map<string, string> = new Map();

  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__bc_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private getItem(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      return window.localStorage.getItem(key);
    }
    return this.memoryFallback.get(key) || null;
  }

  private setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      window.localStorage.setItem(key, value);
    } else {
      this.memoryFallback.set(key, value);
    }
  }

  private removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      window.localStorage.removeItem(key);
    } else {
      this.memoryFallback.delete(key);
    }
  }

  // --- Users Database ---
  getUsers(): User[] {
    try {
      const raw = this.getItem(STORAGE_KEYS.USERS);
      if (!raw) {
        this.saveUsers(INITIAL_USERS);
        return INITIAL_USERS;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  saveUsers(users: User[]): void {
    try {
      this.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users database to storage', e);
    }
  }

  findUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  findUserByEmail(email: string): User | undefined {
    const clean = email.trim().toLowerCase();
    return this.getUsers().find((u) => u.email?.trim().toLowerCase() === clean);
  }

  findUserByPhone(phoneNumber: string): User | undefined {
    const clean = phoneNumber.replace(/[\s()-]/g, '');
    return this.getUsers().find((u) => u.phoneNumber?.replace(/[\s()-]/g, '') === clean);
  }

  saveOrUpdateUser(user: User): User {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    this.saveUsers(users);

    // Also update active session if it matches
    const currentSession = this.getSession();
    if (currentSession && currentSession.user.id === user.id) {
      this.saveSession({
        ...currentSession,
        user: { ...currentSession.user, ...user },
      });
    }

    return user;
  }

  // --- Session Management ---
  getSession(): AuthSession | null {
    try {
      const raw = this.getItem(STORAGE_KEYS.SESSION);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      // Validate expiration (7 days session)
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  saveSession(session: AuthSession): void {
    try {
      this.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session to storage', e);
    }
  }

  clearSession(): void {
    this.removeItem(STORAGE_KEYS.SESSION);
  }

  // --- Onboarding Dismissal ---
  isOnboardingDismissed(): boolean {
    return this.getItem(STORAGE_KEYS.ONBOARDING_DISMISSED) === 'true';
  }

  setOnboardingDismissed(dismissed: boolean): void {
    this.setItem(STORAGE_KEYS.ONBOARDING_DISMISSED, dismissed ? 'true' : 'false');
  }
}

export const storageService = new StorageService();
