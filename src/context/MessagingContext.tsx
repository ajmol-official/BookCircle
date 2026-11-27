import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Conversation, ChatMessage, ActiveFloatingChat } from '../types/messaging';
import { useAuth } from './AuthContext';
import { useExchanges } from './ExchangeContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { cleanAvatarUrl } from '../utils/avatarUtils';
import { getChatPermission } from '../utils/messagingPermissions';

const isRealUuid = (id?: string): boolean =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

const INITIAL_CONVERSATIONS: Conversation[] = [];

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
  acceptMessageRequest: (convId: string) => void;
  declineMessageRequest: (convId: string) => void;
  simulateAcceptance: (convId: string) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

const STORAGE_KEY_CONVS = 'bookcircle_conversations_v3';
const STORAGE_KEY_DRAFTS = 'bookcircle_chat_drafts_v1';

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { exchanges } = useExchanges();

  // Load conversations from localStorage or fallback
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Drop legacy mock conversations
          return parsed.filter(
            (c) =>
              !c.id?.startsWith('conv-elena') &&
              !['conv-1', 'conv-2', 'conv-3'].includes(c.id) &&
              !['Elena Rostova', 'Diego Ramirez', 'Hana Yamada', 'Jonas Meier'].includes(c.participantName)
          );
        }
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

  // Explicit message request decisions ('accepted' | 'declined') keyed by participant ID or lowercase name
  const decisionsStorageKey = `bookcircle_msg_decisions_v1_${currentUser?.id || 'guest'}`;
  const [requestDecisions, setRequestDecisions] = useState<Record<string, 'accepted' | 'declined'>>(() => {
    try {
      const saved = localStorage.getItem(`bookcircle_msg_decisions_v1_${currentUser?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(decisionsStorageKey);
      setRequestDecisions(saved ? JSON.parse(saved) : {});
    } catch {
      setRequestDecisions({});
    }
  }, [decisionsStorageKey]);

  const saveDecision = useCallback(
    (participantId?: string, participantName?: string, decision?: 'accepted' | 'declined') => {
      if (!decision) return;
      setRequestDecisions((prev) => {
        const next = { ...prev };
        if (participantId) next[participantId.toLowerCase()] = decision;
        if (participantName) next[`name:${participantName.toLowerCase().trim()}`] = decision;
        try {
          localStorage.setItem(decisionsStorageKey, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [decisionsStorageKey]
  );

  const getDecision = useCallback(
    (participantId?: string, participantName?: string): 'accepted' | 'declined' | undefined => {
      if (participantId && requestDecisions[participantId.toLowerCase()]) {
        return requestDecisions[participantId.toLowerCase()];
      }
      if (participantName && requestDecisions[`name:${participantName.toLowerCase().trim()}`]) {
        return requestDecisions[`name:${participantName.toLowerCase().trim()}`];
      }
      return undefined;
    },
    [requestDecisions]
  );

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

  // Synchronize authentic conversations from active / pending exchanges (borrow_requests)
  useEffect(() => {
    if (!exchanges || exchanges.length === 0) return;

    setConversations((prev) => {
      let updated = [...prev];

      for (const ex of exchanges) {
        // Check if current user is involved in this exchange
        const isOwner = currentUser?.id
          ? ex.ownerId === currentUser.id
          : ex.ownerName?.toLowerCase() === currentUser?.displayName?.toLowerCase();
        const isBorrower = currentUser?.id
          ? ex.borrowerId === currentUser.id
          : ex.borrowerName?.toLowerCase() === currentUser?.displayName?.toLowerCase();

        // If user is authenticated and not involved, skip
        if (currentUser && !isOwner && !isBorrower) continue;

        const otherId = isOwner ? ex.borrowerId : ex.ownerId;
        const otherName = isOwner ? ex.borrowerName : ex.ownerName;
        const otherAvatar = cleanAvatarUrl(isOwner ? ex.borrowerAvatar : ex.ownerAvatar);
        const otherTrust = isOwner
          ? ex.borrowerTrust || 'Community Reader'
          : ex.ownerTrust || 'Verified Neighbor';
        const role: 'Lender' | 'Borrower' = isOwner ? 'Lender' : 'Borrower';
        const isAccepted = [
          'accepted',
          'handover_in_progress',
          'active_loan',
          'return_scheduled',
          'return_in_progress',
          'completed',
          'handed_over',
          'claim_accepted',
          'claim_handover',
          'claim_handover_in_progress',
          'claim_completed'
        ].includes(ex.status);

        const decision = getDecision(otherId, otherName);

        // Check if conversation already exists by exchange ID or participant
        const existingIdx = updated.findIndex(
          (c) =>
            c.id === `conv-ex-${ex.id}` ||
            (otherId && isRealUuid(otherId) && c.participantId === otherId) ||
            c.participantName.toLowerCase().trim() === otherName.toLowerCase().trim()
        );

        const cleanReqNote = (ex.message || '')
          .replace(/\[BC_META\]:[\s\S]*$/, '')
          .trim();

        const reqMessage: ChatMessage | null = cleanReqNote
          ? {
              id: `req-msg-${ex.id}`,
              sender: isBorrower ? 'user' : 'other',
              senderName: ex.borrowerName,
              senderAvatar: cleanAvatarUrl(ex.borrowerAvatar),
              text: cleanReqNote,
              time: ex.meetupDate || ex.requestDate || 'Request note',
              timestamp: new Date(ex.requestDate || Date.now()).getTime(),
            }
          : null;

        if (existingIdx >= 0) {
          const existing = updated[existingIdx];
          const msgs = existing.messages || [];
          const hasReqMsg = reqMessage && msgs.some((m) => m.id === reqMessage.id || m.text === reqMessage.text);
          const mergedMsgs = reqMessage && !hasReqMsg ? [reqMessage, ...msgs] : msgs;
          const realChatMsgs = mergedMsgs.filter((m) => !m.id.startsWith('req-msg-'));
          const hasTwoWayReplies =
            realChatMsgs.some((m) => m.sender === 'user') &&
            realChatMsgs.some((m) => m.sender === 'other');
          const nextStatus: Conversation['status'] =
            isAccepted || decision === 'accepted' || hasTwoWayReplies || existing.status === 'accepted'
              ? 'accepted'
              : decision === 'declined'
              ? 'declined'
              : 'pending';

          updated[existingIdx] = {
            ...existing,
            participantId: otherId || existing.participantId,
            participantName: otherName || existing.participantName,
            participantAvatar: otherAvatar || existing.participantAvatar,
            participantTrust: otherTrust || existing.participantTrust,
            bookTitle: ex.bookTitle || existing.bookTitle,
            bookAuthor: ex.bookAuthor || existing.bookAuthor,
            bookCover: ex.bookCover || existing.bookCover,
            role,
            hasAcceptedExchange: isAccepted || existing.hasAcceptedExchange,
            status: nextStatus,
            meetupDetails: ex.meetupDate
              ? {
                  date: ex.meetupDate,
                  time: ex.meetupTime,
                  spot: ex.meetupSpot,
                }
              : existing.meetupDetails,
            messages: mergedMsgs,
          };
        } else {
          const newConv: Conversation = {
            id: `conv-ex-${ex.id}`,
            participantId: otherId,
            participantName: otherName,
            participantAvatar: otherAvatar,
            participantTrust: otherTrust,
            bookTitle: ex.bookTitle,
            bookAuthor: ex.bookAuthor,
            bookCover: ex.bookCover,
            catalogId: ex.catalogId,
            role,
            hasAcceptedExchange: isAccepted,
            status: isAccepted || decision === 'accepted' ? 'accepted' : decision === 'declined' ? 'declined' : 'pending',
            lastMessage: cleanReqNote || `Borrow request ${ex.status}`,
            lastMessageTime: ex.meetupDate || ex.requestDate || 'Recently',
            unreadCount: 0,
            initialNote: cleanReqNote,
            meetupDetails: ex.meetupDate
              ? {
                  date: ex.meetupDate,
                  time: ex.meetupTime,
                  spot: ex.meetupSpot,
                }
              : undefined,
            messages: reqMessage ? [reqMessage] : [],
          };
          updated.push(newConv);
        }
      }

      return updated;
    });
  }, [exchanges, currentUser, getDecision]);

  // Helper to resolve a participant's UUID in Supabase
  const resolveParticipantId = useCallback(
    async (conv: Conversation): Promise<string | null> => {
      if (isRealUuid(conv.participantId)) return conv.participantId!;
      if (!isSupabaseConfigured() || !conv.participantName) return null;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .ilike('full_name', conv.participantName.trim())
          .limit(1);

        if (data && data[0]?.id && isRealUuid(data[0].id)) {
          return data[0].id;
        }
      } catch {
        // non-blocking fallback
      }
      return null;
    },
    []
  );

  const profileCacheRef = useRef<Map<string, { id: string; full_name: string; avatar_url: string }>>(new Map());
  const lastMsgSyncRef = useRef<number>(0);

  // Synchronize remote messages from Supabase for authenticated users
  const syncRemoteMessages = useCallback(async () => {
    if (!isSupabaseConfigured() || !isRealUuid(currentUser?.id)) return;

    try {
      lastMsgSyncRef.current = Date.now();
      const currentUserId = currentUser!.id;
      const { data: remoteMsgs, error } = await supabase
        .from('messages')
        .select('id, sender_id, receiver_id, content, is_read, created_at')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: true });

      if (error || !remoteMsgs || remoteMsgs.length === 0) return;

      // Collect unique other user IDs not already cached to avoid re-fetching avatars on every sync
      const otherUserIds = Array.from(
        new Set(
          remoteMsgs.map((m) => (m.sender_id === currentUserId ? m.receiver_id : m.sender_id))
        )
      );
      const uncachedIds = otherUserIds.filter((id) => !profileCacheRef.current.has(id));

      if (uncachedIds.length > 0) {
        const { data: remoteProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', uncachedIds);

        for (const p of remoteProfiles || []) {
          profileCacheRef.current.set(p.id, p);
        }
      }

      const profileMap = profileCacheRef.current;

      // Group messages by other user ID
      const msgsByOther = new Map<string, typeof remoteMsgs>();
      for (const m of remoteMsgs) {
        const otherId = m.sender_id === currentUserId ? m.receiver_id : m.sender_id;
        const list = msgsByOther.get(otherId) || [];
        list.push(m);
        msgsByOther.set(otherId, list);
      }

      setConversations((prev) => {
        let updated = [...prev];

        for (const [otherId, mList] of msgsByOther.entries()) {
          const profile = profileMap.get(otherId);
          const otherName = profile?.full_name || 'Community Reader';
          const otherAvatar = cleanAvatarUrl(profile?.avatar_url);

          const formattedMessages: ChatMessage[] = mList.map((m) => {
            const isMe = m.sender_id === currentUserId;
            const createdDate = new Date(m.created_at);
            return {
              id: m.id,
              sender: isMe ? 'user' : 'other',
              senderName: isMe ? currentUser?.displayName || 'You' : otherName,
              senderAvatar: isMe
                ? cleanAvatarUrl(currentUser?.avatar)
                : otherAvatar,
              text: m.content,
              time: createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: createdDate.getTime(),
            };
          });

          // Check if conversation exists
          const existingIdx = updated.findIndex(
            (c) =>
              (c.participantId && c.participantId === otherId) ||
              c.participantName.toLowerCase().trim() === otherName.toLowerCase().trim()
          );

          const decision = getDecision(otherId, otherName);

          if (existingIdx >= 0) {
            const existingConv = updated[existingIdx];
            const existingMsgs = existingConv.messages || [];
            const merged = [...existingMsgs];
            for (const fm of formattedMessages) {
              if (
                !merged.some(
                  (em) =>
                    em.id === fm.id ||
                    (em.text === fm.text &&
                      Math.abs((em.timestamp || 0) - (fm.timestamp || 0)) < 4000)
                )
              ) {
                merged.push(fm);
              }
            }
            merged.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            const lastM = merged[merged.length - 1];
            const realChatMsgs = merged.filter((m) => !m.id.startsWith('req-msg-'));
            const hasTwoWayReplies =
              realChatMsgs.some((m) => m.sender === 'user') &&
              realChatMsgs.some((m) => m.sender === 'other');

            const nextStatus: Conversation['status'] =
              existingConv.hasAcceptedExchange ||
              decision === 'accepted' ||
              hasTwoWayReplies ||
              existingConv.status === 'accepted'
                ? 'accepted'
                : decision === 'declined'
                ? 'declined'
                : 'pending';

            updated[existingIdx] = {
              ...existingConv,
              participantId: otherId,
              participantName: existingConv.participantName || otherName,
              participantAvatar: existingConv.participantAvatar || otherAvatar,
              status: nextStatus,
              lastMessage: lastM?.text || existingConv.lastMessage,
              lastMessageTime: lastM?.time || existingConv.lastMessageTime,
              messages: merged,
            };
          } else {
            const lastM = formattedMessages[formattedMessages.length - 1];
            const hasTwoWayReplies =
              formattedMessages.some((m) => m.sender === 'user') &&
              formattedMessages.some((m) => m.sender === 'other');
            const initialStatus: Conversation['status'] =
              decision === 'accepted' || hasTwoWayReplies
                ? 'accepted'
                : decision === 'declined'
                ? 'declined'
                : 'pending';

            const newConv: Conversation = {
              id: `conv-${otherId}`,
              participantId: otherId,
              participantName: otherName,
              participantAvatar: otherAvatar,
              participantTrust: '4.9 ★ (Verified Reader)',
              bookTitle: 'Direct Message',
              bookAuthor: 'Neighbor Inquiry',
              bookCover:
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
              role: 'Lender',
              status: initialStatus,
              lastMessage: lastM?.text || 'Conversation opened',
              lastMessageTime: lastM?.time || 'Just now',
              unreadCount: 0,
              messages: formattedMessages,
            };
            updated = [newConv, ...updated];
          }
        }

        return updated;
      });
    } catch (e) {
      console.warn('Could not sync remote messages from Supabase:', e);
    }
  }, [currentUser, getDecision]);

  // Sync on mount, on currentUser change, and via Supabase Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured() || !isRealUuid(currentUser?.id)) return;

    syncRemoteMessages();

    const channel = supabase
      .channel(`realtime:messages:${currentUser!.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          syncRemoteMessages();
        }
      )
      .subscribe();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastMsgSyncRef.current > 30_000) {
        syncRemoteMessages();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncRemoteMessages();
      }
    }, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [syncRemoteMessages, currentUser?.id]);

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
      // Trigger background sync to retrieve any newly received messages
      syncRemoteMessages();

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

        // Create new message request conversation (defaults to 'pending' — 1 intro message allowed until accepted/replied)
        const newConv: Conversation = {
          id: targetId,
          participantId: fallbackData?.participantId,
          participantName,
          participantAvatar: cleanAvatarUrl(fallbackData?.participantAvatar),
          participantTrust: fallbackData?.participantTrust || '4.9 ★ (Verified Reader)',
          bookTitle: bookTitle || fallbackData?.bookTitle || 'Direct Message',
          bookAuthor: fallbackData?.bookAuthor || 'Neighbor Inquiry',
          bookCover:
            fallbackData?.bookCover ||
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
          catalogId: fallbackData?.catalogId,
          role: fallbackData?.role || 'Lender',
          status: fallbackData?.status || 'pending',
          lastMessage: 'Send up to 1 message to start chatting',
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
    [conversations, markAsRead, syncRemoteMessages]
  );

  const minimizeFloatingChat = useCallback(() => {
    setActiveFloatingChat((prev) => (prev ? { ...prev, state: 'minimized' } : null));
  }, []);

  const expandFloatingChat = useCallback(() => {
    // When expanding conversation, refresh messages from Supabase
    syncRemoteMessages();

    setActiveFloatingChat((prev) => {
      if (!prev) return null;
      markAsRead(prev.convId);
      return { ...prev, state: 'expanded' };
    });
  }, [markAsRead, syncRemoteMessages]);

  const closeFloatingChat = useCallback(() => {
    setActiveFloatingChat(null);
  }, []);

  // Send message with permission validation and Supabase persistence
  const sendMessage = useCallback(
    async (convId: string, text: string) => {
      const clean = text.trim();
      if (!clean) return;

      const target = conversations.find((c) => c.id === convId);
      if (!target) throw new Error('Conversation not found');

      // CRITICAL PERMISSION CHECK (Instagram-style 1-message request limit):
      const permission = getChatPermission(target);
      if (!permission.canSend) {
        throw new Error(
          permission.isDeclined
            ? 'This message request was declined.'
            : 'Message request sent. You can send more messages once the recipient accepts or replies.'
        );
      }

      // Resolve recipient UUID for real authenticated session
      let resolvedId = target.participantId;
      if (!resolvedId && isSupabaseConfigured() && isRealUuid(currentUser?.id)) {
        resolvedId = (await resolveParticipantId(target)) || undefined;
      }

      let messageId = `msg-${Date.now()}`;
      let messageTimestamp = Date.now();

      // Persist to Supabase if authenticated and recipient resolved
      if (
        isSupabaseConfigured() &&
        isRealUuid(currentUser?.id) &&
        resolvedId &&
        isRealUuid(resolvedId)
      ) {
        const { data: inserted, error: sendErr } = await supabase
          .from('messages')
          .insert({
            sender_id: currentUser!.id,
            receiver_id: resolvedId,
            content: clean,
          })
          .select()
          .single();

        if (sendErr) {
          console.error('Failed to send message to Supabase:', sendErr);
          throw new Error(`Failed to send message: ${sendErr.message}`);
        }

        if (inserted) {
          messageId = inserted.id;
          messageTimestamp = new Date(inserted.created_at).getTime();
        }
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMsg: ChatMessage = {
        id: messageId,
        sender: 'user',
        senderName: currentUser?.displayName || 'You',
        senderAvatar: cleanAvatarUrl(currentUser?.avatar),
        text: clean,
        time: timeStr,
        timestamp: messageTimestamp,
      };

      // If the recipient replies to an incoming message request, automatically accept & unlock two-way chat
      if (permission.isIncomingRequest) {
        saveDecision(resolvedId || target.participantId, target.participantName, 'accepted');
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            const updatedMessages = [...c.messages, newMsg];
            const realChatMsgs = updatedMessages.filter((m) => !m.id.startsWith('req-msg-'));
            const hasTwoWayReplies =
              realChatMsgs.some((m) => m.sender === 'user') &&
              realChatMsgs.some((m) => m.sender === 'other');
            const nextStatus: Conversation['status'] =
              c.status === 'accepted' || hasTwoWayReplies || permission.isIncomingRequest
                ? 'accepted'
                : 'pending';

            return {
              ...c,
              participantId: resolvedId || c.participantId,
              status: nextStatus,
              lastMessage: clean,
              lastMessageTime: timeStr,
              messages: updatedMessages,
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
    [conversations, currentUser, resolveParticipantId, saveDecision]
  );

  // Recipient explicitly accepts an incoming message request
  const acceptMessageRequest = useCallback(
    (convId: string) => {
      const target = conversations.find((c) => c.id === convId);
      if (target) {
        saveDecision(target.participantId, target.participantName, 'accepted');
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, status: 'accepted' } : c))
      );
    },
    [conversations, saveDecision]
  );

  // Recipient explicitly declines an incoming message request
  const declineMessageRequest = useCallback(
    (convId: string) => {
      const target = conversations.find((c) => c.id === convId);
      if (target) {
        saveDecision(target.participantId, target.participantName, 'declined');
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, status: 'declined', unreadCount: 0 } : c))
      );
      setActiveFloatingChat((prev) => (prev?.convId === convId ? null : prev));
    },
    [conversations, saveDecision]
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
        acceptMessageRequest,
        declineMessageRequest,
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

