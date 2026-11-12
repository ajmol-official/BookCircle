import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Author } from '../types/author';
import type { WriterApplication, AuthorWorkSuggestion } from '../types/writer';
import { initialAuthors, generateAuthorSlug } from '../data/authors';
import { useAuth } from './AuthContext';

const STORAGE_KEYS = {
  APPLICATIONS: 'bookcircle_writer_applications',
  CUSTOM_AUTHORS: 'bookcircle_custom_authors',
  WORK_SUGGESTIONS: 'bookcircle_writer_work_suggestions',
  EXPERIENCE_MODE: 'bookcircle_experience_mode',
};

// Seed sample applications for development / admin review testing if empty
const DEFAULT_SEED_APPLICATIONS: WriterApplication[] = [
  {
    id: 'app-seed-elena-rostova',
    userId: 'user-demo-writer-1',
    applicantName: 'Elena Rostova',
    applicantEmail: 'elena.rostova@literaryagency.co.uk',
    type: 'create_new',
    status: 'pending',
    verificationNotes:
      'Debut literary fiction author. "The Winter Garden of St. Petersburg" published with Bloomsbury UK (Autumn 2025). Seeking to connect with London book clubs.',
    verificationLinks: [
      'https://www.bloomsbury.com/authors/elena-rostova',
      'https://twitter.com/elenarostova_writes',
    ],
    proposedAuthor: {
      name: 'Elena Rostova',
      profession: 'Literary Fiction Novelist & Essayist',
      nationality: 'British-Ukrainian',
      countryFlag: '🇬🇧',
      bio: 'Elena Rostova is a contemporary fiction novelist whose debut work explores diaspora memory and family chronicles between Kyiv and London.',
      born: '1988',
      birthPlace: 'Kyiv, Ukraine',
      websiteUrl: 'https://elenarostova.co.uk',
      literaryAchievements: ['Sunday Times Young Writer of the Year Nominee 2025'],
      notableWorks: ['The Winter Garden of St. Petersburg'],
    },
    submittedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'app-seed-arundhati-claim',
    userId: 'user-claimant-demo',
    applicantName: 'Arundhati Roy Studio',
    applicantEmail: 'contact@arundhatiroy-official.org',
    type: 'claim_existing',
    status: 'pending',
    targetAuthorId: 'author-arundhati-roy',
    targetAuthorName: 'Arundhati Roy',
    targetAuthorSlug: 'arundhati-roy',
    verificationNotes:
      'Official representative management for Arundhati Roy. Verifiable via agent at David Godwin Associates London.',
    verificationLinks: [
      'https://www.penguinrandomhouse.com/authors/26252/arundhati-roy',
      'https://www.dga-litagency.com/authors/arundhati-roy',
    ],
    submittedAt: Date.now() - 12 * 60 * 60 * 1000,
  },
];

interface WriterContextType {
  // State
  applications: WriterApplication[];
  workSuggestions: AuthorWorkSuggestion[];
  experienceMode: 'reader' | 'writer';
  setExperienceMode: (mode: 'reader' | 'writer') => void;
  allAuthors: Author[];
  userApplication: WriterApplication | null;
  activeWriterProfile: Author | null;
  
  // Modals & Navigation
  isWriterOnboardingOpen: boolean;
  onboardingPreselectedAuthor: Author | null;
  openWriterOnboarding: (preselectedAuthor?: Author | null) => void;
  closeWriterOnboarding: () => void;
  isWriterDashboardOpen: boolean;
  openWriterDashboard: () => void;
  closeWriterDashboard: () => void;
  isAdminReviewOpen: boolean;
  openAdminReview: () => void;
  closeAdminReview: () => void;

  // Applicant Operations
  submitClaimApplication: (targetAuthor: Author, notes: string, links: string[]) => Promise<void>;
  submitNewAuthorApplication: (authorData: Partial<Author>, notes: string, links: string[]) => Promise<void>;
  updateWriterProfile: (updatedData: Partial<Author>) => Promise<void>;
  suggestBookWork: (
    work: Omit<AuthorWorkSuggestion, 'id' | 'authorId' | 'authorName' | 'userId' | 'status' | 'createdAt'>
  ) => Promise<void>;

  // Admin Review Operations
  approveApplication: (applicationId: string) => Promise<void>;
  rejectApplication: (applicationId: string, reason: string) => Promise<void>;
  requestChangesApplication: (applicationId: string, notes: string) => Promise<void>;
  approveWorkSuggestion: (suggestionId: string) => Promise<void>;
}

const WriterContext = createContext<WriterContextType | undefined>(undefined);

export const WriterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateProfile } = useAuth();

  // 1. Applications Store
  const [applications, setApplications] = useState<WriterApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse writer applications from storage:', e);
    }
    return DEFAULT_SEED_APPLICATIONS;
  });

  // 2. Custom/Updated Authors Store
  const [customAuthors, setCustomAuthors] = useState<Author[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_AUTHORS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse custom authors from storage:', e);
    }
    return [];
  });

  // 3. Work Suggestions Store
  const [workSuggestions, setWorkSuggestions] = useState<AuthorWorkSuggestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORK_SUGGESTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse work suggestions from storage:', e);
    }
    return [];
  });

  // 4. Experience Mode: Reader vs Writer (persisted across sessions)
  const [experienceModeState, setExperienceModeState] = useState<'reader' | 'writer'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPERIENCE_MODE);
      if (saved === 'writer' || saved === 'reader') return saved;
    } catch {}
    return 'reader';
  });

  // Modals state
  const [isWriterOnboardingOpen, setIsWriterOnboardingOpen] = useState(false);
  const [onboardingPreselectedAuthor, setOnboardingPreselectedAuthor] = useState<Author | null>(null);
  const [isWriterDashboardOpen, setIsWriterDashboardOpen] = useState(false);
  const [isAdminReviewOpen, setIsAdminReviewOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    } catch (e) {
      console.warn('Failed to save writer applications:', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_AUTHORS, JSON.stringify(customAuthors));
    } catch (e) {
      console.warn('Failed to save custom authors:', e);
    }
  }, [customAuthors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORK_SUGGESTIONS, JSON.stringify(workSuggestions));
    } catch (e) {
      console.warn('Failed to save work suggestions:', e);
    }
  }, [workSuggestions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPERIENCE_MODE, experienceModeState);
    } catch (e) {
      console.warn('Failed to save experience mode:', e);
    }
  }, [experienceModeState]);

  // Combined Authors Directory (custom/updated authors override initialAuthors by ID or slug)
  const allAuthors = useMemo<Author[]>(() => {
    const map = new Map<string, Author>();
    // Load initial defaults
    for (const a of initialAuthors) {
      map.set(a.id, a);
    }
    // Overlay custom/updated authors
    for (const ca of customAuthors) {
      map.set(ca.id, ca);
    }
    return Array.from(map.values());
  }, [customAuthors]);

  // Current User's Application
  const userApplication = useMemo(() => {
    if (!currentUser) return null;
    return applications.find((app) => app.userId === currentUser.id) || null;
  }, [applications, currentUser]);

  // Active Writer Profile (if current user is an approved writer)
  const activeWriterProfile = useMemo(() => {
    if (!currentUser) return null;
    const authorId = currentUser.writerProfileId?.trim();
    if (authorId) {
      const lower = authorId.toLowerCase();
      const match = allAuthors.find(
        (a) =>
          a.id.toLowerCase() === lower ||
          a.slug.toLowerCase() === lower ||
          a.name.toLowerCase() === lower
      );
      if (match) return match;
    }

    // Fallback 1: check in allAuthors where claimedUserId === currentUser.id
    const claimed = allAuthors.find((a) => a.claimedUserId === currentUser.id);
    if (claimed) return claimed;

    // Fallback 2: check applications for approved or pending claims by this user
    const userApp = applications.find(
      (app) => app.userId === currentUser.id && (app.status === 'approved' || app.status === 'pending')
    );
    if (userApp) {
      const targetId = (userApp.targetAuthorId || userApp.targetAuthorSlug || userApp.targetAuthorName)?.trim().toLowerCase();
      if (targetId) {
        const match = allAuthors.find(
          (a) =>
            a.id.toLowerCase() === targetId ||
            a.slug.toLowerCase() === targetId ||
            a.name.toLowerCase() === targetId
        );
        if (match) return match;
      }
      if (userApp.proposedAuthor?.name) {
        const propName = userApp.proposedAuthor.name.toLowerCase();
        const matchProp = allAuthors.find((a) => a.name.toLowerCase() === propName);
        if (matchProp) return matchProp;
      }
    }

    // Fallback 3: if currentUser has writerStatus === 'approved', try matching displayName to authors
    if (currentUser.writerStatus === 'approved' && currentUser.displayName) {
      const nameLower = currentUser.displayName.trim().toLowerCase();
      const matchByName = allAuthors.find((a) => a.name.toLowerCase() === nameLower);
      if (matchByName) return matchByName;
    }

    return null;
  }, [currentUser, allAuthors, applications]);

  // Enforce experience mode validity: only approved writers can be in 'writer' mode
  const isApprovedWriter = Boolean(
    currentUser?.writerStatus === 'approved' || activeWriterProfile
  );

  const experienceMode = isApprovedWriter ? experienceModeState : 'reader';

  const setExperienceMode = useCallback(
    (mode: 'reader' | 'writer') => {
      if (mode === 'writer' && !isApprovedWriter) {
        console.warn('Cannot switch to writer mode without an approved writer profile');
        return;
      }
      setExperienceModeState(mode);
    },
    [isApprovedWriter]
  );

  // Modal Open/Close Controls
  const openWriterOnboarding = useCallback((preselectedAuthor: Author | null = null) => {
    setOnboardingPreselectedAuthor(preselectedAuthor);
    setIsWriterOnboardingOpen(true);
  }, []);

  const closeWriterOnboarding = useCallback(() => {
    setIsWriterOnboardingOpen(false);
    setOnboardingPreselectedAuthor(null);
  }, []);

  const openWriterDashboard = useCallback(() => {
    setIsWriterDashboardOpen(true);
  }, []);

  const closeWriterDashboard = useCallback(() => {
    setIsWriterDashboardOpen(false);
  }, []);

  const openAdminReview = useCallback(() => {
    setIsAdminReviewOpen(true);
  }, []);

  const closeAdminReview = useCallback(() => {
    setIsAdminReviewOpen(false);
  }, []);

  // Submit Claim Existing Profile Application (Auto-approved for testing purpose)
  const submitClaimApplication = useCallback(
    async (targetAuthor: Author, notes: string, links: string[]) => {
      if (!currentUser) throw new Error('Must be logged in to claim an author profile');

      // Verify not already claimed by someone else
      if (targetAuthor.isClaimed && targetAuthor.claimedUserId && targetAuthor.claimedUserId !== currentUser.id) {
        throw new Error('This author profile has already been claimed and verified.');
      }

      const newApp: WriterApplication = {
        id: `app-claim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: currentUser.id,
        applicantName: currentUser.displayName || 'Reader',
        applicantEmail: currentUser.email || '',
        type: 'claim_existing',
        status: 'approved', // Auto-approved for testing purpose
        targetAuthorId: targetAuthor.id,
        targetAuthorName: targetAuthor.name,
        targetAuthorSlug: targetAuthor.slug,
        verificationNotes: notes.trim(),
        verificationLinks: links.filter((l) => Boolean(l && l.trim())),
        submittedAt: Date.now(),
        reviewedAt: Date.now(),
        reviewedBy: 'Auto-Approved (Testing Mode)',
      };

      // Mark author as claimed and verified
      const updatedAuthor: Author = {
        ...targetAuthor,
        isClaimed: true,
        isVerified: true,
        claimedUserId: currentUser.id,
      };

      setCustomAuthors((prev) => {
        const filtered = prev.filter((a) => a.id !== updatedAuthor.id);
        return [updatedAuthor, ...filtered];
      });

      setApplications((prev) => [newApp, ...prev.filter((a) => a.userId !== currentUser.id)]);

      // Update current user writer status and activate writer mode
      await updateProfile({
        writerStatus: 'approved',
        writerProfileId: targetAuthor.id,
        writerApplicationId: newApp.id,
      });

      setExperienceModeState('writer');
    },
    [currentUser, updateProfile]
  );

  // Submit Create New Author Profile Application (Auto-approved for testing purpose)
  const submitNewAuthorApplication = useCallback(
    async (authorData: Partial<Author>, notes: string, links: string[]) => {
      if (!currentUser) throw new Error('Must be logged in to create a writer profile');

      const name = (authorData.name || currentUser.displayName || 'Author').trim();
      const slug = generateAuthorSlug(name);

      const targetAuthor: Author = {
        id: `author-${slug}`,
        slug,
        name,
        penName: authorData.penName,
        photo: authorData.photo,
        nationality: authorData.nationality || 'International',
        countryFlag: authorData.countryFlag || '🌍',
        profession: authorData.profession || 'Author & Novelist',
        bio: authorData.bio || '',
        born: authorData.born,
        birthPlace: authorData.birthPlace,
        literaryAchievements: authorData.literaryAchievements || [],
        notableWorks: authorData.notableWorks || [],
        websiteUrl: authorData.websiteUrl,
        socialLinks: authorData.socialLinks,
        isClaimed: true,
        isVerified: true,
        claimedUserId: currentUser.id,
        followersCount: 1,
      };

      const newApp: WriterApplication = {
        id: `app-new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: currentUser.id,
        applicantName: currentUser.displayName || 'Reader',
        applicantEmail: currentUser.email || '',
        type: 'create_new',
        status: 'approved', // Auto-approved for testing purpose
        proposedAuthor: targetAuthor,
        verificationNotes: notes.trim(),
        verificationLinks: links.filter((l) => Boolean(l && l.trim())),
        submittedAt: Date.now(),
        reviewedAt: Date.now(),
        reviewedBy: 'Auto-Approved (Testing Mode)',
      };

      setCustomAuthors((prev) => {
        const filtered = prev.filter((a) => a.id !== targetAuthor.id);
        return [targetAuthor, ...filtered];
      });

      setApplications((prev) => [newApp, ...prev.filter((a) => a.userId !== currentUser.id)]);

      await updateProfile({
        writerStatus: 'approved',
        writerProfileId: targetAuthor.id,
        writerApplicationId: newApp.id,
      });

      setExperienceModeState('writer');
    },
    [currentUser, updateProfile]
  );

  // Update existing Writer Profile by the verified author
  const updateWriterProfile = useCallback(
    async (updatedData: Partial<Author>) => {
      if (!currentUser || !activeWriterProfile) {
        throw new Error('No active writer profile found to update');
      }

      const updatedAuthor: Author = {
        ...activeWriterProfile,
        ...updatedData,
        // Preserve crucial identifiers and claim state
        id: activeWriterProfile.id,
        slug: activeWriterProfile.slug,
        isClaimed: true,
        isVerified: true,
        claimedUserId: currentUser.id,
      };

      setCustomAuthors((prev) => {
        const filtered = prev.filter((a) => a.id !== updatedAuthor.id);
        return [updatedAuthor, ...filtered];
      });
    },
    [currentUser, activeWriterProfile]
  );

  // Suggest a book addition or correction to canonical catalog
  const suggestBookWork = useCallback(
    async (
      work: Omit<AuthorWorkSuggestion, 'id' | 'authorId' | 'authorName' | 'userId' | 'status' | 'createdAt'>
    ) => {
      if (!currentUser || !activeWriterProfile) {
        throw new Error('Must be an approved writer to suggest catalogue works');
      }

      const newSuggestion: AuthorWorkSuggestion = {
        ...work,
        id: `sug-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        authorId: activeWriterProfile.id,
        authorName: activeWriterProfile.name,
        userId: currentUser.id,
        status: 'pending',
        createdAt: Date.now(),
      };

      setWorkSuggestions((prev) => [newSuggestion, ...prev]);
    },
    [currentUser, activeWriterProfile]
  );

  // --- Admin Review Actions ---
  const approveApplication = useCallback(
    async (applicationId: string) => {
      const app = applications.find((a) => a.id === applicationId);
      if (!app) throw new Error('Application not found');

      let targetAuthor: Author;

      if (app.type === 'claim_existing' && app.targetAuthorId) {
        const existing = allAuthors.find((a) => a.id === app.targetAuthorId || a.slug === app.targetAuthorSlug);
        if (!existing) throw new Error('Target author to claim was not found in directory');

        targetAuthor = {
          ...existing,
          isClaimed: true,
          isVerified: true,
          claimedUserId: app.userId,
        };
      } else if (app.type === 'create_new' && app.proposedAuthor) {
        const proposed = app.proposedAuthor;
        const name = proposed.name || app.applicantName || 'Author';
        const slug = generateAuthorSlug(name);

        targetAuthor = {
          id: `author-${slug}`,
          slug,
          name,
          penName: proposed.penName,
          photo: proposed.photo,
          nationality: proposed.nationality || 'International',
          countryFlag: proposed.countryFlag || '🌍',
          profession: proposed.profession || 'Author & Novelist',
          bio: proposed.bio || '',
          born: proposed.born,
          birthPlace: proposed.birthPlace,
          literaryAchievements: proposed.literaryAchievements || [],
          notableWorks: proposed.notableWorks || [],
          websiteUrl: proposed.websiteUrl,
          socialLinks: proposed.socialLinks,
          isClaimed: true,
          isVerified: true,
          claimedUserId: app.userId,
          followersCount: 1,
        };
      } else {
        throw new Error('Invalid application data for approval');
      }

      // Update custom authors store
      setCustomAuthors((prev) => {
        const filtered = prev.filter((a) => a.id !== targetAuthor.id);
        return [targetAuthor, ...filtered];
      });

      // Update application status
      const updatedApp: WriterApplication = {
        ...app,
        status: 'approved',
        reviewedAt: Date.now(),
        reviewedBy: 'BookCircle Editorial Admin',
      };

      setApplications((prev) => prev.map((a) => (a.id === applicationId ? updatedApp : a)));

      // If approved applicant is the current user, update their profile immediately
      if (currentUser && currentUser.id === app.userId) {
        await updateProfile({
          writerStatus: 'approved',
          writerProfileId: targetAuthor.id,
        });
      }
    },
    [applications, allAuthors, currentUser, updateProfile]
  );

  const rejectApplication = useCallback(
    async (applicationId: string, reason: string) => {
      const app = applications.find((a) => a.id === applicationId);
      if (!app) throw new Error('Application not found');

      const updatedApp: WriterApplication = {
        ...app,
        status: 'rejected',
        reviewedAt: Date.now(),
        reviewedBy: 'BookCircle Editorial Admin',
        adminNotes: reason.trim(),
      };

      setApplications((prev) => prev.map((a) => (a.id === applicationId ? updatedApp : a)));

      if (currentUser && currentUser.id === app.userId) {
        await updateProfile({
          writerStatus: 'rejected',
        });
      }
    },
    [applications, currentUser, updateProfile]
  );

  const requestChangesApplication = useCallback(
    async (applicationId: string, notes: string) => {
      const app = applications.find((a) => a.id === applicationId);
      if (!app) throw new Error('Application not found');

      const updatedApp: WriterApplication = {
        ...app,
        status: 'changes_requested',
        reviewedAt: Date.now(),
        reviewedBy: 'BookCircle Editorial Admin',
        adminNotes: notes.trim(),
      };

      setApplications((prev) => prev.map((a) => (a.id === applicationId ? updatedApp : a)));

      if (currentUser && currentUser.id === app.userId) {
        await updateProfile({
          writerStatus: 'changes_requested',
        });
      }
    },
    [applications, currentUser, updateProfile]
  );

  const approveWorkSuggestion = useCallback(async (suggestionId: string) => {
    setWorkSuggestions((prev) =>
      prev.map((sug) => (sug.id === suggestionId ? { ...sug, status: 'approved' } : sug))
    );
  }, []);

  const value = useMemo(
    () => ({
      applications,
      workSuggestions,
      experienceMode,
      setExperienceMode,
      allAuthors,
      userApplication,
      activeWriterProfile,
      isWriterOnboardingOpen,
      onboardingPreselectedAuthor,
      openWriterOnboarding,
      closeWriterOnboarding,
      isWriterDashboardOpen,
      openWriterDashboard,
      closeWriterDashboard,
      isAdminReviewOpen,
      openAdminReview,
      closeAdminReview,
      submitClaimApplication,
      submitNewAuthorApplication,
      updateWriterProfile,
      suggestBookWork,
      approveApplication,
      rejectApplication,
      requestChangesApplication,
      approveWorkSuggestion,
    }),
    [
      applications,
      workSuggestions,
      experienceMode,
      setExperienceMode,
      allAuthors,
      userApplication,
      activeWriterProfile,
      isWriterOnboardingOpen,
      onboardingPreselectedAuthor,
      openWriterOnboarding,
      closeWriterOnboarding,
      isWriterDashboardOpen,
      openWriterDashboard,
      closeWriterDashboard,
      isAdminReviewOpen,
      openAdminReview,
      closeAdminReview,
      submitClaimApplication,
      submitNewAuthorApplication,
      updateWriterProfile,
      suggestBookWork,
      approveApplication,
      rejectApplication,
      requestChangesApplication,
      approveWorkSuggestion,
    ]
  );

  return <WriterContext.Provider value={value}>{children}</WriterContext.Provider>;
};

export const useWriter = (): WriterContextType => {
  const context = useContext(WriterContext);
  if (!context) {
    throw new Error('useWriter must be used within a WriterProvider');
  }
  return context;
};
