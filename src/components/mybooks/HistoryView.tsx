import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  StarIcon
} from '@hugeicons/core-free-icons';

export const HistoryView: React.FC = () => {
  const historyItems = [
    {
      id: 'hist-1',
      book: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
      partner: 'Priya Shah',
      partnerRole: 'Borrower',
      date: 'Returned Mar 28, 2026',
      duration: '26 days',
      ratingGiven: 5,
      type: 'Lent Out'
    },
    {
      id: 'hist-2',
      book: 'Drive: The Surprising Truth',
      author: 'Daniel H. Pink',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=200',
      partner: 'Diego Ramirez',
      partnerRole: 'Lender',
      date: 'Returned Feb 14, 2026',
      duration: '30 days',
      ratingGiven: 5,
      type: 'Borrowed'
    },
    {
      id: 'hist-3',
      book: 'Atomic Habits',
      author: 'James Clear',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200',
      partner: 'Amira Khan',
      partnerRole: 'Borrower',
      date: 'Returned Jan 20, 2026',
      duration: '28 days',
      ratingGiven: 4.8,
      type: 'Lent Out'
    }
  ];

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
          Past Exchanges
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Record of all your completed loans, borrows, and community ratings.
        </p>
      </div>

      <div className="space-y-3">
        {historyItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.cover}
                alt={item.book}
                className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.type === 'Lent Out' ? 'bg-brand/10 text-brand' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-400">· {item.duration}</span>
                </div>

                <h4 className="font-serif text-base font-semibold text-slate-800 mt-1">
                  {item.book}
                </h4>
                <p className="text-xs text-slate-500">
                  With {item.partner} ({item.partnerRole})
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                <span>{item.date}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    size={13}
                    className="fill-amber-400 text-amber-500"
                  />
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
