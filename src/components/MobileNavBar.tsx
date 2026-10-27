import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Home01Icon,
  BookOpen01Icon,
  BubbleChatIcon,
  UserCircle02Icon,
  Clock01Icon
} from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';

interface MobileNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadMessages?: number;
  pendingRequests?: number;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  setActiveTab,
  unreadMessages = 1,
  pendingRequests = 1,
}) => {
  const { isAuthenticated, requireAuth } = useAuth();

  const handleTabClick = (tabId: string, label: string) => {
    if (tabId === 'home') {
      setActiveTab('home');
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

  const navItems = [
    { id: 'home', label: 'Home', icon: Home01Icon },
    { id: 'my-books', label: 'My Books', icon: BookOpen01Icon },
    { id: 'requests', label: 'Requests', icon: Clock01Icon },
    { id: 'messages', label: 'Messages', icon: BubbleChatIcon },
    { id: 'profile', label: isAuthenticated ? 'Profile' : 'Sign In', icon: UserCircle02Icon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_-4px_rgba(60,52,137,0.08)]">
      <div className="flex items-center justify-around px-2 py-1.5 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const badge =
            isAuthenticated && item.id === 'messages' && unreadMessages > 0
              ? unreadMessages
              : isAuthenticated && item.id === 'requests' && pendingRequests > 0
              ? pendingRequests
              : null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id, item.label)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[52px] ${
                isActive
                  ? 'text-brand'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {/* Active background pill */}
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-brand/8" />
              )}

              <span className="relative">
                <HugeiconsIcon
                  icon={item.icon}
                  size={22}
                  className={`transition-all ${isActive ? 'scale-110' : ''}`}
                />
                {badge !== null && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-amber-badge text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {badge}
                  </span>
                )}
              </span>

              <span
                className={`text-[10px] font-medium leading-tight transition-all ${
                  isActive ? 'font-semibold text-brand' : 'text-slate-400'
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
