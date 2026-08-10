'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Bell, User as UserIcon, LogOut, Shield, Menu, X, Check } from 'lucide-react';
import { User, Notification } from '../types';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

import { useAppContext } from '../providers';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  notifications,
  onMarkNotificationRead
}: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { isFeatureHidden } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isAdmin = Boolean(
    (currentUser && (currentUser.isAdmin || (currentUser as any).role === 'admin')) ||
    (mounted && typeof window !== 'undefined' && Boolean(localStorage.getItem('donatelife_admin_token')))
  );

  // Handle outside click to close menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll and listen for Escape key when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus close button for accessibility keyboard navigation
      setTimeout(() => closeBtnRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const rawNavLinks = [
    { id: 'home', labelKey: 'navbar.home' },
    { id: 'donors', labelKey: 'navbar.allDonors' },
    { id: 'search', labelKey: 'navbar.findDonors' },
    { id: 'requests', labelKey: 'navbar.emergencyRequests' },
    { id: 'helpdesk', labelKey: 'navbar.helpdesk' },
    { id: 'hospitals', labelKey: 'navbar.hospitals', featureKey: 'hospitals' },
    { id: 'blood-banks', labelKey: 'navbar.bloodBanks', featureKey: 'blood-banks' },
    { id: 'ambulances', labelKey: 'navbar.ambulances', featureKey: 'ambulances' },
    { id: 'blog', labelKey: 'navbar.blogs', featureKey: 'blog' },
  ];

  const navLinks = rawNavLinks.filter(link => !link.featureKey || !isFeatureHidden(link.featureKey));

  const handleLinkClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3">
      <nav aria-label="Main Navigation" className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <a 
          href="#home"
          onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group text-left min-h-[40px] sm:min-h-[44px]"
          id="nav-logo"
          aria-label="DonateLife BD Emergency Blood Network Home"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center shadow-md sm:shadow-lg shadow-rose-600/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <Heart className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white fill-white animate-pulse" />
          </div>
          <div>
            <span className="block text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-rose-300 to-red-500 bg-clip-text text-transparent leading-tight sm:leading-normal">
              {t('common.appName')}
            </span>
            <span className="block text-[10px] sm:text-[10px] text-slate-400 font-medium tracking-wider sm:tracking-widest uppercase leading-none mt-0.5">
              {t('common.tagline')}
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <ul className="hidden lg:flex items-center gap-1.5 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick(link.id); }}
                aria-current={activeTab === link.id ? 'page' : undefined}
                className={`inline-block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === link.id
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-md shadow-rose-500/5'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/50 border border-transparent'
                }`}
              >
                {t(link.labelKey)}
              </a>
            </li>
          ))}
        </ul>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-[11px] sm:text-xs font-bold transition-all duration-200 text-slate-300 hover:text-white shrink-0 shadow-md cursor-pointer min-h-[44px] min-w-[44px] justify-center"
            title={language === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'}
            id="language-switcher"
          >
            {language === 'en' ? '🇧🇩 বাংলা' : '🇬🇧 English'}
          </button>
          
          {/* Quick Request Button */}
          <button
            onClick={() => handleLinkClick('requests')}
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-md shadow-rose-900/30 hover:shadow-rose-600/30 transition-all duration-200 cursor-pointer"
            suppressHydrationWarning
          >
            {t('navbar.requestBlood')}
          </button>

          {currentUser ? (
            <>
              {/* Notification Center */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-rose-400 border border-slate-800/80 transition-all relative cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-bounce border-2 border-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-1">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{t('navbar.notifications')}</span>
                        {unreadCount > 0 && <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold">{unreadCount} {t('navbar.newNotif')}</span>}
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-slate-500 text-xs">
                            {t('navbar.noNotif')}
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                onMarkNotificationRead(notif.id);
                                if (notif.relatedId) handleLinkClick('requests');
                              }}
                              className={`p-2.5 rounded-lg cursor-pointer text-left transition-all ${
                                !notif.isRead 
                                  ? 'bg-rose-500/5 hover:bg-rose-500/10 border-l-2 border-rose-500' 
                                  : 'hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-semibold text-slate-200">{notif.title}</h4>
                                {!notif.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1"></span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                              <span className="text-[9px] text-slate-500 block mt-1.5">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Dropdown Profile Menu */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 pr-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all text-slate-200 hover:text-white cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 font-extrabold text-sm text-rose-400">
                    {currentUser.bloodGroup}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold max-w-28 truncate">{currentUser.name.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-800/80 mb-1">
                        <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      </div>

                      <button
                        onClick={() => handleLinkClick('dashboard')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white rounded-lg transition-all cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-rose-400" />
                        {t('navbar.donorDashboard')}
                      </button>


                      <button
                        onClick={() => {
                          onLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-900/10 hover:text-rose-300 rounded-lg transition-all mt-1 border-t border-slate-800/40 pt-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('navbar.logoutSession')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <button
              onClick={() => handleLinkClick('auth')}
              className="flex items-center gap-1.5 border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg transition-all cursor-pointer min-h-[36px] sm:min-h-[40px]"
            >
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {t('navbar.donorLogin')}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 sm:p-2.5 rounded-lg lg:hidden bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-800/80 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            id="mobile-hamburger-btn"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-drawer"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      {/* Mobile Side Drawer & Backdrop Overlay via Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm lg:hidden"
                id="mobile-drawer-backdrop"
                aria-hidden="true"
              />

              {/* Sliding Off-Canvas Mobile Drawer Container */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed top-0 right-0 z-[9999] h-[100dvh] w-[min(82vw,340px)] max-w-[340px] flex flex-col bg-slate-900 border-l border-slate-800/90 shadow-2xl lg:hidden overflow-hidden overflow-x-hidden"
                id="mobile-nav-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation Menu"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center shadow-md shadow-rose-600/20">
                      <Heart className="w-4.5 h-4.5 text-white fill-white animate-pulse" />
                    </div>
                    <div>
                      <span className="block text-base font-extrabold text-slate-100 leading-tight">
                        {t('common.appName')}
                      </span>
                      <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-tight mt-0.5">
                        {t('common.tagline')}
                      </span>
                    </div>
                  </div>
                  <button
                    ref={closeBtnRef}
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/60 shrink-0 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    id="close-mobile-drawer-btn"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Nav Items */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 space-y-2 scrollbar-thin overflow-x-hidden">
                  {navLinks.map((link) => {
                    const isActive = activeTab === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => handleLinkClick(link.id)}
                        className={`w-full text-left px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer relative ${
                          isActive
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeMobileNavIndicator"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            className="absolute inset-0 bg-rose-500/10 border border-rose-500/20 rounded-xl"
                          />
                        )}
                        <span className="relative z-10">{t(link.labelKey)}</span>
                        {isActive && (
                          <span className="relative z-10 w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
                        )}
                      </button>
                    );
                  })}

                  {currentUser ? (
                    <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-2">
                      <div className="px-3.5 py-2 bg-slate-950/60 rounded-xl border border-slate-800/60 mb-1.5">
                        <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                      </div>

                      <button
                        onClick={() => handleLinkClick('dashboard')}
                        className={`w-full text-left px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2.5 cursor-pointer relative ${
                          activeTab === 'dashboard'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        {activeTab === 'dashboard' && (
                          <motion.div
                            layoutId="activeMobileNavIndicator"
                            initial={false}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            className="absolute inset-0 bg-rose-500/10 border border-rose-500/20 rounded-xl"
                          />
                        )}
                        <UserIcon className="relative z-10 w-4 h-4 text-rose-400" />
                        <span className="relative z-10">{t('navbar.donorDashboard')}</span>
                      </button>


                      <button
                        onClick={() => {
                          onLogout();
                          setIsOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all flex items-center gap-2.5 cursor-pointer mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('navbar.logoutSession')}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-3 mt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => handleLinkClick('auth')}
                        className="w-full text-left px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-rose-500/30 transition-all flex items-center gap-2.5 cursor-pointer min-h-[44px]"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>{t('navbar.donorLogin')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Drawer Footer CTA - Sticky with safe area support */}
                <div className="sticky bottom-0 z-10 p-3.5 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md shrink-0 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))]">
                  <button
                    onClick={() => handleLinkClick('requests')}
                    className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-center text-xs font-extrabold uppercase tracking-wider py-3 rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
                  >
                    {t('navbar.requestBlood')}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
      </nav>
    </header>
  );
}
