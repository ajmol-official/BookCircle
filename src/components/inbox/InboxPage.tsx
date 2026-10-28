import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  SentIcon,
  LockIcon,
  ShieldCheckIcon,
  Clock01Icon,
  Calendar01Icon,
  Location01Icon,
  Tick01Icon,
  CheckmarkCircle02Icon,
  ArrowLeft01Icon,
  BubbleChatIcon
} from '@hugeicons/core-free-icons';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantTrust: string;
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

interface InboxPageProps {
  initialOwnerName?: string | null;
  onSelectBook?: (bookTitle: string) => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({ initialOwnerName }) => {
  const [conversations, setConversations] = useState<Conversation[]>([
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
      lastMessageTime: '10:14 AM',
      unreadCount: 1,
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
          time: '10:02 AM'
        },
        {
          id: 'm-4',
          sender: 'user',
          senderName: 'You',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          text: 'Perfect! I will see you there around 10. Thanks again!',
          time: '10:14 AM'
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
      lastMessage: 'Saturday at Elm Park Library works perfectly for me!',
      lastMessageTime: 'Yesterday',
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
          text: 'Hi Hana! I just finished the final chapter yesterday. I have scheduled a return meetup for Saturday at Elm Park Library.',
          time: 'Yesterday'
        },
        {
          id: 'm-203',
          sender: 'other',
          senderName: 'Hana Yamada',
          senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
          text: 'Saturday at Elm Park Library works perfectly for me! See you at 11:30 AM.',
          time: 'Yesterday'
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
      status: 'pending', // Pending acceptance rule: locked!
      lastMessage: 'Borrow request sent · Awaiting Jonas Meier acceptance',
      lastMessageTime: 'Yesterday',
      initialNote: 'Hi Jonas! I would love to borrow The Night Circus. I take great care of books and will return it on time.',
      meetupDetails: {
        date: 'Sat 26 Apr',
        time: '2:00 PM',
        spot: 'Elm Park Library entrance'
      },
      messages: []
    }
  ]);

  // Active selected conversation
  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    if (initialOwnerName) {
      const match = conversations.find(
        (c) => c.participantName.toLowerCase() === initialOwnerName.toLowerCase()
      );
      if (match) return match.id;
    }
    return conversations[0].id;
  });

  const [mobileView, setMobileView] = useState<'list' | 'chat'>(initialOwnerName ? 'chat' : 'list');
  const [filter, setFilter] = useState<'all' | 'accepted' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  const acceptedCount = conversations.filter((c) => c.status === 'accepted').length;
  const pendingCount = conversations.filter((c) => c.status === 'pending').length;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
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
  }, [selectedConvId, currentConv.messages.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || currentConv.status !== 'accepted') return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: 'You',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      text: inputMessage.trim(),
      time: 'Just now'
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === currentConv.id) {
          return {
            ...c,
            lastMessage: newMsg.text,
            lastMessageTime: 'Just now',
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );

    setInputMessage('');
  };

  // Demo simulator to allow user to simulate Jonas accepting the request
  const handleSimulateAcceptance = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            status: 'accepted',
            lastMessage: 'Hi Maya! I have accepted your borrowing request! Looking forward to meeting.',
            lastMessageTime: 'Just now',
            messages: [
              {
                id: `msg-accept-${Date.now()}`,
                sender: 'other',
                senderName: c.participantName,
                senderAvatar: c.participantAvatar,
                text: `Hi Maya! I have accepted your borrowing request for “${c.bookTitle}”. Elm Park Library on Saturday at 2:00 PM works great!`,
                time: 'Just now'
              }
            ]
          };
        }
        return c;
      })
    );
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
                All ({conversations.length})
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
                      <img
                        src={conv.participantAvatar}
                        alt={conv.participantName}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      {isLocked ? (
                        <div
                          className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs"
                          title="Messaging locked pending acceptance"
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

        {/* RIGHT COLUMN: ACTIVE CHAT / LOCKED STATE (Strict 8/12 - 66.67% on lg screens, toggled on mobile) */}
        <div className={`lg:col-span-8 h-full flex flex-col overflow-hidden bg-white ${
          mobileView === 'list' ? 'hidden lg:flex' : 'flex'
        }`}>
          
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
              <img
                src={currentConv.participantAvatar}
                alt={currentConv.participantName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
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

          {/* CHAT BODY */}
          {currentConv.status === 'pending' ? (
            /* LOCKED STATE (Fixed scrollable container + docked bar) */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-cream/40">
              <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3.5 ring-8 ring-amber-50 shadow-xs">
                  <HugeiconsIcon icon={LockIcon} size={24} />
                </div>

              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
                Messaging is Locked
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md leading-relaxed">
                You cannot message <strong className="text-slate-700 font-semibold">{currentConv.participantName}</strong> until they accept your borrowing request for <span className="font-medium text-slate-800">“{currentConv.bookTitle}”</span>.
              </p>

              {/* Request Status Card */}
              <div className="mt-5 w-full max-w-md p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <HugeiconsIcon icon={Clock01Icon} size={15} className="text-amber-600" />
                    <span>Request Status</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Awaiting Lender Approval
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <p>
                    <span className="text-slate-400">Book:</span> <strong className="text-slate-800">{currentConv.bookTitle}</strong>
                  </p>
                  {currentConv.meetupDetails && (
                    <p>
                      <span className="text-slate-400">Proposed Meetup:</span> {currentConv.meetupDetails.date} @ {currentConv.meetupDetails.time} at {currentConv.meetupDetails.spot}
                    </p>
                  )}
                  {currentConv.initialNote && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <span className="text-slate-400 text-[11px]">Your request note:</span>
                      <p className="italic text-slate-600 mt-0.5">“{currentConv.initialNote}”</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Policy explanation */}
              <div className="mt-4 max-w-md flex items-center gap-2 text-[11px] text-slate-400">
                <HugeiconsIcon icon={ShieldCheckIcon} size={15} className="text-brand flex-shrink-0" />
                <span>BookCircle safeguards member privacy by unlocking direct chat only upon mutual agreement.</span>
              </div>

              {/* Demo button to simulate acceptance */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => handleSimulateAcceptance(currentConv.id)}
                  className="px-4 py-2.5 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-semibold flex items-center gap-2 transition"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                  <span>Simulate {currentConv.participantName} Accepting Request</span>
                </button>
              </div>
            </div>

            {/* Docked Disabled Composer Bar at Bottom for locked conversation */}
            <div className="p-3 sm:p-3.5 border-t border-slate-200 bg-slate-50 flex items-center gap-3 flex-shrink-0">
              <div className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 flex items-center gap-2 select-none">
                <HugeiconsIcon icon={LockIcon} size={15} className="text-amber-600 flex-shrink-0" />
                <span className="truncate">
                  Direct messaging is locked until {currentConv.participantName} accepts your borrowing request.
                </span>
              </div>
              <button
                disabled
                className="p-2.5 px-3.5 rounded-xl bg-slate-200 text-slate-400 cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 opacity-60"
                title="Direct messaging locked"
              >
                <HugeiconsIcon icon={SentIcon} size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
          ) : (
            /* UNLOCKED ACTIVE CHAT AREA (Fixed structure, independently scrollable messages) */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              
              {/* Meetup Handover Info Banner (Fixed) */}
              {currentConv.meetupDetails && (
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
              )}

              {/* Messages Scroll Area (Independently scrollable) */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                
                {/* Conversation Beginning Card */}
                <div className="my-2 p-3 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center space-y-1.5 max-w-sm mx-auto">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Handover Conversation
                  </span>
                  <p className="font-serif text-sm font-semibold text-slate-800">
                    “{currentConv.bookTitle}” by {currentConv.bookAuthor}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    You and {currentConv.participantName} are connected. Coordinate meeting time and location safely.
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
                        <img
                          src={msg.senderAvatar}
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
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

              {/* Quick Reply Suggestions (Fixed) */}
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

              {/* Message Input Form (Fixed at bottom) */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-3.5 border-t border-slate-200 flex flex-col gap-1.5 bg-white flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Message ${currentConv.participantName}... (Press Enter to send)`}
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
                  <span>Always meet in safe public locations · Coordinate book care respectfully</span>
                  <span className="hidden sm:inline">Press Enter ↵ to send</span>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
