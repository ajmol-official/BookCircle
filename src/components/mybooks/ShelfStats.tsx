import React from 'react';

interface ShelfStatsProps {
  listedCount?: number;
  lentOutCount?: number;
  forLendingCount?: number;
  forDonationCount?: number;
}

export const ShelfStats: React.FC<ShelfStatsProps> = ({
  listedCount = 18,
  lentOutCount = 6,
  forLendingCount = 4,
  forDonationCount = 3
}) => {
  const stats = [
    { label: 'Books Listed', value: listedCount, highlight: 'text-slate-800' },
    { label: 'Lent Out', value: lentOutCount, highlight: 'text-brand' },
    { label: 'For Lending', value: forLendingCount, highlight: 'text-emerald-700' },
    { label: 'For Donation', value: forDonationCount, highlight: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-6 border-y border-slate-200/80 my-6">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col">
          <span className={`font-serif text-3xl sm:text-4xl font-bold tracking-tight ${stat.highlight}`}>
            {stat.value}
          </span>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
};
