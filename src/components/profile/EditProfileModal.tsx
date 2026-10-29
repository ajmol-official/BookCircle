import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Camera01Icon,
  Upload01Icon,
  Image01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';

export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
];

export const AVAILABLE_GENRES = [
  'Fiction',
  'Non-fiction',
  'Science',
  'History',
  'Poetry',
  'Mystery & Thriller',
  'Fantasy & Sci-Fi',
  'Biography',
  'Philosophy',
  'Art & Design',
];

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    name: string;
    location: string;
    bio: string;
    avatar?: string;
    favoriteGenres?: string[];
  };
  onSave: (updated: {
    name: string;
    location: string;
    bio: string;
    avatar: string;
    favoriteGenres: string[];
  }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSave,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [location, setLocation] = useState(userProfile.location);
  const [bio, setBio] = useState(userProfile.bio);
  const [avatar, setAvatar] = useState(userProfile.avatar || PRESET_AVATARS[0]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    userProfile.favoriteGenres && userProfile.favoriteGenres.length > 0
      ? userProfile.favoriteGenres.filter((g) => g.toLowerCase() !== 'all')
      : ['Fiction', 'Non-fiction']
  );
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or userProfile changes
  useEffect(() => {
    if (isOpen) {
      setName(userProfile.name);
      setLocation(userProfile.location);
      setBio(userProfile.bio);
      setAvatar(userProfile.avatar || PRESET_AVATARS[0]);
      setSelectedGenres(
        userProfile.favoriteGenres && userProfile.favoriteGenres.length > 0
          ? userProfile.favoriteGenres.filter((g) => g.toLowerCase() !== 'all')
          : ['Fiction', 'Non-fiction']
      );
      setShowUrlInput(false);
      setCustomUrl('');
      setIsSaved(false);
      setUploadError(null);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        if (prev.length <= 1) return prev; // Keep at least one genre
        return prev.filter((g) => g !== genre);
      }
      return [...prev, genre];
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setUploadError('Image size should be less than 4MB.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setAvatar(event.target.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setAvatar(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);

    const fullGenresList = selectedGenres.length > 0 ? selectedGenres : ['Fiction', 'Non-fiction'];

    setTimeout(() => {
      onSave({
        name: name.trim() || userProfile.name,
        location: location.trim() || 'Local Neighborhood',
        bio: bio.trim(),
        avatar,
        favoriteGenres: ['All', ...fullGenresList],
      });
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-amber-400 to-brand" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">
            Reader Profile
          </span>
          <h3 className="font-serif text-2xl font-semibold text-slate-800 mt-1">
            Edit Profile & Preferences
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Update your profile photo, reading bio, and book preferences whenever you like.
          </p>
        </div>

        {isSaved ? (
          <div className="py-16 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4 ring-8 ring-emerald-50">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={32} />
            </div>
            <h4 className="font-serif text-2xl font-semibold text-slate-800">
              Profile Updated!
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xs mx-auto">
              Your profile picture and preferences have been successfully updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-6 overflow-y-auto pr-1 flex-1">
            {/* 1. Avatar Selection Section */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Profile Picture
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-brand hover:text-brand transition shadow-2xs"
                  >
                    <HugeiconsIcon icon={Upload01Icon} size={13} />
                    <span>Upload Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition shadow-2xs"
                  >
                    <HugeiconsIcon icon={Image01Icon} size={13} />
                    <span>URL</span>
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {uploadError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  {uploadError}
                </p>
              )}

              {/* URL Input Drawer */}
              {showUrlInput && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in slide-in-from-top-1">
                  <input
                    type="url"
                    placeholder="Paste image URL (https://...)"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Avatar Preview & Presets Row */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="relative group flex-shrink-0">
                  <img
                    src={avatar}
                    alt="Active Avatar"
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-brand/30 shadow-md"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    title="Change photo"
                  >
                    <HugeiconsIcon icon={Camera01Icon} size={18} />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <p className="text-[11px] text-slate-500 font-medium mb-1.5">
                    Or pick a community avatar:
                  </p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((url, idx) => {
                      const isSelected = avatar === url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`relative rounded-full transition transform active:scale-90 flex-shrink-0 ${
                            isSelected
                              ? 'ring-2 ring-brand ring-offset-2 scale-105'
                              : 'opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Preset avatar ${idx + 1}`}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          {isSelected && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center shadow-xs">
                              <HugeiconsIcon icon={Tick01Icon} size={10} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Basic Info Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Neighborhood Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bloomsbury, North London"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Bio & Reading Habit
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your neighbors what books you love and how you like to exchange them..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition"
              />
            </div>

            {/* 3. Favorite Genres / Reading Preferences */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Reading Preferences / Favorite Genres
                </label>
                <span className="text-[11px] text-slate-400">
                  {selectedGenres.length} selected
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2.5">
                Select your favorite genres so nearby neighbors and book circles can recommend relevant titles.
              </p>

              <div className="flex flex-wrap gap-2">
                {AVAILABLE_GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleToggleGenre(genre)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                        isSelected
                          ? 'bg-brand text-white shadow-xs border border-brand'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && <HugeiconsIcon icon={Tick01Icon} size={12} />}
                      <span>{genre}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
