import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  SentIcon,
  MinusSignIcon,
  ArrowUpRight01Icon,
  LockIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons';
import { useMessaging } from '../../context/MessagingContext';

interface SafeAvatarProps {
  src?: string;
  name: string;
  sizeClass?: string;
}

const SafeAvatar: React.FC<SafeAvatarProps> = ({ src, name, sizeClass = 'w-8 h-8' }) => {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(() => {
    if (!name) return 'R';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-brand/10 border border-brand/20 text-brand font-bold text-xs flex items-center justify-center flex-shrink-0 select-none shadow-xs`}
        aria-label={name}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className={`${sizeClass} rounded-full object-cover ring-1 ring-slate-200/80 flex-shrink-0`}
      loading="lazy"
    />
  );
};

export const FloatingChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeFloatingChat,
    activeConversation,
    drafts,
    setDraft,
    sendMessage,
    minimizeFloatingChat,
    expandFloatingChat,
    closeFloatingChat,
    simulateAcceptance,
  } = useMessaging();

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  });

  const [mobileHeightTier, setMobileHeightTier] = useState<'normal' | 'expanded'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef<boolean>(false);

  // Track window resize for responsive breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll on mobile bottom sheet
  useEffect(() => {
    if (isMobile && activeFloatingChat?.state === 'expanded') {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMobile, activeFloatingChat]);

  // Auto-scroll when new messages arrive (unless user explicitly scrolled up)
  const messageCount = activeConversation?.messages?.length ?? 0;
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messageCount]);

  // If user is currently on the full /messages page, do not display duplicate floating chat
  const isFullMessagesPage = location.pathname === '/messages';
  if (isFullMessagesPage || !activeFloatingChat || !activeConversation) {
    return null;
  }

  const convId = activeConversation.id;
  const currentDraft = drafts[convId] || '';
  const isLocked = activeConversation.status === 'pending';

  // Handle scroll detection
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // If user is more than 80px away from bottom, mark userScrolledUp
    userScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 80;
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentDraft.trim() || isLocked || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendMessage(convId, currentDraft);
      userScrolledUpRef.current = false;
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFullMessages = () => {
    closeFloatingChat();
    navigate(`/messages?chat=${encodeURIComponent(activeConversation.participantName)}`);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 1. MOBILE BOTTOM SHEET (< 640px)
  // ───────────────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <AnimatePresence>
        <aside aria-label="Mobile chat conversation" className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeFloatingChat}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className={`relative z-10 w-full bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border-t border-slate-200 ${
              mobileHeightTier === 'expanded' ? 'h-[88vh]' : 'h-[64vh]'
            }`}
          >
            {/* Top Pull Handle */}
            <div
              className="w-full pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing select-none"
              onClick={() =>
                setMobileHeightTier((prev) => (prev === 'normal' ? 'expanded' : 'normal'))
              }
            >
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Mobile Header: User Profile, Name, Close (No book title as specified) */}
            <header className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <SafeAvatar
                  src={activeConversation.participantAvatar}
                  name={activeConversation.participantName}
                  sizeClass="w-9 h-9"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif text-sm font-semibold text-slate-900 truncate">
                      {activeConversation.participantName}
                    </h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                      {activeConversation.role}
                    </span>
                  </div>
                  {activeConversation.participantTrust && (
                    <p className="text-[10px] text-slate-400 truncate">
                      {activeConversation.participantTrust}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleOpenFullMessages}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Open full messages page"
                  aria-label="Open full messages page"
                >
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={18} />
                </button>
                <button
                  type="button"
                  onClick={closeFloatingChat}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close chat"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
              </div>
            </header>

            {/* Messages Scroll Area */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FCFBF8]"
            >
              {isLocked ? (
                <div className="py-8 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                    <HugeiconsIcon icon={LockIcon} size={20} />
                  </div>
                  <h4 className="font-serif text-base font-semibold text-slate-800">
                    Direct Chat Locked
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Messaging unlocks once {activeConversation.participantName} accepts your borrowing request.
                  </p>
                  <button
                    type="button"
                    onClick={() => simulateAcceptance(convId)}
                    className="mt-3.5 px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-semibold inline-flex items-center gap-1.5 transition"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                    <span>Simulate Acceptance</span>
                  </button>
                </div>
              ) : activeConversation.messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No messages yet. Send a greeting to start coordinating!
                </div>
              ) : (
                activeConversation.messages.map((m) => {
                  const isUser = m.sender === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                          isUser
                            ? 'bg-brand text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 px-1">{m.time}</span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Mobile Composer */}
            <form
              onSubmit={handleSend}
              className="p-3 pb-6 border-t border-slate-100 bg-white flex items-center gap-2 flex-shrink-0"
            >
              <input
                type="text"
                disabled={isLocked || isSubmitting}
                value={currentDraft}
                onChange={(e) => setDraft(convId, e.target.value)}
                placeholder={
                  isLocked ? 'Messaging locked until request accepted' : 'Type a message...'
                }
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:bg-slate-100 disabled:cursor-not-allowed transition"
              />
              <button
                type="submit"
                disabled={!currentDraft.trim() || isLocked || isSubmitting}
                className="w-8 h-8 rounded-xl bg-brand hover:bg-brand-dark active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center transition flex-shrink-0 shadow-xs"
                aria-label="Send message"
              >
                <HugeiconsIcon icon={SentIcon} size={15} />
              </button>
            </form>
          </motion.div>
        </aside>
      </AnimatePresence>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. DESKTOP MINIMIZED STATE (≥ 640px)
  // ───────────────────────────────────────────────────────────────────────────
  if (activeFloatingChat.state === 'minimized') {
    const hasUnread = (activeConversation.unreadCount || 0) > 0;

    return (
      <aside
        aria-label="Minimized chat bar"
        className="fixed z-40 bottom-6 right-6 w-[280px] sm:w-[320px] h-12 bg-white rounded-2xl shadow-xl border border-slate-200/90 flex items-center justify-between px-3.5 py-2 transition-all hover:border-slate-300 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 select-none cursor-pointer group"
        onClick={expandFloatingChat}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <SafeAvatar
              src={activeConversation.participantAvatar}
              name={activeConversation.participantName}
              sizeClass="w-7 h-7"
            />
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-white animate-pulse" />
            )}
          </div>
          <span className="font-serif text-xs font-semibold text-slate-800 truncate group-hover:text-brand transition">
            {activeConversation.participantName}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={expandFloatingChat}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Expand chat"
            aria-label="Expand chat"
          >
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
          </button>
          <button
            type="button"
            onClick={closeFloatingChat}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close chat"
            aria-label="Close chat"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} />
          </button>
        </div>
      </aside>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. DESKTOP EXPANDED STATE (≥ 640px)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <aside
      role="region"
      aria-label="Chat conversation"
      className="fixed z-40 bottom-6 right-6 w-[360px] h-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Desktop Header: Avatar, Name, Controls (No book title as specified) */}
      <header className="p-3 px-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <SafeAvatar
            src={activeConversation.participantAvatar}
            name={activeConversation.participantName}
            sizeClass="w-8 h-8"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif text-sm font-semibold text-slate-900 truncate">
                {activeConversation.participantName}
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                {activeConversation.role}
              </span>
            </div>
            {activeConversation.participantTrust && (
              <p className="text-[10px] text-slate-400 truncate">
                {activeConversation.participantTrust}
              </p>
            )}
          </div>
        </div>

        {/* Window Controls: Minimize, Open Full Page, Close */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={minimizeFloatingChat}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Minimize chat"
            aria-label="Minimize chat"
          >
            <HugeiconsIcon icon={MinusSignIcon} size={16} />
          </button>
          <button
            type="button"
            onClick={handleOpenFullMessages}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Open full messages page"
            aria-label="Open full messages page"
          >
            <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} />
          </button>
          <button
            type="button"
            onClick={closeFloatingChat}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close chat"
            aria-label="Close chat"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      </header>

      {/* Message History Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[#FCFBF8]"
      >
        {isLocked ? (
          <div className="py-10 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
              <HugeiconsIcon icon={LockIcon} size={20} />
            </div>
            <h4 className="font-serif text-base font-semibold text-slate-800">
              Direct Chat Locked
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Messaging unlocks once {activeConversation.participantName} accepts your borrowing request.
            </p>
            <button
              type="button"
              onClick={() => simulateAcceptance(convId)}
              className="mt-3.5 px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-semibold inline-flex items-center gap-1.5 transition"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
              <span>Simulate Acceptance</span>
            </button>
          </div>
        ) : activeConversation.messages.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No messages yet. Send a greeting to start coordinating!
          </div>
        ) : (
          activeConversation.messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-brand text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 px-1">{m.time}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Composer at Bottom */}
      <form
        onSubmit={handleSend}
        className="p-2.5 px-3 border-t border-slate-100 bg-white flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          disabled={isLocked || isSubmitting}
          value={currentDraft}
          onChange={(e) => setDraft(convId, e.target.value)}
          placeholder={
            isLocked ? 'Messaging locked until request accepted' : 'Type a message...'
          }
          className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:bg-slate-100 disabled:cursor-not-allowed transition"
        />
        <button
          type="submit"
          disabled={!currentDraft.trim() || isLocked || isSubmitting}
          className="w-8 h-8 rounded-xl bg-brand hover:bg-brand-dark active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center transition flex-shrink-0 shadow-xs"
          aria-label="Send message"
        >
          <HugeiconsIcon icon={SentIcon} size={15} />
        </button>
      </form>
    </aside>
  );
};

export default FloatingChatWidget;

