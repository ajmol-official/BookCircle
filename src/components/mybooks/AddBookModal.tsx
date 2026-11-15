import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  BookOpen01Icon,
  GiftIcon,
  Bookmark02Icon,
  GraduationCapIcon,
  CheckmarkCircle02Icon,
  Search01Icon,
  Upload01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Image01Icon,
  Delete02Icon
} from '@hugeicons/core-free-icons';
import { canonicalCatalogBooks } from '../../data/canonicalCatalog';
import { dbService } from '../../services/dbService';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import type {
  BookClassification,
  GeneralBookType,
  AcademicEducationLevel,
  CollegeAcademicGroup,
  AcademicMetadata,
  UserReadingStatusValue
} from '../../types';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBook?: {
    title?: string;
    author?: string;
    catalogId?: string;
    coverImage?: string;
    category?: 'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry';
  } | null;
  onBookAdded?: (bookData: {
    title: string;
    author: string;
    catalogId: string;
    condition: string;
    availability: 'lending' | 'donation' | 'personal';
    coverImage: string;
    bookType?: 'Original Copy' | 'Translated Copy';
    category?: 'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry';
    bookClassification?: BookClassification;
    generalType?: GeneralBookType;
    translator?: string;
    translationLanguage?: string;
    edition?: string;
    educationLevel?: AcademicEducationLevel;
    academicMetadata?: AcademicMetadata;
    description?: string;
  }) => void;
}

const CONDITION_OPTIONS = [
  { id: 'Like New', label: 'Like New', desc: 'Read once, clean' },
  { id: 'Very Good', label: 'Very Good', desc: 'Minor wear' },
  { id: 'Good', label: 'Good', desc: 'Loved & readable' },
  { id: 'Fair', label: 'Fair', desc: 'Older copy' }
] as const;

const AVAILABILITY_OPTIONS = [
  {
    id: 'lending' as const,
    label: 'For Lending',
    desc: 'Keep ownership, lend out for 30 days',
    icon: BookOpen01Icon
  },
  {
    id: 'donation' as const,
    label: 'For Donation',
    desc: 'Free gift to keep for loving readers',
    icon: GiftIcon
  },
  {
    id: 'personal' as const,
    label: 'Private Collection',
    desc: 'Personal library (hidden from search)',
    icon: Bookmark02Icon
  }
] as const;

const CATEGORY_OPTIONS: Array<'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry'> = [
  'Fiction',
  'Non-fiction',
  'Science',
  'History',
  'Poetry',
];

const PRESET_COVERS = [
  {
    id: 'preset-fiction',
    label: 'Fiction',
    url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'preset-science',
    label: 'Science',
    url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'preset-history',
    label: 'History',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'preset-academic',
    label: 'Academic',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'
  }
];

const COMMON_LANGUAGES = [
  'Bengali',
  'English',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Arabic',
  'Hindi',
  'Russian',
  'Portuguese',
  'Italian',
  'Chinese'
];

interface CatalogMatchItem {
  id: string;
  title: string;
  author: string;
  category: 'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry';
  coverImage: string;
  source: 'canonical' | 'community';
  classification: 'general' | 'academic';
  generalType?: 'original' | 'translated';
  translator?: string;
  translationLanguage?: string;
  educationLevel?: string;
  subject?: string;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, initialBook, onBookAdded }) => {
  // Navigation / Step state
  const [classification, setClassification] = useState<BookClassification | null>(null);
  const [generalStep, setGeneralStep] = useState<1 | 2>(1);
  const [academicStep, setAcademicStep] = useState<1 | 2 | 3>(1);

  // General Book State
  const [generalType, setGeneralType] = useState<GeneralBookType>('original');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [translator, setTranslator] = useState('');
  const [translationLanguage, setTranslationLanguage] = useState('');
  const [category, setCategory] = useState<'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry'>('Fiction');
  const [edition, setEdition] = useState('');
  const [condition, setCondition] = useState<string>('Like New');
  const [availability, setAvailability] = useState<'lending' | 'donation' | 'personal'>('lending');
  const [coverUrl, setCoverUrl] = useState('');
  const [isCustomUploaded, setIsCustomUploaded] = useState(false);
  const [matchedCatalogId, setMatchedCatalogId] = useState<string | null>(null);

  // Academic Book State
  const [educationLevel, setEducationLevel] = useState<AcademicEducationLevel>('University');
  const [schoolGrade, setSchoolGrade] = useState('');
  const [schoolSubject, setSchoolSubject] = useState('');
  const [collegeGroup, setCollegeGroup] = useState<CollegeAcademicGroup>('Science');
  const [collegeSubject, setCollegeSubject] = useState('');
  const [universityDepartment, setUniversityDepartment] = useState('');
  const [universityCourse, setUniversityCourse] = useState('');
  const [professionalField, setProfessionalField] = useState('');
  const [professionalSubject, setProfessionalSubject] = useState('');

  // Catalog Matching & Autocomplete State
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [communityMatches, setCommunityMatches] = useState<CatalogMatchItem[]>([]);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Post-submission reading status modal state (General Books only)
  const [showReadingStatusPrompt, setShowReadingStatusPrompt] = useState(false);
  const [submittedBookInfo, setSubmittedBookInfo] = useState<{ title: string; catalogId: string } | null>(null);

  // Feedback & Validation Errors
  const [formError, setFormError] = useState<string | null>(null);

  useBodyScrollLock(isOpen);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside autocomplete dropdown handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (autocompleteRef.current && !autocompleteRef.current.contains(target)) {
        setIsTitleFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pre-fill form when initialBook is provided
  useEffect(() => {
    if (isOpen && initialBook) {
      setClassification('general');
      setGeneralStep(1);
      if (initialBook.title) setTitle(initialBook.title);
      if (initialBook.author) setAuthor(initialBook.author);
      if (initialBook.coverImage) setCoverUrl(initialBook.coverImage);
      if (initialBook.category) setCategory(initialBook.category);
      if (initialBook.catalogId) {
        setMatchedCatalogId(initialBook.catalogId);
      }
    }
  }, [isOpen, initialBook]);

  // Reset form when modal closes
  const resetFormState = () => {
    setClassification(null);
    setGeneralStep(1);
    setAcademicStep(1);
    setGeneralType('original');
    setTitle('');
    setAuthor('');
    setTranslator('');
    setTranslationLanguage('');
    setCategory('Fiction');
    setEdition('');
    setCondition('Like New');
    setAvailability('lending');
    setCoverUrl('');
    setIsCustomUploaded(false);
    setMatchedCatalogId(null);
    setEducationLevel('University');
    setSchoolGrade('');
    setSchoolSubject('');
    setCollegeGroup('Science');
    setCollegeSubject('');
    setUniversityDepartment('');
    setUniversityCourse('');
    setProfessionalField('');
    setProfessionalSubject('');
    setCommunityMatches([]);
    setFormError(null);
    setShowReadingStatusPrompt(false);
    setSubmittedBookInfo(null);
  };

  const handleModalClose = () => {
    resetFormState();
    onClose();
  };

  // Debounced search for community books in live DB
  useEffect(() => {
    if (!title.trim() || title.trim().length < 2) {
      setCommunityMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await dbService.searchCommunityBooks(title.trim());
        const mapped: CatalogMatchItem[] = results.map((b) => ({
          id: b.catalogId || b.id,
          title: b.title,
          author: b.author,
          category: b.category,
          coverImage: b.coverImage,
          source: 'community',
          classification: b.bookClassification || 'general',
          generalType: b.generalType || 'original',
          translator: b.translator,
          translationLanguage: b.translationLanguage,
          educationLevel: b.educationLevel,
          subject: b.academicMetadata?.universityDepartment || b.academicMetadata?.schoolSubject || b.academicMetadata?.collegeSubject || b.academicMetadata?.professionalSubject,
        }));
        setCommunityMatches(mapped);
      } catch (err) {
        setCommunityMatches([]);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [title]);

  // Combined, Deduplicated Catalog Matches (Canonical + Community)
  const catalogSuggestions = useMemo(() => {
    if (!title.trim() || title.trim().length < 2) return [];
    const query = title.trim().toLowerCase();

    // 1. Search Canonical Works
    const canonicalResults: CatalogMatchItem[] = canonicalCatalogBooks
      .filter((b) => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query))
      .map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        category: b.category,
        coverImage: b.coverImage,
        source: 'canonical',
        classification: 'general',
        generalType: 'original',
      }));

    // 2. Merge and Deduplicate by unique canonical identity key
    const mergedMap = new Map<string, CatalogMatchItem>();

    // Add canonical entries first (authoritative)
    for (const item of canonicalResults) {
      const key = `${item.classification}-${item.id}`;
      mergedMap.set(key, item);
    }

    // Add community results, deduplicating multiple copies of same book
    for (const item of communityMatches) {
      const dedupKey = item.classification === 'academic'
        ? `academic-${item.title.toLowerCase()}-${item.educationLevel || ''}-${item.subject || ''}`
        : item.generalType === 'translated'
        ? `translated-${item.title.toLowerCase()}-${(item.translator || '').toLowerCase()}-${(item.translationLanguage || '').toLowerCase()}`
        : `general-orig-${item.id || item.title.toLowerCase()}`;

      if (!mergedMap.has(dedupKey)) {
        mergedMap.set(dedupKey, item);
      }
    }

    const allMatches = Array.from(mergedMap.values());

    // 3. Filter strictly based on active classification path
    if (classification === 'general') {
      if (generalType === 'original') {
        return allMatches.filter((m) => m.classification === 'general' && m.generalType !== 'translated').slice(0, 6);
      } else {
        return allMatches.filter((m) => m.classification === 'general').slice(0, 6);
      }
    } else if (classification === 'academic') {
      return allMatches.filter((m) => m.classification === 'academic').slice(0, 6);
    }

    return allMatches.slice(0, 6);
  }, [title, communityMatches, classification, generalType]);

  // Handle selecting a catalog suggestion
  const handleSelectCatalogMatch = (match: CatalogMatchItem) => {
    setTitle(match.title);
    setAuthor(match.author);
    setCategory(match.category);
    setCoverUrl(match.coverImage);
    setIsCustomUploaded(false);
    setMatchedCatalogId(match.id);

    if (classification === 'general' && generalType === 'translated') {
      if (match.translator) setTranslator(match.translator);
      if (match.translationLanguage) setTranslationLanguage(match.translationLanguage);
    } else if (classification === 'academic') {
      if (match.educationLevel && ['School', 'College', 'University', 'Professional'].includes(match.educationLevel)) {
        setEducationLevel(match.educationLevel as AcademicEducationLevel);
      }
      if (match.subject) {
        if (educationLevel === 'School') setSchoolSubject(match.subject);
        if (educationLevel === 'College') setCollegeSubject(match.subject);
        if (educationLevel === 'University') setUniversityDepartment(match.subject);
        if (educationLevel === 'Professional') setProfessionalSubject(match.subject);
      }
    }

    setIsTitleFocused(false);
    setFormError(null);
  };

  const handleClearCatalogMatch = () => {
    setMatchedCatalogId(null);
  };

  // Image Upload Handling (File Picker & Drag-and-Drop)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCoverUrl(result);
      setIsCustomUploaded(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // General Step 1 Validation
  const handleGeneralStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a book title.');
      return;
    }
    if (generalType === 'original') {
      if (!author.trim()) {
        setFormError('Please enter the author name.');
        return;
      }
    } else {
      if (!author.trim()) {
        setFormError('Please enter the original author name.');
        return;
      }
      if (!translator.trim()) {
        setFormError('Please enter the translator name.');
        return;
      }
      if (!translationLanguage.trim()) {
        setFormError('Please specify the Translation Language.');
        return;
      }
    }
    setFormError(null);
    setGeneralStep(2);
  };

  // Academic Step 1 Validation
  const handleAcademicStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter the textbook or academic book title.');
      return;
    }
    if (!author.trim()) {
      setFormError('Please enter the author or editor name.');
      return;
    }
    setFormError(null);
    setAcademicStep(2);
  };

  // Academic Step 2 Validation
  const handleAcademicStep2Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (educationLevel === 'School') {
      if (!schoolGrade.trim()) {
        setFormError('Please enter the Class / Grade for this school textbook.');
        return;
      }
      if (!schoolSubject.trim()) {
        setFormError('Please enter the Subject (e.g. Mathematics, Science).');
        return;
      }
    } else if (educationLevel === 'College') {
      if (!collegeGroup) {
        setFormError('Please select a College Group.');
        return;
      }
      if (!collegeSubject.trim()) {
        setFormError('Please enter the Subject (e.g. Physics, Accounting).');
        return;
      }
    } else if (educationLevel === 'University') {
      if (!universityDepartment.trim()) {
        setFormError('Please enter the University Department.');
        return;
      }
    } else if (educationLevel === 'Professional') {
      if (!professionalField.trim()) {
        setFormError('Please specify the Professional Field / Specialization.');
        return;
      }
      if (!professionalSubject.trim()) {
        setFormError('Please enter the Subject or Course Name.');
        return;
      }
    }
    setFormError(null);
    setAcademicStep(3);
  };

  // Final Submission Handler
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCover = coverUrl || PRESET_COVERS[0].url;
    const generatedId = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const finalCatalogId = matchedCatalogId || generatedId;

    if (classification === 'general') {
      const bookPayload = {
        title: title.trim(),
        author: author.trim(),
        catalogId: finalCatalogId,
        condition,
        availability,
        coverImage: finalCover,
        bookType: generalType === 'original' ? ('Original Copy' as const) : ('Translated Copy' as const),
        category,
        bookClassification: 'general' as const,
        generalType,
        translator: generalType === 'translated' ? translator.trim() : undefined,
        translationLanguage: generalType === 'translated' ? translationLanguage.trim() : undefined,
        edition: edition.trim() || undefined,
        description: generalType === 'translated'
          ? `Translated by ${translator.trim()} into ${translationLanguage.trim()}.${edition.trim() ? ` Edition: ${edition.trim()}.` : ''}`
          : edition.trim() ? `Edition: ${edition.trim()}.` : '',
      };

      onBookAdded?.(bookPayload);

      // Trigger the lightweight post-submission reading status follow-up
      setSubmittedBookInfo({ title: title.trim(), catalogId: finalCatalogId });
      setShowReadingStatusPrompt(true);

    } else {
      // Build structured payload for Academic Book (Donation only)
      const academicMeta: AcademicMetadata = {};
      let descSummary = `[ACADEMIC: ${educationLevel}]`;

      if (educationLevel === 'School') {
        academicMeta.schoolGrade = schoolGrade.trim();
        academicMeta.schoolSubject = schoolSubject.trim();
        descSummary += ` Class/Grade: ${schoolGrade.trim()} | Subject: ${schoolSubject.trim()}.`;
      } else if (educationLevel === 'College') {
        academicMeta.collegeGroup = collegeGroup;
        academicMeta.collegeSubject = collegeSubject.trim();
        descSummary += ` Group: ${collegeGroup} | Subject: ${collegeSubject.trim()}.`;
      } else if (educationLevel === 'University') {
        academicMeta.universityDepartment = universityDepartment.trim();
        if (universityCourse.trim()) academicMeta.universityCourse = universityCourse.trim();
        descSummary += ` Dept: ${universityDepartment.trim()}${universityCourse.trim() ? ` | Course: ${universityCourse.trim()}` : ''}.`;
      } else if (educationLevel === 'Professional') {
        academicMeta.professionalField = professionalField.trim();
        academicMeta.professionalSubject = professionalSubject.trim();
        descSummary += ` Field: ${professionalField.trim()} | Course: ${professionalSubject.trim()}.`;
      }

      if (edition.trim()) descSummary += ` Edition: ${edition.trim()}.`;

      const bookPayload = {
        title: title.trim(),
        author: author.trim(),
        catalogId: finalCatalogId,
        condition,
        availability: 'donation' as const, // STRICTLY FOR DONATION
        coverImage: finalCover,
        category: 'Non-fiction' as const,
        bookClassification: 'academic' as const,
        educationLevel,
        academicMetadata: academicMeta,
        edition: edition.trim() || undefined,
        description: descSummary,
      };

      onBookAdded?.(bookPayload);

      // Academic Books DO NOT show reading status follow-up. Directly close modal.
      handleModalClose();
    }
  };

  // Reading status choice handler (General Books Only)
  const handleReadingStatusSelect = async (status: UserReadingStatusValue) => {
    if (submittedBookInfo) {
      await dbService.upsertReadingStatus('demo-user', submittedBookInfo.catalogId, status);
    }
    handleModalClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-book-dialog-title"
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-5 right-5 p-2 rounded-full text-ink-muted hover:text-ink-primary hover:bg-surface-subtle transition cursor-pointer touch-target-44"
          aria-label="Close modal"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* ─────────────────────────────────────────────────────────────
            POST-SUBMISSION READING STATUS POPUP (GENERAL BOOKS ONLY)
        ───────────────────────────────────────────────────────────── */}
        {showReadingStatusPrompt ? (
          <div className="py-4 animate-in fade-in text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center mb-4">
              <HugeiconsIcon icon={BookOpen01Icon} size={28} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent-sage bg-accent-sage-subtle px-2.5 py-1 rounded-full border border-accent-sage/20">
              Book Added Successfully!
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-ink-primary mt-2">
              Have you read this book already?
            </h3>
            <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
              Help organize your personal reading library. (Kept private on your profile).
            </p>

            <div className="mt-6 space-y-2.5 max-w-sm mx-auto text-left">
              {[
                { status: 'read' as UserReadingStatusValue, label: "Yes, I've read it.", desc: 'Finished reading this title', emoji: '✅' },
                { status: 'reading' as UserReadingStatusValue, label: "I'm currently reading it.", desc: 'In progress on your nightstand', emoji: '📖' },
                { status: 'want_to_read' as UserReadingStatusValue, label: "No, I haven't read it yet.", desc: 'Saved for later on your wishlist', emoji: '🔖' },
              ].map((item) => (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => handleReadingStatusSelect(item.status)}
                  className="w-full p-3.5 rounded-2xl border border-surface-border bg-surface-subtle hover:bg-surface-card hover:border-brand/40 transition flex items-center justify-between cursor-pointer group active:scale-[0.99] touch-target-44 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.emoji}</span>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-ink-primary group-hover:text-brand transition-colors">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-ink-muted">{item.desc}</p>
                    </div>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-ink-muted group-hover:text-brand transition-colors" />
                </button>
              ))}
            </div>

            <div className="mt-6 pt-3 border-t border-surface-border">
              <button
                type="button"
                onClick={handleModalClose}
                className="text-xs text-ink-muted hover:text-ink-primary font-medium hover:underline cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* ─────────────────────────────────────────────────────────────
                SCREEN 0: ENTRY POINT SELECTION (GENERAL VS ACADEMIC)
            ───────────────────────────────────────────────────────────── */}
            {classification === null ? (
              <div className="py-2">
                <div className="mb-6">
                  <h3 id="add-book-dialog-title" className="font-serif text-2xl font-semibold text-ink-primary">
                    Add a Book to BookCircle
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-ink-secondary">
                    Select which type of book you would like to list in your community circle.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: General Book */}
                  <button
                    type="button"
                    onClick={() => {
                      setClassification('general');
                      setGeneralStep(1);
                    }}
                    className="p-5 rounded-2xl border border-surface-border bg-surface-subtle hover:bg-surface-card hover:border-brand/50 hover:shadow-tactile-card transition-all text-left flex flex-col justify-between group cursor-pointer active:scale-[0.98]"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <HugeiconsIcon icon={BookOpen01Icon} size={24} />
                      </div>
                      <h4 className="font-serif text-lg font-semibold text-ink-primary group-hover:text-brand transition-colors">
                        General Book
                      </h4>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                        Novels, literature, poetry, science, history, memoirs, and general leisure reading.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand">
                      <span>Add General Book</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                    </div>
                  </button>

                  {/* Option 2: Academic Book */}
                  <button
                    type="button"
                    onClick={() => {
                      setClassification('academic');
                      setAcademicStep(1);
                      setAvailability('donation'); // Enforce donation policy
                    }}
                    className="p-5 rounded-2xl border border-surface-border bg-surface-subtle hover:bg-surface-card hover:border-accent-amber/50 hover:shadow-tactile-card transition-all text-left flex flex-col justify-between group cursor-pointer active:scale-[0.98]"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-accent-amber-subtle text-accent-amber-text flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <HugeiconsIcon icon={GraduationCapIcon} size={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-lg font-semibold text-ink-primary group-hover:text-accent-amber-text transition-colors">
                          Academic Book
                        </h4>
                        <span className="text-[10px] font-bold bg-accent-sage-subtle text-accent-sage-text px-2 py-0.5 rounded-full border border-accent-sage/20">
                          Donation
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                        School, college, university textbooks, and professional curriculum course materials.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent-amber-text">
                      <span>Donate Academic Book</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                    </div>
                  </button>
                </div>
              </div>
            ) : classification === 'general' ? (
              /* ─────────────────────────────────────────────────────────────
                  PATH 1: GENERAL BOOK MULTI-STEP FLOW (2 STEPS)
              ───────────────────────────────────────────────────────────── */
              <div>
                {/* Header & Step Indicator */}
                <div className="pb-4 border-b border-surface-border mb-4 pr-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">
                      General Book · Step {generalStep} of 2
                    </span>
                    <button
                      type="button"
                      onClick={() => setClassification(null)}
                      className="text-xs text-ink-muted hover:text-ink-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} size={12} />
                      <span>Switch Type</span>
                    </button>
                  </div>
                  <h3 id="add-book-dialog-title" className="font-serif text-xl sm:text-2xl font-semibold text-ink-primary mt-1.5">
                    {generalStep === 1 ? 'Book Information' : 'Copy Information & Condition'}
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {generalStep === 1
                      ? 'Search existing title or enter author and category.'
                      : 'Specify your copy’s physical condition, availability, and cover image.'}
                  </p>
                </div>

                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {formError}
                  </div>
                )}

                {/* GENERAL STEP 1: BOOK INFORMATION */}
                {generalStep === 1 && (
                  <form onSubmit={handleGeneralStep1Continue} className="space-y-4">
                    {/* Copy Type Selection: Original vs Translated */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                        Copy Type
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'original' as GeneralBookType, label: 'Original Copy', desc: 'Authored in original language' },
                          { id: 'translated' as GeneralBookType, label: 'Translated Copy', desc: 'Translated from another language' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setGeneralType(item.id);
                              setFormError(null);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer touch-target-44 ${
                              generalType === item.id
                                ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                                : 'bg-surface-subtle hover:bg-surface-card text-ink-secondary border-surface-border'
                            }`}
                          >
                            <p className="font-semibold text-xs">{item.label}</p>
                            <p className={`text-[10px] mt-0.5 ${generalType === item.id ? 'text-white/80' : 'text-ink-muted'}`}>
                              {item.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Book Title Input with Real-Time Autocomplete Matching */}
                    <div ref={autocompleteRef} className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                          Book Title <span className="text-red-500">*</span>
                        </label>
                        {matchedCatalogId && (
                          <span className="text-[11px] text-accent-sage font-semibold flex items-center gap-1">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                            <span>Matched to Catalog</span>
                            <button
                              type="button"
                              onClick={handleClearCatalogMatch}
                              className="text-ink-muted hover:text-red-500 ml-1 underline cursor-pointer"
                            >
                              Clear
                            </button>
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                          <HugeiconsIcon icon={Search01Icon} size={16} />
                        </div>
                        <input
                          ref={titleInputRef}
                          type="text"
                          required
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            setIsTitleFocused(true);
                            if (formError) setFormError(null);
                          }}
                          onFocus={() => setIsTitleFocused(true)}
                          placeholder="Type title (e.g. The God of Small Things, Pachinko...)"
                          className="w-full pl-9 pr-4 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                        />
                      </div>

                      {/* Autocomplete Suggestions Dropdown */}
                      {isTitleFocused && catalogSuggestions.length > 0 && (
                        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-surface-card rounded-2xl border border-surface-border shadow-2xl max-h-56 overflow-y-auto divide-y divide-surface-border">
                          <div className="p-2.5 bg-surface-subtle text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center justify-between">
                            <span>MATCHING BOOKCIRCLE CATALOG TITLES</span>
                            <span>{catalogSuggestions.length} found</span>
                          </div>
                          {catalogSuggestions.map((item) => (
                            <button
                              key={`${item.source}-${item.id}`}
                              type="button"
                              onClick={() => handleSelectCatalogMatch(item)}
                              className="w-full p-2.5 text-left hover:bg-brand/5 flex items-center gap-3 transition cursor-pointer"
                            >
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="w-8 h-11 object-cover rounded shadow-xs flex-shrink-0 border border-surface-border"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-serif text-xs sm:text-sm font-semibold text-ink-primary truncate">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-ink-muted truncate">
                                  by {item.author}
                                  {item.translator && ` · Translated by ${item.translator}`}
                                </p>
                              </div>
                              <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                {item.source === 'canonical' ? 'Canonical' : 'Community'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Author Fields Based on Copy Type */}
                    {generalType === 'original' ? (
                      /* Original Copy: Author Name */
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                          Author Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          placeholder="Author Name (e.g. Arundhati Roy)"
                          className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                        />
                      </div>
                    ) : (
                      /* Translated Copy: Original Author + Translator + Translation Language */
                      <div className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                              Original Author <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={author}
                              onChange={(e) => setAuthor(e.target.value)}
                              placeholder="Original Author (e.g. Leo Tolstoy)"
                              className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                              Translator <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={translator}
                              onChange={(e) => setTranslator(e.target.value)}
                              placeholder="Translator (e.g. Constance Garnett)"
                              className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                            Translation Language <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={translationLanguage}
                              onChange={(e) => setTranslationLanguage(e.target.value)}
                              placeholder="Translation Language (e.g. Bengali, Spanish, English)"
                              list="languages-list"
                              className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                            />
                            <datalist id="languages-list">
                              {COMMON_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang} />
                              ))}
                            </datalist>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Genre / Category Selector */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                        Genre / Category <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs">
                        {CATEGORY_OPTIONS.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`min-h-[38px] py-1.5 px-2 rounded-xl border text-center transition font-medium cursor-pointer touch-target-44 ${
                              category === cat
                                ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                                : 'bg-surface-subtle hover:bg-surface-card text-ink-secondary border-surface-border'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Optional Edition Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 flex items-center justify-between">
                        <span>Edition</span>
                        <span className="text-[11px] text-ink-muted normal-case font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={edition}
                        onChange={(e) => setEdition(e.target.value)}
                        placeholder="e.g. 1st Edition, Illustrated Edition, Deluxe Paperback"
                        className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                      />
                    </div>

                    {/* Step 1 Actions */}
                    <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setClassification(null)}
                        className="px-4 py-2.5 rounded-xl border border-surface-border text-ink-secondary hover:bg-surface-subtle text-xs font-semibold transition cursor-pointer touch-target-44"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold transition active:scale-95 shadow-tactile-card flex items-center gap-1.5 cursor-pointer touch-target-44"
                      >
                        <span>Continue to Copy Info</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                      </button>
                    </div>
                  </form>
                )}

                {/* GENERAL STEP 2: COPY INFORMATION */}
                {generalStep === 2 && (
                  <form onSubmit={handleFinalSubmit} className="space-y-4">
                    {/* Book Condition (Required) */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                        Book Condition <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {CONDITION_OPTIONS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCondition(c.id)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer touch-target-44 ${
                              condition === c.id
                                ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                                : 'bg-surface-subtle hover:bg-surface-card text-ink-secondary border-surface-border'
                            }`}
                          >
                            <p className="font-semibold">{c.label}</p>
                            <p className={`text-[11px] mt-0.5 ${condition === c.id ? 'text-white/80' : 'text-ink-muted'}`}>
                              {c.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Availability (Required) */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                        Availability <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {AVAILABILITY_OPTIONS.map((a) => {
                          const IconComp = a.icon;
                          const isSelected = availability === a.id;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => setAvailability(a.id)}
                              className={`p-2.5 rounded-xl border text-left transition cursor-pointer touch-target-44 flex sm:flex-col items-center sm:items-start gap-2.5 ${
                                isSelected
                                  ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                                  : 'bg-surface-subtle hover:bg-surface-card text-ink-secondary border-surface-border'
                              }`}
                            >
                              <HugeiconsIcon icon={IconComp} size={18} className={isSelected ? 'text-white' : 'text-brand'} />
                              <div>
                                <p className="font-semibold text-xs">{a.label}</p>
                                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-ink-muted'}`}>
                                  {a.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Upload Book Cover (Required) */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 flex items-center justify-between">
                        <span>Upload Book Cover <span className="text-red-500">*</span></span>
                        {coverUrl && (
                          <span className="text-[11px] text-accent-sage font-medium flex items-center gap-1">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                            Cover photo ready
                          </span>
                        )}
                      </label>

                      {coverUrl ? (
                        <div className="p-3 bg-surface-subtle rounded-2xl border border-brand/40 shadow-xs flex items-center gap-3.5">
                          <img
                            src={coverUrl}
                            alt="Book cover preview"
                            className="w-14 h-20 object-cover rounded-xl shadow-sm border border-surface-border flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-ink-primary truncate">
                              {isCustomUploaded ? 'Custom Photo Uploaded' : 'Catalog / Sample Cover Selected'}
                            </p>
                            <p className="text-[11px] text-ink-muted mt-0.5">
                              {isCustomUploaded ? 'From your device' : 'Ready to be saved with your physical copy'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs font-medium text-brand hover:text-brand-dark bg-brand/10 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                              >
                                <HugeiconsIcon icon={Upload01Icon} size={12} />
                                <span>Replace Photo</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCoverUrl('');
                                  setIsCustomUploaded(false);
                                }}
                                className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 flex items-center gap-1 transition cursor-pointer"
                              >
                                <HugeiconsIcon icon={Delete02Icon} size={12} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`p-4 bg-surface-subtle rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3.5 ${
                            isDragging
                              ? 'border-brand bg-brand/5 scale-[1.01]'
                              : 'border-surface-border hover:border-brand/60 hover:bg-surface-card'
                          }`}
                        >
                          <div className="w-12 h-16 rounded-xl bg-brand/5 border border-dashed border-brand/30 text-brand flex flex-col items-center justify-center flex-shrink-0">
                            <HugeiconsIcon icon={Image01Icon} size={20} />
                            <span className="text-[9px] font-semibold mt-0.5 text-brand uppercase tracking-wider">Cover</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-ink-primary">
                              Upload a photo of your book cover
                            </p>
                            <p className="text-[11px] text-ink-muted mt-1 leading-normal">
                              Click to browse or drag & drop (PNG, JPG, WEBP up to 5MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step 2 Actions */}
                    <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setGeneralStep(1)}
                        className="px-4 py-2.5 rounded-xl border border-surface-border text-ink-secondary hover:bg-surface-subtle text-xs font-semibold transition flex items-center gap-1 cursor-pointer touch-target-44"
                      >
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold transition active:scale-95 shadow-tactile-card flex items-center gap-1.5 cursor-pointer touch-target-44"
                      >
                        <HugeiconsIcon icon={BookOpen01Icon} size={15} />
                        <span>List Book to Circle</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : classification === 'academic' ? (
              /* ─────────────────────────────────────────────────────────────
                  PATH 2: ACADEMIC BOOK MULTI-STEP FLOW (3 STEPS, DONATION ONLY)
              ───────────────────────────────────────────────────────────── */
              <div>
                {/* Header & Step Indicator */}
                <div className="pb-4 border-b border-surface-border mb-4 pr-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent-amber-text bg-accent-amber-subtle px-2.5 py-0.5 rounded-full border border-accent-amber/20">
                      Academic Donation · Step {academicStep} of 3
                    </span>
                    <button
                      type="button"
                      onClick={() => setClassification(null)}
                      className="text-xs text-ink-muted hover:text-ink-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} size={12} />
                      <span>Switch Type</span>
                    </button>
                  </div>
                  <h3 id="add-book-dialog-title" className="font-serif text-xl sm:text-2xl font-semibold text-ink-primary mt-1.5">
                    {academicStep === 1
                      ? 'Academic Book & Education Level'
                      : academicStep === 2
                      ? `${educationLevel} Specific Information`
                      : 'Copy Condition & Donation'}
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {academicStep === 1
                      ? 'Specify education tier, book title, and author/editor.'
                      : academicStep === 2
                      ? 'Provide syllabus or course details for students.'
                      : 'Review donation policy, set physical condition and book cover.'}
                  </p>
                </div>

                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {formError}
                  </div>
                )}

                {/* ACADEMIC STEP 1: BASIC BOOK INFO */}
                {academicStep === 1 && (
                  <form onSubmit={handleAcademicStep1Continue} className="space-y-4">
                    {/* Education Level (Required) */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                        Education Level <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {(['School', 'College', 'University', 'Professional'] as AcademicEducationLevel[]).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => {
                              setEducationLevel(level);
                              setFormError(null);
                            }}
                            className={`min-h-[44px] py-2 px-2.5 rounded-xl border text-center transition font-semibold cursor-pointer touch-target-44 ${
                              educationLevel === level
                                ? 'bg-accent-amber text-white border-accent-amber shadow-xs'
                                : 'bg-surface-subtle hover:bg-surface-card text-ink-secondary border-surface-border'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Book Title with Catalog Autocomplete */}
                    <div ref={autocompleteRef} className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                          Textbook Title <span className="text-red-500">*</span>
                        </label>
                        {matchedCatalogId && (
                          <span className="text-[11px] text-accent-sage font-semibold flex items-center gap-1">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                            <span>Matched to Catalog</span>
                            <button
                              type="button"
                              onClick={handleClearCatalogMatch}
                              className="text-ink-muted hover:text-red-500 ml-1 underline cursor-pointer"
                            >
                              Clear
                            </button>
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                          <HugeiconsIcon icon={Search01Icon} size={16} />
                        </div>
                        <input
                          ref={titleInputRef}
                          type="text"
                          required
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            setIsTitleFocused(true);
                            if (formError) setFormError(null);
                          }}
                          onFocus={() => setIsTitleFocused(true)}
                          placeholder="Textbook title (e.g. Higher Secondary Physics, Thomas Calculus...)"
                          className="w-full pl-9 pr-4 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                        />
                      </div>

                      {/* Autocomplete Suggestions Dropdown */}
                      {isTitleFocused && catalogSuggestions.length > 0 && (
                        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-surface-card rounded-2xl border border-surface-border shadow-2xl max-h-56 overflow-y-auto divide-y divide-surface-border">
                          <div className="p-2.5 bg-surface-subtle text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center justify-between">
                            <span>MATCHING ACADEMIC TEXTBOOKS</span>
                            <span>{catalogSuggestions.length} found</span>
                          </div>
                          {catalogSuggestions.map((item) => (
                            <button
                              key={`${item.source}-${item.id}`}
                              type="button"
                              onClick={() => handleSelectCatalogMatch(item)}
                              className="w-full p-2.5 text-left hover:bg-brand/5 flex items-center gap-3 transition cursor-pointer"
                            >
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="w-8 h-11 object-cover rounded shadow-xs flex-shrink-0 border border-surface-border"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-serif text-xs sm:text-sm font-semibold text-ink-primary truncate">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-ink-muted truncate">
                                  by {item.author}
                                  {item.educationLevel && ` · ${item.educationLevel}`}
                                </p>
                              </div>
                              <span className="text-[10px] bg-accent-amber-subtle text-accent-amber-text px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                Academic
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Author / Editor Name */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                        Author(s) or Editor <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Author or Editor Name (e.g. Halliday & Resnick)"
                        className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                      />
                    </div>

                    {/* Edition (Optional) */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 flex items-center justify-between">
                        <span>Edition</span>
                        <span className="text-[11px] text-ink-muted normal-case font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={edition}
                        onChange={(e) => setEdition(e.target.value)}
                        placeholder="e.g. 10th Edition, Global Edition, 2023 Revision"
                        className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                      />
                    </div>

                    {/* Step 1 Actions */}
                    <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setClassification(null)}
                        className="px-4 py-2.5 rounded-xl border border-surface-border text-ink-secondary hover:bg-surface-subtle text-xs font-semibold transition cursor-pointer touch-target-44"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold transition active:scale-95 shadow-tactile-card flex items-center gap-1.5 cursor-pointer touch-target-44"
                      >
                        <span>Continue to Course Info</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                      </button>
                    </div>
                  </form>
                )}

                {/* ACADEMIC STEP 2: DYNAMIC EDUCATION-SPECIFIC INFO */}
                {academicStep === 2 && (
                  <form onSubmit={handleAcademicStep2Continue} className="space-y-4">
                    {/* Dynamic Form: School */}
                    {educationLevel === 'School' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                            Class / Grade <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={schoolGrade}
                            onChange={(e) => setSchoolGrade(e.target.value)}
                            placeholder="e.g. Class 9, Grade 10, O Level, Year 8"
                            className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                            Subject <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={schoolSubject}
                            onChange={(e) => setSchoolSubject(e.target.value)}
                            placeholder="e.g. General Science, Mathematics, English, History"
                            className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Dynamic Form: College (No Department field) */}
                    {educationLevel === 'College' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                            Group <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {(['Science', 'Business Studies', 'Humanities'] as CollegeAcademicGroup[]).map((group) => (
                              <button
                                key={group}
                                type="button"
                                onClick={() => setCollegeGroup(group)}
                                className={`min-h-[44px] py-2 px-2 rounded-xl border text-center transition font-semibold cursor-pointer touch-target-44 ${
                                  collegeGroup === group
                                    ? 'bg-accent-amber text-white border-accent-amber shadow-xs'
                                    : 'bg-surface-subtle hover:bg-surface-card text-ink-secondary border-surface-border'
                                }`}
                              >
                                {group}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                            Subject <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={collegeSubject}
                            onChange={(e) => setCollegeSubject(e.target.value)}
                            placeholder="e.g. Physics 1st Paper, Accounting, Economics"
                            className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Dynamic Form: University */}
                    {educationLevel === 'University' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={universityDepartment}
                            onChange={(e) => setUniversityDepartment(e.target.value)}
                            placeholder="e.g. Computer Science & Engineering, Law, Economics"
                            className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 flex items-center justify-between">
                            <span>Course Name</span>
                            <span className="text-[11px] text-ink-muted normal-case font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={universityCourse}
                            onChange={(e) => setUniversityCourse(e.target.value)}
                            placeholder="e.g. Algorithms & Complexity, Constitutional Law"
                            className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Dynamic Form: Professional (No forced Department field) */}
                    {educationLevel === 'Professional' && (
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                            Professional Field / Specialization <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={professionalField}
                            onChange={(e) => setProfessionalField(e.target.value)}
                            placeholder="e.g. Chartered Accountancy (CA), Medical / USMLE, Law / Bar, PMP"
                            className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                            Subject or Course Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={professionalSubject}
                            onChange={(e) => setProfessionalSubject(e.target.value)}
                            placeholder="e.g. Financial Audit, Pathology, Corporate Taxation"
                            className="w-full px-3.5 py-2.5 bg-surface-subtle rounded-xl border border-surface-border text-xs sm:text-sm text-ink-primary placeholder-ink-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2 Actions */}
                    <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setAcademicStep(1)}
                        className="px-4 py-2.5 rounded-xl border border-surface-border text-ink-secondary hover:bg-surface-subtle text-xs font-semibold transition flex items-center gap-1 cursor-pointer touch-target-44"
                      >
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold transition active:scale-95 shadow-tactile-card flex items-center gap-1.5 cursor-pointer touch-target-44"
                      >
                        <span>Continue to Copy Info</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                      </button>
                    </div>
                  </form>
                )}

                {/* ACADEMIC STEP 3: COPY INFORMATION & DONATION LOCK */}
                {academicStep === 3 && (
                  <form onSubmit={handleFinalSubmit} className="space-y-4">
                    {/* Fixed Availability Banner (Policy Enforced) */}
                    <div className="p-4 rounded-2xl bg-accent-sage-subtle border border-accent-sage/30 text-xs text-left">
                      <div className="flex items-center gap-2 text-accent-sage-text font-bold">
                        <HugeiconsIcon icon={GiftIcon} size={16} />
                        <span>Availability: Fixed to For Donation</span>
                      </div>
                      <p className="text-ink-secondary mt-1 text-[11px] leading-relaxed">
                        Academic coursebooks and textbooks on BookCircle are donation-only to support student education and equitable community learning. Lending and Private Collection are not offered for academic books.
                      </p>
                    </div>

                    {/* Book Condition (Required) */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
                        Book Condition <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {CONDITION_OPTIONS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCondition(c.id)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer touch-target-44 ${
                              condition === c.id
                                ? 'bg-brand text-white border-brand shadow-xs font-semibold'
                                : 'bg-surface-subtle hover:bg-surface-card text-ink-secondary border-surface-border'
                            }`}
                          >
                            <p className="font-semibold">{c.label}</p>
                            <p className={`text-[11px] mt-0.5 ${condition === c.id ? 'text-white/80' : 'text-ink-muted'}`}>
                              {c.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Upload Book Cover (Required) */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5 flex items-center justify-between">
                        <span>Upload Book Cover <span className="text-red-500">*</span></span>
                        {coverUrl && (
                          <span className="text-[11px] text-accent-sage font-medium flex items-center gap-1">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                            Cover photo ready
                          </span>
                        )}
                      </label>

                      {coverUrl ? (
                        <div className="p-3 bg-surface-subtle rounded-2xl border border-brand/40 shadow-xs flex items-center gap-3.5">
                          <img
                            src={coverUrl}
                            alt="Book cover preview"
                            className="w-14 h-20 object-cover rounded-xl shadow-sm border border-surface-border flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-ink-primary truncate">
                              {isCustomUploaded ? 'Custom Photo Uploaded' : 'Sample Cover Selected'}
                            </p>
                            <p className="text-[11px] text-ink-muted mt-0.5">
                              Ready to be saved with textbook donation listing
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs font-medium text-brand hover:text-brand-dark bg-brand/10 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                              >
                                <HugeiconsIcon icon={Upload01Icon} size={12} />
                                <span>Replace Photo</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCoverUrl('');
                                  setIsCustomUploaded(false);
                                }}
                                className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 flex items-center gap-1 transition cursor-pointer"
                              >
                                <HugeiconsIcon icon={Delete02Icon} size={12} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`p-4 bg-surface-subtle rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-3.5 ${
                            isDragging
                              ? 'border-brand bg-brand/5 scale-[1.01]'
                              : 'border-surface-border hover:border-brand/60 hover:bg-surface-card'
                          }`}
                        >
                          <div className="w-12 h-16 rounded-xl bg-brand/5 border border-dashed border-brand/30 text-brand flex flex-col items-center justify-center flex-shrink-0">
                            <HugeiconsIcon icon={Image01Icon} size={20} />
                            <span className="text-[9px] font-semibold mt-0.5 text-brand uppercase tracking-wider">Cover</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-ink-primary">
                              Upload a photo of textbook cover
                            </p>
                            <p className="text-[11px] text-ink-muted mt-1 leading-normal">
                              Click to browse from device or drag & drop photo
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step 3 Actions */}
                    <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setAcademicStep(2)}
                        className="px-4 py-2.5 rounded-xl border border-surface-border text-ink-secondary hover:bg-surface-subtle text-xs font-semibold transition flex items-center gap-1 cursor-pointer touch-target-44"
                      >
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-accent-sage text-white text-xs font-semibold transition active:scale-95 shadow-tactile-card hover:brightness-105 flex items-center gap-1.5 cursor-pointer touch-target-44"
                      >
                        <HugeiconsIcon icon={GiftIcon} size={15} />
                        <span>Donate Academic Book</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBookModal;
