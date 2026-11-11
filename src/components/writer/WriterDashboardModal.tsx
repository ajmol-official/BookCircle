import React, { useState, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  SparklesIcon,
  Share01Icon,
  PlusSignIcon
} from '@hugeicons/core-free-icons';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useWriter } from '../../context/WriterContext';
import { getCatalogWorksForAuthor } from '../../data/canonicalCatalog';
import type { Book, CatalogWork } from '../../types';

interface WriterDashboardModalProps {
  booksList?: Book[];
  onNavigateToAuthorProfile?: (authorSlug: string) => void;
}

export const WriterDashboardModal: React.FC<WriterDashboardModalProps> = ({
  booksList = [],
  onNavigateToAuthorProfile,
}) => {
  const {
    isWriterDashboardOpen,
    closeWriterDashboard,
    activeWriterProfile,
    updateWriterProfile,
    suggestBookWork,
    experienceMode,
    setExperienceMode,
  } = useWriter();

  useBodyScrollLock(isWriterDashboardOpen);

  // Active Tab: 'profile' | 'bibliography' | 'readers'
  const [activeTab, setActiveTab] = useState<'profile' | 'bibliography' | 'readers'>('profile');

  // Profile Edit State
  const [profession, setProfession] = useState('');
  const [photo, setPhoto] = useState('');
  const [bio, setBio] = useState('');
  const [nationality, setNationality] = useState('');
  const [countryFlag, setCountryFlag] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [achievements, setAchievements] = useState('');

  // Suggest Work Sub-form State
  const [isSuggestingWork, setIsSuggestingWork] = useState(false);
  const [suggestTitle, setSuggestTitle] = useState('');
  const [suggestYear, setSuggestYear] = useState('');
  const [suggestCategory, setSuggestCategory] = useState<'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry'>('Fiction');
  const [suggestSynopsis, setSuggestSynopsis] = useState('');
  const [suggestCover, setSuggestCover] = useState('');
  const [suggestPublisherUrl, setSuggestPublisherUrl] = useState('');

  // Feedback states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Initialize edit form when activeWriterProfile loads or changes
  React.useEffect(() => {
    if (activeWriterProfile) {
      setProfession(activeWriterProfile.profession || '');
      setPhoto(activeWriterProfile.photo || '');
      setBio(activeWriterProfile.bio || '');
      setNationality(activeWriterProfile.nationality || '');
      setCountryFlag(activeWriterProfile.countryFlag || '');
      setWebsiteUrl(activeWriterProfile.websiteUrl || '');
      setTwitter(activeWriterProfile.socialLinks?.twitter || '');
      setInstagram(activeWriterProfile.socialLinks?.instagram || '');
      setAchievements((activeWriterProfile.literaryAchievements || []).join('\n'));
    }
  }, [activeWriterProfile]);

  // Compute canonical works and physical copies circulating
  const catalogWorks = useMemo<CatalogWork[]>(() => {
    if (!activeWriterProfile) return [];
    return getCatalogWorksForAuthor(activeWriterProfile.name, booksList);
  }, [activeWriterProfile, booksList]);

  const totalCirculatingCopies = useMemo(() => {
    return catalogWorks.reduce((acc, w) => acc + w.totalCopies, 0);
  }, [catalogWorks]);

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWriterProfile) return;

    const achievementsList = achievements
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean);

    await updateWriterProfile({
      profession: profession.trim() || undefined,
      photo: photo.trim() || undefined,
      bio: bio.trim() || undefined,
      nationality: nationality.trim() || undefined,
      countryFlag: countryFlag.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      literaryAchievements: achievementsList.length > 0 ? achievementsList : undefined,
      socialLinks: {
        twitter: twitter.trim() || undefined,
        instagram: instagram.trim() || undefined,
      },
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Submit new published title suggestion
  const handleSuggestWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestTitle.trim()) return;

    await suggestBookWork({
      type: 'add_work',
      title: suggestTitle.trim(),
      publishedYear: suggestYear.trim() || undefined,
      category: suggestCategory,
      synopsis: suggestSynopsis.trim() || undefined,
      coverImage: suggestCover.trim() || undefined,
      publisherUrl: suggestPublisherUrl.trim() || undefined,
    });

    setSuggestTitle('');
    setSuggestYear('');
    setSuggestSynopsis('');
    setSuggestCover('');
    setSuggestPublisherUrl('');
    setIsSuggestingWork(false);

    setSuggestSuccess(true);
    setTimeout(() => setSuggestSuccess(false), 3000);
  };

  // Copy share link
  const handleShareProfile = () => {
    if (!activeWriterProfile) return;
    const profileUrl = `${window.location.origin}/author/${activeWriterProfile.slug || activeWriterProfile.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  if (!isWriterDashboardOpen || !activeWriterProfile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="writer-dashboard-title"
        className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 my-8 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Brand Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-purple-500 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeWriterDashboard}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-brand/30"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Toast Alerts */}
        {saveSuccess && (
          <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
            <span>Writer profile updated successfully!</span>
          </div>
        )}
        {suggestSuccess && (
          <div className="fixed top-20 right-6 z-50 bg-brand text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
            <span>Book suggestion submitted to editorial catalog!</span>
          </div>
        )}
        {shareToast && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-400" />
            <span>Official writer profile link copied to clipboard!</span>
          </div>
        )}

        {/* Header / Identity Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 pr-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  activeWriterProfile.photo ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
                }
                alt={activeWriterProfile.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-purple-100 shadow-sm"
              />
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center ring-2 ring-white shadow-xs"
                title="Verified Writer"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                  Verified Writer Profile
                </span>
                {activeWriterProfile.countryFlag && <span>{activeWriterProfile.countryFlag}</span>}
              </div>
              <h2 id="writer-dashboard-title" className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {activeWriterProfile.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {activeWriterProfile.profession || 'Author & Literary Creator'}
              </p>
            </div>
          </div>

          {/* Quick Actions: View Public Profile & Mode Switch */}
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
            <button
              type="button"
              onClick={() => {
                closeWriterDashboard();
                if (onNavigateToAuthorProfile) {
                  onNavigateToAuthorProfile(activeWriterProfile.slug || activeWriterProfile.id);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-brand/40 hover:text-brand bg-white transition shadow-2xs"
            >
              <span>View Public Page ↗</span>
            </button>

            <button
              type="button"
              onClick={handleShareProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:border-brand/40 hover:text-brand bg-white transition shadow-2xs"
            >
              <HugeiconsIcon icon={Share01Icon} size={13} />
              <span>Share Profile</span>
            </button>
          </div>
        </div>

        {/* Experience Mode Toggle Bar */}
        <div className="my-4 p-3 rounded-2xl bg-gradient-to-r from-purple-50 via-[#FDF8F2] to-amber-50/50 border border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={SparklesIcon} size={16} className="text-brand" />
            <span className="text-xs font-medium text-slate-700">
              Active Experience:{' '}
              <strong className="text-slate-900 font-bold uppercase tracking-wider">
                {experienceMode === 'writer' ? 'Writer Mode' : 'Reader Mode'}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExperienceMode(experienceMode === 'writer' ? 'reader' : 'writer')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition shadow-xs ${
              experienceMode === 'writer'
                ? 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                : 'bg-brand text-white hover:bg-brand/90'
            }`}
          >
            {experienceMode === 'writer' ? 'Switch to Reader Mode' : 'Switch to Writer Mode'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold transition border-b-2 -mb-[2px] ${
              activeTab === 'profile'
                ? 'border-brand text-brand'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bibliography')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold transition border-b-2 -mb-[2px] flex items-center gap-1.5 ${
              activeTab === 'bibliography'
                ? 'border-brand text-brand'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Published Bibliography</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
              {catalogWorks.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('readers')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold transition border-b-2 -mb-[2px] ${
              activeTab === 'readers'
                ? 'border-brand text-brand'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Readers & Circulation
          </button>
        </div>

        {/* =========================================================================
            TAB 1: EDIT PROFILE
            ========================================================================= */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Profession / Headline
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Novelist, Essayist & Critic"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portrait Photo URL
                </label>
                <input
                  type="url"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://.../photo.jpg"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="e.g. Indian, American, Nigerian"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Country Flag Emoji
                </label>
                <input
                  type="text"
                  value={countryFlag}
                  onChange={(e) => setCountryFlag(e.target.value)}
                  placeholder="e.g. 🇮🇳, 🇺🇸, 🇳🇬"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Biographical Narrative
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your literary background, notable accomplishments, and themes..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Literary Achievements & Awards <span className="text-slate-400 font-normal">(one per line)</span>
              </label>
              <textarea
                rows={2}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="e.g. Man Booker Prize for Fiction&#10;Sydney Peace Prize"
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Website
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Twitter / X
                </label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs sm:text-sm font-semibold transition shadow-sm"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            TAB 2: PUBLISHED BIBLIOGRAPHY & COMMUNITY COPIES
            ========================================================================= */}
        {activeTab === 'bibliography' && (
          <div>
            {/* Top Metric Strip: Distinguishes Published Bibliography from Community Circulation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-left">
                <p className="text-[11px] font-semibold text-brand uppercase tracking-wider">
                  Official Published Works
                </p>
                <p className="font-serif text-2xl font-bold text-slate-900 mt-0.5">
                  {catalogWorks.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Catalogued published titles
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-left">
                <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                  Community Copies Nearby
                </p>
                <p className="font-serif text-2xl font-bold text-slate-900 mt-0.5">
                  {totalCirculatingCopies}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Physical books on neighbor shelves
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-left flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                    Catalog Curations
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Missing a published title or see an inaccuracy?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSuggestingWork(true)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={14} />
                  <span>Suggest Published Title</span>
                </button>
              </div>
            </div>

            {/* Sub-form: Suggest / Add Published Work without duplicate catalog entries */}
            {isSuggestingWork ? (
              <form onSubmit={handleSuggestWork} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <h4 className="font-serif text-sm font-bold text-slate-900">
                    Suggest a Published Title / Addition
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsSuggestingWork(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Book Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={suggestTitle}
                      onChange={(e) => setSuggestTitle(e.target.value)}
                      placeholder="e.g. The Overstory"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Publication Year
                    </label>
                    <input
                      type="text"
                      value={suggestYear}
                      onChange={(e) => setSuggestYear(e.target.value)}
                      placeholder="e.g. 2018"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Category / Genre
                    </label>
                    <select
                      value={suggestCategory}
                      onChange={(e) => setSuggestCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                    >
                      <option value="Fiction">Fiction</option>
                      <option value="Non-fiction">Non-fiction</option>
                      <option value="Science">Science</option>
                      <option value="History">History</option>
                      <option value="Poetry">Poetry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Publisher / Catalog Link
                    </label>
                    <input
                      type="url"
                      value={suggestPublisherUrl}
                      onChange={(e) => setSuggestPublisherUrl(e.target.value)}
                      placeholder="https://publisher.com/book"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Short Synopsis / Description
                  </label>
                  <textarea
                    rows={2}
                    value={suggestSynopsis}
                    onChange={(e) => setSuggestSynopsis(e.target.value)}
                    placeholder="Brief overview of the literary work..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSuggestingWork(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition shadow-xs"
                  >
                    Submit for Catalog Verification
                  </button>
                </div>
              </form>
            ) : null}

            {/* List of Published Works */}
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {catalogWorks.map((work) => (
                <div
                  key={work.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={
                        work.coverImage ||
                        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={work.title}
                      className="w-12 h-16 rounded-lg object-cover shadow-xs flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif text-sm font-bold text-slate-900 truncate">
                        {work.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {work.category} {work.publishedYear ? `· Published ${work.publishedYear}` : ''}
                      </p>
                      {work.synopsis && (
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-1">
                          {work.synopsis}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Physical Copies Pill */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {work.totalCopies > 0 ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/70 flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{work.totalCopies} {work.totalCopies === 1 ? 'copy circulating' : 'copies circulating'}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium whitespace-nowrap">
                        0 copies in area
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: READERS & CIRCULATION INSIGHTS
            ========================================================================= */}
        {activeTab === 'readers' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-left">
                <p className="text-xs font-semibold text-brand uppercase tracking-wider">
                  Community Followers
                </p>
                <p className="font-serif text-3xl font-bold text-slate-900 mt-1">
                  {activeWriterProfile.followersCount || 1}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Readers who follow your author profile for new book announcements.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-left">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Copies Circulating
                </p>
                <p className="font-serif text-3xl font-bold text-slate-900 mt-1">
                  {totalCirculatingCopies}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Copies currently on shelves across neighborhood readers.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 text-left">
              <h4 className="font-serif text-base font-bold text-slate-900 mb-1">
                Reader Connection Opportunities
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                As an approved BookCircle writer, you are a vital part of the community. In upcoming releases, you will be able to post author updates, announce new book publications, and interact with readers sharing your books.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition shadow-sm inline-flex items-center gap-1.5"
                >
                  <HugeiconsIcon icon={Share01Icon} size={14} />
                  <span>Share Your Official Author Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
