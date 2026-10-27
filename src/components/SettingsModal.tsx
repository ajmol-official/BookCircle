import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  Notification01Icon,
  ShieldCheckIcon,
  BookOpen01Icon,
  Location01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div className="pr-4">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0 ${
        value ? 'bg-brand' : 'bg-slate-200'
      }`}
      role="switch"
      aria-checked={value}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState({
    borrowRequests: true,
    requestAccepted: true,
    meetupReminders: true,
    returnDueSoon: true,
    communityDigest: false,
    showLocation: true,
    showDistance: true,
    profilePublic: true,
    showRecentActivity: false,
    radius: 'Within 5km',
  });

  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#FDF8F2] rounded-3xl shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#FDF8F2]/95 backdrop-blur-md px-6 sm:px-8 pt-6 pb-4 border-b border-slate-200/80">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-slate-800">Settings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Account & notification preferences</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              aria-label="Close settings"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-8 space-y-6 mt-4">

          {/* Notification Settings */}
          <section>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                <HugeiconsIcon icon={Notification01Icon} size={16} />
              </div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Notifications</h4>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 px-4 divide-y divide-slate-100">
              <ToggleRow
                label="Borrow Requests"
                description="When someone wants to borrow your book"
                value={settings.borrowRequests}
                onChange={() => toggle('borrowRequests')}
              />
              <ToggleRow
                label="Request Accepted"
                description="When your borrow request is approved"
                value={settings.requestAccepted}
                onChange={() => toggle('requestAccepted')}
              />
              <ToggleRow
                label="Meetup Reminders"
                description="24-hour reminder before a scheduled handover"
                value={settings.meetupReminders}
                onChange={() => toggle('meetupReminders')}
              />
              <ToggleRow
                label="Return Due Soon"
                description="7-day and 3-day warning before a book is due"
                value={settings.returnDueSoon}
                onChange={() => toggle('returnDueSoon')}
              />
              <ToggleRow
                label="Community Digest"
                description="Weekly summary of new books near you"
                value={settings.communityDigest}
                onChange={() => toggle('communityDigest')}
              />
            </div>
          </section>

          {/* Privacy Settings */}
          <section>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HugeiconsIcon icon={ShieldCheckIcon} size={16} />
              </div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Privacy</h4>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 px-4 divide-y divide-slate-100">
              <ToggleRow
                label="Public Profile"
                description="Show your profile to other BookCircle members"
                value={settings.profilePublic}
                onChange={() => toggle('profilePublic')}
              />
              <ToggleRow
                label="Show Approximate Distance"
                description="Display how far you are from other readers"
                value={settings.showDistance}
                onChange={() => toggle('showDistance')}
              />
              <ToggleRow
                label="Recent Activity"
                description="Allow others to see your recent borrows & reviews"
                value={settings.showRecentActivity}
                onChange={() => toggle('showRecentActivity')}
              />
            </div>
          </section>

          {/* Discovery Settings */}
          <section>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <HugeiconsIcon icon={Location01Icon} size={16} />
              </div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Discovery</h4>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 px-4 divide-y divide-slate-100">
              <div className="py-3">
                <p className="text-sm font-semibold text-slate-800">Default Search Radius</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-2">How far to show books and readers by default</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Within 2km', 'Within 5km', 'Within 10km', 'Within 25km'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, radius: r }))}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                        settings.radius === r
                          ? 'bg-brand/10 text-brand border-brand/30 ring-1 ring-brand'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <ToggleRow
                label="Show My Books in Discovery"
                description="Let readers near you find your listed books"
                value={settings.showLocation}
                onChange={() => toggle('showLocation')}
              />
            </div>
          </section>

          {/* Account */}
          <section>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <HugeiconsIcon icon={BookOpen01Icon} size={16} />
              </div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Account</h4>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {currentUser?.email ? 'Email Address' : 'Verified Phone Number'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {currentUser?.email || currentUser?.phoneNumber || 'Not signed in'}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Verified
                </span>
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Password</p>
                  <p className="text-xs text-slate-400">Last changed 3 months ago</p>
                </div>
                <button className="text-xs text-brand font-semibold hover:underline">Change</button>
              </div>
            </div>
          </section>

        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-[#FDF8F2]/95 backdrop-blur-md px-6 sm:px-8 pb-6 pt-3 border-t border-slate-200/80">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {saved ? (
              <>
                <HugeiconsIcon icon={Tick01Icon} size={18} />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
