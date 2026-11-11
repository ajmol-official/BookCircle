import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  ShieldCheckIcon,
  Globe02Icon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useWriter } from '../../context/WriterContext';
import { useAuth } from '../../context/AuthContext';
import type { WriterApplication } from '../../types/writer';

interface AdminWriterReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminWriterReviewModal: React.FC<AdminWriterReviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const {
    applications,
    workSuggestions,
    approveApplication,
    rejectApplication,
    requestChangesApplication,
    approveWorkSuggestion,
  } = useWriter();

  useBodyScrollLock(isOpen);

  // Authorization Check: Predefined admin configuration for controlled access
  const isAuthorizedAdmin = Boolean(
    currentUser?.isAdmin ||
    currentUser?.email?.toLowerCase().includes('admin') ||
    localStorage.getItem('bookcircle_admin_override') === 'true'
  );

  // Active Tab: 'pending' | 'work_suggestions' | 'reviewed'
  const [activeTab, setActiveTab] = useState<'pending' | 'work_suggestions' | 'reviewed'>('pending');

  // Action Dialog States
  const [actingAppId, setActingAppId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'changes' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const pendingApps = applications.filter(
    (a) => a.status === 'pending' || a.status === 'changes_requested'
  );
  const reviewedApps = applications.filter(
    (a) => a.status === 'approved' || a.status === 'rejected'
  );

  // Handle Approve
  const handleApprove = async (app: WriterApplication) => {
    try {
      await approveApplication(app.id);
      setFeedbackToast(`Approved writer profile for "${app.applicantName}"!`);
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error approving application');
    }
  };

  // Handle Submit Reject / Changes
  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actingAppId || !actionType) return;

    try {
      if (actionType === 'reject') {
        await rejectApplication(actingAppId, actionNotes || 'Application did not meet verification criteria.');
        setFeedbackToast('Application marked as rejected.');
      } else {
        await requestChangesApplication(actingAppId, actionNotes || 'Additional verification information requested.');
        setFeedbackToast('Requested changes sent to applicant.');
      }
      setActingAppId(null);
      setActionType(null);
      setActionNotes('');
      setTimeout(() => setFeedbackToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error processing action');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-review-title"
        className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 my-8 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand via-purple-500 to-amber-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-brand/30"
          aria-label="Close"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={18} />
        </button>

        {/* Toast Alert */}
        {feedbackToast && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-400" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* =========================================================================
            SECURITY CHECK: ACCESS RESTRICTED FOR NON-ADMINS
            ========================================================================= */}
        {!isAuthorizedAdmin ? (
          <div className="text-center py-10 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 ring-8 ring-amber-50/50">
              <HugeiconsIcon icon={ShieldCheckIcon} size={32} />
            </div>
            <h2 id="admin-review-title" className="font-serif text-2xl font-bold text-slate-900">
              Admin Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              This designated review portal is restricted to authorized BookCircle editorial administrators. You do not have permissions to review or approve writer applications.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
              Logged in as: <strong className="text-slate-800">{currentUser?.email || currentUser?.displayName || 'Guest'}</strong>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-brand text-white text-xs sm:text-sm font-semibold hover:bg-brand/90 transition shadow-sm"
            >
              Return to Community
            </button>
          </div>
        ) : (
          /* =========================================================================
             AUTHORIZED ADMIN REVIEW DASHBOARD
             ========================================================================= */
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 pr-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand flex items-center justify-center flex-shrink-0">
                  <HugeiconsIcon icon={ShieldCheckIcon} size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Editorial Review
                    </span>
                    <span className="text-xs text-slate-400">• Restricted Area</span>
                  </div>
                  <h2 id="admin-review-title" className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                    Writer Onboarding & Claims Management
                  </h2>
                </div>
              </div>

              {pendingApps.length > 0 && (
                <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>{pendingApps.length} pending review</span>
                </span>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 border-b border-slate-200 my-4">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`pb-2 px-3 text-xs sm:text-sm font-semibold transition border-b-2 -mb-[2px] flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>Pending Claims & Profiles</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand/10 text-brand">
                  {pendingApps.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('work_suggestions')}
                className={`pb-2 px-3 text-xs sm:text-sm font-semibold transition border-b-2 -mb-[2px] flex items-center gap-1.5 ${
                  activeTab === 'work_suggestions'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>Work Suggestions</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                  {workSuggestions.filter((s) => s.status === 'pending').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviewed')}
                className={`pb-2 px-3 text-xs sm:text-sm font-semibold transition border-b-2 -mb-[2px] ${
                  activeTab === 'reviewed'
                    ? 'border-brand text-brand'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Review History ({reviewedApps.length})
              </button>
            </div>

            {/* Sub-Modal / Drawer for Reject or Request Changes */}
            {actingAppId && actionType && (
              <form onSubmit={handleConfirmAction} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 mb-5 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                  <h4 className="font-serif text-sm font-bold text-amber-900">
                    {actionType === 'reject' ? 'Reject Writer Application' : 'Request Changes / Additional Proof'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setActingAppId(null);
                      setActionType(null);
                      setActionNotes('');
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-amber-800">
                  {actionType === 'reject'
                    ? 'Provide a clear rationale for declining this claim. The applicant will be informed.'
                    : 'Specify what additional proof is needed (e.g. link to publisher author page or agency email confirmation).'}
                </p>

                <textarea
                  rows={3}
                  required
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Enter editor feedback message for the applicant..."
                  className="w-full p-2.5 text-xs rounded-xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                />

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActingAppId(null);
                      setActionType(null);
                      setActionNotes('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-1.5 rounded-xl text-white text-xs font-semibold transition shadow-xs ${
                      actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {actionType === 'reject' ? 'Confirm Rejection' : 'Send Change Request'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT: PENDING APPLICATIONS */}
            {activeTab === 'pending' && (
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {pendingApps.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-500 text-sm font-medium">
                      All writer claims and applications are up to date! 🎉
                    </p>
                  </div>
                ) : (
                  pendingApps.map((app) => {
                    // Check for conflicting claims on the same author
                    const conflicts =
                      app.type === 'claim_existing' && app.targetAuthorId
                        ? applications.filter(
                            (other) =>
                              other.id !== app.id &&
                              other.targetAuthorId === app.targetAuthorId &&
                              other.status === 'pending'
                          )
                        : [];

                    return (
                      <div
                        key={app.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4"
                      >
                        {/* Application Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                app.type === 'claim_existing'
                                  ? 'bg-purple-100 text-brand'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {app.type === 'claim_existing' ? 'Profile Claim' : 'New Profile Application'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              ID: {app.id.substring(0, 16)}...
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Submitted {new Date(app.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Conflict Warning Banner */}
                        {conflicts.length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                            <HugeiconsIcon icon={AlertCircleIcon} size={16} className="flex-shrink-0 text-amber-600" />
                            <span>
                              <strong>Multiple Claims Conflict:</strong> {conflicts.length} other reader(s) have also applied to claim "{app.targetAuthorName}". Compare proof links carefully before approving.
                            </span>
                          </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          {/* Applicant Info */}
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Applicant Account
                            </span>
                            <h4 className="font-serif text-sm font-bold text-slate-900 mt-1">
                              {app.applicantName}
                            </h4>
                            <p className="text-slate-500 mt-0.5">
                              {app.applicantEmail || 'No email provided'}
                            </p>
                            <p className="text-slate-400 text-[11px] mt-1 font-mono">
                              User ID: {app.userId}
                            </p>
                          </div>

                          {/* Target Author / Proposed Profile */}
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {app.type === 'claim_existing' ? 'Target Author in Catalog' : 'Proposed Writer Profile'}
                            </span>
                            {app.type === 'claim_existing' ? (
                              <div>
                                <h4 className="font-serif text-sm font-bold text-brand mt-1">
                                  {app.targetAuthorName}
                                </h4>
                                <p className="text-slate-500 text-[11px] mt-0.5">
                                  Author ID: {app.targetAuthorId}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <h4 className="font-serif text-sm font-bold text-slate-900 mt-1">
                                  {app.proposedAuthor?.name}
                                </h4>
                                <p className="text-slate-500 text-[11px] mt-0.5">
                                  {app.proposedAuthor?.profession || 'Author'} · {app.proposedAuthor?.nationality || 'International'}
                                </p>
                                {app.proposedAuthor?.bio && (
                                  <p className="text-slate-600 line-clamp-2 mt-1 text-[11px]">
                                    "{app.proposedAuthor.bio}"
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Verification Links & Proof */}
                        <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-100 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                            Submitted Verification Proof
                          </span>
                          {app.verificationNotes && (
                            <p className="text-slate-700 mt-1 italic">
                              "{app.verificationNotes}"
                            </p>
                          )}

                          {app.verificationLinks && app.verificationLinks.length > 0 ? (
                            <div className="mt-2.5 space-y-1">
                              <span className="text-[11px] font-semibold text-slate-600">Proof Links:</span>
                              {app.verificationLinks.map((link, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <HugeiconsIcon icon={Globe02Icon} size={13} className="text-brand flex-shrink-0" />
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand hover:underline truncate text-[11px]"
                                  >
                                    {link} ↗
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 mt-1 text-[11px]">No external links provided.</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setActingAppId(app.id);
                              setActionType('reject');
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition"
                          >
                            Reject
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActingAppId(app.id);
                              setActionType('changes');
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-semibold transition"
                          >
                            Request Changes
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApprove(app)}
                            className="px-5 py-1.5 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
                          >
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                            <span>Approve & Verify Writer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB CONTENT: WORK SUGGESTIONS */}
            {activeTab === 'work_suggestions' && (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {workSuggestions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-500 text-sm font-medium">
                      No book suggestions pending review.
                    </p>
                  </div>
                ) : (
                  workSuggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-purple-50 px-2 py-0.5 rounded-full">
                            Suggested by {sug.authorName}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(sug.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-slate-900 mt-1">
                          {sug.title} {sug.publishedYear ? `(${sug.publishedYear})` : ''}
                        </h4>
                        <p className="text-xs text-slate-500">Category: {sug.category}</p>
                        {sug.synopsis && (
                          <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                            "{sug.synopsis}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {sug.status === 'approved' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            Approved in Catalog
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => approveWorkSuggestion(sug.id)}
                            className="px-4 py-1.5 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition shadow-xs"
                          >
                            Add to Catalog
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: REVIEWED HISTORY */}
            {activeTab === 'reviewed' && (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {reviewedApps.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-500 text-sm font-medium">
                      No reviewed applications in history yet.
                    </p>
                  </div>
                ) : (
                  reviewedApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              app.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {app.status}
                          </span>
                          <span className="font-semibold text-slate-800">{app.applicantName}</span>
                          <span className="text-slate-400">
                            → {app.type === 'claim_existing' ? app.targetAuthorName : app.proposedAuthor?.name}
                          </span>
                        </div>
                        {app.adminNotes && (
                          <p className="text-slate-500 mt-1 italic text-[11px]">
                            Notes: "{app.adminNotes}"
                          </p>
                        )}
                      </div>

                      <span className="text-slate-400 text-[11px]">
                        Reviewed {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
