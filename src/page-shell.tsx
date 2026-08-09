'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useAppContext } from './providers';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SeoHead from './components/SeoHead';

export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    currentUser,
    activeTab,
    setActiveTab,
    notifications,
    handleLogout,
    handleMarkNotificationRead,
  } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col justify-between medical-grid relative selection:bg-rose-500 selection:text-white overflow-x-hidden">
      
      {/* Dynamic SEO Head Manager */}
      <SeoHead activeTab={activeTab} />

      {/* Glow Ambient Highlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-600/5 rounded-full filter blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-red-600/3 rounded-full filter blur-3xl pointer-events-none -z-10"></div>

      <div>
        {/* Navigation Sticky Header */}
        <Navbar 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
        />

        {/* Dynamic Route/View Stage Wrapper */}
        <main className="py-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname || 'root'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Structured Footer Column */}
      <Footer onNavigate={setActiveTab} />
    </div>
  );
}

