export interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
  timestamp?: number;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantTrust?: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  catalogId?: string;
  role: 'Lender' | 'Borrower';
  status: 'accepted' | 'pending';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  meetupDetails?: {
    date: string;
    time: string;
    spot: string;
  };
  initialNote?: string;
  messages: ChatMessage[];
}

export type FloatingChatState = 'expanded' | 'minimized' | 'closed';

export interface ActiveFloatingChat {
  convId: string;
  state: 'expanded' | 'minimized';
}

