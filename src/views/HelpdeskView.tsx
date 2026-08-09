'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../providers';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Phone,
  Shield,
  Activity,
  MapPin,
  Heart,
  ExternalLink,
  MessageSquare,
  Mail,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Users,
  Compass,
  CheckCircle2,
  Bookmark,
  Share2,
  Clock,
  Map
} from 'lucide-react';
import { BloodRequest } from '../types';

interface HelpdeskViewProps {
  onNavigate: (tabId: string) => void;
}

export default function HelpdeskView({ onNavigate }: HelpdeskViewProps) {
  const { language, t, translateLocation } = useLanguage();
  const { stats, allRequests, currentUser } = useAppContext();

  // Notification / Geolocation states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [shareCoordsText, setShareCoordsText] = useState<string | null>(null);

  // Filter pending active cases
  const activeCases = allRequests.filter(req => req.status === 'pending');
  const latestRealCase = activeCases.length > 0 ? activeCases[0] : null;

  // Bilingual translation text
  const text = {
    title: language === 'bn' ? 'জরুরী হেল্পডেস্ক' : 'Emergency Helpdesk',
    subtitle: language === 'bn' ? 'তাৎক্ষণিক এমারজেন্সি সেবা ও লাইভ রক্ত সমন্বয় কেন্দ্র' : 'Instant Emergency Support & Live Blood Coordination',
    
    // Stats Section
    statsTitle: language === 'bn' ? 'হেল্পডেস্ক লাইভ পরিসংখ্যান' : 'Helpdesk Live Statistics',
    statRequests: language === 'bn' ? 'জরুরী রক্তের আবেদন' : 'Total Emergency Requests',
    statDonors: language === 'bn' ? 'অনলাইন রক্তদাতা' : 'Active Donors Online',
    statBanks: language === 'bn' ? 'সক্রিয় ব্লাড ব্যাংক' : 'Available Blood Banks',
    statSuccess: language === 'bn' ? 'সফল রক্তদান' : 'Successful Emergency Donations',

    // Quick Actions
    actionTitle: language === 'bn' ? 'জরুরী কুইক অ্যাকশন' : 'Emergency Quick Actions',
    action999: language === 'bn' ? '৯৯৯ হেল্পলাইন কল করুন' : 'Call National Emergency (999)',
    actionAmbulance: language === 'bn' ? 'এ্যাম্বুলেন্স কল করুন' : 'Call Ambulance Hotline',
    actionHospitals: language === 'bn' ? 'নিকটবর্তী হাসপাতাল' : 'Find Nearby Hospitals',
    actionDonors: language === 'bn' ? 'রক্তদাতা খুঁজুন' : 'Find Blood Donors',
    actionShareLoc: language === 'bn' ? 'বর্তমান অবস্থান শেয়ার' : 'Share Current Location',
    actionShareReq: language === 'bn' ? 'জরুরী আবেদন পাঠান' : 'Share Emergency Request',
    actionWhatsapp: language === 'bn' ? 'হোয়াটসঅ্যাপ সহায়তা' : 'WhatsApp Help Support',
    actionEmail: language === 'bn' ? 'ইমেইল সহায়তা' : 'Email Team Support',

    // Contacts
    contactTitle: language === 'bn' ? 'জরুরী হটলাইন ও যোগাযোগ' : 'Emergency Contacts',
    callNow: language === 'bn' ? 'কল করুন' : 'Call Now',
    copyNum: language === 'bn' ? 'কপি করুন' : 'Copy Number',
    copied: language === 'bn' ? 'কপি হয়েছে' : 'Copied!',

    // Live Tracker
    trackerTitle: language === 'bn' ? 'লাইভ জরুরী রক্তের আবেদন ট্র্যাকার' : 'Emergency Blood Request Status',
    noActiveCase: language === 'bn' ? 'বর্তমানে কোনো লাইভ সক্রিয় রক্তের আবেদন নেই।' : 'No live active blood requests in your region.',
    demoCase: language === 'bn' ? 'সক্রিয় রক্তের আবেদন (ডেমো উদাহরণ)' : 'Active Blood Request (Representative Case)',
    bloodNeeded: language === 'bn' ? 'প্রয়োজনীয় রক্তের গ্রুপ' : 'Blood Group Needed',
    bagsNeeded: language === 'bn' ? 'প্রয়োজনীয় ব্যাগ' : 'Required Bags',
    hospName: language === 'bn' ? 'হাসপাতালের নাম' : 'Hospital Name',
    patStatus: language === 'bn' ? 'রোগীর অবস্থা' : 'Patient Status',
    critical: language === 'bn' ? '🚨 আশঙ্কাজনক / অতি জরুরী' : '🚨 Critical / Ultra Urgent',
    stable: language === 'bn' ? '🟢 স্থিতিশীল' : '🟢 Stable',
    timeSince: language === 'bn' ? 'আবেদনের সময়কাল' : 'Time Since Request',
    notifiedCount: language === 'bn' ? 'বিজ্ঞপ্তি পাঠানো রক্তদাতা' : 'Donors Notified',
    notifiedDesc: language === 'bn' ? 'জন রক্তদাতাকে এসএমএস ও এলার্ট পাঠানো হয়েছে' : 'matched local donors notified instantly',
    timeMin: language === 'bn' ? '৪৫ মিনিট পূর্বে' : '45 minutes ago',
    shareText: language === 'bn' ? 'আবেদন শেয়ার করুন' : 'Share Request details',

    // Live Geolocation
    locTitle: language === 'bn' ? 'লাইভ ভৌগলিক অবস্থান নির্দেশক' : '📍 Live Geolocation Finder',
    locDesc: language === 'bn' ? 'নিরাপদ ব্রাউজার জিপিএস দিয়ে আপনার স্থানাঙ্ক সনাক্ত করুন।' : 'Identify your real-time coordinates securely via browser GPS.',
    detectBtn: language === 'bn' ? 'বর্তমান অবস্থান সনাক্ত করুন' : 'Detect Live Location',
    googleMapsBtn: language === 'bn' ? 'গুগল ম্যাপে দেখুন' : 'Open in Google Maps',
    copyLocStr: language === 'bn' ? 'স্থানাঙ্ক কপি করুন' : 'Copy Address / Coords',
    latitude: language === 'bn' ? 'অক্ষাংশ (Latitude)' : 'Latitude',
    longitude: language === 'bn' ? 'দ্রাঘিমাংশ (Longitude)' : 'Longitude',
    currentArea: language === 'bn' ? 'নির্ধারিত এলাকা' : 'Assigned Profile Area',

    // Tips
    tipsTitle: language === 'bn' ? '⚡ জরুরী রক্তগ্রহণের গাইডলাইন ও টিপস' : '⚡ Emergency Blood Guidelines & Tips',
    tips1: language === 'bn' ? 'শান্ত থাকুন ও ধৈর্য ধরুন' : 'Keep calm and act methodically',
    tips1Desc: language === 'bn' ? 'আতঙ্কিত না হয়ে ঠাণ্ডা মাথায় জরুরী হটলাইনগুলোতে যোগাযোগ করুন।' : 'Panic reduces action capacity. Keep your composure and coordinate clearly.',
    tips2: language === 'bn' ? 'হাসপাতালে অবিলম্বে যোগাযোগ রাখুন' : 'Stay in touch with the hospital',
    tips2Desc: language === 'bn' ? 'রক্তের ক্রস-ম্যাচিং এবং স্থানান্তরের যাবতীয় প্রস্তুতি আগে থেকেই নিয়ে রাখুন।' : 'Ensure doctors and blood bank technicians are ready for blood cross-matching.',
    tips3: language === 'bn' ? 'রক্তের গ্রুপ পুনর্বার যাচাই করুন' : 'Double-verify patient\'s blood group',
    tips3Desc: language === 'bn' ? 'যেকোনো ভুল এড়াতে মেডিকেল প্রেসক্রিপশন দেখে রক্তের গ্রুপ পুনরায় নিশ্চিত হোন।' : 'Check the official clinical slip to eliminate manual matching group errors.',
    tips4: language === 'bn' ? 'প্রয়োজনীয় কাগজপত্র প্রস্তুত রাখুন' : 'Keep clinical records handy',
    tips4Desc: language === 'bn' ? 'রোগীর ফাইল, ক্যাবিনের বিবরণ এবং ডক্টর রেফারেল ফাইল কাছে রাখুন।' : 'Keep patient files, ward numbers, and physician prescriptions accessible.',
    tips5: language === 'bn' ? 'রক্তদাতার সাথে বন্ধুত্বপূর্ণ যোগাযোগ রাখুন' : 'Respect and support the volunteer donor',
    tips5Desc: language === 'bn' ? 'স্বেচ্ছাসেবী রক্তদাতারা কোনো বিনিময় ছাড়া আসেন, তাদের যাতায়াত ও সুরক্ষায় সাহায্য করুন।' : 'Donors are saving lives out of goodwill. Ensure their transit support is managed.',
  };

  // List of emergency contacts
  const emergencyContacts = [
    {
      id: '999-all',
      nameEn: 'National Emergency Service',
      nameBn: 'জাতীয় জরুরী সেবা',
      phone: '999',
      category: '999',
      descEn: 'One-stop helpline for police, fire service, and ambulance support across Bangladesh.',
      descBn: 'বাংলাদেশ পুলিশ, ফায়ার সার্ভিস ও এ্যাম্বুলেন্সের ওয়ান-স্টপ জাতীয় জরুরী হটলাইন সেবা।'
    },
    {
      id: 'fire-dept',
      nameEn: 'Fire Service Headquarters',
      nameBn: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স',
      phone: '102',
      category: 'Fire Service',
      descEn: 'Immediate response hotline for rescue, accidental fire breakouts, and safety operations.',
      descBn: 'যেকোনো অগ্নিকাণ্ড, উদ্ধার অভিযান ও সিভিল ডিফেন্সের দ্রুততম বিশেষায়িত কল সেন্টার।'
    },
    {
      id: 'police-hq',
      nameEn: 'Bangladesh Police HQ Helpdesk',
      nameBn: 'বাংলাদেশ পুলিশ কন্ট্রোল রুম',
      phone: '02-223381961',
      category: 'Police',
      descEn: 'Direct support line for law enforcement coordination and regional security assistance.',
      descBn: 'আইনশৃঙ্খলা পরিস্থিতি নিয়ন্ত্রণ ও তাত্ক্ষণিক পুলিশী নিরাপত্তা সহায়তার কেন্দ্রীয় কন্ট্রোল রুম।'
    },
    {
      id: 'shastho-batayon',
      nameEn: 'Shastho Batayon Health Hotline',
      nameBn: 'স্বাস্থ্য বাতায়ন (সরকারি স্বাস্থ্য তথ্য)',
      phone: '16263',
      category: 'Hospital Hotline',
      descEn: 'Government run clinical guidance, telemedicine, and national ambulance dispatcher services.',
      descBn: 'স্বাস্থ্য মন্ত্রনালয় পরিচালিত বিনামূল্যে ২৪ ঘণ্টা চিকিৎসা পরামর্শ ও এ্যাম্বুলেন্স সমন্বয় কেন্দ্র।'
    },
    {
      id: 'quantum-blood',
      nameEn: 'Quantum Blood Lab Support',
      nameBn: 'কোয়ান্টাম ব্লাড ব্যাংক ল্যাব',
      phone: '01714010869',
      category: 'Nearest Blood Bank',
      descEn: 'Available 24/7 for safe matching clinical screening and blood components requests.',
      descBn: 'নিরাপদ রক্ত পরিসঞ্চালন এবং ২৪ ঘণ্টা জরুরি রক্তের উপাদান সরবরাহের বিশেষায়িত ল্যাব।'
    },
    {
      id: 'donatelife-support',
      nameEn: 'DonateLife BD Clinical Support',
      nameBn: 'ডোনেটলাইফ বিডি সাপোর্ট হেল্পডেস্ক',
      phone: '+8809612999333',
      category: 'DonateLife BD Support',
      descEn: 'Our volunteer coordination group helping match complex and rare blood groups.',
      descBn: 'আমাদের প্ল্যাটফর্মের কেন্দ্রীয় টিম, বিরল রক্তের গ্রুপ সমন্বয়ের জরুরি স্বেচ্ছাসেবক সেল।'
    }
  ];

  const handleCopy = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGeolocate = () => {
    setGeoLoading(true);
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError(language === 'bn' ? 'আপনার ব্রাউজার জিপিএস সমর্থন করে না।' : 'Geolocation is not supported by your browser.');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        setShareCoordsText(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        setGeoLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setGeoError(
          language === 'bn'
            ? 'ভৌগলিক অবস্থান অ্যাক্সেস করতে ব্যর্থ হয়েছে। অনুগ্রহ করে জিপিএস পারমিশন চালু করুন।'
            : 'Failed to access live coordinates. Please enable device GPS permissions.'
        );
        setGeoLoading(false);
      }
    );
  };

  const getShareCaseTemplate = (req: any) => {
    return `🚨 *URGENT EMERGENCY BLOOD CASE ALERT*
💉 *Blood Group:* ${req.bloodGroup}
🏥 *Hospital:* ${req.hospitalName}
📍 *Location:* ${req.upazila || 'Dhaka'}, ${req.district || 'Dhaka'}, Bangladesh
📞 *Contact Phone:* ${req.contactPhone}
⚠️ *Status:* ${text.critical}

Shared via DonateLife BD Emergency Helpdesk. Please forward immediately!`;
  };

  const handleShareCase = (req: any) => {
    const template = getShareCaseTemplate(req);
    navigator.clipboard.writeText(template);
    setCopiedId('share-' + req.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10" id="emergency-helpdesk-view">
      
      {/* Title Header with Glowing Red Beacon Animation */}
      <div className="text-left space-y-3 relative">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/15">
            {language === 'bn' ? 'সরাসরি লাইভ সমন্বয়' : 'Live Coordination Portal'}
          </span>
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-rose-500" />
            <span>{text.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-normal max-w-3xl">{text.subtitle}</p>
        </div>
      </div>

      {/* Dynamic Statistics Panel (DYNAMICALLY AGGREGATED FROM BACKEND DB) */}
      <section className="bg-slate-900/30 border border-slate-800/80 p-6 sm:p-8 rounded-3xl text-left shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/2 rounded-full filter blur-3xl pointer-events-none"></div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-500" />
          <span>{text.statsTitle}</span>
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 1. Total Requests */}
          <div className="bg-slate-950/45 p-5 rounded-2xl border border-slate-800/60 hover:border-slate-700/40 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{text.statRequests}</p>
            <p className="text-2xl sm:text-3xl font-black text-rose-500 mt-2 font-mono">
              {language === 'bn' ? String(stats.totalRequests).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : stats.totalRequests}
            </p>
          </div>

          {/* 2. Available Volunteers */}
          <div className="bg-slate-950/45 p-5 rounded-2xl border border-slate-800/60 hover:border-slate-700/40 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{text.statDonors}</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 font-mono">
              {language === 'bn' ? String(stats.totalDonors).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : stats.totalDonors}
            </p>
          </div>

          {/* 3. Available Repositories */}
          <div className="bg-slate-950/45 p-5 rounded-2xl border border-slate-800/60 hover:border-slate-700/40 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{text.statBanks}</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-400 mt-2 font-mono">
              {language === 'bn' ? String(stats.totalBloodBanks).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : stats.totalBloodBanks}
            </p>
          </div>

          {/* 4. Successful Emergency Matches */}
          <div className="bg-slate-950/45 p-5 rounded-2xl border border-slate-800/60 hover:border-slate-700/40 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{text.statSuccess}</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-2 font-mono">
              {language === 'bn' ? String(stats.successfulDonations).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : stats.successfulDonations}
            </p>
          </div>
        </div>
      </section>

      {/* Grid of Quick Actions & Geolocation Finder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Column: Geolocation Panel & Emergency Tips (Takes 5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Live Geolocation Finder */}
          <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
            
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-3">
              <Compass className="w-5 h-5 text-indigo-400" />
              <span>{text.locTitle}</span>
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">{text.locDesc}</p>

            <div className="bg-slate-950/65 p-4 rounded-xl border border-slate-850 space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{text.latitude}</p>
                  <p className="text-xs font-mono font-bold text-slate-300 mt-1">
                    {currentCoords ? currentCoords.lat.toFixed(6) : '---'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{text.longitude}</p>
                  <p className="text-xs font-mono font-bold text-slate-300 mt-1">
                    {currentCoords ? currentCoords.lng.toFixed(6) : '---'}
                  </p>
                </div>
              </div>

              {currentUser && (
                <div className="pt-2 border-t border-slate-900 text-xs">
                  <span className="font-semibold text-slate-500">{text.currentArea}:</span>{' '}
                  <span className="font-extrabold text-indigo-400">
                    {translateLocation(currentUser.upazila)}, {translateLocation(currentUser.district)}, {translateLocation(currentUser.division)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGeolocate}
                disabled={geoLoading}
                className="flex-1 py-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer touch-target"
              >
                <Activity className={`w-4 h-4 ${geoLoading ? 'animate-spin' : ''}`} />
                <span>{geoLoading ? (language === 'bn' ? 'সনাক্ত হচ্ছে...' : 'Detecting...') : text.detectBtn}</span>
              </button>

              {currentCoords && (
                <div className="flex gap-2.5">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl hover:text-white transition flex items-center justify-center shrink-0 cursor-pointer touch-target"
                    title={text.googleMapsBtn}
                  >
                    <Map className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleCopy(`${currentCoords.lat}, ${currentCoords.lng}`, 'geo-coords')}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl hover:text-white transition flex items-center justify-center shrink-0 cursor-pointer touch-target"
                    title={text.copyLocStr}
                  >
                    {copiedId === 'geo-coords' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {geoError && <p className="text-[11px] font-bold text-red-400 bg-red-500/5 p-3 rounded-lg border border-red-500/10">{geoError}</p>}
          </section>

          {/* Quick Emergency Tips */}
          <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/3 rounded-full filter blur-2xl pointer-events-none"></div>
            
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-3">
              <Phone className="w-5 h-5 text-amber-500" />
              <span>{text.tipsTitle}</span>
            </h3>

            <div className="space-y-5">
              {[
                { title: text.tips1, desc: text.tips1Desc },
                { title: text.tips2, desc: text.tips2Desc },
                { title: text.tips3, desc: text.tips3Desc },
                { title: text.tips4, desc: text.tips4Desc },
                { title: text.tips5, desc: text.tips5Desc }
              ].map((tip, i) => (
                <div key={i} className="flex gap-3.5 items-start">
                  <div className="w-6.5 h-6.5 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 font-bold text-xs border border-amber-500/10">
                    {language === 'bn' ? String(i + 1).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : i + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-200 leading-tight">{tip.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Emergency Actions & Quick Actions List (Takes 7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Emergency Quick Action Launchpad */}
          <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-3">
              <Activity className="w-5 h-5 text-rose-500" />
              <span>{text.actionTitle}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Call 999 */}
              <a
                href="tel:999"
                className="p-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-2xl hover:border-red-500/40 transition-all flex items-center justify-between group touch-target cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4.5 h-4.5 text-red-500 fill-red-500/20" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-200 group-hover:text-red-400 transition-colors">{text.action999}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Call Ambulance Hotline */}
              <a
                href="tel:16263"
                className="p-4 bg-rose-600/5 hover:bg-rose-600/10 text-rose-400 border border-rose-500/10 rounded-2xl hover:border-rose-500/35 transition-all flex items-center justify-between group touch-target cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-600/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4.5 h-4.5 text-rose-500" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-200 group-hover:text-rose-400 transition-colors">{text.actionAmbulance}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Find Nearby Hospitals */}
              <button
                onClick={() => onNavigate('directories')}
                className="p-4 bg-slate-950/60 hover:bg-slate-950 text-slate-300 border border-slate-850 rounded-2xl hover:border-slate-700 transition-all flex items-center justify-between group text-left touch-target cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                    <MapPin className="w-4.5 h-4.5 text-slate-400" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-200 group-hover:text-white transition-colors">{text.actionHospitals}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Find Blood Donors */}
              <button
                onClick={() => onNavigate('search')}
                className="p-4 bg-slate-950/60 hover:bg-slate-950 text-slate-300 border border-slate-850 rounded-2xl hover:border-slate-700 transition-all flex items-center justify-between group text-left touch-target cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                    <Users className="w-4.5 h-4.5 text-slate-400" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-200 group-hover:text-white transition-colors">{text.actionDonors}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Submit Emergency Request */}
              <button
                onClick={() => onNavigate('requests')}
                className="p-4 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 rounded-2xl hover:border-rose-500/45 transition-all flex items-center justify-between group text-left touch-target cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-900 flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5 text-rose-500" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-200 group-hover:text-rose-400 transition-colors">{text.actionShareReq}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* WhatsApp Live Support Chat */}
              <a
                href="https://wa.me/8801711223344?text=Emergency%20Blood%20Support%20Needed"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded-2xl hover:border-emerald-500/40 transition-all flex items-center justify-between group touch-target cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/10" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-200 group-hover:text-emerald-400 transition-colors">{text.actionWhatsapp}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Email Support Coordinator */}
              <a
                href="mailto:support@donatelife.bd?subject=Emergency%20Blood%20Request%20Help"
                className="p-4 bg-slate-950/60 hover:bg-slate-950 text-slate-300 border border-slate-850 rounded-2xl hover:border-slate-700 transition-all flex items-center justify-between group touch-target cursor-pointer md:col-span-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                    <Mail className="w-4.5 h-4.5 text-slate-400" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-200 group-hover:text-white transition-colors">{text.actionEmail}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </a>

            </div>
          </section>

          {/* Live Blood Request Status Tracker */}
          <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-3">
              <Activity className="w-5 h-5 text-rose-500" />
              <span>{text.trackerTitle}</span>
            </h3>

            {/* Display real active requests from database first, otherwise render representative case */}
            {latestRealCase ? (
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-600/15 border border-red-500/20 text-red-500 font-extrabold text-lg rounded-xl flex items-center justify-center shrink-0">
                      {latestRealCase.bloodGroup}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-100">{latestRealCase.patientName}</h4>
                      <p className="text-[10px] font-black text-rose-500 uppercase mt-0.5 tracking-wider">{text.critical}</p>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md">
                    {language === 'bn' ? 'বাস্তব ঘটনা' : 'Verified Case'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-900">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500">{text.bloodNeeded}</span>
                    <p className="text-sm font-bold text-slate-200 mt-1 font-mono">{latestRealCase.bloodGroup}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500">{text.bagsNeeded}</span>
                    <p className="text-sm font-bold text-slate-200 mt-1 font-mono">
                      {language === 'bn' ? String(latestRealCase.unitsNeeded).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : latestRealCase.unitsNeeded}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-black uppercase text-slate-500">{text.hospName}</span>
                    <p className="text-xs font-bold text-slate-200 mt-1">
                      {latestRealCase.hospitalName} ({translateLocation(latestRealCase.upazila)}, {translateLocation(latestRealCase.district)})
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{text.timeSince}</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${latestRealCase.contactPhone}`}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition duration-200 cursor-pointer touch-target"
                    >
                      {text.callNow}
                    </a>
                    <button
                      onClick={() => handleShareCase(latestRealCase)}
                      className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl hover:border-slate-700 transition cursor-pointer touch-target"
                      title={text.shareText}
                    >
                      {copiedId === 'share-' + latestRealCase.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback: Highly polished simulation/representative case */
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 sm:p-6 space-y-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-600/10 border border-red-500/15 text-red-400 font-extrabold text-lg rounded-xl flex items-center justify-center shrink-0">
                      O-
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-200">{language === 'bn' ? 'বেগম মাহমুদা আক্তার' : 'Begum Mahmuda Akhter'}</h4>
                      <p className="text-[10px] font-black text-rose-500 uppercase mt-0.5 tracking-wider">{text.critical}</p>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase font-bold text-amber-500/80 px-2 py-0.5 bg-amber-500/5 border border-amber-500/10 rounded-md">
                    {text.demoCase}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-900">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500">{text.bloodNeeded}</span>
                    <p className="text-sm font-bold text-slate-200 mt-1 font-mono">O- (Negative)</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500">{text.bagsNeeded}</span>
                    <p className="text-sm font-bold text-slate-200 mt-1 font-mono">{language === 'bn' ? '২ ব্যাগ' : '2 Units'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-black uppercase text-slate-500">{text.hospName}</span>
                    <p className="text-xs font-bold text-slate-200 mt-1">
                      {language === 'bn' ? 'জাতীয় হৃদরোগ ইনস্টিটিউট ও হাসপাতাল, শেরেবাংলা নগর, ঢাকা' : 'National Institute of Cardiovascular Diseases, Sher-e-Bangla Nagar, Dhaka'}
                    </p>
                  </div>
                </div>

                {/* Donors Notified Live representation */}
                <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-3 text-xs text-red-400">
                  <Users className="w-4.5 h-4.5 shrink-0" />
                  <p className="leading-snug">
                    <span className="font-extrabold">{language === 'bn' ? '১২' : '12'}</span> {text.notifiedDesc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{text.timeSince}: {text.timeMin}</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="tel:01711234567"
                      className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl shadow transition duration-200 cursor-pointer touch-target"
                    >
                      {text.callNow}
                    </a>
                    <button
                      onClick={() => handleShareCase({ bloodGroup: 'O-', hospitalName: 'NICVD, Dhaka', contactPhone: '01711234567', id: 'demo-o-neg' })}
                      className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl hover:border-slate-700 transition cursor-pointer touch-target"
                      title={text.shareText}
                    >
                      {copiedId === 'share-demo-o-neg' ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Emergency Hotlines Directory Cards */}
      <section className="space-y-6 text-left">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Phone className="w-5 h-5 text-rose-500 fill-rose-500/15" />
          <span>{text.contactTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group relative overflow-hidden"
            >
              {/* Highlight overlay */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-black text-rose-500 tracking-wider bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/10">
                      {contact.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-2 truncate">
                      {language === 'bn' ? contact.nameBn : contact.nameEn}
                    </h4>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-855 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-rose-500 group-hover:bg-slate-900 transition-all duration-300">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-normal min-h-[3.5rem]">
                  {language === 'bn' ? contact.descBn : contact.descEn}
                </p>

                <p className="text-base font-black text-slate-200 tracking-tight font-mono">
                  {language === 'bn' ? contact.phone.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : contact.phone}
                </p>
              </div>

              <div className="border-t border-slate-850/60 pt-4 mt-4 flex gap-3">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950/20 transition flex items-center justify-center gap-1.5 cursor-pointer touch-target"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{text.callNow}</span>
                </a>
                <button
                  onClick={() => handleCopy(contact.phone, contact.id)}
                  className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 hover:border-slate-750 transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer touch-target"
                >
                  {copiedId === contact.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-extrabold">{text.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{text.copyNum}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
