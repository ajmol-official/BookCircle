import React, { useState, useMemo, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Search01Icon,
  SparklesIcon,
  Globe02Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  BookOpen01Icon,
  AlertCircleIcon,
  Clock01Icon,
  ShieldCheckIcon,
  UserCircle02Icon
} from '@hugeicons/core-free-icons';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useWriter } from '../../context/WriterContext';
import { useAuth } from '../../context/AuthContext';
import type { Author } from '../../types/author';

type OnboardingPath = 'choose_path' | 'claim_profile' | 'create_profile' | 'status_view' | 'submitted_success';

export const WriterOnboardingModal: React.FC = () => {
  const {
    isWriterOnboardingOpen,
    onboardingPreselectedAuthor,
    closeWriterOnboarding,
    openWriterDashboard,
    allAuthors,
    userApplication,
    submitClaimApplication,
    submitNewAuthorApplication,
  } = useWriter();

  const { currentUser } = useAuth();
  useBodyScrollLock(isWriterOnboardingOpen);

  // Current view state
  const [currentPath, setCurrentPath] = useState<OnboardingPath>('choose_path');

  // Search & Claim state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthorToClaim, setSelectedAuthorToClaim] = useState<Author | null>(null);
  const [claimNotes, setClaimNotes] = useState('');
  const [claimLinks, setClaimLinks] = useState<string[]>(['']);

  // New Profile state
  const [newName, setNewName] = useState(currentUser?.displayName || '');
  const [newPenName, setNewPenName] = useState('');
  const [newProfession, setNewProfession] = useState('Novelist & Essayist');
  const [newPhoto, setNewPhoto] = useState(currentUser?.avatar || '');
  const [newNationality, setNewNationality] = useState('British');
  const [newCountryFlag, setNewCountryFlag] = useState('🇬🇧');
  const [newBio, setNewBio] = useState('');
  const [newBorn, setNewBorn] = useState('');
  const [newBirthPlace, setNewBirthPlace] = useState('');
  const [newAchievements, setNewAchievements] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newTwitter, setNewTwitter] = useState('');
  const [newInstagram, setNewInstagram] = useState('');
  const [newVerificationNotes, setNewVerificationNotes] = useState('');
  const [newVerificationLinks, setNewVerificationLinks] = useState<string[]>(['']);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or reset view whenever modal opens
  useEffect(() => {
    if (isWriterOnboardingOpen) {
      setErrorMessage(null);
      setIsSubmitting(false);

      if (userApplication && userApplication.status === 'pending') {
        setCurrentPath('status_view');
      } else if (userApplication && userApplication.status === 'changes_requested') {
        setCurrentPath('status_view');
      } else if (onboardingPreselectedAuthor) {
        setSelectedAuthorToClaim(onboardingPreselectedAuthor);
        setCurrentPath('claim_profile');
      } else {
        setCurrentPath('choose_path');
      }
    }
  }, [isWriterOnboardingOpen, userApplication, onboardingPreselectedAuthor]);

  // Filter authors for claiming
  const filteredAuthors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allAuthors.slice(0, 8);
    return allAuthors.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.nationality && a.nationality.toLowerCase().includes(q)) ||
        (a.profession && a.profession.toLowerCase().includes(q))
    );
  }, [allAuthors, searchQuery]);

  // Add / remove link helpers
  const handleAddLink = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const handleUpdateLink = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveLink = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : ['']));
  };

  // Submit Claim Request
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuthorToClaim) {
      setErrorMessage('Please select an author profile to claim.');
      return;
    }
    const cleanLinks = claimLinks.filter((l) => l.trim().length > 0);
    if (cleanLinks.length === 0 && !claimNotes.trim()) {
      setErrorMessage('Please provide at least one verification link (e.g. publisher or official website) or an identity note.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await submitClaimApplication(selectedAuthorToClaim, claimNotes, cleanLinks);
      setCurrentPath('submitted_success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit claim request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit New Author Profile Request
  const handleSubmitNewAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMessage('Full name is required for your writer profile.');
      return;
    }
    const cleanLinks = newVerificationLinks.filter((l) => l.trim().length > 0);
    if (cleanLinks.length === 0 && !newVerificationNotes.trim()) {
      setErrorMessage('Please provide at least one verification link or publisher details for editorial review.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const achievementsList = newAchievements
        .split('\n')
        .map((a) => a.trim())
        .filter(Boolean);

      const authorData: Partial<Author> = {
        name: newName.trim(),
        penName: newPenName.trim() || undefined,
        profession: newProfession.trim() || 'Author',
        photo: newPhoto.trim() || undefined,
        nationality: newNationality.trim() || 'International',
        countryFlag: newCountryFlag.trim() || '🌍',
        bio: newBio.trim(),
        born: newBorn.trim() || undefined,
        birthPlace: newBirthPlace.trim() || undefined,
        literaryAchievements: achievementsList.length > 0 ? achievementsList : undefined,
        websiteUrl: newWebsite.trim() || undefined,
        socialLinks: {
          twitter: newTwitter.trim() || undefined,
          instagram: newInstagram.trim() || undefined,
        },
      };

      await submitNewAuthorApplication(authorData, newVerificationNotes, cleanLinks);
      setCurrentPath('submitted_success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit writer application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isWriterOnboardingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="writer-onboarding-title"
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 my-8 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Brand Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-purple-500 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeWriterOnboarding}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-brand/30"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* =========================================================================
            PATH 0: ACTIVE APPLICATION STATUS VIEW
            ========================================================================= */}
        {currentPath === 'status_view' && userApplication && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  userApplication.status === 'changes_requested'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-purple-50 text-brand'
                }`}
              >
                {userApplication.status === 'changes_requested' ? (
                  <HugeiconsIcon icon={AlertCircleIcon} size={24} />
                ) : (
                  <HugeiconsIcon icon={Clock01Icon} size={24} />
                )}
              </div>
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    userApplication.status === 'changes_requested'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-brand'
                  }`}
                >
                  {userApplication.status === 'changes_requested' ? 'Action Needed' : 'Under Editorial Review'}
                </span>
                <h2 id="writer-onboarding-title" className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  Writer Application Status
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 text-sm">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Application ID: <strong className="font-mono text-slate-700">{userApplication.id}</strong></span>
                <span>Submitted {new Date(userApplication.submittedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-700">
                Type:{' '}
                <strong className="text-slate-900">
                  {userApplication.type === 'claim_existing'
                    ? `Claim Profile: "${userApplication.targetAuthorName}"`
                    : `Create New Profile: "${userApplication.proposedAuthor?.name}"`}
                </strong>
              </p>

              {userApplication.adminNotes && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs">
                  <p className="font-semibold mb-1">Editor Feedback:</p>
                  <p>{userApplication.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-slate-600 space-y-1.5 mb-6">
              <p className="font-semibold text-brand">What happens next?</p>
              <p>
                Our editorial team verifies author identity to preserve community trust and prevent impersonation.
                In the meantime, you retain 100% of your Reader functionality (borrowing, lending, and catalog browsing).
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeWriterOnboarding}
                className="px-5 py-2.5 rounded-xl bg-brand text-white font-semibold text-xs sm:text-sm hover:bg-brand/90 transition shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PATH 1: CHOOSE ONBOARDING PATH (HERO LANDING)
            ========================================================================= */}
        {currentPath === 'choose_path' && (
          <div>
            {/* Header / Intro */}
            <div className="text-center max-w-xl mx-auto mb-8 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-brand flex items-center justify-center mx-auto mb-3 shadow-inner">
                <HugeiconsIcon icon={SparklesIcon} size={28} />
              </div>
              <h2 id="writer-onboarding-title" className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Join BookCircle as a Writer
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Are you an author? Join BookCircle and create your official writer profile to connect with readers and showcase your published works.
              </p>
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <HugeiconsIcon icon={ShieldCheckIcon} size={16} />
                </div>
                <h4 className="font-semibold text-slate-800">Verified Badge</h4>
                <p className="text-slate-500 mt-0.5 text-[11px]">Official literary identity verified by editorial review.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-brand flex items-center justify-center mb-2">
                  <HugeiconsIcon icon={BookOpen01Icon} size={16} />
                </div>
                <h4 className="font-semibold text-slate-800">Catalog Ownership</h4>
                <p className="text-slate-500 mt-0.5 text-[11px]">Curate your published bibliography without duplicates.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                  <HugeiconsIcon icon={UserCircle02Icon} size={16} />
                </div>
                <h4 className="font-semibold text-slate-800">Reader Connection</h4>
                <p className="text-slate-500 mt-0.5 text-[11px]">See copies circulating across neighborhood shelves.</p>
              </div>
            </div>

            {/* Two Path Choice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Claim Existing */}
              <button
                type="button"
                onClick={() => setCurrentPath('claim_profile')}
                className="group p-5 rounded-2xl border-2 border-slate-200/90 hover:border-brand bg-white hover:bg-purple-50/20 text-left transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-brand uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-full">
                      Option A
                    </span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-slate-400 group-hover:text-brand group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand transition-colors">
                    Claim an Existing Profile
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    My books or name already exist in the BookCircle directory. I want to claim official ownership.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-brand inline-flex items-center gap-1">
                  Search & Claim Profile →
                </span>
              </button>

              {/* Option B: Create New */}
              <button
                type="button"
                onClick={() => setCurrentPath('create_profile')}
                className="group p-5 rounded-2xl border-2 border-slate-200/90 hover:border-brand bg-white hover:bg-purple-50/20 text-left transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full">
                      Option B
                    </span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-slate-400 group-hover:text-brand group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand transition-colors">
                    Create a New Writer Profile
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    I am an author new to BookCircle. I want to build my official author profile from scratch.
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-brand inline-flex items-center gap-1">
                  Create Writer Profile →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PATH 2A: CLAIM AN EXISTING PROFILE
            ========================================================================= */}
        {currentPath === 'claim_profile' && (
          <form onSubmit={handleSubmitClaim}>
            {/* Breadcrumb / Back button */}
            <button
              type="button"
              onClick={() => {
                setSelectedAuthorToClaim(null);
                setCurrentPath('choose_path');
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand mb-4 font-medium"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
              <span>Back to Options</span>
            </button>

            <h2 id="writer-onboarding-title" className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
              Claim Your Existing Author Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
              Search for your name in our directory. If you find your profile, submit verification to claim official ownership.
            </p>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!selectedAuthorToClaim ? (
              <div>
                {/* Search Input */}
                <div className="relative mb-4">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by author name or nationality..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200/90 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 transition placeholder:text-slate-400"
                  />
                </div>

                {/* Author Selection List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {filteredAuthors.map((author) => {
                    const isAlreadyClaimed = Boolean(author.isClaimed && author.claimedUserId && author.claimedUserId !== currentUser?.id);
                    return (
                      <div
                        key={author.id}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                          isAlreadyClaimed
                            ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                            : 'bg-white border-slate-200 hover:border-brand/60 hover:bg-purple-50/20 cursor-pointer shadow-2xs'
                        }`}
                        onClick={() => {
                          if (!isAlreadyClaimed) setSelectedAuthorToClaim(author);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={author.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                            alt={author.name}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-serif text-sm font-bold text-slate-900 truncate">
                              {author.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              {author.countryFlag && <span className="mr-1">{author.countryFlag}</span>}
                              <span>{author.nationality || 'International'}</span>
                              {author.profession && ` · ${author.profession}`}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isAlreadyClaimed ? (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                              Already Claimed
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="px-3 py-1 rounded-full bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition shadow-xs"
                            >
                              This Is Me
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Selected Author & Verification Details Form */
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedAuthorToClaim.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                      alt={selectedAuthorToClaim.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-brand tracking-wider">
                        Target Author Profile
                      </span>
                      <h4 className="font-serif text-base font-bold text-slate-900">
                        {selectedAuthorToClaim.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {selectedAuthorToClaim.profession || 'Author in BookCircle Directory'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAuthorToClaim(null)}
                    className="text-xs text-slate-500 hover:text-red-600 underline font-medium"
                  >
                    Change
                  </button>
                </div>

                {/* Identity Verification Links */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Proof of Authorship Links <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Provide links to your official website, publisher author page, or verified social account.
                  </p>
                  <div className="space-y-2">
                    {claimLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <HugeiconsIcon icon={Globe02Icon} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => handleUpdateLink(idx, e.target.value, setClaimLinks)}
                            placeholder="https://yourpublisher.com/authors/you"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                          />
                        </div>
                        {claimLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(idx, setClaimLinks)}
                            className="p-2 text-slate-400 hover:text-red-500"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddLink(setClaimLinks)}
                      className="text-[11px] font-semibold text-brand hover:underline"
                    >
                      + Add another link
                    </button>
                  </div>
                </div>

                {/* Identification Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Note / Publisher Details
                  </label>
                  <textarea
                    rows={3}
                    value={claimNotes}
                    onChange={(e) => setClaimNotes(e.target.value)}
                    placeholder="Briefly state your relationship to this author profile (e.g. Literary agent email, publisher contact, or official communication channel)..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30 placeholder:text-slate-400"
                  />
                </div>

                {/* Submission CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedAuthorToClaim(null)}
                    className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs sm:text-sm font-semibold transition shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting Claim...' : 'Submit Claim for Review'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* =========================================================================
            PATH 2B: CREATE A NEW WRITER PROFILE
            ========================================================================= */}
        {currentPath === 'create_profile' && (
          <form onSubmit={handleSubmitNewAuthor}>
            <button
              type="button"
              onClick={() => setCurrentPath('choose_path')}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand mb-4 font-medium"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
              <span>Back to Options</span>
            </button>

            <h2 id="writer-onboarding-title" className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
              Create Your Official Writer Profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
              Build your author identity on BookCircle. Once verified by our editorial team, your official profile will be visible across the community.
            </p>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Row 1: Name & Pen Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Author Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Richard Powers"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pen Name / Pseudonym <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newPenName}
                    onChange={(e) => setNewPenName(e.target.value)}
                    placeholder="e.g. Robert Galbraith"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>

              {/* Row 2: Profession & Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profession / Designation
                  </label>
                  <input
                    type="text"
                    value={newProfession}
                    onChange={(e) => setNewProfession(e.target.value)}
                    placeholder="e.g. Novelist, Essayist & Poet"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Portrait Photo URL
                  </label>
                  <input
                    type="url"
                    value={newPhoto}
                    onChange={(e) => setNewPhoto(e.target.value)}
                    placeholder="https://.../author-portrait.jpg"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>

              {/* Row 3: Nationality & Flag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={newNationality}
                    onChange={(e) => setNewNationality(e.target.value)}
                    placeholder="e.g. British, Indian, Canadian"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country Flag Emoji
                  </label>
                  <input
                    type="text"
                    value={newCountryFlag}
                    onChange={(e) => setNewCountryFlag(e.target.value)}
                    placeholder="e.g. 🇬🇧, 🇮🇳, 🇺🇸"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>

              {/* Row 3b: Birth Year & Birthplace */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Birth Year <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newBorn}
                    onChange={(e) => setNewBorn(e.target.value)}
                    placeholder="e.g. 1978"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Birthplace <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newBirthPlace}
                    onChange={(e) => setNewBirthPlace(e.target.value)}
                    placeholder="e.g. London, UK"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>

              {/* Row 4: Short Biography */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Author Biography
                </label>
                <textarea
                  rows={3}
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Tell BookCircle readers about your literary background, themes you explore, and notable publications..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30 placeholder:text-slate-400"
                />
              </div>

              {/* Row 5: Literary Achievements */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Awards & Fellowships <span className="text-slate-400 font-normal">(one per line, optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={newAchievements}
                  onChange={(e) => setNewAchievements(e.target.value)}
                  placeholder="e.g. Costa First Novel Award Shortlist&#10;Guggenheim Fellow 2024"
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30 placeholder:text-slate-400"
                />
              </div>

              {/* Row 6: Online Presence */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Website
                  </label>
                  <input
                    type="url"
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Twitter / X Handle
                  </label>
                  <input
                    type="text"
                    value={newTwitter}
                    onChange={(e) => setNewTwitter(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={newInstagram}
                    onChange={(e) => setNewInstagram(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
              </div>

              {/* Row 7: Verification Links & Proof */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identity Verification Links <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Provide links to verify authorship (publisher catalogue, agent website, ISBN agency, or verified media profile).
                </p>
                <div className="space-y-2">
                  {newVerificationLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <HugeiconsIcon icon={Globe02Icon} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="url"
                          value={link}
                          onChange={(e) => handleUpdateLink(idx, e.target.value, setNewVerificationLinks)}
                          placeholder="https://publisher.com/authors/your-name"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                        />
                      </div>
                      {newVerificationLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(idx, setNewVerificationLinks)}
                          className="p-2 text-slate-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddLink(setNewVerificationLinks)}
                    className="text-[11px] font-semibold text-brand hover:underline"
                  >
                    + Add another link
                  </button>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Note / Publisher Details
                  </label>
                  <textarea
                    rows={2}
                    value={newVerificationNotes}
                    onChange={(e) => setNewVerificationNotes(e.target.value)}
                    placeholder="Brief note on your agency or publisher affiliation for editorial review..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Submission CTA */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentPath('choose_path')}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs sm:text-sm font-semibold transition shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Profile for Editorial Review'}
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            PATH 3: SUBMISSION SUCCESS SCREEN (AUTO-APPROVED FOR TESTING)
            ========================================================================= */}
        {currentPath === 'submitted_success' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 ring-8 ring-emerald-50/50">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <HugeiconsIcon icon={SparklesIcon} size={13} />
              <span>Auto-Approved (Testing Mode)</span>
            </div>

            <h2 id="writer-onboarding-title" className="font-serif text-2xl font-bold text-slate-900">
              Writer Profile Verified & Active!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              Your writer profile has been automatically approved and linked to your BookCircle account.
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs text-slate-600 space-y-2 max-w-md mx-auto">
              <p className="font-semibold text-slate-800">Your writer capabilities are now active:</p>
              <p>• <strong>Verified Writer Badge:</strong> Your official author profile displays the verified badge.</p>
              <p>• <strong>Writer Mode:</strong> You can switch between Reader and Writer experiences anytime via your profile dropdown.</p>
              <p>• <strong>Writer Dashboard:</strong> Edit your biography, website, and curate your published bibliography.</p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-7">
              <button
                type="button"
                onClick={closeWriterOnboarding}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition shadow-2xs"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  closeWriterOnboarding();
                  openWriterDashboard();
                }}
                className="px-6 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-semibold hover:bg-brand/90 transition shadow-sm inline-flex items-center gap-1.5"
              >
                <HugeiconsIcon icon={SparklesIcon} size={15} />
                <span>Open Writer Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
