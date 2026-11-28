import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  BookOpen01Icon,
  BubbleChatIcon,
  UserCircle02Icon,
  Clock01Icon,
  HelpCircleIcon
} from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';

interface MobileNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadMessages?: number;
  activityBadgeCount?: number;
  pendingRequests?: number;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  setActiveTab,
  unreadMessages = 0,
  activityBadgeCount,
  pendingRequests = 0,
}) => {
  const { isAuthenticated, requireAuth } = useAuth();

  const renderFilledIcon = (id: string) => {
    const sharedProps = {
      width: 22,
      height: 22,
      viewBox: '0 0 24 24',
      fill: 'none',
      className: 'transition-all scale-110',
      'aria-hidden': true as const,
    };

    switch (id) {
      case 'home':
        return (
          <svg {...sharedProps}>
            <path
              d="M3 11.9896V14.5C3 17.7998 3 19.4497 4.02513 20.4749C5.05025 21.5 6.70017 21.5 10 21.5H14C17.2998 21.5 18.9497 21.5 19.9749 20.4749C21 19.4497 21 17.7998 21 14.5V11.9896C21 10.3083 21 9.46773 20.6441 8.74005C20.2882 8.01237 19.6247 7.49628 18.2976 6.46411L16.2976 4.90855C14.2331 3.30285 13.2009 2.5 12 2.5C10.7991 2.5 9.76689 3.30285 7.70242 4.90855L5.70241 6.46411C4.37533 7.49628 3.71179 8.01237 3.3559 8.74005C3 9.46773 3 10.3083 3 11.9896Z"
              fill="currentColor"
            />
            <path
              d="M9.75 21.5V16.25C9.75 15.0074 10.7574 14 12 14C13.2426 14 14.25 15.0074 14.25 16.25V21.5H9.75Z"
              fill="white"
            />
          </svg>
        );
      case 'my-books':
        return (
          <svg {...sharedProps}>
            <path
              d="M7.99978 3.5H6.60021C4.43183 3.5 3.34764 3.5 2.67399 4.17362C2.00034 4.84724 2.00029 5.93144 2.00021 8.09982L2 13.3998C1.99992 15.5684 1.99987 16.6526 2.67353 17.3263C3.34719 18 4.43146 18 6.6 18H8.95042C10.4329 18 11.7092 19.0464 11.9999 20.5V5.5C11.0556 4.24097 9.99989 3.5 7.99978 3.5Z"
              fill="currentColor"
            />
            <path
              d="M16.0001 3.5H17.3997C19.5681 3.5 20.6523 3.5 21.3259 4.17362C21.9996 4.84724 21.9996 5.93144 21.9997 8.09982L21.9999 13.3998C22 15.5684 22 16.6526 21.3264 17.3263C20.6527 18 19.5684 18 17.3999 18H15.0495C13.567 18 12.2907 19.0464 12 20.5V5.5C12.9443 4.24097 14 3.5 16.0001 3.5Z"
              fill="currentColor"
            />
            <path
              d="M12 5.3V20.4"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'activity':
        return (
          <svg {...sharedProps}>
            <circle cx="12" cy="12" r="10.25" fill="currentColor" />
            <path
              d="M12 7.5V12L14.5 14.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'messages':
        return (
          <svg {...sharedProps}>
            <path
              d="M21.5 12C21.5 17.2467 17.2467 21.5 12 21.5C10.3719 21.5 8.8394 21.0904 7.5 20.3687C5.63177 19.362 4.37462 20.2979 3.26592 20.4658C3.09774 20.4913 2.93024 20.4302 2.80997 20.31C2.62741 20.1274 2.59266 19.8451 2.6935 19.6074C3.12865 18.5818 3.5282 16.6382 2.98341 15C2.6698 14.057 2.5 13.0483 2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12Z"
              fill="currentColor"
            />
            <circle cx="8" cy="12" r="1.2" fill="white" />
            <circle cx="12" cy="12" r="1.2" fill="white" />
            <circle cx="16" cy="12" r="1.2" fill="white" />
          </svg>
        );
      case 'who-we-are':
        return (
          <svg {...sharedProps}>
            <circle cx="12" cy="12" r="10.25" fill="currentColor" />
            <path
              d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="16.75" r="1.05" fill="white" />
          </svg>
        );
      case 'profile':
        return (
          <svg {...sharedProps}>
            <defs>
              <clipPath id="mobile-profile-filled-clip">
                <circle cx="12" cy="12" r="9.4" />
              </clipPath>
            </defs>
            <circle cx="12" cy="12" r="10.25" fill="currentColor" />
            <g clipPath="url(#mobile-profile-filled-clip)">
              <circle cx="12" cy="8.9" r="2.75" fill="white" />
              <path
                d="M6.4 21C7.05 16.85 9.35 14.2 12 14.2C14.65 14.2 16.95 16.85 17.6 21H6.4Z"
                fill="white"
              />
            </g>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleTabClick = (tabId: string, label: string) => {
    if (tabId === 'home' || tabId === 'my-books' || tabId === 'activity' || tabId === 'who-we-are') {
      setActiveTab(tabId);
      return;
    }

    if (!isAuthenticated) {
      requireAuth({
        title: `Sign In to Access ${label}`,
        message: `Sign in to access your ${label.toLowerCase()} and neighbor conversations.`,
        targetAction: tabId as any,
        onAuthorized: () => setActiveTab(tabId),
      });
      return;
    }

    setActiveTab(tabId);
  };

  const navItems = isAuthenticated
    ? [
        { id: 'home', label: 'Home', icon: Home01Icon },
        { id: 'my-books', label: 'My Books', icon: BookOpen01Icon },
        { id: 'activity', label: 'Activity', icon: Clock01Icon },
        { id: 'messages', label: 'Messages', icon: BubbleChatIcon },
        { id: 'profile', label: 'Profile', icon: UserCircle02Icon },
      ]
    : [
        { id: 'home', label: 'Home', icon: Home01Icon },
        { id: 'my-books', label: 'My Books', icon: BookOpen01Icon },
        { id: 'activity', label: 'Activity', icon: Clock01Icon },
        { id: 'who-we-are', label: 'Guide', icon: HelpCircleIcon },
        { id: 'profile', label: 'Sign In', icon: UserCircle02Icon },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_-4px_rgba(60,52,137,0.08)]">
      <div className="flex items-center justify-around px-2 py-1.5 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const effectiveActivityBadge =
            activityBadgeCount !== undefined ? activityBadgeCount : pendingRequests;

          const badge =
            isAuthenticated && item.id === 'messages' && unreadMessages > 0
              ? unreadMessages
              : isAuthenticated && item.id === 'activity' && effectiveActivityBadge > 0
              ? effectiveActivityBadge
              : null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id, item.label)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[52px] ${
                isActive
                  ? 'text-brand'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {/* Active background pill */}
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-brand/8" />
              )}

              <span className="relative">
                {isActive ? (
                  renderFilledIcon(item.id)
                ) : (
                  <HugeiconsIcon
                    icon={item.icon}
                    size={22}
                    className="transition-all"
                  />
                )}
                {badge !== null && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-amber-badge text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {badge}
                  </span>
                )}
              </span>

              <span
                className={`text-[10px] font-medium leading-tight transition-all ${
                  isActive ? 'font-semibold text-brand' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
