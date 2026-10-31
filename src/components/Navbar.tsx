import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon,
  Coffee02Icon,
  Notification01Icon,
  UserCircle02Icon,
  BubbleChatIcon,
  Clock01Icon,
  Logout01Icon,
  Settings01Icon,
  ArrowDown01Icon,
  HelpCircleIcon,
  FavouriteIcon
} from '@hugeicons/core-free-icons';
import { NotificationDropdown, type NotificationItem } from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { dropdownVariants } from '../animations/motionVariants';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCoffeeModal: () => void;
  onOpenSettings?: () => void;
  onRequestLogout?: () => void;
  onOpenWishlistModal?: () => void;
  notifications?: NotificationItem[];
  onNotificationClick?: (item: NotificationItem) => void;
  onMarkAllNotificationsRead?: () => void;
  unreadCount?: number;
  activityBadgeCount?: number;
  /** @deprecated handled internally by NotificationDropdown */
  onToggleNotifications?: () => void;
  /** @deprecated use onRequestLogout instead */
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCoffeeModal,
  onOpenSettings,
  onRequestLogout,
  onOpenWishlistModal,
  notifications = [],
  onNotificationClick,
  onMarkAllNotificationsRead,
  unreadCount = 2,
  activityBadgeCount,
  onLogout
}) => {
  const {
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    reopenOnboarding,
    requireAuth,
    wishlist
  } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationButtonRef.current && !notificationButtonRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'my-books', label: 'My Books' },
    {
      id: 'activity',
      label: 'Activity',
      badge:
        isAuthenticated && activityBadgeCount !== undefined
          ? activityBadgeCount > 0
            ? String(activityBadgeCount)
            : undefined
          : isAuthenticated
          ? '2'
          : undefined,
    },
    { id: 'messages', label: 'Messages', badge: isAuthenticated ? '1' : undefined },
    { id: 'profile', label: 'Profile' },
  ];

  const handleNavClick = (tabId: string, label: string) => {
    if (tabId === 'home') {
      setActiveTab('home');
      return;
    }
    // Protected tabs require authentication
    requireAuth({
      title: `Sign In to Access ${label}`,
      message: `Join or sign in to BookCircle to access your ${label.toLowerCase()} and borrowing activity.`,
      targetAction: tabId as any,
      onAuthorized: () => setActiveTab(tabId),
    });
  };

  const handleSelectMenuItem = (tabId: string) => {
    setActiveTab(tabId);
    setIsProfileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setIsProfileMenuOpen(false);
    if (onRequestLogout) {
      onRequestLogout();
    } else if (onLogout) {
      onLogout();
    } else {
      setActiveTab('home');
    }
  };

  const toggleNotifications = () => {
    setIsProfileMenuOpen(false);
    setIsNotificationOpen((prev) => !prev);
  };

  const toggleProfileMenu = () => {
    setIsNotificationOpen(false);
    setIsProfileMenuOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-[1248px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <HugeiconsIcon icon={BookOpen01Icon} size={22} className="text-white" />
          </div>
          <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-brand">
            BookCircle
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.label)}
                className={`relative py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive 
                    ? 'text-brand font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-amber-badge rounded-full">
                    {item.badge}
                  </span>
                )}
                {/* Active Indicator Underline (Glides smoothly across tabs) */}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Buy Us a Coffee Button */}
          <button
            onClick={onOpenCoffeeModal}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-amber-badge hover:bg-amber-badgeHover active:scale-95 text-slate-800 font-medium text-xs sm:text-sm shadow-sm hover:shadow transition-all duration-200"
            title="Support BookCircle"
          >
            <HugeiconsIcon icon={Coffee02Icon} size={18} className="text-slate-800" />
            <span className="hidden sm:inline">Buy us a coffee</span>
          </button>

          {/* Conditional Rendering: Unauthenticated Guest vs Authenticated User */}
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-full bg-brand hover:bg-brand-dark text-white font-semibold text-xs sm:text-sm transition active:scale-95 shadow-sm"
            >
              Sign In
            </button>
          ) : (
            <>
              {/* Notifications Button with Dropdown Panel */}
              <div ref={notificationButtonRef} className="relative">
                <button
                  type="button"
                  onClick={toggleNotifications}
                  className={`relative p-2.5 rounded-full transition-all ${
                    isNotificationOpen
                      ? 'bg-brand/10 text-brand ring-1 ring-brand/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 active:scale-95'
                  }`}
                  aria-label="Notifications"
                  aria-expanded={isNotificationOpen}
                  aria-haspopup="dialog"
                  title="Notifications"
                >
                  <HugeiconsIcon icon={Notification01Icon} size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-cream rounded-full animate-pulse" />
                  )}
                </button>

                {/* Notification Dropdown Popover */}
                <NotificationDropdown
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  notifications={notifications}
                  onNotificationClick={(item) => {
                    setIsNotificationOpen(false);
                    if (onNotificationClick) {
                      onNotificationClick(item);
                    } else if (item.targetTab) {
                      setActiveTab(item.targetTab);
                    }
                  }}
                  onMarkAllAsRead={() => {
                    if (onMarkAllNotificationsRead) {
                      onMarkAllNotificationsRead();
                    }
                  }}
                  onGoToRequests={() => {
                    setActiveTab('activity');
                    setIsNotificationOpen(false);
                  }}
                />
              </div>

              {/* User Profile Avatar with Dropdown Menu */}
              <div ref={profileMenuRef} className="relative pl-1">
                <button
                  type="button"
                  onClick={toggleProfileMenu}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-200/50 transition-all group focus:outline-none focus:ring-2 focus:ring-brand/30"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="relative">
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt={currentUser?.displayName || 'User profile'}
                      className={`w-10 h-10 rounded-full object-cover ring-2 transition-all shadow-sm ${
                        isProfileMenuOpen ? 'ring-brand' : 'ring-slate-200 group-hover:ring-brand'
                      }`}
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-cream rounded-full" />
                  </div>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={14}
                    className={`text-slate-500 group-hover:text-slate-700 transition-transform duration-200 hidden sm:block ${
                      isProfileMenuOpen ? 'rotate-180 text-brand' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown Popover */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 top-full mt-3 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 overflow-hidden"
                    >
                    
                    {/* User Identity Header */}
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3.5">
                      <img
                        src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                        alt={currentUser?.displayName || 'User'}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif text-sm font-semibold text-slate-900 truncate">
                          {currentUser?.displayName || 'Reader'}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {currentUser?.email || currentUser?.phoneNumber || 'Active Member'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                          <span className="text-amber-600 font-semibold">★ {currentUser?.trustScore || 4.9}</span>
                          <span className="text-slate-500">• {currentUser?.lendsCount ?? 18} books lent</span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Options */}
                    <div className="py-2 px-2 space-y-0.5 text-xs sm:text-sm">
                      
                      {/* 1. Profile */}
                      <button
                        type="button"
                        onClick={() => handleSelectMenuItem('profile')}
                        className={`w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left transition ${
                          activeTab === 'profile'
                            ? 'bg-brand/10 text-brand font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                            <HugeiconsIcon icon={UserCircle02Icon} size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Profile</p>
                            <p className="text-[11px] text-slate-500">View public library & trust stats</p>
                          </div>
                        </div>
                      </button>

                      {/* 2. Messages */}
                      <button
                        type="button"
                        onClick={() => handleSelectMenuItem('messages')}
                        className={`w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left transition ${
                          activeTab === 'messages'
                            ? 'bg-brand/10 text-brand font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                            <HugeiconsIcon icon={BubbleChatIcon} size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Messages</p>
                            <p className="text-[11px] text-slate-500">Chat with borrowers & lenders</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-brand text-white px-2 py-0.5 rounded-full">
                          1 new
                        </span>
                      </button>

                      {/* 3. Activity Hub */}
                      <button
                        type="button"
                        onClick={() => handleSelectMenuItem('activity')}
                        className={`w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left transition ${
                          activeTab === 'activity'
                            ? 'bg-brand/10 text-brand font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                            <HugeiconsIcon icon={Clock01Icon} size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Activity Hub</p>
                            <p className="text-[11px] text-slate-500">Borrowing, lending & returns</p>
                          </div>
                        </div>
                        {activityBadgeCount && activityBadgeCount > 0 ? (
                          <span className="text-[10px] font-bold bg-amber-badge text-white px-2 py-0.5 rounded-full">
                            {activityBadgeCount}
                          </span>
                        ) : null}
                      </button>

                      {/* 4. My Books */}
                      <button
                        type="button"
                        onClick={() => handleSelectMenuItem('my-books')}
                        className={`w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left transition ${
                          activeTab === 'my-books'
                            ? 'bg-brand/10 text-brand font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                            <HugeiconsIcon icon={BookOpen01Icon} size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">My Books</p>
                            <p className="text-[11px] text-slate-500">Manage shelf, lent out & history</p>
                          </div>
                        </div>
                      </button>

                      {/* 5. Wishlist & Alerts */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onOpenWishlistModal) onOpenWishlistModal();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left text-slate-700 hover:bg-rose-50/70 hover:text-rose-700 transition group/wish"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover/wish:bg-rose-100 transition">
                            <HugeiconsIcon icon={FavouriteIcon} size={18} className="fill-rose-500 text-rose-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover/wish:text-rose-900">Wishlist & Alerts</p>
                            <p className="text-[11px] text-slate-500">Saved books & return notifications</p>
                          </div>
                        </div>
                        {wishlist && wishlist.length > 0 && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            {wishlist.length}
                          </span>
                        )}
                      </button>

                      {/* 6. How It Works Guide */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          reopenOnboarding();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left text-slate-700 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                            <HugeiconsIcon icon={HelpCircleIcon} size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">How BookCircle Works</p>
                            <p className="text-[11px] text-slate-500">Review community sharing guides</p>
                          </div>
                        </div>
                      </button>

                      {/* 6. Settings */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onOpenSettings) onOpenSettings();
                        }}
                        className="w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left text-slate-700 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                            <HugeiconsIcon icon={Settings01Icon} size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Settings</p>
                            <p className="text-[11px] text-slate-500">Account & notification preferences</p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] bg-slate-100 my-1 mx-3" />

                    {/* Log Out */}
                    <div className="px-2 pt-1">
                      <button
                        type="button"
                        onClick={handleLogoutClick}
                        className="w-full px-3.5 py-2.5 rounded-2xl flex items-center gap-3 text-left text-red-600 hover:bg-red-50 transition group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-red-100/60 text-red-600 flex items-center justify-center flex-shrink-0 group-hover:bg-red-100">
                          <HugeiconsIcon icon={Logout01Icon} size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-xs sm:text-sm">Log Out</p>
                          <p className="text-[11px] text-red-400">Sign out of this device safely</p>
                        </div>
                      </button>
                    </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
};
