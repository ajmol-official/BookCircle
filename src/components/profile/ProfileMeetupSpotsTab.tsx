import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Location01Icon,
  ShieldCheckIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import type { HandoverLocation } from '../../types';

export interface ProfileMeetupSpotsTabProps {
  handoverSpots: HandoverLocation[];
  isOwnProfile?: boolean;
  readerName?: string;
}

export const ProfileMeetupSpotsTab: React.FC<ProfileMeetupSpotsTabProps> = ({
  handoverSpots,
  isOwnProfile = false,
  readerName = 'Reader',
}) => {
  const navigate = useNavigate();
  const firstName = readerName.split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-slate-800">
              {isOwnProfile ? 'Your Preferred Handover Spots' : `${firstName}’s Preferred Handover Spots`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isOwnProfile
                ? 'Public, safe spots in your neighborhood where you prefer to meet neighbors for book exchanges.'
                : `Verified, public places where ${firstName} prefers to coordinate physical book handovers.`}
            </p>
          </div>

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition shadow-xs active:scale-95 self-start sm:self-auto cursor-pointer"
            >
              <span>Manage in Settings</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
          )}
        </div>

        {/* Spots Grid */}
        {handoverSpots && handoverSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {handoverSpots.map((spot, i) => (
              <div
                key={spot.id || i}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-brand/30 hover:bg-white transition-all shadow-2xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HugeiconsIcon icon={Location01Icon} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-base sm:text-lg font-semibold text-slate-800">
                        {spot.name}
                      </h3>
                      {spot.instructions ? (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {spot.instructions}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1 italic">
                          Standard neighborhood public meetup spot
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600" />
                    <span>Public & Safe Location</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <HugeiconsIcon icon={Clock01Icon} size={13} />
                    <span>Flexible times</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand mx-auto flex items-center justify-center">
              <HugeiconsIcon icon={Location01Icon} size={24} />
            </div>
            <h4 className="font-serif text-base font-semibold text-slate-800">
              No specific handover spots listed yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {isOwnProfile
                ? 'Add up to 2 favorite coffee shops, local libraries, or station exits to make neighborhood handovers swift and effortless.'
                : `${firstName} hasn't listed specific spots yet. You can suggest a convenient public cafe or station when submitting a borrow request.`}
            </p>
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition shadow-xs active:scale-95 cursor-pointer mt-2"
              >
                <span>Add Handover Spots</span>
              </button>
            )}
          </div>
        )}

        {/* Safety & Community Handover Guidelines Card */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#FDF8F2] border border-amber-200/60 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <HugeiconsIcon icon={ShieldCheckIcon} size={18} />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800 block mb-0.5">
              BookCircle Neighborhood Handover Standard
            </span>
            All community handovers are conducted in safe, daylight, public spaces — such as local coffee shops, public libraries, or town squares. Always confirm meeting timing via the in-app chat.
          </div>
        </div>
      </div>
    </div>
  );
};
