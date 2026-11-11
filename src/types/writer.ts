import type { Author } from './author';

export type WriterStatus =
  | 'not_applied'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export interface WriterApplication {
  id: string;
  userId: string;
  applicantName: string;
  applicantEmail?: string;
  type: 'claim_existing' | 'create_new';
  status: WriterStatus;

  // For Claiming Existing Profile:
  targetAuthorId?: string;
  targetAuthorName?: string;
  targetAuthorSlug?: string;
  verificationNotes: string;
  verificationLinks: string[];

  // For Creating New Profile:
  proposedAuthor?: Partial<Author>;

  // Administrative Review:
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  adminNotes?: string;
}

export interface AuthorWorkSuggestion {
  id: string;
  authorId: string;
  authorName: string;
  userId: string;
  type: 'add_work' | 'edit_work';
  workId?: string;
  title: string;
  publishedYear?: string;
  category: 'Fiction' | 'Non-fiction' | 'Science' | 'History' | 'Poetry';
  synopsis?: string;
  coverImage?: string;
  publisherUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

