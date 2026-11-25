import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  SentIcon,
  LockIcon,
  ShieldCheckIcon,
  Calendar01Icon,
  Location01Icon,
  Tick01Icon,
  ArrowLeft01Icon,
  BubbleChatIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';
import { useMessaging } from '../../context/MessagingContext';
import type { ChatMessage, Conversation } from '../../types/messaging';
import { getChatPermission } from '../../utils/messagingPermissions';
import { cleanAvatarUrl, getUserInitials } from '../../utils/avatarUtils';

export type { ChatMessage, Conversation };

const SafeInboxAvatar: React.FC<{ src?: string; name: string; className?: string; textClass?: string }> = ({
  src,
  name,
  className = 'w-11 h-11',
  textClass = 'text-xs',
}) => {
  const [hasError, setHasError] = useState(false);
  const cleaned = cleanAvatarUrl(src);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!cleaned || hasError) {
    return (
      <div
        className={`${className} rounded-full bg-brand/10 border border-brand/20 text-brand font-serif font-bold ${textClass} flex items-center justify-center flex-shrink-0 select-none`}
        aria-label={name}
      >
        {getUserInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={cleaned}
      alt={name}
      onError={() => setHasError(true)}
      className={`${className} rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0`}
    />
  );
};

interface InboxPageProps {
  initialOwnerName?: string | null;
  onSelectBook?: (bookTitle: string) => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({ initialOwnerName }) => {
  const {
    conversations,
    sendMessage,
    drafts,
    setDraft,
    markAsRead,
    acceptMessageRequest,
    declineMessageRequest,
  } = useMessaging();

  const visibleConversations = conversations.filter((c) => c.status !== 'declined');

  // Active selected conversation
  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    if (initialOwnerName && visibleConversations.length > 0) {
      const match = visibleConversations.find(
        (c) => c.participantName.toLowerCase() === initialOwnerName.toLowerCase()
      );
      if (match) return match.id;
    }
    return visibleConversations[0]?.id || '';
  });

  const [mobileView, setMobileView] = useState<'list' | 'chat'>(initialOwnerName ? 'chat' : 'list');
  const [filter, setFilter] = useState<'all' | 'accepted' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Keep selectedConvId valid as conversations load or update
  useEffect(() => {
    if (!selectedConvId && visibleConversations.length > 0) {
      setSelectedConvId(visibleConversations[0].id);
    } else if (
      selectedConvId &&
      !visibleConversations.some((c) => c.id === selectedConvId) &&
      visibleConversations.length > 0
    ) {
      setSelectedConvId(visibleConversations[0].id);
    }
  }, [visibleConversations, selectedConvId]);

  const currentConv =
    visibleConversations.find((c) => c.id === selectedConvId) || visibleConversations[0];
  const permission = currentConv ? getChatPermission(currentConv) : null;
  const inputMessage = drafts[currentConv?.id || ''] || '';
  const setInputMessage = (val: string) => {
    if (currentConv) setDraft(currentConv.id, val);
  };

  const acceptedCount = visibleConversations.filter((c) => c.status === 'accepted').length;
  const pendingCount = visibleConversations.filter((c) => c.status === 'pending').length;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark as read when selected
  useEffect(() => {
    if (selectedConvId) {
      markAsRead(selectedConvId);
    }
  }, [selectedConvId, markAsRead]);

  const filteredConversations = visibleConversations.filter((c) => {
    if (filter === 'accepted' && c.status !== 'accepted') return false;
    if (filter === 'pending' && c.status !== 'pending') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.participantName.toLowerCase().includes(q) ||
        c.bookTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Scroll to latest message smoothly when messages change or conversation switches
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, currentConv?.messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentConv || !permission?.canSend) return;
    await sendMessage(currentConv.id, inputMessage);
  };

  const quickReplies = [
    'Looking forward to it!',
    'I will be there on time.',
    'I have arrived at the spot.',
    'Thanks again!'
  ];

  return (
    <div className="h-full flex flex-col pt-1.5 sm:pt-3 pb-0 overflow-hidden animate-in fade-in duration-200">
      
      {/* Page Title & Intro - Compact fixed header with live network pill */}
      <div className="px-3 sm:px-0 mb-2 sm:mb-2.5 flex-shrink-0 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-lg sm:text-2xl font-semibold text-slate-800 tracking-tight">
            Messages & Inbox
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Coordinate meetups and communicate securely once borrowing requests are accepted.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Community Network Connected</span>
        </div>
      </div>

      {/* Main Inbox Container - Fixed height with 4/12 and 8/12 layout */}
      <div className="flex-1 min-h-0 bg-white rounded-none sm:rounded-2xl lg:rounded-3xl border-0 sm:border border-slate-200/90 shadow-none sm:shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* LEFT COLUMN: CONVERSATION LIST (Strict 4/12 - 33.33% on lg screens, toggled on mobile) */}
        <div className={`lg:col-span-4 h-full flex flex-col overflow-hidden border-r border-slate-200 bg-cream/60 ${
          mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Search & Filter Header (Fixed) */}
          <div className="p-3.5 border-b border-slate-200/80 space-y-2.5 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <HugeiconsIcon icon={Search01Icon} size={15} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reader or book title..."
                className="w-full pl-9 pr-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  filter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All ({visibleConversations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('accepted')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  filter === 'accepted' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Active ({acceptedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('pending')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  filter === 'pending' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pending ({pendingCount})
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List (Independently scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                const isLocked = conv.status === 'pending';

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setMobileView('chat');
                    }}
                    className={`p-3.5 transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-brand/5 border-l-4 border-brand'
                        : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Participant Avatar */}
                    <div className="relative flex-shrink-0">
                      <SafeInboxAvatar
                        src={conv.participantAvatar}
                        name={conv.participantName}
                        className="w-11 h-11"
                      />
                      {isLocked ? (
                        <div
                          className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs"
                          title="Message request pending"
                        >
                          <HugeiconsIcon icon={LockIcon} size={10} />
                        </div>
                      ) : (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Metadata & Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-serif text-sm font-semibold text-slate-800 truncate">
                          {conv.participantName}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      {/* Book association chip */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                          📖 {conv.bookTitle}
                        </span>
                        {isLocked && (
                          <span className="text-[9px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex-shrink-0">
                            Pending
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 truncate leading-relaxed">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {/* Unread badge */}
                    {conv.unreadCount && conv.unreadCount > 0 && !isSelected && (
                      <span className="w-4 h-4 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center my-auto">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <HugeiconsIcon icon={BubbleChatIcon} size={22} />
                </div>
                <p className="font-serif text-sm font-semibold text-slate-700">No conversations found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                  {searchQuery ? 'Try clearing your search query.' : 'Borrow requests and active chats with lenders will appear here.'}
                </p>
              </div>
            )}

            {filteredConversations.length > 0 && (
              <div className="p-3 m-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                  <HugeiconsIcon icon={ShieldCheckIcon} size={14} className="text-amber-700" />
                  <span>Neighborhood Handover Protocol</span>
                </div>
                <p className="text-amber-800/90 text-[10px] leading-relaxed">
                  Direct chat opens once requests are accepted. Always meet in safe, well-lit public spots and inspect book condition together.
                </p>
              </div>
            )}
          </div>

          {/* Privacy & Trust Note at Bottom (Fixed) */}
          <div className="p-3 px-3.5 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 truncate">
              <HugeiconsIcon icon={ShieldCheckIcon} size={15} className="text-brand flex-shrink-0" />
              <span className="truncate font-medium">Private neighborhood chat</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-white px-2 py-0.5 rounded border border-slate-200 flex-shrink-0">
              Verified
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT / LOCKED STATE / EMPTY STATE (Strict 8/12 - 66.67% on lg screens, toggled on mobile) */}
        <div className={`lg:col-span-8 h-full flex flex-col overflow-hidden bg-white ${
          mobileView === 'list' ? 'hidden lg:flex' : 'flex'
        }`}>
          {!currentConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-cream/30">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4 shadow-xs">
                <HugeiconsIcon icon={BubbleChatIcon} size={32} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-slate-800">
                Your Messages & Handover Chats
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">
                Coordinate meetups and communicate securely once borrowing requests are accepted. Select a conversation from the left to start chatting.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header (Fixed) */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200/80 flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {/* Back to conversations button on mobile */}
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition flex items-center justify-center flex-shrink-0"
                    aria-label="Back to conversations list"
                    title="Back to conversations"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                  </button>
                  <SafeInboxAvatar
                    src={currentConv.participantAvatar}
                    name={currentConv.participantName}
                    className="w-10 h-10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-900">
                        {currentConv.participantName}
                      </h3>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                        {currentConv.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {currentConv.participantTrust}
                    </p>
                  </div>
                </div>

                {/* Book context badge */}
                <div className="hidden sm:flex items-center gap-2.5 p-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <img
                    src={currentConv.bookCover}
                    alt={currentConv.bookTitle}
                    className="w-7 h-10 object-cover rounded shadow-xs"
                  />
                  <div className="text-left text-xs">
                    <p className="font-serif font-semibold text-slate-800 truncate max-w-[170px]">
                      {currentConv.bookTitle}
                    </p>
                    <p className="text-[10px] text-slate-400">by {currentConv.bookAuthor}</p>
                  </div>
                </div>
              </div>

              {/* CHAT BODY (Always displays messages, enforcing 1-message request rules) */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Meetup Handover / Pending Request Banner (Fixed) */}
                {currentConv.meetupDetails && permission?.isUnlocked ? (
                  <div className="p-2.5 px-5 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold flex items-center gap-1.5">
                        <HugeiconsIcon icon={Tick01Icon} size={14} className="text-emerald-700" />
                        <span>Request Accepted</span>
                      </span>
                      <span className="hidden sm:inline text-emerald-400">•</span>
                      <span className="hidden sm:flex items-center gap-1 text-[11px]">
                        <HugeiconsIcon icon={Calendar01Icon} size={13} />
                        {currentConv.meetupDetails.date} @ {currentConv.meetupDetails.time}
                      </span>
                      <span className="hidden sm:inline text-emerald-400">•</span>
                      <span className="hidden md:flex items-center gap-1 text-[11px]">
                        <HugeiconsIcon icon={Location01Icon} size={13} />
                        {currentConv.meetupDetails.spot}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                      Active Handover
                    </span>
                  </div>
                ) : currentConv.status === 'pending' ? (
                  <div className="p-2.5 px-5 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between gap-3 text-xs text-amber-900 flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <HugeiconsIcon icon={LockIcon} size={14} className="text-amber-700 flex-shrink-0" />
                      <span className="truncate font-medium">
                        {permission?.isIncomingRequest
                          ? `Incoming message request from ${currentConv.participantName}`
                          : permission?.isAwaitingAcceptance
                          ? `1 of 1 message sent · Waiting for ${currentConv.participantName} to accept or reply`
                          : `Message request · You can send 1 intro message to ${currentConv.participantName}`}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded flex-shrink-0">
                      Pending
                    </span>
                  </div>
                ) : null}

                {/* Messages Scroll Area (Independently scrollable) */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                  {/* Conversation Beginning Card */}
                  <div className="my-2 p-3 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center space-y-1.5 max-w-sm mx-auto">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {currentConv.meetupDetails ? 'Handover Conversation' : 'Neighborhood Chat'}
                    </span>
                    <p className="font-serif text-sm font-semibold text-slate-800">
                      “{currentConv.bookTitle}”
                      {currentConv.bookAuthor && currentConv.bookAuthor !== 'Neighbor Inquiry'
                        ? ` by ${currentConv.bookAuthor}`
                        : ''}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {permission?.isUnlocked
                        ? `You and ${currentConv.participantName} are connected. Coordinate respectfully.`
                        : `Send 1 initial message to ${currentConv.participantName}. Two-way chat unlocks once they accept or reply.`}
                    </p>
                  </div>

                  {currentConv.messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <SafeInboxAvatar
                            src={msg.senderAvatar || currentConv.participantAvatar}
                            name={msg.senderName}
                            className="w-7 h-7 mb-1"
                            textClass="text-[10px]"
                          />
                        )}

                        <div
                          className={`max-w-[80%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 shadow-xs text-xs sm:text-sm leading-relaxed ${
                            isUser
                              ? 'bg-brand text-white rounded-br-none'
                              : 'bg-slate-100 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p
                            className={`text-[10px] mt-1 text-right ${
                              isUser ? 'text-white/70' : 'text-slate-400'
                            }`}
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Incoming Message Request Action Bar (Recipient can Accept, Decline, or Reply directly) */}
                {permission?.isIncomingRequest && (
                  <div className="px-4 py-2.5 border-t border-amber-200/80 bg-amber-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 flex-shrink-0">
                    <div className="text-xs text-amber-950">
                      <span className="font-semibold">{currentConv.participantName}</span> sent you a message request.{' '}
                      <span className="text-amber-800">Accept or reply below to unlock full chat.</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => declineMessageRequest(currentConv.id)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={13} />
                        <span>Decline</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => acceptMessageRequest(currentConv.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition"
                      >
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                        <span>Accept Chat</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Reply Suggestions (Only when unlocked) */}
                {permission?.isUnlocked && (
                  <div className="px-4 py-1.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto flex-shrink-0 bg-white">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 whitespace-nowrap">
                      Quick reply:
                    </span>
                    {quickReplies.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setInputMessage(r)}
                        className="text-[11px] bg-slate-100 hover:bg-brand/10 hover:text-brand px-2.5 py-1 rounded-full text-slate-600 whitespace-nowrap transition"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}

                {/* Bottom Composer / Locked Status Bar */}
                {!permission?.canSend ? (
                  <div className="p-3 sm:p-3.5 border-t border-slate-200 bg-slate-50 flex items-center gap-3 flex-shrink-0">
                    <div className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 flex items-center gap-2 select-none">
                      <HugeiconsIcon icon={LockIcon} size={15} className="text-amber-600 flex-shrink-0" />
                      <span className="truncate">
                        {permission?.isDeclined
                          ? 'This message request was declined.'
                          : `1 of 1 message sent · Locked until ${currentConv.participantName} accepts or replies.`}
                      </span>
                    </div>
                    <button
                      disabled
                      className="p-2.5 px-3.5 rounded-xl bg-slate-200 text-slate-400 cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 opacity-60"
                      title="Awaiting acceptance"
                    >
                      <HugeiconsIcon icon={SentIcon} size={16} />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="p-3 sm:p-3.5 border-t border-slate-200 flex flex-col gap-1.5 bg-white flex-shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={
                          permission.isFirstMessagePrompt
                            ? `Send 1 intro message to ${currentConv.participantName}...`
                            : `Message ${currentConv.participantName}... (Press Enter to send)`
                        }
                        className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand focus:bg-white transition"
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim()}
                        className="p-2.5 px-4 rounded-xl bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:hover:bg-brand text-white shadow-sm transition active:scale-95 flex items-center justify-center flex-shrink-0 gap-1.5 text-xs font-semibold"
                        aria-label="Send message"
                      >
                        <HugeiconsIcon icon={SentIcon} size={16} />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
                      <span>
                        {permission.isFirstMessagePrompt
                          ? `1-message limit applies until ${currentConv.participantName} accepts or replies`
                          : 'Always meet in safe public locations · Coordinate book care respectfully'}
                      </span>
                      <span className="hidden sm:inline">Press Enter ↵ to send</span>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
