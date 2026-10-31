import React, { useState, useRef, useEffect } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Location01Icon,
  ArrowDown01Icon,
  Cancel01Icon
} from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';

interface HeaderSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRadius: string;
  setSelectedRadius: (radius: string) => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  searchQuery,
  setSearchQuery,
  selectedRadius,
  setSelectedRadius
}) => {
  const { currentUser } = useAuth();
  const [isRadiusOpen, setIsRadiusOpen] = useState(false);
  const radiusDropdownRef = useRef<HTMLDivElement>(null);
  const radiusOptions = ['Within 2km', 'Within 5km', 'Within 10km', 'Within 25km'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (radiusDropdownRef.current && !radiusDropdownRef.current.contains(e.target as Node)) {
        setIsRadiusOpen(false);
      }
    };
    if (isRadiusOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isRadiusOpen]);

  // Determine greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <section className="pt-8 pb-6">
      <div className="flex flex-col gap-6">
        
        {/* Dynamic Welcome Header */}
        <div>
          {currentUser ? (
            <>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">
                {getGreeting()}, {currentUser.displayName}
              </h1>
              <p className="mt-1 text-sm text-slate-500 font-normal">
                {currentUser.location ? `44 books available near ${currentUser.location}` : '44 new books listed near you this week.'}
              </p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">
                Explore Local Books
              </h1>
              <p className="mt-1 text-sm text-slate-500 font-normal">
                Discover, borrow, and share books with neighbors in your community.
              </p>
            </>
          )}
        </div>

        {/* Search Bar & Radius Chip Bar */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3 w-full bg-white border border-slate-200/90 rounded-xl p-2 sm:p-2.5 shadow-sm hover:border-slate-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all duration-200">
          
          {/* Search Input */}
          <div className="flex items-center gap-3 flex-1 w-full px-2">
            <HugeiconsIcon icon={Search01Icon} size={20} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books, authors, or readers"
              className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 transition"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            )}
          </div>

          {/* Location Radius Selector Dropdown */}
          <div ref={radiusDropdownRef} className="relative self-end sm:self-auto w-full sm:w-auto">
            <button
              onClick={() => setIsRadiusOpen(!isRadiusOpen)}
              className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto px-3 py-2 rounded-lg bg-brand/10 hover:bg-brand/15 text-brand text-sm font-medium transition-colors"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Location01Icon} size={18} className="text-brand" />
                <span>{selectedRadius}</span>
              </div>
              <HugeiconsIcon 
                icon={ArrowDown01Icon} 
                size={16} 
                className={`text-brand transition-transform duration-200 ${isRadiusOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isRadiusOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                {radiusOptions.map((radius) => (
                  <button
                    key={radius}
                    onClick={() => {
                      setSelectedRadius(radius);
                      setIsRadiusOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-slate-50 transition-colors flex items-center justify-between ${
                      selectedRadius === radius ? 'font-semibold text-brand bg-brand/5' : 'text-slate-700'
                    }`}
                  >
                    <span>{radius}</span>
                    {selectedRadius === radius && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
