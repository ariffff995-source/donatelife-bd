'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Search,
  Shield,
  UserCheck,
  Users,
  Activity,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  MapPin,
  Sparkles,
  Droplet,
  Building2,
  Truck,
  PhoneCall,
  Clock,
  ArrowRight,
  Phone,
  MessageSquare,
  Compass,
  FileText
} from 'lucide-react';
import { BloodRequest, PlatformStats, BloodGroup } from '../types';
import LocationSelector from '../components/LocationSelector';
import SearchableSelect from '../components/SearchableSelect';
import { BLOOD_GROUPS } from '../data/bangladesh-locations';
import heroImage from '../assets/images/medical_hero_illustration_1783087625061.jpg';
import { useLanguage } from '../contexts/LanguageContext';
import LiveImpactTelemetry from '../components/LiveImpactTelemetry';

interface HomeViewProps {
  onNavigate: (tabId: string) => void;
  onInstantSearch: (filters: { bloodGroup: string; division: string; district: string; upazila: string }) => void;
  activeRequests: BloodRequest[];
  stats: PlatformStats;
  currentUser: any;
}

export default function HomeView({ onNavigate, onInstantSearch, activeRequests, stats, currentUser }: HomeViewProps) {
  const { language } = useLanguage();
  const latestRequests = activeRequests.filter(r => r.status === 'pending').slice(0, 3);

  // FAQ Accordion Active Index State
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Instant Search State
  const [searchState, setSearchState] = useState({
    bloodGroup: '' as BloodGroup | '',
    division: '',
    district: '',
    upazila: '',
    policeStation: '',
    fullAddress: '',
    availableOnly: true
  });

  const handleLocationChange = (field: 'division' | 'district' | 'upazila' | 'policeStation' | 'fullAddress' | 'bloodGroup', value: string) => {
    setSearchState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInstantSearch(searchState);
  };

  const eligibilityGuide = [
    {
      rule: language === 'bn' ? 'বয়সের মাপকাঠি' : 'Age Constraint',
      detail: language === 'bn' ? 'বয়স ১৮ থেকে ৬০ বছরের মধ্যে হতে হবে।' : 'Must be between 18 and 60 years old.'
    },
    {
      rule: language === 'bn' ? 'ওজনসীমা' : 'Weight Threshold',
      detail: language === 'bn' ? 'সর্বনিম্ন ওজন ৫০ কেজি (১১০ পাউন্ড) হওয়া আবশ্যক।' : 'Must weigh at least 50 kg (110 lbs).'
    },
    {
      rule: language === 'bn' ? 'রক্তদানের সময় ব্যবধান' : 'Interval Limit',
      detail: language === 'bn' ? 'সর্বশেষ রক্তদানের পর কমপক্ষে ১২০ দিন (৪ মাস) পার হতে হবে।' : 'Minimum 120 days (4 months) since last donation.'
    },
    {
      rule: language === 'bn' ? 'শারীরিক সুস্থতা' : 'Health Standard',
      detail: language === 'bn' ? 'কোনো জটিল দীর্ঘমেয়াদী রোগ বা সাম্প্রতিক জ্বর থাকা চলবে না।' : 'Must not have chronic diseases or ongoing fever.'
    }
  ];

  const faqs = [
    {
      question: language === 'bn' ? 'কত দিন পরপর রক্তদান করা যায়?' : 'How often can I safely donate blood?',
      answer: language === 'bn'
        ? 'সুস্থ পুরুষ দাতারা প্রতি ১২০ দিন (৪ মাস) এবং নারী দাতারা প্রতি ১৫০ দিন (৫ মাস) পর পর রক্তদান করতে পারেন।'
        : 'Healthy male donors can donate every 120 days (4 months), while female donors can donate every 150 days (5 months).'
    },
    {
      question: language === 'bn' ? 'রক্তদানের আগে কী প্রস্তুতি নেওয়া উচিত?' : 'What should I do before donating blood?',
      answer: language === 'bn'
        ? 'পর্যাপ্ত পানি পান করুন, হালকা পুষ্টিকর খাবার খান, ৭-৮ ঘণ্টা ঘুমান এবং রক্তদানের ঠিক আগে ভারী ব্যায়াম পরিহার করুন।'
        : 'Drink plenty of water, consume a light healthy meal, get 7-8 hours of sleep, and avoid heavy exercise right before donation.'
    },
    {
      question: language === 'bn' ? 'রক্তদান কি নিরাপদ?' : 'Is blood donation safe?',
      answer: language === 'bn'
        ? 'হ্যাঁ, রক্তদান সম্পূর্ণ নিরাপদ। সমস্ত ব্যবহৃত সরঞ্জাম ওয়ান-টাইম, স্টেরিলাইজড ও জীবাণুমুক্ত।'
        : 'Yes, blood donation is 100% safe. All collection equipment is single-use, sterile, and disposable.'
    },
    {
      question: language === 'bn' ? 'রক্তদানের পর করণীয় কী?' : 'What should I do after donating blood?',
      answer: language === 'bn'
        ? '১০-১৫ মিনিট বিশ্রাম নিন, জুস বা পানি পান করুন এবং সারাদিন ভারী কাজ থেকে বিরত থাকুন।'
        : 'Rest for 10-15 minutes, drink fluids or juice, and avoid strenuous physical labor for the remainder of the day.'
    }
  ];

  // Motion animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto py-2 sm:py-6"
    >
      
      {/* ========================================== */}
      {/* 1. HERO SECTION                            */}
      {/* ========================================== */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-800/80 p-3.5 sm:p-10 lg:p-14 shadow-2xl shadow-rose-950/10">
        {/* Glow Ambient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 rounded-full filter blur-3xl -z-10"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-12 items-center">
          
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-2.5 sm:space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] sm:text-xs font-semibold uppercase tracking-wider shadow-inner">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 animate-ping shrink-0"></span>
              {language === 'bn' ? 'জরুরী রক্ত সংযোগ নেটওয়ার্ক' : 'Emergency Blood Matchmaking'}
            </div>
            
            <h1 className="text-xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight sm:leading-tight">
              {language === 'bn' ? (
                <>প্রতিটি রক্তের ফোঁটা <br /><span className="bg-gradient-to-r from-rose-400 via-red-500 to-amber-400 bg-clip-text text-transparent font-black">নতুন জীবনের আশা</span></>
              ) : (
                <>Every drop of blood is a <br /><span className="bg-gradient-to-r from-rose-400 via-red-500 to-amber-400 bg-clip-text text-transparent font-black">Ray of New Hope</span></>
              )}
            </h1>
            
            <p className="text-[13px] sm:text-base text-slate-300/90 leading-snug sm:leading-relaxed max-w-xl">
              {language === 'bn'
                ? 'বাংলাদেশের রিয়েল-টাইম ব্লাড ম্যাচিং প্ল্যাটফর্ম। ৮ টি বিভাগ, ৬৪ টি জেলা এবং উপজেলা জুড়ে স্বেচ্ছাসেবী রক্তদাতা ও জরুরী রোগীর তাৎক্ষণিক সংযোগ।'
                : 'Bangladesh\'s advanced, real-time blood matcher. Bridging the gap between volunteer donors and clinical emergencies across all 8 divisions, 64 districts, and sub-districts instantly.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-1 sm:pt-2">
              <button
                onClick={() => onNavigate('search')}
                className="h-10 sm:h-auto px-4 py-2.5 sm:py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest rounded-lg sm:rounded-xl shadow-lg shadow-rose-900/40 hover:shadow-rose-600/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer border border-rose-500/30 min-h-[44px]"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {language === 'bn' ? 'রক্তদাতা খুঁজুন' : 'Find Donors'}
              </button>
              
              {!currentUser ? (
                <button
                  onClick={() => onNavigate('auth')}
                  className="h-10 sm:h-auto px-4 py-2.5 sm:py-3.5 border border-slate-700 bg-slate-800/40 hover:bg-slate-800/80 text-slate-200 hover:text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest rounded-lg sm:rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center min-h-[44px]"
                >
                  {language === 'bn' ? 'রক্তদাতা নিবন্ধন' : 'Register as Donor'}
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="h-10 sm:h-auto px-4 py-2.5 sm:py-3.5 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest rounded-lg sm:rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer flex items-center justify-center min-h-[44px]"
                >
                  {language === 'bn' ? 'আমার ডোনার ককনসোল' : 'My Donor Console'}
                </button>
              )}
            </div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-5 flex justify-center relative group mt-1 sm:mt-4 lg:mt-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-red-500/10 rounded-xl sm:rounded-2xl filter blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative p-1 bg-slate-950/80 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md max-w-[150px] sm:max-w-md w-full">
              <img
                src={typeof heroImage === 'object' && heroImage && 'src' in heroImage ? (heroImage as any).src : (heroImage as any)}
                alt="DonateLife BD Medical Network Illustration"
                loading="lazy"
                decoding="async"
                width={400}
                height={300}
                className="w-full h-auto object-cover rounded-xl sm:rounded-2xl border border-slate-900 shadow-inner group-hover:scale-[1.01] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 bg-slate-950/90 border border-slate-800 p-1.5 sm:p-3.5 rounded-lg sm:rounded-xl flex items-center gap-1.5 sm:gap-3">
                <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="text-left min-w-0">
                  <h4 className="text-[9px] sm:text-xs font-bold text-slate-200 truncate">
                    {language === 'bn' ? 'যাচাইকৃত ডেটাবেস' : 'Database Guard'}
                  </h4>
                  <p className="text-[7px] sm:text-[10px] text-slate-400 truncate">
                    {language === 'bn' ? '১০০% ভেরিফাইড প্রফাইল' : '100% verified identities'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>


      {/* ========================================== */}
      {/* 2. EMERGENCY BLOOD REQUESTS               */}
      {/* ========================================== */}
      <motion.section variants={itemVariants} className="space-y-5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-rose-400">
                {language === 'bn' ? 'জরুরী রক্তের চাহিদা' : 'Urgent Emergency Feeds'}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight mt-1">
              {language === 'bn' ? 'জরুরী রক্তের রিকুয়েস্টসমূহ' : 'Live Emergency Blood Requests'}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('requests')}
            className="self-start sm:self-auto text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer group"
          >
            <span>{language === 'bn' ? 'সকল রিকুয়েস্ট দেখুন' : 'View All Requests'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {latestRequests.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm border border-dashed border-slate-800 rounded-3xl bg-slate-900/40">
            {language === 'bn' ? 'বর্তমানে কোনো সক্রিয় রক্ত দরকার নেই।' : 'No active emergency requests in Bangladesh right now.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {latestRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => onNavigate('requests')}
                className="p-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-rose-500/50 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-lg hover:shadow-rose-950/30"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl font-black text-base group-hover:scale-105 transition-transform">
                      {req.bloodGroup}
                    </span>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md animate-pulse">
                      {language === 'bn' ? 'জরুরী' : 'Urgent'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-100 group-hover:text-rose-300 transition-colors truncate">
                      {req.patientName}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      {req.hospitalName}, {req.district}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {req.requiredDate || (language === 'bn' ? 'তাত্ক্ষণিক' : 'Immediate')}
                  </span>
                  <span className="font-bold text-rose-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {language === 'bn' ? 'সাড়া দিন' : 'Respond'} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>


      {/* ========================================== */}
      {/* 3. INSTANT MATCHMAKER                      */}
      {/* ========================================== */}
      <motion.section 
        variants={itemVariants}
        className="bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/95 border border-slate-800/80 p-3.5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-950/80 text-left relative overflow-hidden backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 sm:space-y-4 relative z-10">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="p-1 sm:p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-rose-400">
              {language === 'bn' ? 'ইনস্ট্যান্ট ম্যাচমেকার' : 'Instant Matchmaker'}
            </span>
          </div>
          <h3 className="text-base sm:text-2xl font-black text-slate-100 tracking-tight">
            {language === 'bn' ? 'তাত্ক্ষণিক রক্তদাতা নির্বাচন করুন' : 'Locate Donors Instantly'}
          </h3>
          <p className="text-[11px] sm:text-sm text-slate-300/90 leading-snug sm:leading-relaxed max-w-3xl">
            {language === 'bn'
              ? 'রক্তের গ্রুপ এবং আপনার কাঙ্খিত এলাকা নির্বাচন করে বাংলাদেশের সক্রিয় রক্তদাতাদের তালিকা থেকে তাৎক্ষণিক ম্যাচ খুঁজুন।'
              : 'Select blood type and target territory below to search Bangladesh\'s active voluntary donor rosters immediately.'}
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-3 sm:space-y-4 mt-3 sm:mt-5 relative z-10">
          <LocationSelector
            division={searchState.division}
            district={searchState.district}
            upazila={searchState.upazila}
            bloodGroup={searchState.bloodGroup}
            fullAddress={searchState.fullAddress}
            onChange={handleLocationChange}
            required={true}
            showBloodGroup={true}
            showFullAddress={true}
            layoutMode="compact-2col"
          />

          <div className="flex flex-col gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            {/* Show Available Donors toggle above the search button */}
            <div className="flex items-center justify-between px-0.5 min-h-[44px]">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setSearchState(prev => ({ ...prev, availableOnly: !prev.availableOnly }))}
                  className={`w-9 h-5 sm:w-10 sm:h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex cursor-pointer shrink-0 ${
                    searchState.availableOnly !== false ? 'bg-rose-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                  aria-label={language === 'bn' ? 'শুধুমাত্র সক্রিয় রক্তদাতা প্রদর্শন করুন' : 'Show Available Donors Only'}
                >
                  <motion.div layout className="w-4 h-4 sm:w-4.5 sm:h-4.5 bg-white rounded-full shadow-sm" />
                </button>
                <span className="text-[11px] sm:text-xs font-bold text-slate-300">
                  {language === 'bn' ? 'শুধুমাত্র সক্রিয় রক্তদাতা প্রদর্শন করুন' : 'Show Available Donors Only'}
                </span>
              </div>
            </div>

            {/* Search button height 48px on mobile (h-12), full width */}
            <button
              type="submit"
              className="w-full h-12 sm:h-[50px] bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:via-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-2.5 shadow-lg shadow-rose-950/50 hover:shadow-rose-600/40 active:scale-[0.99] cursor-pointer border border-rose-500/30 group"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-100 group-hover:scale-110 transition-transform duration-200" />
              <span>{language === 'bn' ? 'স্মার্ট সার্চ শুরু করুন' : 'Initiate Smart Search'}</span>
              <Sparkles className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
            </button>
          </div>
        </form>
      </motion.section>


      {/* ========================================== */}
      {/* 4. LIVE IMPACT TELEMETRY                   */}
      {/* ========================================== */}
      <LiveImpactTelemetry onNavigate={onNavigate} initialStats={stats} />


      {/* ========================================== */}
      {/* 5. QUICK DIRECTORIES                       */}
      {/* ========================================== */}
      <motion.section variants={itemVariants} className="space-y-5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-rose-400">
              <Compass className="w-4 h-4" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                {language === 'bn' ? 'জরুরী ডিরেক্টরি' : 'Resource Directories'}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight mt-1">
              {language === 'bn' ? 'জরুরী সেবা ও রিসোর্স ডিরেক্টরি' : 'Quick Resource Directories'}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: language === 'bn' ? 'হাসপাতাল নেটওয়ার্ক' : 'Hospitals Network',
              desc: language === 'bn' ? 'রক্ত সঞ্চালন সুবিধাসম্পন্ন সকল হাসপাতাল' : 'Transfusion-equipped hospital centers across 64 districts.',
              icon: Building2,
              tab: 'directories',
              color: 'from-blue-500/20 to-sky-500/10 border-blue-500/30 text-blue-400'
            },
            {
              title: language === 'bn' ? 'ব্লাড ব্যাংক ডিরেক্টরি' : 'Blood Bank Directory',
              desc: language === 'bn' ? 'কেন্দ্রীয় ও আঞ্চলিক ব্লাড ব্যাংক তথ্য' : 'Central & regional official blood repos with stock telemetry.',
              icon: Droplet,
              tab: 'directories',
              color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400'
            },
            {
              title: language === 'bn' ? '২৪/৭ অ্যাম্বুলেন্স বহর' : '24/7 Ambulance Fleet',
              desc: language === 'bn' ? 'জরুরী আইসিইউ ও সাধারণ অ্যাম্বুলেন্স' : 'Emergency ICU & general ambulance contacts across Bangladesh.',
              icon: Truck,
              tab: 'directories',
              color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400'
            },
            {
              title: language === 'bn' ? 'স্বেচ্ছাসেবক রক্তদাতা' : 'Voluntary Donors',
              desc: language === 'bn' ? 'ভেরিফাইড ডোনারদের সাথে সরাসরি যোগযোগ' : 'Search verified volunteer donors across all upazilas.',
              icon: Users,
              tab: 'search',
              color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400'
            }
          ].map((dir, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate(dir.tab)}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-lg hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${dir.color} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <dir.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                  {dir.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {dir.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-rose-400">
                <span>{language === 'bn' ? 'ব্রাউজ করুন' : 'Browse Directory'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </motion.section>


      {/* ========================================== */}
      {/* 6. FEATURE CARDS                           */}
      {/* ========================================== */}
      <motion.section variants={itemVariants} className="space-y-5 text-left">
        <div className="pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-rose-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              {language === 'bn' ? 'প্ল্যাটফর্মের মূল সুবিধা' : 'Platform Architecture'}
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight mt-1">
            {language === 'bn' ? 'ডোনেটলাইফ কেন সেরা?' : 'Core Infrastructure Features'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: language === 'bn' ? 'সুনির্দিষ্ট ভৌগলিক সার্চ' : 'Cascading Geographic Search',
              desc: language === 'bn' ? 'বিভাগ, জেলা ও উপজেলা পর্যায়ে সুনির্দিষ্ট রক্তদাতা খুঁজুন।' : 'Find donors at division, district, or sub-district (Upazila) granularity instantly.',
              icon: Search,
              iconColor: 'text-rose-400 bg-rose-500/10'
            },
            {
              title: language === 'bn' ? 'স্বয়ংক্রিয় এলার্ট নোটিফিকেশন' : 'Auto-Trigger Alerts',
              desc: language === 'bn' ? 'জরুরী রিকুয়েস্ট পোস্ট করার সাথে সাথেই স্থানীয় ডোনারদের কাছে মেসেজ পৌছে যায়।' : 'When a new emergency blood request is posted, matched local donors get instant notifications.',
              icon: Activity,
              iconColor: 'text-sky-400 bg-sky-500/10'
            },
            {
              title: language === 'bn' ? 'যাচাইকৃত হেলথ শিল্ড' : 'Verified Health Shield',
              desc: language === 'bn' ? 'রক্তদানের ইতিবৃত্ত ট্র্যাক করে সুরক্ষিত ডোনেশন নিশ্চিত করা হয়।' : 'Tracks donation histories and applies medical safety criteria, preventing premature donations.',
              icon: Shield,
              iconColor: 'text-emerald-400 bg-emerald-500/10'
            },
            {
              title: language === 'bn' ? 'লাইভ নেটওয়ার্ক মনিটর' : 'Live Network Telemetry',
              desc: language === 'bn' ? '৬৪ টি জেলা জুড়েই রক্তদান ও জরুরী চেইনের সার্বক্ষণিক অবস্থা।' : 'Real-time telemetry and network metrics across all 64 districts in Bangladesh.',
              icon: Users,
              iconColor: 'text-amber-400 bg-amber-500/10'
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl space-y-3 text-left shadow-md hover:border-slate-700 transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl ${item.iconColor} flex items-center justify-center border border-white/5`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>


      {/* ========================================== */}
      {/* 7. MEDICAL SCREENING ("Can I Donate Blood?")*/}
      {/* ========================================== */}
      <motion.section 
        variants={itemVariants}
        className="bg-slate-900/40 border border-slate-800 p-5 sm:p-8 rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center text-left"
      >
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <HelpCircle className="w-4.5 h-4.5" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              {language === 'bn' ? 'মেডিকেল স্ক্রিনিং' : 'Medical Screening'}
            </span>
          </div>
          <h3 className="text-lg sm:text-2xl font-black text-slate-100 tracking-tight">
            {language === 'bn' ? 'আমি কি রক্তদান করতে পারব?' : 'Can I Donate Blood?'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {language === 'bn'
              ? 'প্রত্যেক রক্তদাতাকে রক্তদানের পূর্বে প্রয়োজনীয় স্বাস্থ্যবিধি অনুসরণ করতে হবে। দাতা ও রোগীর নিরাপত্তায় বিশ্ব স্বাস্থ্য সংস্থা ও বাংলাদেশের জাতীয় ব্লাড ট্রান্সফিউশন নির্দেশিকা মানা বাধ্যতামূলক।'
              : 'Every blood donor must meet standard clinical requirements before donation. These precautions are put in place by Bangladesh blood repositories and the World Health Organization to guarantee donor health and patient safety.'}
          </p>
          <div className="flex gap-3 items-center pt-1 sm:pt-2 text-[10px] sm:text-xs font-semibold text-amber-300 bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-2xl">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-amber-400" />
            <span>
              {language === 'bn'
                ? 'গত ১৪ দিনে আপনার জ্বর, ইনফেকশন বা কোনো সার্জারি হয়ে থাকলে সাময়িকভাবে রক্তদান থেকে বিরত থাকুন।'
                : 'If you had fever, viral infection, or major dental procedures in the last 14 days, please delay registering.'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {eligibilityGuide.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-1.5 hover:border-rose-500/30 transition-all">
              <h5 className="text-xs sm:text-sm font-extrabold text-rose-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                {item.rule}
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </motion.section>


      {/* ========================================== */}
      {/* 8. FAQS / TIPS                             */}
      {/* ========================================== */}
      <motion.section 
        variants={itemVariants}
        className="bg-slate-900/60 border border-slate-800 p-5 sm:p-8 rounded-3xl space-y-6 text-left"
      >
        <div className="flex items-center gap-2 text-rose-400">
          <FileText className="w-4.5 h-4.5" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">
            {language === 'bn' ? 'সাধারণ প্রশ্ন ও পরামর্শ' : 'FAQs & Guidelines'}
          </span>
        </div>
        <div>
          <h3 className="text-lg sm:text-2xl font-black text-slate-100 tracking-tight">
            {language === 'bn' ? 'রক্তদান সম্পর্কিত সাধারণ জিজ্ঞাসাসমূহ' : 'Blood Donation FAQs & Preparation Tips'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'bn'
              ? 'নিরাপদ রক্তদান ও দ্রুত সুস্থতার জন্য প্রয়োজনীয় সাধারণ প্রশ্নাবলীর উত্তর।'
              : 'Essential guidance to ensure a comfortable and safe blood donation experience.'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm sm:text-base text-slate-200 hover:text-rose-300 cursor-pointer transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ml-2 ${activeFaq === idx ? 'rotate-180 text-rose-400' : ''}`} />
              </button>

              <AnimatePresence>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.section>


      {/* ========================================== */}
      {/* 9. EMERGENCY HELPDESK                      */}
      {/* ========================================== */}
      <motion.section 
        variants={itemVariants}
        className="relative rounded-3xl bg-gradient-to-r from-rose-950/50 via-slate-900 to-slate-900 border border-rose-500/30 p-6 sm:p-10 text-left shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/10 rounded-full filter blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase tracking-widest">
              <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
              <span>{language === 'bn' ? '২৪/৭ সাপোর্ট সুবিধা' : '24/7 Emergency Support'}</span>
            </div>

            <h3 className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight">
              {language === 'bn' ? 'জরুরী সাপোর্ট ও হটলাইন হেল্পডেস্ক' : '24/7 Emergency Blood Helpdesk'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {language === 'bn'
                ? 'আকস্মিক ও জটিল রক্তের প্রয়োজনে আমাদের ২৪/৭ সাপোর্ট টিম প্রস্তুত। যেকোনো সহযোগিতায় আমাদের হটলাইনে সাথে সাথে কল বা যোগাযোগ করুন।'
                : 'In critical medical situations, our emergency coordination team is active round the clock. Connect directly with our helpdesk dispatch.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm font-bold text-slate-200">
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <Phone className="w-4 h-4 text-rose-400" />
                <span>999 (National Emergency)</span>
              </span>
              <span className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>+880 9612-345678 (Helpdesk)</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <button
              onClick={() => onNavigate('helpdesk')}
              className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-950/60 hover:shadow-rose-600/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 border border-rose-500/30"
            >
              <Shield className="w-4.5 h-4.5" />
              <span>{language === 'bn' ? 'জরুরী হেল্পডেস্কে যান' : 'Access Emergency Helpdesk'}</span>
            </button>
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
}

