import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { Conversation, ChatMessage, ActiveFloatingChat } from '../types/messaging';
import { useAuth } from './AuthContext';

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-elena',
    participantName: 'Elena Rostova',
    participantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    participantTrust: '5.0 ★ (Reliable Neighbor)',
    bookTitle: 'The Overstory',
    bookAuthor: 'Richard Powers',
    bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200',
    catalogId: 'the-overstory',
    role: 'Borrower',
    status: 'accepted',
    lastMessage: 'Hi! Looking forward to meeting tomorrow at Riverside Coffee.',
    lastMessageTime: '10:14 AM',
    unreadCount: 1,
    meetupDetails: {
      date: 'Tomorrow',
      time: '2:30 PM',
      spot: 'Riverside Coffee'
    },
    messages: [
      {
        id: 'msg-e1',
        sender: 'other',
        senderName: 'Elena Rostova',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        text: 'Hi Maya! Would love to borrow The Overstory for our local book circle next week.',
        time: 'Yesterday 3:15 PM'
      },
      {
        id: 'msg-e2',
        sender: 'user',
        senderName: 'You',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        text: 'Hello Elena! Happy to lend it. Riverside Coffee works well for me.',
        time: 'Yesterday 4:02 PM'
      },
      {
        id: 'msg-e3',
        sender: 'other',
        senderName: 'Elena Rostova',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        text: 'Hi! Looking forward to meeting tomorrow at Riverside Coffee.',
        time: '10:14 AM'
      }
    ]
  },
  {
    id: 'conv-1',
    participantName: 'Diego Ramirez',
    participantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    participantTrust: '4.9 ★ (Verified Lender)',
    bookTitle: 'The Overstory',
    bookAuthor: 'Richard Powers',
    bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200',
    catalogId: 'the-overstory',
    role: 'Lender',
    status: 'accepted',
    lastMessage: 'Riverside Coffee works great for me tomorrow at 10 AM. See you there!',
    lastMessageTime: 'Yesterday 4:18 PM',
    unreadCount: 0,
    meetupDetails: {
      date: 'Fri 25 Apr',
      time: '10:00 AM',
      spot: 'Riverside Coffee, Rampura'
    },
    messages: [
      {
        id: 'm-1',
        sender: 'other',
        senderName: 'Diego Ramirez',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        text: 'Hi Maya! I have accepted your request for The Overstory. Looking forward to lending it to you!',
        time: 'Yesterday 4:15 PM'
      },
      {
        id: 'm-2',
        sender: 'user',
        senderName: 'You',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        text: 'Thank you so much Diego! I have been looking for this edition for months. Where is best to meet?',
        time: 'Yesterday 4:18 PM'
      },
      {
        id: 'm-3',
        sender: 'other',
        senderName: 'Diego Ramirez',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        text: 'Riverside Coffee works great for me tomorrow at 10 AM. I will be sitting near the corner table with the book on the table.',
        time: 'Yesterday 4:20 PM'
      }
    ]
  },
  {
    id: 'conv-2',
    participantName: 'Hana Yamada',
    participantAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    participantTrust: '4.8 ★ (Community Leader)',
    bookTitle: 'Sapiens: A Brief History of Humankind',
    bookAuthor: 'Yuval Noah Harari',
    bookCover: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=200',
    catalogId: 'sapiens',
    role: 'Lender',
    status: 'accepted',
    lastMessage: 'Saturday at Elm Park Library works perfectly for me! See you at 11:30 AM.',
    lastMessageTime: '2 days ago',
    unreadCount: 0,
    meetupDetails: {
      date: 'Sat 26 Apr',
      time: '11:30 AM',
      spot: 'Elm Park Library entrance'
    },
    messages: [
      {
        id: 'm-201',
        sender: 'other',
        senderName: 'Hana Yamada',
        senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
        text: 'Hi Maya! Hope you are enjoying Sapiens. Let me know when you are ready to arrange the return handover.',
        time: '2 days ago'
      },
      {
        id: 'm-202',
        sender: 'user',
        senderName: 'You',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        text: 'Hi Hana! I just finished the final chapter yesterday. Saturday works great!',
        time: '2 days ago'
      }
    ]
  },
  {
    id: 'conv-3',
    participantName: 'Jonas Meier',
    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    participantTrust: '4.7 ★ (Active Lender)',
    bookTitle: 'The Night Circus',
    bookAuthor: 'Erin Morgenstern',
    bookCover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
    catalogId: 'the-night-circus',
    role: 'Lender',
    status: 'pending', // Direct messaging locked until accepted!
    lastMessage: 'Borrow request sent · Awaiting Jonas Meier acceptance',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    initialNote: 'Hi Jonas! I would love to borrow The Night Circus. I take great care of books and will return it on time.',
    meetupDetails: {
      date: 'Sat 26 Apr',
      time: '2:00 PM',
      spot: 'Elm Park Library entrance'
    },
    messages: []
  }
];

interface MessagingContextType {
  conversations: Conversation[];
  activeFloatingChat: ActiveFloatingChat | null;
  activeConversation: Conversation | null;
  drafts: Record<string, string>;
  totalUnreadCount: number;
  openFloatingChat: (participantName: string, bookTitle?: string, fallbackData?: Partial<Conversation>) => void;
  minimizeFloatingChat: () => void;
  expandFloatingChat: () => void;
  closeFloatingChat: () => void;
  setDraft: (convId: string, draft: string) => void;
  sendMessage: (convId: string, text: string) => Promise<void>;
  markAsRead: (convId: string) => void;
  simulateAcceptance: (convId: string) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

const STORAGE_KEY_CONVS = 'bookcircle_conversations_v2';
const STORAGE_KEY_DRAFTS = 'bookcircle_chat_drafts_v1';

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Load conversations from localStorage or fallback
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_CONVERSATIONS;
  });

  // Drafts per conversation
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  // Floating Chat State: null (closed) | { convId, state: 'expanded' | 'minimized' }
  const [activeFloatingChat, setActiveFloatingChat] = useState<ActiveFloatingChat | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVS, JSON.stringify(conversations));
    } catch {
      // ignore quota issues
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(drafts));
    } catch {
      // ignore
    }
  }, [drafts]);

  // Total unread count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  // Active conversation object
  const activeConversation = useMemo(() => {
    if (!activeFloatingChat) return null;
    return conversations.find((c) => c.id === activeFloatingChat.convId) || null;
  }, [activeFloatingChat, conversations]);

  // Mark a conversation as read
  const markAsRead = useCallback((convId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId && (c.unreadCount || 0) > 0) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      })
    );
  }, []);

  // Set draft for conversation
  const setDraft = useCallback((convId: string, draft: string) => {
    setDrafts((prev) => ({ ...prev, [convId]: draft }));
  }, []);

  // Open floating chat widget
  const openFloatingChat = useCallback(
    (participantName: string, bookTitle?: string, fallbackData?: Partial<Conversation>) => {
      const existing = conversations.find(
        (c) => c.participantName.toLowerCase().trim() === participantName.toLowerCase().trim()
      );
      const targetId = existing ? existing.id : `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      setConversations((prev) => {
        const found = prev.find(
          (c) => c.participantName.toLowerCase().trim() === participantName.toLowerCase().trim()
        );

        if (found) {
          if (bookTitle && found.bookTitle !== bookTitle) {
            return prev.map((c) => (c.id === found.id ? { ...c, bookTitle } : c));
          }
          return prev;
        }

        // Create new conversation
        const newConv: Conversation = {
          id: targetId,
          participantName,
          participantAvatar:
            fallbackData?.participantAvatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          participantTrust: fallbackData?.participantTrust || '4.9 ★ (Verified Reader)',
          bookTitle: bookTitle || fallbackData?.bookTitle || 'Community Book',
          bookAuthor: fallbackData?.bookAuthor || 'Neighbor',
          bookCover:
            fallbackData?.bookCover ||
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
          catalogId: fallbackData?.catalogId,
          role: fallbackData?.role || 'Lender',
          status: fallbackData?.status || 'accepted',
          lastMessage: 'Conversation opened',
          lastMessageTime: 'Just now',
          unreadCount: 0,
          messages: fallbackData?.messages || [],
          meetupDetails: fallbackData?.meetupDetails,
        };
        return [newConv, ...prev];
      });

      setActiveFloatingChat({ convId: targetId, state: 'expanded' });
      markAsRead(targetId);
    },
    [conversations, markAsRead]
  );

  const minimizeFloatingChat = useCallback(() => {
    setActiveFloatingChat((prev) => (prev ? { ...prev, state: 'minimized' } : null));
  }, []);

  const expandFloatingChat = useCallback(() => {
    setActiveFloatingChat((prev) => {
      if (!prev) return null;
      markAsRead(prev.convId);
      return { ...prev, state: 'expanded' };
    });
  }, [markAsRead]);

  const closeFloatingChat = useCallback(() => {
    setActiveFloatingChat(null);
  }, []);

  // Send message with permission validation
  const sendMessage = useCallback(
    async (convId: string, text: string) => {
      const clean = text.trim();
      if (!clean) return;

      const target = conversations.find((c) => c.id === convId);
      if (!target) throw new Error('Conversation not found');

      // CRITICAL PERMISSION CHECK:
      // Direct messaging is locked if the borrow request has not been accepted!
      if (target.status === 'pending') {
        throw new Error('403 Forbidden: Direct messaging is locked until the borrowing request has been accepted.');
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        senderName: currentUser?.displayName || 'You',
        senderAvatar:
          currentUser?.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        text: clean,
        time: timeStr,
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              lastMessage: clean,
              lastMessageTime: timeStr,
              messages: [...c.messages, newMsg],
            };
          }
          return c;
        })
      );

      // Clear draft for this conversation
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[convId];
        return next;
      });
    },
    [conversations, currentUser]
  );

  // Demo helper: simulate acceptance of request
  const simulateAcceptance = useCallback((convId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            status: 'accepted',
            lastMessage: 'Hi Maya! I have accepted your borrowing request! Looking forward to meeting.',
            lastMessageTime: 'Just now',
            messages: [
              ...c.messages,
              {
                id: `msg-accept-${Date.now()}`,
                sender: 'other',
                senderName: c.participantName,
                senderAvatar: c.participantAvatar,
                text: 'Hi Maya! I have accepted your borrowing request! Looking forward to meeting.',
                time: 'Just now',
                timestamp: Date.now(),
              },
            ],
          };
        }
        return c;
      })
    );
  }, []);

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        activeFloatingChat,
        activeConversation,
        drafts,
        totalUnreadCount,
        openFloatingChat,
        minimizeFloatingChat,
        expandFloatingChat,
        closeFloatingChat,
        setDraft,
        sendMessage,
        markAsRead,
        simulateAcceptance,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = (): MessagingContextType => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

