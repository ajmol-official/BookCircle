import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Clock01Icon,
  CheckmarkCircle02Icon,
  BubbleChatIcon,
  BookOpen01Icon,
  Calendar01Icon
} from '@hugeicons/core-free-icons';
import { dropdownVariants } from '../animations/motionVariants';

export interface NotificationItem {
  id: string | number;
  sender: string;
  avatar: string;
  action: string;
  book: string;
  time: string;
  type: 'request' | 'approved' | 'meetup' | 'message';
  unread: boolean;
  targetTab?: 'requests' | 'messages' | 'my-books';
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onNotificationClick: (item: NotificationItem) => void;
  onMarkAllAsRead: () => void;
  onGoToRequests: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
  onGoToRequests
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside and on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'message':
        return <HugeiconsIcon icon={BubbleChatIcon} size={13} className="text-brand" />;
      case 'approved':
        return <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} className="text-emerald-600" />;
      case 'meetup':
        return <HugeiconsIcon icon={Calendar01Icon} size={13} className="text-amber-600" />;
      case 'request':
      default:
        return <HugeiconsIcon icon={BookOpen01Icon} size={13} className="text-brand" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] max-w-[340px] sm:max-w-none sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 overflow-hidden"
          role="dialog"
          aria-label="Notifications"
        >
      {/* Header */}
      <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-serif text-base font-semibold text-slate-800 tracking-tight">
            Notifications
          </h4>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-amber-badge text-white px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-[11px] font-semibold text-brand hover:text-brand-dark hover:underline transition"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List or Empty State */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100/80">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onNotificationClick(n)}
              className={`p-3.5 px-4 sm:px-5 transition cursor-pointer flex items-start gap-3 group ${
                n.unread
                  ? 'bg-brand/[0.04] hover:bg-brand/[0.08]'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              {/* Avatar with Type Badge */}
              <div className="relative flex-shrink-0 mt-0.5">
                <img
                  src={n.avatar}
                  alt={n.sender}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-brand/30 transition"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center">
                  {getTypeIcon(n.type)}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-800 leading-snug">
                  <strong className="font-semibold text-slate-900">{n.sender}</strong>{' '}
                  <span className={n.unread ? 'text-slate-800 font-medium' : 'text-slate-600'}>
                    {n.action}
                  </span>{' '}
                  <span className="font-semibold text-brand">“{n.book}”</span>
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                  <HugeiconsIcon icon={Clock01Icon} size={12} />
                  <span>{n.time}</span>
                </div>
              </div>

              {/* Unread dot */}
              {n.unread && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-brand flex-shrink-0 self-center shadow-xs"
                  title="Unread"
                />
              )}
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 ring-8 ring-emerald-50/50">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
            </div>
            <h5 className="font-serif text-sm font-semibold text-slate-800">
              All caught up!
            </h5>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">
              No new notifications right now. Activity from borrowers and lenders will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-2.5 px-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => {
            onClose();
            onGoToRequests();
          }}
          className="w-full py-2 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold transition shadow-xs text-center flex items-center justify-center gap-1.5"
        >
          <span>View All Borrow Requests</span>
        </button>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
