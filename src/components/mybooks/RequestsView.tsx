import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { getUpcomingHandoverDates } from '../../utils/dateUtils';
import {
  Calendar01Icon,
  Clock01Icon,
  Location01Icon,
  Tick01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons';

export const RequestsView: React.FC = () => {
  const [activeRequest, setActiveRequest] = useState<{
    id: string;
    borrower: string;
    avatar: string;
    distance: string;
    memberSince: string;
    trust: string;
    borrowsCount: number;
    book: string;
    author: string;
    cover: string;
    proposedDate: string;
    proposedTime: string;
    meetupSpot: string;
    returnBy: string;
    note: string;
  } | null>(() => {
    const dates = getUpcomingHandoverDates();
    return {
      id: 'req-1',
      borrower: 'Hana Yamada',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      distance: '0.6 km',
      memberSince: '2024',
      trust: 'Fair',
      borrowsCount: 23,
      book: 'Pachinko',
      author: 'Min Jin Lee',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200',
      proposedDate: `${dates[2]?.val || 'Upcoming Saturday'}`,
      proposedTime: '11:00 AM',
      meetupSpot: 'Riverside Coffee, Rampura',
      returnBy: '30 days after collection',
      note: '“Hi! - I’ve been wanting to read Pachinko for months. I just finished Kim Jiyoung, and I think I’m ready for this one. I’d take great care of it and return it on time.”'
    };
  });

  const [decisionNotice, setDecisionNotice] = useState<string | null>(null);

  const pastRequests = [
    {
      id: 'past-1',
      borrower: 'Jonas Meier',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      book: 'The Overstory',
      date: '3 days ago',
      status: 'Approved'
    },
    {
      id: 'past-2',
      borrower: 'Amira Khan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      book: 'The Godfather',
      date: 'Last week',
      status: 'Declined'
    },
    {
      id: 'past-3',
      borrower: 'Diego Ramirez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      book: 'Stoner',
      date: '2 weeks ago',
      status: 'Approved'
    }
  ];

  const handleAction = (type: 'approved' | 'declined' | 'reschedule') => {
    if (type === 'approved') {
      setDecisionNotice('Request approved! Meetup details confirmed with Hana.');
    } else if (type === 'declined') {
      setDecisionNotice('Request declined.');
    } else {
      setDecisionNotice('Reschedule message prompt sent to Hana.');
    }
    setActiveRequest(null);
  };

  return (
    <div className="space-y-10 pb-16">
      
      {/* Title */}
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
          Borrow Requests
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          People who’d like to borrow books from your shelf.
        </p>
      </div>

      {decisionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-600" />
            <span>{decisionNotice}</span>
          </div>
          <button onClick={() => setDecisionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
      )}

      {/* Inbound Request Card matching Figma */}
      {activeRequest ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
              <span className="text-xs font-semibold text-brand uppercase tracking-wider">
                New Request · 3 hours ago
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Pending response</span>
          </div>

          <div className="mt-6 flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Borrower Profile Column */}
            <div className="flex-1 w-full space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={activeRequest.avatar}
                  alt={activeRequest.borrower}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-slate-800">
                    {activeRequest.borrower}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeRequest.distance} · member since {activeRequest.memberSince}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                      Trust: {activeRequest.trust}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {activeRequest.borrowsCount} Successful borrows
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Note */}
              <div className="p-4 rounded-2xl bg-cream border border-slate-200/70 text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                {activeRequest.note}
              </div>

              {/* Meetup Proposed Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                    <HugeiconsIcon icon={Calendar01Icon} size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Proposed Date</p>
                    <p className="text-sm font-semibold text-slate-800">{activeRequest.proposedDate}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <HugeiconsIcon icon={Clock01Icon} size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Proposed Time</p>
                    <p className="text-sm font-semibold text-slate-800">{activeRequest.proposedTime}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <HugeiconsIcon icon={Location01Icon} size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Meetup Spot</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{activeRequest.meetupSpot}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Return By</p>
                    <p className="text-sm font-semibold text-slate-800">{activeRequest.returnBy}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleAction('approved')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand hover:bg-brand-dark active:scale-[0.98] text-white text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2"
                >
                  <HugeiconsIcon icon={Tick01Icon} size={18} />
                  <span>Approve Request</span>
                </button>

                <button
                  onClick={() => handleAction('declined')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 text-sm font-semibold transition"
                >
                  Decline Request
                </button>

                <button
                  onClick={() => handleAction('reschedule')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl text-brand hover:bg-brand/5 text-sm font-semibold transition ml-auto"
                >
                  Suggest a different time
                </button>
              </div>

            </div>

            {/* Book Preview Side Column */}
            <div className="w-full lg:w-64 flex-shrink-0 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-center">
              <img
                src={activeRequest.cover}
                alt={activeRequest.book}
                className="w-28 h-40 object-cover rounded-xl shadow-md mx-auto mb-3"
              />
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Requested Book</p>
              <h4 className="font-serif text-base font-semibold text-slate-800 mt-1">{activeRequest.book}</h4>
              <p className="text-xs text-slate-500">{activeRequest.author}</p>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center text-slate-400 text-xs sm:text-sm">
          No new incoming requests right now. All caught up!
        </div>
      )}

      {/* Earlier Requests */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-slate-800 mb-3">
          Earlier Requests
        </h3>

        <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {pastRequests.map((req) => (
            <div key={req.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={req.avatar}
                  alt={req.borrower}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {req.borrower} <span className="text-slate-400 font-normal">wanted to borrow</span> “{req.book}”
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{req.date}</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
