'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Wrench, ArrowLeft, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MaintenanceViewProps {
  featureName: string;
  description?: string;
}

export function MaintenanceView({ featureName, description }: MaintenanceViewProps) {
  const { language } = useLanguage();

  const isBn = language === 'bn';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-950 font-sans text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden"
      >
        {/* Glow ambient background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500"></div>

        {/* Icon Header */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
          <Wrench className="w-10 h-10 text-amber-400 animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-amber-500/40 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-black uppercase tracking-widest">
          <ShieldAlert className="w-3.5 h-3.5" />
          {isBn ? 'রক্ষণাবেক্ষণ চলছে' : 'System Maintenance'}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {featureName}
          </h1>
          <p className="text-sm font-semibold text-amber-400/90">
            {isBn ? 'এই ডিরেক্টরিটি সাময়িকভাবে বন্ধ আছে' : 'Directory Temporarily Unavailable'}
          </p>
        </div>

        {/* Core Message */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          {isBn
            ? 'এই ডিরেক্টরিটি বর্তমানে সংস্কার ও আপডেট কাজের জন্য রক্ষণাবেক্ষণে রয়েছে। অনুগ্রহ করে কিছু সময় পর আবার চেষ্টা করুন।'
            : 'This directory is currently under maintenance. Please check back later.'}
        </div>

        {description && (
          <p className="text-xs text-slate-500 italic">{description}</p>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            {isBn ? 'রিফ্রেশ করুন' : 'Refresh Page'}
          </button>

          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {isBn ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
