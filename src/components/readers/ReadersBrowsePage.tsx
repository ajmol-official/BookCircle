import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  Search01Icon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@hugeicons/core-free-icons';
import type { Reader } from '../../types';
import { ReaderCard } from '../ReaderCard';

interface ReadersBrowsePageProps {
  readers: Reader[];
  onBrowseShelf: (reader: Reader) => void;
  onBack: () => void;
}

export const ReadersBrowsePage: React.FC<ReadersBrowsePageProps> = ({
  readers,
  onBrowseShelf,
  onBack
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'nearby'>('all');

  const filteredReaders = readers.filter((reader) => {
    const readerLocation = reader.location || '';
    const readerBio = reader.bio || '';
    const matchesSearch =
      reader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      readerLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      readerBio.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'verified') {
      return reader.verified || (reader.trustTier && reader.trustTier.toLowerCase().includes('tier 5'));
    }
    if (selectedFilter === 'nearby') {
      const distanceNum = parseFloat(reader.distance);
      return !isNaN(distanceNum) && distanceNum <= 1.0;
    }

    return true;
  });

  return (
    <div className="pt-6 pb-20 animate-in fade-in duration-200">
      {/* Top Back Navigation */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand transition mb-6"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span>Back to Discover</span>
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold tracking-wide">
              <HugeiconsIcon icon={UserGroupIcon} size={14} />
              <span>Neighborhood Directory</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">
              Community Readers
            </h1>
            <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
              Discover neighbors who have opened their home libraries for lending and donating. Browse their personal shelves, check trust badges, and borrow directly.
            </p>
          </div>

          {/* Quick Community Stats */}
          <div className="flex items-center gap-4 sm:gap-6 bg-cream rounded-2xl p-4 border border-slate-200/80 self-start md:self-auto">
            <div className="text-center">
              <p className="font-serif text-2xl font-bold text-slate-900">{readers.length}</p>
              <p className="text-[11px] text-slate-500 font-medium">Local Readers</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-300/80" />
            <div className="text-center">
              <p className="font-serif text-2xl font-bold text-brand">
                {readers.reduce((acc, r) => acc + (r.booksAvailable || 0), 0)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Books on Shelves</p>
            </div>
            <div className="w-[1px] h-8 bg-slate-300/80" />
            <div className="text-center">
              <p className="font-serif text-2xl font-bold text-emerald-600">100%</p>
              <p className="text-[11px] text-slate-500 font-medium">Safe Handovers</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by reader name, neighborhood, or favorite genre..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Readers ({readers.length})
            </button>
            <button
              onClick={() => setSelectedFilter('verified')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                selectedFilter === 'verified'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <HugeiconsIcon icon={ShieldCheckIcon} size={14} />
              <span>Verified Only</span>
            </button>
            <button
              onClick={() => setSelectedFilter('nearby')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                selectedFilter === 'nearby'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Within 1 km
            </button>
          </div>
        </div>
      </div>

      {/* Readers Grid */}
      {filteredReaders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <HugeiconsIcon icon={UserGroupIcon} size={24} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-slate-800">No readers found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Try adjusting your search keywords or clearing filters to see more neighbors.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredReaders.map((reader) => (
            <ReaderCard
              key={reader.id}
              reader={reader}
              onBrowseShelf={onBrowseShelf}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadersBrowsePage;
