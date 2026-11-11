import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Settings01Icon,
  Notification01Icon,
  ShieldCheckIcon,
  Location01Icon,
  BookOpen01Icon,
  Tick01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Mail01Icon,
  UserCircle02Icon,
  AlertCircleIcon,
  SparklesIcon,
  Add01Icon,
  PencilEdit02Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';
import { useAuth } from '../../context/AuthContext';
import type { HandoverLocation } from '../../types';

export interface UserSettings {
  // Notifications
  borrowRequests: boolean;
  requestAccepted: boolean;
  meetupReminders: boolean;
  returnDueSoon: boolean;
  communityDigest: boolean;

  // Privacy
  profilePublic: boolean;
  showDistance: boolean;
  showRecentActivity: boolean;

  // Discovery
  radius: string;
  showLocation: boolean;

  // Preferred Handover Locations (Maximum 2)
  preferredHandoverLocations: HandoverLocation[];
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  borrowRequests: true,
  requestAccepted: true,
  meetupReminders: true,
  returnDueSoon: true,
  communityDigest: false,
  profilePublic: true,
  showDistance: true,
  showRecentActivity: false,
  radius: 'Within 5km',
  showLocation: true,
  preferredHandoverLocations: [
    {
      id: 'loc-1',
      name: 'Camden Coffee Roasters',
      instructions: 'Main entrance foyer · Usually weekdays 5pm - 7pm',
    },
    {
      id: 'loc-2',
      name: 'Primrose Hill Community Library',
      instructions: 'Front reception desk · Saturdays 10am - 1pm',
    },
  ],
};

const STORAGE_KEY = 'bookcircle_user_settings';

interface SettingsPageProps {
  onBack?: () => void;
  onRadiusChange?: (radius: string) => void;
}

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ id, label, description, value, onChange }) => (
  <div className="flex items-center justify-between py-4 group transition">
    <div className="pr-4 min-w-0">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-800 cursor-pointer group-hover:text-brand transition-colors block"
      >
        {label}
      </label>
      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
    </div>
    <button
      id={id}
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 flex-shrink-0 cursor-pointer ${
        value ? 'bg-brand' : 'bg-slate-200 hover:bg-slate-300'
      }`}
      role="switch"
      aria-checked={value}
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, onRadiusChange }) => {
  const { currentUser, updateProfile } = useAuth();

  // Load initial settings from localStorage or fallback to defaults
  const [savedSettings, setSavedSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const locations =
          currentUser?.preferredHandoverLocations ??
          parsed.preferredHandoverLocations ??
          DEFAULT_USER_SETTINGS.preferredHandoverLocations;
        return {
          ...DEFAULT_USER_SETTINGS,
          ...parsed,
          preferredHandoverLocations: Array.isArray(locations) ? locations.slice(0, 2) : [],
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved settings:', e);
    }
    return {
      ...DEFAULT_USER_SETTINGS,
      preferredHandoverLocations:
        currentUser?.preferredHandoverLocations ?? DEFAULT_USER_SETTINGS.preferredHandoverLocations,
    };
  });

  const [settings, setSettings] = useState<UserSettings>(savedSettings);
  const [savedToast, setSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'notifications' | 'privacy' | 'discovery' | 'handover' | 'account'>('all');

  // Handover Location Form States
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);

  // Form inputs for Add
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationInstructions, setNewLocationInstructions] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Form inputs for Edit
  const [editLocationName, setEditLocationName] = useState('');
  const [editLocationInstructions, setEditLocationInstructions] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Sync state if savedSettings changed
  useEffect(() => {
    setSettings(savedSettings);
  }, [savedSettings]);

  // Compute dirty state
  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  }, [settings, savedSettings]);

  const toggle = (key: keyof UserSettings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  // Handover Location Handlers
  const handleStartAdd = () => {
    if (settings.preferredHandoverLocations.length >= 2) {
      return;
    }
    setNewLocationName('');
    setNewLocationInstructions('');
    setAddError(null);
    setEditingLocationId(null);
    setIsAddingLocation(true);
  };

  const handleCancelAdd = () => {
    setIsAddingLocation(false);
    setNewLocationName('');
    setNewLocationInstructions('');
    setAddError(null);
  };

  const handleConfirmAdd = () => {
    if (!newLocationName.trim()) {
      setAddError('Please enter a location name');
      return;
    }
    if (settings.preferredHandoverLocations.length >= 2) {
      setAddError('You can add up to 2 preferred handover locations');
      return;
    }

    const newLoc: HandoverLocation = {
      id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newLocationName.trim(),
      instructions: newLocationInstructions.trim() || undefined,
    };

    setSettings((prev) => ({
      ...prev,
      preferredHandoverLocations: [...prev.preferredHandoverLocations, newLoc].slice(0, 2),
    }));

    setIsAddingLocation(false);
    setNewLocationName('');
    setNewLocationInstructions('');
    setAddError(null);
  };

  const handleStartEdit = (loc: HandoverLocation) => {
    setIsAddingLocation(false);
    setEditingLocationId(loc.id);
    setEditLocationName(loc.name);
    setEditLocationInstructions(loc.instructions || '');
    setEditError(null);
  };

  const handleCancelEdit = () => {
    setEditingLocationId(null);
    setEditLocationName('');
    setEditLocationInstructions('');
    setEditError(null);
  };

  const handleConfirmEdit = (id: string) => {
    if (!editLocationName.trim()) {
      setEditError('Location name cannot be empty');
      return;
    }

    setSettings((prev) => ({
      ...prev,
      preferredHandoverLocations: prev.preferredHandoverLocations.map((loc) =>
        loc.id === id
          ? {
              ...loc,
              name: editLocationName.trim(),
              instructions: editLocationInstructions.trim() || undefined,
            }
          : loc
      ),
    }));

    setEditingLocationId(null);
    setEditLocationName('');
    setEditLocationInstructions('');
    setEditError(null);
  };

  const handleRemoveLocation = (id: string) => {
    if (editingLocationId === id) {
      setEditingLocationId(null);
    }
    setSettings((prev) => ({
      ...prev,
      preferredHandoverLocations: prev.preferredHandoverLocations.filter((loc) => loc.id !== id),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedSettings(settings);
      if (onRadiusChange && settings.radius) {
        onRadiusChange(settings.radius);
      }
      if (currentUser && updateProfile) {
        try {
          await updateProfile({
            preferredHandoverLocations: settings.preferredHandoverLocations,
          });
        } catch (err) {
          console.warn('Could not sync handover locations to profile:', err);
        }
      }
      setSavedToast(true);
      setTimeout(() => {
        setSavedToast(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    }
  };

  const handleDiscard = () => {
    setSettings(savedSettings);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_USER_SETTINGS);
  };

  // Derive initials for avatar fallback
  const initials = useMemo(() => {
    const name = currentUser?.displayName || 'Reader';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [currentUser]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-4 sm:pt-8 pb-24 animate-in fade-in duration-200">
      {/* Toast Notification */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white text-xs sm:text-sm font-medium shadow-2xl border border-slate-700/80 flex items-center gap-2.5 max-w-md text-center"
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-400 flex-shrink-0" />
            <span>Settings saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Breadcrumb & Navigation Row ─── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-brand font-medium transition-colors"
          >
            Home
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold">Settings</span>
        </nav>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-brand transition-colors bg-white px-3 sm:px-4 py-1.5 rounded-full border border-slate-200/80 shadow-xs hover:border-brand/30"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            <span>Back</span>
          </button>
        )}
      </div>

      {/* ─── Page Title & Action Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              Settings
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-semibold">
              <HugeiconsIcon icon={Settings01Icon} size={13} />
              <span>Preferences</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Manage your account, privacy, and notification preferences. Changes apply across your devices.
          </p>
        </div>

        {/* Quick Save Indicator / Top Save Button */}
        <div className="flex items-center gap-3">
          {isDirty ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/80 animate-pulse">
                <HugeiconsIcon icon={AlertCircleIcon} size={14} />
                <span>Unsaved changes</span>
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 flex items-center gap-1.5 disabled:opacity-75"
              >
                <HugeiconsIcon icon={Tick01Icon} size={16} />
                <span>Save</span>
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600" />
              <span>All changes saved</span>
            </span>
          )}
        </div>
      </div>

      {/* ─── Main Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ─── Left Sidebar (Navigation & Profile Overview) ─── */}
        <aside className="lg:col-span-4 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* User Profile Overview Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-card">
            <div className="flex items-center gap-4">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName || 'User'}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand/10 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand via-brand/90 to-purple-700 text-white font-serif font-bold text-lg flex items-center justify-center shadow-xs">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-serif font-semibold text-slate-800 truncate text-base">
                    {currentUser?.displayName || 'Active Reader'}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {currentUser?.email || currentUser?.phoneNumber || 'Verified Community Member'}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <HugeiconsIcon icon={ShieldCheckIcon} size={12} />
                    <span>Verified Neighbor</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Navigation Quick-Links */}
          <nav aria-label="Settings sections" className="bg-white rounded-3xl p-3 border border-slate-200/90 shadow-card">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveSection('all');
                  scrollToSection('section-notifications');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition text-left ${
                  activeSection === 'notifications' || activeSection === 'all'
                    ? 'bg-purple-50/80 text-brand'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                    <HugeiconsIcon icon={Notification01Icon} size={15} />
                  </div>
                  <span>Notifications</span>
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-400">5 items</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection('privacy');
                  scrollToSection('section-privacy');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition text-left ${
                  activeSection === 'privacy'
                    ? 'bg-purple-50/80 text-brand'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <HugeiconsIcon icon={ShieldCheckIcon} size={15} />
                  </div>
                  <span>Privacy & Safety</span>
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-400">3 items</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection('discovery');
                  scrollToSection('section-discovery');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition text-left ${
                  activeSection === 'discovery'
                    ? 'bg-purple-50/80 text-brand'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <HugeiconsIcon icon={Location01Icon} size={15} />
                  </div>
                  <span>Discovery & Radius</span>
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-400">{settings.radius}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection('handover');
                  scrollToSection('section-handover');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition text-left ${
                  activeSection === 'handover'
                    ? 'bg-purple-50/80 text-brand'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-brand flex items-center justify-center">
                    <HugeiconsIcon icon={Location01Icon} size={15} />
                  </div>
                  <span>Handover Spots</span>
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-400">
                  {settings.preferredHandoverLocations.length}/2 spots
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSection('account');
                  scrollToSection('section-account');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition text-left ${
                  activeSection === 'account'
                    ? 'bg-purple-50/80 text-brand'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <HugeiconsIcon icon={UserCircle02Icon} size={15} />
                  </div>
                  <span>Account & Security</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-600">Verified</span>
              </button>
            </div>
          </nav>

          {/* Privacy Guarantee Context Card */}
          <div className="bg-gradient-to-br from-purple-50/80 via-[#FDF8F2] to-amber-50/60 rounded-3xl p-5 border border-brand/15 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <HugeiconsIcon icon={SparklesIcon} size={16} />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-slate-800">
                  Neighborhood Privacy
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  BookCircle never shares your exact address. Only approximate distances and confirmed public handover spots are visible to neighbors.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Right Content Area (Settings Sections) ─── */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-8">
          
          {/* ─────────────────────────────────────────────────────────────
              SECTION 1: NOTIFICATIONS
          ───────────────────────────────────────────────────────────── */}
          <section id="section-notifications" aria-labelledby="heading-notifications">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                <HugeiconsIcon icon={Notification01Icon} size={18} />
              </div>
              <div>
                <h2 id="heading-notifications" className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  Notifications
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Stay updated about borrow requests, approvals, and upcoming book returns.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card px-5 sm:px-7 divide-y divide-slate-100">
              <ToggleRow
                id="toggle-borrow-requests"
                label="Borrow Requests"
                description="When someone wants to borrow or claim a book from your shelf"
                value={settings.borrowRequests}
                onChange={() => toggle('borrowRequests')}
              />
              <ToggleRow
                id="toggle-request-accepted"
                label="Request Accepted"
                description="When a neighbor approves your borrow or gift claim request"
                value={settings.requestAccepted}
                onChange={() => toggle('requestAccepted')}
              />
              <ToggleRow
                id="toggle-meetup-reminders"
                label="Meetup Reminders"
                description="Receive a reminder 24 hours before a confirmed book handover"
                value={settings.meetupReminders}
                onChange={() => toggle('meetupReminders')}
              />
              <ToggleRow
                id="toggle-return-due-soon"
                label="Return Due Soon"
                description="7-day and 3-day notifications before a borrowed book is due"
                value={settings.returnDueSoon}
                onChange={() => toggle('returnDueSoon')}
              />
              <ToggleRow
                id="toggle-community-digest"
                label="Community Digest"
                description="A weekly digest of newly listed books circulating in your neighborhood"
                value={settings.communityDigest}
                onChange={() => toggle('communityDigest')}
              />
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 2: PRIVACY
          ───────────────────────────────────────────────────────────── */}
          <section id="section-privacy" aria-labelledby="heading-privacy">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <HugeiconsIcon icon={ShieldCheckIcon} size={18} />
              </div>
              <div>
                <h2 id="heading-privacy" className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  Privacy & Safety
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Control who can see your profile, your shelf, and your borrowing history.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card px-5 sm:px-7 divide-y divide-slate-100">
              <ToggleRow
                id="toggle-public-profile"
                label="Public Profile"
                description="Allow other BookCircle community members to view your reader profile"
                value={settings.profilePublic}
                onChange={() => toggle('profilePublic')}
              />
              <ToggleRow
                id="toggle-show-distance"
                label="Show Approximate Distance"
                description="Display your approximate distance (e.g., '1.2 km away') on cards"
                value={settings.showDistance}
                onChange={() => toggle('showDistance')}
              />
              <ToggleRow
                id="toggle-recent-activity"
                label="Recent Activity"
                description="Allow neighborhood readers to see books you have recently read and reviewed"
                value={settings.showRecentActivity}
                onChange={() => toggle('showRecentActivity')}
              />
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 3: DISCOVERY
          ───────────────────────────────────────────────────────────── */}
          <section id="section-discovery" aria-labelledby="heading-discovery">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <HugeiconsIcon icon={Location01Icon} size={18} />
              </div>
              <div>
                <h2 id="heading-discovery" className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  Discovery Preferences
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Customize the search radius and visibility for books near your neighborhood.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card px-5 sm:px-7 divide-y divide-slate-100">
              {/* Default Search Radius */}
              <div className="py-4">
                <label className="text-sm font-semibold text-slate-800 block">
                  Default Search Radius
                </label>
                <p className="text-xs text-slate-500 mt-0.5 mb-3 leading-relaxed">
                  How far to search for books and readers by default across discovery and home feeds.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['Within 2km', 'Within 5km', 'Within 10km', 'Within 25km'].map((r) => {
                    const isSelected = settings.radius === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSettings((prev) => ({ ...prev, radius: r }))}
                        className={`px-3 py-2.5 rounded-2xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 active:scale-95 ${
                          isSelected
                            ? 'bg-brand text-white border-brand shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected && <HugeiconsIcon icon={Tick01Icon} size={13} className="text-white" />}
                        <span>{r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Show My Books in Discovery */}
              <ToggleRow
                id="toggle-show-location"
                label="Show My Books in Discovery"
                description="Make your listed books discoverable by readers living within your radius"
                value={settings.showLocation}
                onChange={() => toggle('showLocation')}
              />
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              SECTION: PREFERRED HANDOVER LOCATIONS
          ───────────────────────────────────────────────────────────── */}
          <section id="section-handover" aria-labelledby="heading-handover">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-brand flex items-center justify-center flex-shrink-0">
                  <HugeiconsIcon icon={Location01Icon} size={18} />
                </div>
                <div>
                  <h2 id="heading-handover" className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                    Preferred Handover Locations
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Choose up to 2 safe, public meetup spots in your neighborhood for book handovers.
                  </p>
                </div>
              </div>

              {/* Counter Badge */}
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${
                  settings.preferredHandoverLocations.length >= 2
                    ? 'bg-purple-50 text-brand border-brand/20'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {settings.preferredHandoverLocations.length} of 2 added
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 sm:p-7 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                These locations are displayed under the <strong className="text-slate-700">About & Meetup Spots</strong> tab on your public profile. We recommend safe, bustling public places like neighborhood cafes or local libraries.
              </p>

              {/* List of Saved Locations */}
              <div className="space-y-3">
                {settings.preferredHandoverLocations.map((loc, idx) => {
                  const isEditing = editingLocationId === loc.id;
                  if (isEditing) {
                    return (
                      <div
                        key={loc.id}
                        className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-brand/30 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-brand uppercase tracking-wider">
                            Edit Location #{idx + 1}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Location Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editLocationName}
                            onChange={(e) => {
                              setEditLocationName(e.target.value);
                              if (editError) setEditError(null);
                            }}
                            placeholder="e.g. Camden Coffee Roasters, Central Library Steps"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand focus:ring-1 focus:ring-brand text-xs sm:text-sm text-slate-800 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Meeting Details & Instructions (Optional)
                          </label>
                          <input
                            type="text"
                            value={editLocationInstructions}
                            onChange={(e) => setEditLocationInstructions(e.target.value)}
                            placeholder="e.g. Main entrance foyer · Usually weekdays 5pm - 7pm"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand focus:ring-1 focus:ring-brand text-xs sm:text-sm text-slate-800 bg-white"
                          />
                        </div>

                        {editError && (
                          <p className="text-xs text-rose-600 font-medium">{editError}</p>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleConfirmEdit(loc.id)}
                            className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95"
                          >
                            Update Location
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={loc.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 group hover:border-brand/30 hover:bg-slate-50/90 transition"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                          <HugeiconsIcon icon={Location01Icon} size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                              {loc.name}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                              Spot {idx + 1}
                            </span>
                          </div>
                          {loc.instructions && (
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                              {loc.instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(loc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-brand hover:border-brand/40 hover:bg-brand/5 text-xs font-semibold transition"
                          title="Edit this location"
                        >
                          <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveLocation(loc.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold transition"
                          title="Remove this location"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={14} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State if no locations saved */}
                {settings.preferredHandoverLocations.length === 0 && !isAddingLocation && (
                  <div className="p-6 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center space-y-1.5">
                    <p className="text-xs font-semibold text-slate-700">No preferred handover spots yet</p>
                    <p className="text-[11px] text-slate-500">
                      Add up to 2 locations so neighbors know your preferred meetup spots when requesting books.
                    </p>
                  </div>
                )}
              </div>

              {/* Add New Location Form / Button */}
              {isAddingLocation ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-brand/30 space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand uppercase tracking-wider">
                      Add Handover Location ({settings.preferredHandoverLocations.length + 1}/2)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Location Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newLocationName}
                      onChange={(e) => {
                        setNewLocationName(e.target.value);
                        if (addError) setAddError(null);
                      }}
                      placeholder="e.g. Camden Coffee Roasters, Central Library Steps"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand focus:ring-1 focus:ring-brand text-xs sm:text-sm text-slate-800 bg-white"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Meeting Details & Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={newLocationInstructions}
                      onChange={(e) => setNewLocationInstructions(e.target.value)}
                      placeholder="e.g. Main entrance foyer · Usually weekdays 5pm - 7pm"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-brand focus:ring-1 focus:ring-brand text-xs sm:text-sm text-slate-800 bg-white"
                    />
                  </div>

                  {addError && (
                    <p className="text-xs text-rose-600 font-medium">{addError}</p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCancelAdd}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAdd}
                      className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      <HugeiconsIcon icon={Tick01Icon} size={15} />
                      <span>Save Location</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {settings.preferredHandoverLocations.length < 2 ? (
                    <button
                      type="button"
                      onClick={handleStartAdd}
                      className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand hover:bg-brand/5 text-slate-700 hover:text-brand font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 group active:scale-[0.99]"
                    >
                      <div className="w-6 h-6 rounded-lg bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition">
                        <HugeiconsIcon icon={Add01Icon} size={14} />
                      </div>
                      <span>Add Preferred Handover Location ({settings.preferredHandoverLocations.length}/2)</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800">
                      <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-600 flex-shrink-0" />
                      <span>
                        Maximum of 2 preferred handover locations reached. Edit or remove an existing location to add another.
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              SECTION 4: ACCOUNT
          ───────────────────────────────────────────────────────────── */}
          <section id="section-account" aria-labelledby="heading-account">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                <HugeiconsIcon icon={BookOpen01Icon} size={18} />
              </div>
              <div>
                <h2 id="heading-account" className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  Account & Security
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Your registered login method and community verification standing.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card px-5 sm:px-7 py-2 divide-y divide-slate-100">
              {/* Contact / Email Row */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-brand flex items-center justify-center flex-shrink-0">
                    <HugeiconsIcon icon={Mail01Icon} size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {currentUser?.email ? 'Email Address' : 'Verified Phone Number'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {currentUser?.email || currentUser?.phoneNumber || 'reader@bookcircle.local'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex-shrink-0">
                  Verified
                </span>
              </div>

              {/* Password Row */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Password</p>
                  <p className="text-xs text-slate-500 mt-0.5">Last updated 3 months ago · Protected by 2FA</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your verified email/phone.')}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:border-brand hover:text-brand text-xs font-semibold transition hover:bg-slate-50"
                >
                  Change Password
                </button>
              </div>

              {/* Trust Standing */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Member Trust Standing</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tier 5 (Top Tier) · 100% on-time return rate</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">
                  <HugeiconsIcon icon={ShieldCheckIcon} size={14} />
                  <span>Tier 5 Guide</span>
                </span>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              BOTTOM ACTIONS BAR
          ───────────────────────────────────────────────────────────── */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-slate-200/90 shadow-card">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 underline transition px-2 py-1"
              >
                Reset to Defaults
              </button>
              {isDirty && (
                <>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700 underline transition px-2 py-1"
                  >
                    Discard Changes
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {savedToast ? (
                  <>
                    <HugeiconsIcon icon={Tick01Icon} size={18} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
