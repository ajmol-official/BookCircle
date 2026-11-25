import type { Conversation } from '../types/messaging';

export interface ChatPermission {
  /** Whether the current user can submit a message right now */
  canSend: boolean;
  /** True once full two-way chat is unlocked (accepted exchange, manual accept, or two-way replies) */
  isUnlocked: boolean;
  /** True when the other user sent 1+ message and current user hasn't accepted or replied yet */
  isIncomingRequest: boolean;
  /** True when 0 chat messages have been sent and user can send their 1 initial intro message */
  isFirstMessagePrompt: boolean;
  /** True when current user already sent 1 message and is locked waiting for accept/reply */
  isAwaitingAcceptance: boolean;
  /** True when the message request was declined */
  isDeclined: boolean;
}

/**
 * Computes Instagram-style 1-message request permissions for a conversation.
 *
 * Rules:
 * 1. Declined threads are locked.
 * 2. Threads are fully unlocked if status === 'accepted', hasAcceptedExchange is true,
 *    or both participants have sent at least 1 real chat message.
 * 3. Incoming request (other sent >=1, user sent 0): recipient can reply, accept, or decline.
 * 4. Outgoing request (user sent >=1, other sent 0): sender is locked until recipient accepts or replies.
 * 5. Brand-new / pending thread with 0 chat messages sent: user may send up to 1 initial message.
 */
export function getChatPermission(conv: Conversation): ChatPermission {
  if (conv.status === 'declined') {
    return {
      canSend: false,
      isUnlocked: false,
      isIncomingRequest: false,
      isFirstMessagePrompt: false,
      isAwaitingAcceptance: false,
      isDeclined: true,
    };
  }

  const chatMessages = (conv.messages || []).filter((m) => !m.id.startsWith('req-msg-'));
  const userCount = chatMessages.filter((m) => m.sender === 'user').length;
  const otherCount = chatMessages.filter((m) => m.sender === 'other').length;

  const isUnlocked =
    conv.status === 'accepted' ||
    Boolean(conv.hasAcceptedExchange) ||
    (userCount > 0 && otherCount > 0);

  if (isUnlocked) {
    return {
      canSend: true,
      isUnlocked: true,
      isIncomingRequest: false,
      isFirstMessagePrompt: false,
      isAwaitingAcceptance: false,
      isDeclined: false,
    };
  }

  if (otherCount > 0 && userCount === 0) {
    return {
      canSend: true,
      isUnlocked: false,
      isIncomingRequest: true,
      isFirstMessagePrompt: false,
      isAwaitingAcceptance: false,
      isDeclined: false,
    };
  }

  if (userCount >= 1 && otherCount === 0) {
    return {
      canSend: false,
      isUnlocked: false,
      isIncomingRequest: false,
      isFirstMessagePrompt: false,
      isAwaitingAcceptance: true,
      isDeclined: false,
    };
  }

  return {
    canSend: true,
    isUnlocked: false,
    isIncomingRequest: false,
    isFirstMessagePrompt: true,
    isAwaitingAcceptance: false,
    isDeclined: false,
  };
}
