'use client';

import React, { useState } from 'react';
import { 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Shield, 
  Activity, 
  Users, 
  AlertTriangle,
  FileText, 
  Compass, 
  Copy, 
  Check 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  onNavigate: (tabId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { language, t } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyNum = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-5 sm:pt-16 pb-5 sm:pb-8 px-4 sm:px-6 lg:px-8 mt-10 sm:mt-24" id="premium-footer">
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-12">
        
        {/* SECTION 2: Upgrade Emergency Helpdesk Contacts (Modern Glassmorphism) */}
        <div className="border-b border-slate-900 pb-5 sm:pb-12" id="footer-emergency-desk">
          <div className="text-left mb-4 sm:mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{t('footer.contactUs')}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              {language === 'bn' 
                ? 'তাত্ক্ষণিক চিকিৎসার পরামর্শ, অ্যাম্বুলেন্স সাপোর্ট ও লাইভ ব্লাড ব্যাংক যোগাযোগ।' 
                : 'Direct support links for ambulance assistance, medical hotlines, and safe blood units.'}
            </p>
          </div>

          {/* TABLET / DESKTOP VIEW (>= sm) */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 999 Card */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-900/90 hover:border-rose-500/35 rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden text-left shadow-lg">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] uppercase font-black text-rose-400 bg-rose-500/5 px-2.5 py-0.5 rounded-full border border-rose-500/10">
                    {language === 'bn' ? 'জাতীয়' : 'National'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-200">
                    {language === 'bn' ? 'জাতীয় জরুরী সেবা (৯৯৯)' : 'National Emergency (999)'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal min-h-[40px]">
                    {language === 'bn' 
                      ? 'পুলিশ, ফায়ার সার্ভিস ও এ্যাম্বুলেন্সের তাত্ক্ষণিক ওয়ান-স্টপ রাষ্ট্রীয় সেবা।' 
                      : '24/7 one-stop state helpline for police, rescue fire-forces, and active ambulance.'}
                  </p>
                </div>
                <p className="text-sm font-black text-slate-300 font-mono tracking-wider">999</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-900/60 flex gap-2">
                <a
                  href="tel:999"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1 shadow cursor-pointer touch-target"
                >
                  <Phone className="w-3 h-3" />
                  <span>{language === 'bn' ? 'কল করুন' : 'Call Now'}</span>
                </a>
                <button
                  onClick={() => handleCopyNum('999', '999')}
                  className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition flex items-center justify-center gap-1 shrink-0 cursor-pointer touch-target"
                  title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                >
                  {copiedId === '999' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Shastho Batayon Card */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-900/90 hover:border-rose-500/35 rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden text-left shadow-lg">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] uppercase font-black text-emerald-400 bg-emerald-500/5 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                    {language === 'bn' ? 'স্বাস্থ্য' : 'Health'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-200">
                    {language === 'bn' ? 'স্বাস্থ্য বাতায়ন (১৬২৬৩)' : 'Shastho Batayon (16263)'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal min-h-[40px]">
                    {language === 'bn' 
                      ? 'সরকারি ফ্রী চিকিৎসা পরামর্শ ও এ্যাম্বুলেন্স সহায়তার কেন্দ্রীয় কল সেন্টার।' 
                      : 'Government clinical guidance, telemedicine advisor, and ambulance coordination.'}
                  </p>
                </div>
                <p className="text-sm font-black text-slate-300 font-mono tracking-wider">16263</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-900/60 flex gap-2">
                <a
                  href="tel:16263"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1 shadow cursor-pointer touch-target"
                >
                  <Phone className="w-3 h-3" />
                  <span>{language === 'bn' ? 'কল করুন' : 'Call Now'}</span>
                </a>
                <button
                  onClick={() => handleCopyNum('16263', '16263')}
                  className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition flex items-center justify-center gap-1 shrink-0 cursor-pointer touch-target"
                  title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                >
                  {copiedId === '16263' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Quantum Blood Center Card */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-900/90 hover:border-rose-500/35 rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden text-left shadow-lg">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-600 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                    <Heart className="w-5 h-5 fill-amber-500/10" />
                  </div>
                  <span className="text-[9px] uppercase font-black text-amber-400 bg-amber-500/5 px-2.5 py-0.5 rounded-full border border-amber-500/10">
                    {language === 'bn' ? 'ল্যাব' : 'Blood Bank'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-200">
                    {language === 'bn' ? 'কোয়ান্টাম ব্লাড ব্যাংক' : 'Quantum Blood Lab'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal min-h-[40px]">
                    {language === 'bn' 
                      ? '২৪ ঘণ্টা নিরাপদ রক্তের গ্রুপ যাচাইকরণ এবং দ্রুত ব্লাড কম্পোনেন্ট সরবরাহ ল্যাব।' 
                      : 'Round-the-clock safe matching clinical screening and safe blood supply.'}
                  </p>
                </div>
                <p className="text-sm font-black text-slate-300 font-mono tracking-wider">01714010869</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-900/60 flex gap-2">
                <a
                  href="tel:01714010869"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1 shadow cursor-pointer touch-target"
                >
                  <Phone className="w-3 h-3" />
                  <span>{language === 'bn' ? 'কল করুন' : 'Call Now'}</span>
                </a>
                <button
                  onClick={() => handleCopyNum('01714010869', 'quantum-blood')}
                  className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition flex items-center justify-center gap-1 shrink-0 cursor-pointer touch-target"
                  title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                >
                  {copiedId === 'quantum-blood' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* DonateLife Support Card */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-900/90 hover:border-rose-500/35 rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden text-left shadow-lg">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] uppercase font-black text-rose-400 bg-rose-500/5 px-2.5 py-0.5 rounded-full border border-rose-500/10">
                    {language === 'bn' ? 'ডোনেটলাইফ' : 'Platform'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-200">
                    {language === 'bn' ? 'ডোনেটলাইফ সাপোর্ট ডেক্স' : 'DonateLife Support'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal min-h-[40px]">
                    {language === 'bn' 
                      ? 'বিরল রক্তের গ্রুপ অনুসন্ধান এবং জটিল এমারজেন্সি সমন্বয়ে আমাদের কেন্দ্রীয় টিম।' 
                      : 'Central volunteer taskforce helping match complex and rare blood cases.'}
                  </p>
                </div>
                <p className="text-sm font-black text-slate-300 font-mono tracking-wider">+8809612999333</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-900/60 flex gap-2">
                <a
                  href="tel:+8809612999333"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1 shadow cursor-pointer touch-target"
                >
                  <Phone className="w-3 h-3" />
                  <span>{language === 'bn' ? 'কল করুন' : 'Call Now'}</span>
                </a>
                <button
                  onClick={() => handleCopyNum('+8809612999333', 'donatelife-desk')}
                  className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition flex items-center justify-center gap-1 shrink-0 cursor-pointer touch-target"
                  title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                >
                  {copiedId === 'donatelife-desk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>

          {/* MOBILE ONLY VIEW (< sm) — Ultra Compact, Clean Single Row Card */}
          <div className="grid grid-cols-1 gap-2.5 sm:hidden">
            
            {/* 1. National Emergency */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-900/90 rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden text-left shadow">
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-red-600 to-rose-600"></div>
              
              {/* Icon, title and badge in a single row */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-500/10 text-red-500 rounded-lg shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-200 leading-tight">
                      {language === 'bn' ? 'জাতীয় জরুরী সেবা (৯৯৯)' : 'National Emergency (999)'}
                    </h4>
                    {/* Phone number directly below title */}
                    <p className="text-[10px] font-black text-rose-500 font-mono tracking-wider mt-0.5">999</p>
                  </div>
                </div>
                <span className="text-[8px] uppercase font-black text-rose-400 bg-rose-500/5 px-1.5 py-0.5 rounded-full border border-rose-500/10 shrink-0">
                  {language === 'bn' ? 'জাতীয়' : 'National'}
                </span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-slate-400 leading-snug">
                {language === 'bn' 
                  ? 'পুলিশ, ফায়ার সার্ভিস ও এ্যাম্বুলেন্সের তাত্ক্ষণিক ওয়ান-স্টপ রাষ্ট্রীয় সেবা।' 
                  : '24/7 one-stop state helpline for police, rescue fire-forces, and active ambulance.'}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1 border-t border-slate-900/60">
                <a
                  href="tel:999"
                  className="flex-1 h-11 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1 shadow cursor-pointer touch-target"
                >
                  <Phone className="w-3 h-3" />
                  <span>{language === 'bn' ? 'কল করুন' : 'Call Now'}</span>
                </a>
                <button
                  onClick={() => handleCopyNum('999', '999')}
                  className="w-11 h-11 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition flex items-center justify-center shrink-0 cursor-pointer touch-target"
                  title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                >
                  {copiedId === '999' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2. Shastho Batayon */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-900/90 rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden text-left shadow">
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-emerald-600 to-teal-600"></div>
              
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-200 leading-tight">
                      {language === 'bn' ? 'স্বাস্থ্য বাতায়ন (১৬২৬৩)' : 'Shastho Batayon (16263)'}
                    </h4>
                    <p className="text-[10px] font-black text-emerald-500 font-mono tracking-wider mt-0.5">16263</p>
                  </div>
                </div>
                <span className="text-[8px] uppercase font-black text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded-full border border-emerald-500/10 shrink-0">
                  {language === 'bn' ? 'স্বাস্থ্য' : 'Health'}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 leading-snug">
                {language === 'bn' 
                  ? 'সরকারি ফ্রী চিকিৎসা পরামর্শ ও এ্যাম্বুলেন্স সহায়তার কেন্দ্রীয় কল সেন্টার।' 
                  : 'Government clinical guidance, telemedicine advisor, and ambulance coordination.'}
              </p>

              <div className="flex gap-2 pt-1 border-t border-slate-900/60">
                <a
                  href="tel:16263"
                  className="flex-1 h-11 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1 shadow cursor-pointer touch-target"
                >
                  <Phone className="w-3 h-3" />
                  <span>{language === 'bn' ? 'কল করুন' : 'Call Now'}</span>
                </a>
                <button
                  onClick={() => handleCopyNum('16263', '16263')}
                  className="w-11 h-11 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition flex items-center justify-center shrink-0 cursor-pointer touch-target"
                  title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                >
                  {copiedId === '16263' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 3. Quantum Blood Center */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-900/90 rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden text-left shadow">
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-amber-600 to-yellow-600"></div>
              
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
                    <Heart className="w-3.5 h-3.5 fill-amber-500/10" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-200 leading-tight">
                      {language === 'bn' ? 'কোয়ান্টাম ব্লাড ব্যাংক' : 'Quantum Blood Lab'}
                    </h4>
                    <p className="text-[10px] font-black text-amber-500 font-mono tracking-wider mt-0.5">01714010869</p>
                  </div>
                </div>
                <span className="text-[8px] uppercase font-black text-amber-400 bg-amber-500/5 px-1.5 py-0.5 rounded-full border border-amber-500/10 shrink-0">
                  {language === 'bn' ? 'ল্যাব' : 'Blood Bank'}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 leading-snug">
                {language === 'bn' 
                  ? '২৪ ঘণ্টা নিরাপদ রক্তের গ্রুপ যাচাইকরণ এবং দ্রুত ব্লাড কম্পোনেন্ট সরবরাহ ল্যাব।' 
                  : 'Round-the-clock safe matching clinical screening and safe blood supply.'}
              </p>

              <div className="flex gap-2 pt-1 border-t border-slate-900/60">
                <a
                  href="tel:01714010869"
                  className="flex-1 h-11 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1 shadow cursor-pointer touch-target"
                >
                  <Phone className="w-3 h-3" />
                  <span>{language === 'bn' ? 'কল করুন' : 'Call Now'}</span>
                </a>
                <button
                  onClick={() => handleCopyNum('01714010869', 'quantum-blood')}
                  className="w-11 h-11 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition flex items-center justify-center shrink-0 cursor-pointer touch-target"
                  title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                >
                  {copiedId === 'quantum-blood' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 4. DonateLife Support */}
            <div className="backdrop-blur-md bg-slate-900/30 border border-slate-900/90 rounded-2xl p-3 flex flex-col gap-2 relative overflow-hidden text-left shadow">
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-rose-600 to-pink-600"></div>
              
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-200 leading-tight">
                      {language === 'bn' ? 'ডোনেটলাইফ সাপোর্ট ডেক্স' : 'DonateLife Support'}
                    </h4>
                    <p className="text-[10px] font-black text-rose-500 font-mono tracking-wider mt-0.5">+8809612999333</p>
                  </div>
                </div>
                <span className="text-[8px] uppercase font-black text-rose-400 bg-rose-500/5 px-1.5 py-0.5 rounded-full border border-rose-500/10 shrink-0">
                  {language === 'bn' ? 'ডোনেটলাইফ' : 'Platform'}
                </span>
              </div>

              <p className="text-[10px] text-slate-400 leading-snug">
                {language === 'bn' 
                  ? 'বিরল রক্তের গ্রুপ অনুসন্ধান এবং জটিল এমারজেন্সি সমন্বয়ে আমাদের কেন্দ্রীয় টিম।' 
                  : 'Central volunteer taskforce helping match complex and rare blood cases.'}
              </p>

              <div className="flex gap-2 pt-1 border-t border-slate-900/60">
                <a
                  href="tel:+8809612999333"
                  className="flex-1 h-11 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1 shadow cursor-pointer touch-target"
                >
                  <Phone className="w-3 h-3" />
                  <span>{language === 'bn' ? 'কল করুন' : 'Call Now'}</span>
                </a>
                <button
                  onClick={() => handleCopyNum('+8809612999333', 'donatelife-desk')}
                  className="w-11 h-11 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition flex items-center justify-center shrink-0 cursor-pointer touch-target"
                  title={language === 'bn' ? 'কপি করুন' : 'Copy'}
                >
                  {copiedId === 'donatelife-desk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 1: Upgrade Quick Navigation (Interactive Premium Grid Cards) */}
        <div className="border-b border-slate-900 pb-5 sm:pb-12" id="footer-quick-navigation">
          <div className="text-left mb-4 sm:mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Compass className="w-4 h-4 text-rose-500" />
              <span>{t('footer.quickLinks')}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              {language === 'bn' 
                ? 'ডোনেটলাইফ বিডি প্ল্যাটফর্মের বিভিন্ন ফিচার ও ডিরেক্টরি পেইজগুলোতে সহজে নেভিগেট করুন।' 
                : 'Instantly bounce across the major visual boards, registries, and articles of our network.'}
            </p>
          </div>

          {/* TABLET / DESKTOP QUICK NAVIGATION VIEW */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'home',
                labelKey: 'navbar.home',
                icon: Heart,
                color: 'text-rose-500 bg-rose-500/5',
                descEn: 'Go to the main portal, view active blood stats and real-time counter.',
                descBn: 'মূল প্ল্যাটফর্ম পোর্টাল, লাইভ রক্তদানের পরিসংখ্যান এবং কেন্দ্রীয় নোটিফিকেশন বোর্ড।',
              },
              {
                id: 'search',
                labelKey: 'navbar.findDonors',
                icon: Users,
                color: 'text-emerald-500 bg-emerald-500/5',
                descEn: 'Browse or filter local verified blood donors across multiple sub-districts.',
                descBn: 'যাচাইকৃত রক্তদাতাদের বিস্তারিত তালিকা এবং গ্রুপ ও এলাকাভিত্তিক সার্চ ইঞ্জিন।',
              },
              {
                id: 'requests',
                labelKey: 'navbar.emergencyRequests',
                icon: AlertTriangle,
                color: 'text-amber-500 bg-amber-500/5',
                descEn: 'View, verify, or post active patient emergency clinical cases.',
                descBn: 'সক্রিয় জরুরী রক্তের আবেদনগুলো পর্যবেক্ষণ করুন অথবা নতুন রক্তদান অনুরোধ পোস্ট করুন।',
              },
              {
                id: 'helpdesk',
                labelKey: 'navbar.helpdesk',
                icon: Shield,
                color: 'text-rose-500 bg-rose-500/5',
                descEn: 'Access national emergency hotlines, GPS tracking coordinates, and active support cell.',
                descBn: 'জাতীয় জরুরী হটলাইন ডিরেক্টরি, ব্রাউজার জিপিএস স্থানাঙ্ক এবং লাইভ সহায়তা কেন্দ্র।',
              },
              {
                id: 'directories',
                labelKey: 'navbar.directories',
                icon: MapPin,
                color: 'text-indigo-500 bg-indigo-500/5',
                descEn: 'Curated clinical records of local public hospitals, specialized labs, and ambulances.',
                descBn: 'হাসপাতাল, ক্লিনিক, এ্যাম্বুলেন্স সার্ভিস এবং নিরাপদ ব্লাড ব্যাংক সেন্টারের বিবরণী।',
              },
              {
                id: 'blog',
                labelKey: 'navbar.blogs',
                icon: FileText,
                color: 'text-cyan-500 bg-cyan-500/5',
                descEn: 'Read medical advice, blood donation guidelines, safety checklists, and articles.',
                descBn: 'রক্তদানের নিয়মাবলী, স্বাস্থ্য বিষয়ক প্রবন্ধ, এবং ডোনেটলাইফ মেডিকেল ব্লগসমূহ।',
              }
            ].map((link) => {
              const IconComp = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/60 transition-all text-left group cursor-pointer flex gap-3.5 items-start hover:-translate-y-0.5 duration-200"
                >
                  <div className={`p-2 rounded-lg ${link.color} group-hover:scale-110 transition-transform duration-300 shrink-0 flex items-center justify-center`}>
                    <IconComp className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors flex items-center gap-1">
                      {t(link.labelKey)}
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all text-rose-500" />
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-snug">
                      {language === 'bn' ? link.descBn : link.descEn}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* MOBILE ONLY QUICK NAVIGATION VIEW */}
          <div className="grid grid-cols-1 gap-2.5 sm:hidden">
            {[
              {
                id: 'home',
                labelKey: 'navbar.home',
                icon: Heart,
                color: 'text-rose-500 bg-rose-500/5',
                descEn: 'Go to the main portal, view active blood stats and real-time counter.',
                descBn: 'মূল প্ল্যাটফর্ম পোর্টাল, লাইভ রক্তদানের পরিসংখ্যান এবং কেন্দ্রীয় নোটিফিকেশন বোর্ড।',
              },
              {
                id: 'search',
                labelKey: 'navbar.findDonors',
                icon: Users,
                color: 'text-emerald-500 bg-emerald-500/5',
                descEn: 'Browse or filter local verified blood donors across multiple sub-districts.',
                descBn: 'যাচাইকৃত রক্তদাতাদের বিস্তারিত তালিকা এবং গ্রুপ ও এলাকাভিত্তিক সার্চ ইঞ্জিন।',
              },
              {
                id: 'requests',
                labelKey: 'navbar.emergencyRequests',
                icon: AlertTriangle,
                color: 'text-amber-500 bg-amber-500/5',
                descEn: 'View, verify, or post active patient emergency clinical cases.',
                descBn: 'সক্রিয় জরুরী রক্তের আবেদনগুলো পর্যবেক্ষণ করুন অথবা নতুন রক্তদান অনুরোধ পোস্ট করুন।',
              },
              {
                id: 'helpdesk',
                labelKey: 'navbar.helpdesk',
                icon: Shield,
                color: 'text-rose-500 bg-rose-500/5',
                descEn: 'Access national emergency hotlines, GPS tracking coordinates, and active support cell.',
                descBn: 'জাতীয় জরুরী হটলাইন ডিরেক্টরি, ব্রাউজার জিপিএস স্থানাঙ্ক এবং লাইভ সহায়তা কেন্দ্র।',
              },
              {
                id: 'directories',
                labelKey: 'navbar.directories',
                icon: MapPin,
                color: 'text-indigo-500 bg-indigo-500/5',
                descEn: 'Curated clinical records of local public hospitals, specialized labs, and ambulances.',
                descBn: 'হাসপাতাল, ক্লিনিক, এ্যাম্বুলেন্স সার্ভিস এবং নিরাপদ ব্লাড ব্যাংক সেন্টারের বিবরণী।',
              },
              {
                id: 'blog',
                labelKey: 'navbar.blogs',
                icon: FileText,
                color: 'text-cyan-500 bg-cyan-500/5',
                descEn: 'Read medical advice, blood donation guidelines, safety checklists, and articles.',
                descBn: 'রক্তদানের নিয়মাবলী, স্বাস্থ্য বিষয়ক প্রবন্ধ, এবং ডোনেটলাইফ মেডিকেল ব্লগসমূহ।',
              }
            ].map((link) => {
              const IconComp = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className="p-3 rounded-xl bg-slate-900/30 border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/60 transition-all text-left group cursor-pointer flex flex-col gap-1 hover:-translate-y-0.5 duration-200"
                >
                  {/* Icon + title on one line */}
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${link.color} group-hover:scale-110 transition-transform duration-300 shrink-0 flex items-center justify-center`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors flex items-center gap-1">
                      {t(link.labelKey)}
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all text-rose-500" />
                    </span>
                  </div>
                  {/* Description below with smaller text */}
                  <span className="text-[10px] text-slate-400 block leading-snug">
                    {language === 'bn' ? link.descBn : link.descEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: Tagline Section */}
        <div className="border-t border-b border-slate-900 py-4 sm:py-8 flex flex-col items-center text-center space-y-1" id="footer-hero-tagline">
          <p className="text-xs sm:text-sm font-black text-slate-100 tracking-wider uppercase flex items-center justify-center gap-1.5">
            <span className="text-rose-500">❤️🩹</span> {t('footer.logoText') ? t('footer.tagline') : (language === 'bn' ? 'প্রতিটি রক্তদাতাই একজন হিরো।' : 'Every Donor is a Hero.')}
          </p>
          <p className="text-[10px] sm:text-xs text-rose-500 font-bold uppercase tracking-widest leading-none">
            {t('footer.logoText') ? t('footer.description') : (language === 'bn' ? 'প্রতিটি রক্তদান বাঁচায় একটি প্রাণ।' : 'Every Donation Saves a Life.')}
          </p>
        </div>

        {/* SECTION 5: Brand Identity, HQ Info & Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 text-left pt-2 pb-2 md:pt-4 md:pb-4">
          
          {/* Brand & Badges (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center">
                <Heart className="w-4.5 h-4.5 text-white fill-white" />
              </div>
              <span className="text-base font-black text-slate-100 tracking-tight">{t('common.appName')}</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footer.desc')}
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <span className="text-[9px] uppercase font-black tracking-widest text-rose-400 bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10 shadow-sm">
                🛡️ Secure Platform
              </span>
              <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10 shadow-sm">
                ✅ Verified Donors
              </span>
            </div>
          </div>

          {/* Contact Details (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400">{language === 'bn' ? 'কেন্দ্রীয় কার্যালয়' : 'HQ Headquarters'}</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Dhanmondi, Dhaka-1209, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                <span>support@donatelife.bd</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                <span>+880 1712-345678 (General Desk)</span>
              </div>
            </div>
          </div>

          {/* Social Media Connections (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400">{language === 'bn' ? 'সামাজিক যোগাযোগ' : 'Social Connection'}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'bn' ? 'আমাদের কার্যক্রমে যুক্ত থাকুন সামাজিক মাধ্যমে।' : 'Stay tuned and share clinical updates with our communities.'}
            </p>
            
            <div className="flex gap-2.5 pt-1">
              {/* Facebook */}
              <a 
                href="https://facebook.com/donatelife.bd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-850 hover:border-blue-500/50 hover:bg-blue-950/20 text-slate-400 hover:text-blue-400 transition-all flex items-center justify-center cursor-pointer touch-target shadow-md"
                title="Facebook"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a 
                href="https://wa.me/8801711223344" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-850 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-400 transition-all flex items-center justify-center cursor-pointer touch-target shadow-md"
                title="WhatsApp"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com/donatelife.bd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-850 hover:border-pink-500/50 hover:bg-pink-950/20 text-slate-400 hover:text-pink-400 transition-all flex items-center justify-center cursor-pointer touch-target shadow-md"
                title="Instagram"
              >
                <svg className="w-4.5 h-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* LinkedIn */}
              <a 
                href="https://linkedin.com/company/donatelife-bd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-850 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-slate-400 hover:text-indigo-400 transition-all flex items-center justify-center cursor-pointer touch-target shadow-md"
                title="LinkedIn"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>

              {/* GitHub */}
              <a 
                href="https://github.com/donatelife-bd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-850 hover:border-purple-500/50 hover:bg-purple-950/20 text-slate-400 hover:text-purple-400 transition-all flex items-center justify-center cursor-pointer touch-target shadow-md"
                title="GitHub"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* SECTION 6: Copyright & Secondary Actions Row */}
        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" id="footer-legal-bar">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
          
          <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
            <a href="#" className="hover:text-rose-400 transition-colors">{t('footer.legal')}</a>
            <span>•</span>
            <a href="#" className="hover:text-rose-400 transition-colors">{t('footer.terms')}</a>

          </div>
        </div>

      </div>
    </footer>
  );
}
