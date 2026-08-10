'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { X, Printer, ShieldCheck, Heart, MapPin, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DonorCardModalProps {
  user: User;
  onClose: () => void;
}

export function DonorCardModal({ user, onClose }: DonorCardModalProps) {
  const { language, formatLocation } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  // Generate SVG QR Code URL for profile
  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/donors?q=${encodeURIComponent(user.donorId || user.id)}`
    : `https://donatelife-bd.vercel.app/donors?q=${encodeURIComponent(user.donorId || user.id)}`;

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(profileUrl)}&color=e11d48&bgcolor=ffffff`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
        
        {/* Background Overlay dismiss */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 print:hidden"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full relative z-10 space-y-6 shadow-2xl text-left print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none print:bg-white"
        >
          {/* Header Controls */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 print:hidden">
            <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400 flex items-center gap-2">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              Digital Donor Identity Card
            </h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Printable Card Area */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/30 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl print:text-slate-900 print:bg-white print:border-2 print:border-rose-600 print:rounded-2xl">
            
            {/* Background Watermark */}
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none print:hidden">
              <Heart className="w-48 h-48 text-rose-500" />
            </div>

            {/* Top Branding Banner */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4 print:border-slate-300">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 block">
                  People's Healthcare BD
                </span>
                <h4 className="text-base font-black text-slate-100 tracking-tight print:text-slate-900">
                  DonateLife <span className="text-rose-500">BD</span>
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[8px] font-mono text-slate-400 block print:text-slate-600">SMART DONOR ID</span>
                <span className="text-xs font-black font-mono text-rose-400 print:text-rose-700">
                  {user.donorId || `DLBD-2026-${user.id.substring(0, 4).toUpperCase()}`}
                </span>
              </div>
            </div>

            {/* Main Card Content */}
            <div className="flex gap-4 items-start">
              {/* Photo */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-rose-500/40 overflow-hidden flex items-center justify-center text-rose-400 font-extrabold text-2xl shadow-md print:border-rose-600">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                {user.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1 rounded-full shadow-lg" title="Medically Verified">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Donor Credentials */}
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-extrabold text-slate-100 leading-tight print:text-slate-900">
                  {user.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 print:text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{formatLocation(user)}</span>
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <span className="px-3 py-1 bg-rose-600 text-white font-black text-xs rounded-xl shadow-md font-mono">
                    {user.bloodGroup}
                  </span>
                  
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full border ${
                    user.isAvailable 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 print:bg-emerald-100 print:text-emerald-800' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {user.isAvailable ? (language === 'bn' ? 'প্রস্তুত' : 'Available') : (language === 'bn' ? 'অপ্রাপ্য' : 'Unavailable')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Details & QR Code */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between print:border-slate-300">
              <div className="space-y-1 text-[10px] text-slate-400 print:text-slate-700">
                <p className="font-mono">
                  Registered: <strong className="text-slate-200 print:text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</strong>
                </p>
                <p className="font-mono">
                  Last Donation: <strong className="text-rose-400 print:text-rose-700">{user.lastDonationDate || 'First Time / None'}</strong>
                </p>
              </div>

              {/* QR Code Container */}
              <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-md border border-slate-700 shrink-0">
                <img src={qrApiUrl} alt="Scan QR Profile" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Official Footer Verification Note */}
            <div className="mt-3 text-[8px] font-mono text-slate-500 text-center uppercase tracking-widest print:text-slate-600">
              Official Voluntary Blood Donor Verification Card • DonateLife BD
            </div>

          </div>

          {/* Action Controls */}
          <div className="flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-950/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF Card
            </button>

            <button
              onClick={onClose}
              className="px-5 py-3 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
