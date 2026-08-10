'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, DonationHistory } from '../types';
import { X, Printer, Award, Heart, CheckCircle2 } from 'lucide-react';

interface DonationCertificateModalProps {
  user: User;
  donation: DonationHistory;
  onClose: () => void;
}

export function DonationCertificateModal({ user, donation, onClose }: DonationCertificateModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const certificateNo = `CERT-${donation.id.substring(0, 8).toUpperCase()}-${new Date(donation.donationDate).getFullYear()}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 print:hidden"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-2xl w-full relative z-10 space-y-6 shadow-2xl text-left print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none print:bg-white"
        >
          {/* Top Bar (Screen Only) */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 print:hidden">
            <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400 flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-rose-500" />
              Official Voluntary Donation Certificate
            </h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Printable Certificate Canvas */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/20 border-4 border-amber-500/30 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-2xl text-center space-y-6 print:bg-white print:border-4 print:border-amber-600 print:text-slate-900 print:p-8">
            
            {/* Corner Decorative Borders */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 print:border-amber-600" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500/50 print:border-amber-600" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500/50 print:border-amber-600" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500/50 print:border-amber-600" />

            {/* Header Emblem */}
            <div className="space-y-2">
              <div className="w-16 h-16 bg-rose-500/10 border-2 border-rose-500/30 rounded-2xl mx-auto flex items-center justify-center text-rose-500 print:border-rose-600 print:bg-rose-50">
                <Heart className="w-8 h-8 fill-rose-500" />
              </div>
              
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block print:text-amber-700">
                DonateLife Bangladesh National Healthcare Roster
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-wide print:text-slate-900 font-serif">
                Certificate of Appreciation
              </h2>
              
              <p className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                SERIAL NO: <strong className="text-amber-400 print:text-amber-800">{certificateNo}</strong>
              </p>
            </div>

            {/* Certificate Body Text */}
            <div className="space-y-4 max-w-xl mx-auto py-4 border-y border-slate-800/80 print:border-slate-300">
              <p className="text-xs text-slate-300 print:text-slate-700 uppercase tracking-widest font-semibold">
                This certificate is proudly awarded to
              </p>

              <h3 className="text-xl sm:text-2xl font-black text-rose-400 print:text-rose-700 font-serif underline decoration-amber-500/50 decoration-2 underline-offset-8">
                {user.name}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed print:text-slate-800 pt-2">
                In noble recognition of voluntary blood donation performed at <strong className="text-slate-100 print:text-slate-950 font-bold">{donation.hospitalName}</strong> for recipient <strong className="text-slate-100 print:text-slate-950 font-bold">{donation.recipientName}</strong>. Your generous gift of life (<strong className="text-rose-400 print:text-rose-700 font-extrabold">{donation.bloodGroup}</strong> blood) exemplifies compassionate humanitarian service for the people of Bangladesh.
              </p>
            </div>

            {/* Footer Metadata & Signatures */}
            <div className="grid grid-cols-2 gap-6 pt-4 items-end text-xs text-slate-400 print:text-slate-700">
              <div className="text-left space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 print:text-slate-600">Donation Date</p>
                <p className="font-extrabold text-slate-200 print:text-slate-900 font-mono">
                  {new Date(donation.donationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="text-right space-y-1">
                <div className="w-32 ml-auto border-b border-slate-600 print:border-slate-900 pb-1">
                  <span className="font-serif italic text-rose-400 print:text-rose-700 text-sm block">DonateLife BD Board</span>
                </div>
                <p className="text-[10px] uppercase font-bold text-slate-500 print:text-slate-600">Authorized Signature</p>
              </div>
            </div>

            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono pt-2 print:text-slate-600">
              Verified & Issued via DonateLife BD Clinical Portal • www.donatelife-bd.vercel.app
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-950/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Download / Print Official Certificate
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
