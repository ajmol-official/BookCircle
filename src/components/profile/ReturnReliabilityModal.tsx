import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  ShieldCheckIcon,
  Clock01Icon,
  Tick01Icon,
  BubbleChatIcon,
  StarIcon
} from '@hugeicons/core-free-icons';

interface ReturnReliabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier?: number;
  userName?: string;
  onTimeCount?: number;
  totalReturns?: number;
}

export const ReturnReliabilityModal: React.FC<ReturnReliabilityModalProps> = ({
  isOpen,
  onClose,
  userTier = 5,
  userName = 'Maya Lin',
  onTimeCount = 32,
  totalReturns = 32
}) => {
  if (!isOpen) return null;

  const tiers = [
    {
      tier: 1,
      name: 'Novice Reader',
      badgeColor: 'bg-slate-100 text-slate-600 border-slate-300',
      dotColor: 'bg-slate-400',
      returnsRange: '0 – 2 completed returns',
      punctualityReq: 'Community onboarding baseline',
      communicationReq: 'Standard meetup coordination',
      perk: 'Borrow up to 2 books simultaneously'
    },
    {
      tier: 2,
      name: 'Reliable Borrower',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      dotColor: 'bg-blue-500',
      returnsRange: '3 – 9 completed returns',
      punctualityReq: '≥ 85% returned on or before due date',
      communicationReq: 'Confirms meetup spots within 24 hours',
      perk: 'Borrow up to 3 books simultaneously'
    },
    {
      tier: 3,
      name: 'Punctual Neighbor',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      dotColor: 'bg-amber-500',
      returnsRange: '10 – 19 completed returns',
      punctualityReq: '≥ 90% returned on or before due date',
      communicationReq: 'Proactive renewal notices & prompt scheduling',
      perk: 'Fast-track borrower approval badge'
    },
    {
      tier: 4,
      name: 'Trusted Steward',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotColor: 'bg-emerald-600',
      returnsRange: '20 – 29 completed returns',
      punctualityReq: '≥ 95% on-time record, pristine book care',
      communicationReq: 'Average response time < 6 hours',
      perk: 'Priority request queue for popular titles'
    },
    {
      tier: 5,
      name: 'Exemplary Patron',
      badgeColor: 'bg-brand/10 text-brand border-brand/30',
      dotColor: 'bg-brand',
      returnsRange: '30+ completed returns',
      punctualityReq: '100% on-time return rate (32/32 on schedule)',
      communicationReq: 'Immediate handover confirmation & high trust',
      perk: 'Verified Trust Shield & unlimited simultaneous borrows'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close modal"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-6 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
            <HugeiconsIcon icon={ShieldCheckIcon} size={26} />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-semibold text-slate-800">
              Return Reliability System
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              A 5-level community trust framework reflecting return punctuality and responsible communication.
            </p>
          </div>
        </div>

        {/* Current User Standing Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <HugeiconsIcon icon={StarIcon} size={20} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-emerald-950">
                  {userName} — Tier {userTier} Exemplary Patron
                </span>
                <span className="text-[10px] uppercase font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  Top 2%
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                {onTimeCount}/{totalReturns} returns on schedule (100% punctuality rate) · Avg response &lt; 2 hrs
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right flex-shrink-0">
            <span className="text-xs font-semibold text-emerald-900 block">Verified Status</span>
            <span className="text-[11px] text-emerald-700">Protected by Community Guarantee</span>
          </div>
        </div>

        {/* The 5 Tiers List */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            The 5 Reliability Levels
          </h4>

          {tiers.map((t) => {
            const isUserTier = t.tier === userTier;
            return (
              <div
                key={t.tier}
                className={`p-4 rounded-2xl border transition-all ${
                  isUserTier
                    ? 'bg-brand/5 border-brand ring-2 ring-brand/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${t.dotColor} flex-shrink-0 shadow-xs`} />
                    <span className="font-serif text-base font-semibold text-slate-900">
                      Tier {t.tier}: {t.name}
                    </span>
                    {isUserTier && (
                      <span className="text-[10px] font-bold bg-brand text-white px-2 py-0.5 rounded-full">
                        Your Current Tier
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {t.returnsRange}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Clock01Icon} size={14} className="text-slate-400 flex-shrink-0" />
                    <span><strong className="text-slate-700">Punctuality:</strong> {t.punctualityReq}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={BubbleChatIcon} size={14} className="text-slate-400 flex-shrink-0" />
                    <span><strong className="text-slate-700">Comms:</strong> {t.communicationReq}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-brand font-medium">
                  <HugeiconsIcon icon={Tick01Icon} size={13} className="flex-shrink-0" />
                  <span>Benefit: {t.perk}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between gap-4">
          <p>
            Reliability scores update automatically upon mutual handover confirmation at designated meeting spots.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-xs transition active:scale-95 flex-shrink-0"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
