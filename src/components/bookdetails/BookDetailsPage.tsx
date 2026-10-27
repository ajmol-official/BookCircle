import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft01Icon,
  StarIcon,
  Location01Icon,
  ArrowRight01Icon,
  BookOpen01Icon
} from '@hugeicons/core-free-icons';
import type { Book } from '../../types';
import { ReviewModal } from './ReviewModal';

interface BookDetailsPageProps {
  book: Book;
  onBack: () => void;
  onRequestBorrow: (book: Book, ownerName?: string) => void;
}

export const BookDetailsPage: React.FC<BookDetailsPageProps> = ({
  book,
  onBack,
  onRequestBorrow
}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState([
    {
      id: 'rev-1',
      author: 'Hana Yamada',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      rating: 5,
      date: '2 weeks ago',
      text: 'Tender and sprawling. I underlined whole paragraphs and passed it to my mother the moment I finished.'
    },
    {
      id: 'rev-2',
      author: 'Oliver West',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      rating: 5,
      date: '1 month ago',
      text: 'A patient book that rewards patient reading. The middle section dragged for me but the last hundred pages hit hard.'
    },
    {
      id: 'rev-3',
      author: 'Fatima Noor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      rating: 5,
      date: '2 months ago',
      text: 'History as tenderness. I don’t think I’ll forget Sunja for a long time.'
    }
  ]);

  const nearbyOwners = book.title.toLowerCase().includes('god of small things')
    ? [
        {
          id: 'owner-arif',
          name: 'Arif Ahmed',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
          distance: '1.2 km',
          memberSince: '2023',
          status: 'Available now (Like New)',
          isAvailable: true
        },
        {
          id: 'owner-rahim',
          name: 'Rahim Chowdhury',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
          distance: '0.6 km',
          memberSince: '2024',
          status: 'Available now (Very Good)',
          isAvailable: true
        }
      ]
    : [
        {
          id: 'owner-1',
          name: 'Aisha Patel',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          distance: '0.4 km',
          memberSince: '2023',
          status: 'Available now',
          isAvailable: true
        },
        {
          id: 'owner-2',
          name: 'Liam Becker',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
          distance: '1.2 km',
          memberSince: '2024',
          status: 'Borrowed out',
          isAvailable: false
        },
        {
          id: 'owner-3',
          name: 'Maya Fischer',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
          distance: '2.1 km',
          memberSince: '2022',
          status: 'Available now',
          isAvailable: true
        },
        {
          id: 'owner-4',
          name: 'Ethan Vogel',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
          distance: '3.4 km',
          memberSince: '2024',
          status: 'Available now',
          isAvailable: true
        }
      ];

  const handleNewReview = (newRev: { author: string; rating: number; text: string }) => {
    setReviews(prev => [
      {
        id: `rev-${Date.now()}`,
        author: newRev.author,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        rating: newRev.rating,
        date: 'Just now',
        text: newRev.text
      },
      ...prev
    ]);
  };

  return (
    <div className="pt-6 pb-20 animate-in fade-in duration-200">
      
      {/* Back to Home Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand transition mb-6"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={18}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span>Back to home</span>
      </button>

      {/* Main Book Card Hero matching Figma layout_87873766 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card flex flex-col md:flex-row gap-8 items-start">
        {/* Book Cover */}
        <div className="relative w-full md:w-44 h-64 sm:h-64 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-md">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white flex items-center gap-1 shadow-sm">
            <HugeiconsIcon icon={Location01Icon} size={12} className="text-amber-badge" />
            <span className="text-[11px] font-medium">{book.distance}</span>
          </div>
        </div>

        {/* Book Metadata */}
        <div className="flex-1 flex flex-col justify-between h-full space-y-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                Available now
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-brand/10 text-brand">
                {book.category}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              {book.title}
            </h1>
            <p className="text-base text-slate-500 font-medium mt-1">
              by <span className="text-slate-700 font-semibold">{book.author}</span>
            </p>
          </div>

          {/* Ratings row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <HugeiconsIcon
                  key={i}
                  icon={StarIcon}
                  size={18}
                  className={i < Math.floor(book.rating) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}
                />
              ))}
            </div>
            <span className="font-serif font-bold text-lg text-slate-800">
              {book.rating}
            </span>
            <span className="text-sm text-slate-400">
              124 community reviews
            </span>
          </div>

          {/* Stats Bar row matching Figma */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <HugeiconsIcon icon={Location01Icon} size={16} className="text-brand" />
              <span><strong>3</strong> in your area</span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <strong className="text-slate-800">1,254</strong> in country
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <strong className="text-slate-800">143</strong> reviews
            </div>
          </div>
        </div>
      </div>

      {/* About this book section */}
      <div className="mt-10 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
        <h2 className="font-serif text-2xl font-semibold text-slate-800 mb-3">
          About this book
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
          {book.description || 'A sweeping saga of a Korean family across four generations, exploring identity, displacement, and resilience from colonial Busan to post-war Osaka. Rich in historical texture and emotional depth, it captures the everyday triumphs and burdens of exile and survival.'}
        </p>
      </div>

      {/* Available from nearby readers section */}
      <div className="mt-10">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-semibold text-slate-800">
            Available from nearby readers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            3 owners within 5 km ready for pickup or exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {nearbyOwners.map((owner) => (
            <div
              key={owner.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex flex-col justify-between group hover:shadow-card-hover transition-all"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <img
                    src={owner.avatar}
                    alt={owner.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-brand/30 transition-all"
                  />
                  <div>
                    <h4 className="font-serif text-base font-semibold text-slate-800">
                      {owner.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {owner.distance} · Member {owner.memberSince}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  {owner.isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{owner.status}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-400">
                      <span>{owner.status}</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                disabled={!owner.isAvailable}
                onClick={() => onRequestBorrow(book, owner.name)}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95 ${
                  owner.isAvailable
                    ? 'bg-brand hover:bg-brand-dark text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {owner.isAvailable ? 'Request' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Community Reviews section */}
      <div className="mt-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-slate-800">
              Community reviews
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {reviews.length} readers have shared their thoughts
            </p>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark px-3 py-1.5 rounded-lg hover:bg-brand/5 transition"
          >
            <span>Write a review</span>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-slate-800">{rev.author}</h4>
                      <p className="text-[11px] text-slate-400">{rev.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <HugeiconsIcon
                        key={i}
                        icon={StarIcon}
                        size={14}
                        className="fill-amber-400 text-amber-500"
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  “{rev.text}”
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share your experience Dotted Card matching Figma */}
      <div 
        onClick={() => setIsReviewModalOpen(true)}
        className="mt-8 p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand bg-white/70 hover:bg-white text-center cursor-pointer transition-all duration-200 group"
      >
        <div className="w-12 h-12 rounded-full bg-brand/10 text-brand mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <HugeiconsIcon icon={BookOpen01Icon} size={22} />
        </div>
        <h3 className="font-serif text-lg font-semibold text-brand">
          Share your experience
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Anyone can review — you don’t need to have borrowed this copy.
        </p>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        bookTitle={book.title}
        onReviewSubmitted={handleNewReview}
      />

    </div>
  );
};
