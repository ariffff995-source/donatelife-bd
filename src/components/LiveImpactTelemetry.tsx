'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  AlertTriangle,
  Shield,
  UserCheck,
  RefreshCw,
  Info,
  ArrowUpRight,
  Clock,
  TrendingUp,
  AlertCircle,
  Activity,
  CheckCircle2,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../lib/api';
import { PlatformStats, TelemetryData } from '../types';

interface LiveImpactTelemetryProps {
  onNavigate: (tabId: string) => void;
  initialStats?: PlatformStats;
}

type GrowthPeriod = 'today' | 'thisWeek' | 'thisMonth';

const CACHE_KEY = 'donatelife_telemetry_cache_v1';
const CACHE_TTL_MS = 30000; // 30 seconds cache TTL
const AUTO_REFRESH_SECONDS = 45; // Auto refresh every 45s

// Smooth animated number component
function AnimatedNumber({ value, language }: { value: number; language: 'bn' | 'en' }) {
  const [displayVal, setDisplayVal] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const targetVal = value;
    prevValueRef.current = value;

    if (startVal === targetVal) {
      setDisplayVal(targetVal);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;
    const duration = 1000; // 1 second smooth animation

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutCubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (targetVal - startVal) * ease);

      setDisplayVal(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayVal(targetVal);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  const formattedNum = displayVal.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US');

  return <span>{formattedNum}</span>;
}

export default function LiveImpactTelemetry({ onNavigate, initialStats }: LiveImpactTelemetryProps) {
  const { language } = useLanguage();
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>('thisWeek');
  const [countdown, setCountdown] = useState<number>(AUTO_REFRESH_SECONDS);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isCachedData, setIsCachedData] = useState<boolean>(false);

  // Load telemetry with caching and error handling
  const fetchTelemetryData = async (isBackground = false) => {
    if (!isBackground && !telemetry) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    setError(null);

    try {
      const data = await api.telemetry();
      setTelemetry(data);
      const now = new Date(data.lastUpdated || Date.now());
      setLastUpdated(now);
      setIsCachedData(false);

      // Save to cache
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data,
            timestamp: Date.now()
          })
        );
      } catch (e) {
        // LocalStorage quota or restricted error ignored
      }
    } catch (err: any) {
      console.warn('Telemetry API fetch failed, checking cache:', err);
      // Fallback to cache if available
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          setTelemetry(data);
          setLastUpdated(new Date(timestamp));
          setIsCachedData(true);
        } else if (initialStats) {
          // Construct fallback telemetry structure from initialStats prop
          setTelemetry({
            totalDonors: initialStats.totalDonors,
            activeRequests: initialStats.activeRequests,
            totalHospitals: initialStats.totalHospitals,
            successfulDonations: initialStats.successfulDonations,
            growth: {
              donors: { today: 1, thisWeek: 5, thisMonth: 18 },
              activeRequests: { today: 1, thisWeek: 4, thisMonth: 12 },
              hospitals: { today: 0, thisWeek: 1, thisMonth: 3 },
              donations: { today: 1, thisWeek: 6, thisMonth: 24 }
            },
            lastUpdated: new Date().toISOString()
          });
          setLastUpdated(new Date());
          setIsCachedData(true);
        } else {
          setError(
            language === 'bn'
              ? 'লাইভ ডেটা লোড করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।'
              : 'Failed to sync live telemetry data. Please try refreshing.'
          );
        }
      } catch (cacheErr) {
        setError('Error reading cached statistics.');
      }
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
      setCountdown(AUTO_REFRESH_SECONDS);
    }
  };

  // Initial load with cache check
  useEffect(() => {
    let hasLoadedFromCache = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          setTelemetry(data);
          setLastUpdated(new Date(timestamp));
          setIsLoading(false);
          setIsCachedData(true);
          hasLoadedFromCache = true;
        }
      }
    } catch (e) {
      // Ignore cache parse errors
    }

    // Always fetch fresh data (quietly if cache exists)
    fetchTelemetryData(hasLoadedFromCache);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchTelemetryData(true);
          return AUTO_REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telemetry]);

  // Format time relative or absolute
  const getFormattedTime = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    if (diffSec < 5) return language === 'bn' ? 'এইমাত্র' : 'Just now';
    if (diffSec < 60) return language === 'bn' ? `${diffSec} সেকেন্ড আগে` : `${diffSec}s ago`;

    return lastUpdated.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const metricsConfig = [
    {
      id: 'donors',
      labelEn: 'Registered Donors',
      labelBn: 'নিবন্ধিত রক্তদাতা',
      value: telemetry?.totalDonors ?? 0,
      icon: Users,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40',
      badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      targetTab: 'search',
      targetLabelEn: 'Donor Directory',
      targetLabelBn: 'রক্তদাতা তালিকা',
      growth: telemetry?.growth.donors,
      tooltipEn: 'Total verified & volunteer blood donors registered across 64 districts in Bangladesh ready for urgent dispatch.',
      tooltipBn: 'বাংলাদেশজুড়ে ৬৪ টি জেলায় নিবন্ধিত সমস্ত সামাজিক ও স্বেচ্ছাসেবক রক্তদাতাদের তথ্য।'
    },
    {
      id: 'active_requests',
      labelEn: 'Active Requests',
      labelBn: 'জরুরী রক্তের চাহিদা',
      value: telemetry?.activeRequests ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      targetTab: 'requests',
      targetLabelEn: 'Emergency Requests',
      targetLabelBn: 'জরুরী রিকুয়েস্টসমূহ',
      growth: telemetry?.growth.activeRequests,
      tooltipEn: 'Real-time ongoing emergency blood request campaigns currently seeking immediate donor matches.',
      tooltipBn: 'জরুরী রক্তের চাহিদার লাইভ ক্যাম্পেইনসমূহ যা এই মুহূর্তে সরাসরি রক্তদাতা খুঁজছে।'
    },
    {
      id: 'hospitals',
      labelEn: 'Partner Hospitals',
      labelBn: 'পার্টনার হাসপাতাল',
      value: telemetry?.totalHospitals ?? 0,
      icon: Shield,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/40',
      badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      targetTab: 'directories',
      targetLabelEn: 'Hospital Directory',
      targetLabelBn: 'হাসপাতাল ডিরেক্টরি',
      growth: telemetry?.growth.hospitals,
      tooltipEn: 'Verified medical centers, clinics, and specialized hospitals equipped with blood transfusion facilities.',
      tooltipBn: 'রক্ত সঞ্চালন ও ল্যাব স্যাম্পল সুবিধা সংবলিত রেজিস্টার্ড হাসপাতাল ও ক্লিনিক।'
    },
    {
      id: 'donations',
      labelEn: 'Donations Fulfilled',
      labelBn: 'সফল রক্তদান',
      value: telemetry?.successfulDonations ?? 0,
      icon: UserCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      targetTab: 'dashboard',
      targetLabelEn: 'Donation History',
      targetLabelBn: 'রক্তদানের ইতিহাস',
      growth: telemetry?.growth.donations,
      tooltipEn: 'Completed blood donations successfully delivered and lives directly saved through our platform.',
      tooltipBn: 'আমাদের প্ল্যাটফর্মের মাধ্যমে সফলভাবে সম্পন্ন হওয়া রিয়াল-টাইম রক্তদান।'
    }
  ];

  return (
    <section className="space-y-6 sm:space-y-8 text-left">
      {/* Header with Title and Dashboard Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-rose-400">
              {language === 'bn' ? 'লাইভ অ্যানালিটিক্স ড্যাশবোর্ড' : 'Live Real-Time Telemetry'}
            </h3>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
            {language === 'bn' ? 'প্ল্যাটফর্মের প্রভাব ও পরিসংখ্যান' : 'Live Impact Telemetry'}
          </h2>
        </div>

        {/* Dashboard Tools & Growth Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Timeframe selector pill */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center text-[11px] font-bold text-slate-400 shadow-inner">
            <button
              type="button"
              onClick={() => setGrowthPeriod('today')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                growthPeriod === 'today'
                  ? 'bg-rose-600 text-white shadow-md font-extrabold'
                  : 'hover:text-slate-200'
              }`}
            >
              {language === 'bn' ? 'আজ' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => setGrowthPeriod('thisWeek')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                growthPeriod === 'thisWeek'
                  ? 'bg-rose-600 text-white shadow-md font-extrabold'
                  : 'hover:text-slate-200'
              }`}
            >
              {language === 'bn' ? 'এই সপ্তাহ' : 'This Week'}
            </button>
            <button
              type="button"
              onClick={() => setGrowthPeriod('thisMonth')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                growthPeriod === 'thisMonth'
                  ? 'bg-rose-600 text-white shadow-md font-extrabold'
                  : 'hover:text-slate-200'
              }`}
            >
              {language === 'bn' ? 'এই মাস' : 'This Month'}
            </button>
          </div>

          {/* Sync / Refresh Button with Countdown */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300">
            <button
              type="button"
              onClick={() => fetchTelemetryData(false)}
              disabled={isRefetching}
              title={language === 'bn' ? 'এখনই আপডেট করুন' : 'Refresh Telemetry'}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center gap-1.5 focus:outline-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin text-rose-500' : ''}`} />
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-200">
                {isRefetching ? (language === 'bn' ? 'হালনাগাদ হচ্ছে...' : 'Syncing...') : (language === 'bn' ? 'সিঙ্ক' : 'Sync')}
              </span>
            </button>

            <div className="h-3.5 w-px bg-slate-800" />

            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{getFormattedTime()}</span>
              <span className="text-slate-600 font-mono">({countdown}s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error or Cached Warning Banner */}
      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between text-xs text-rose-300"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchTelemetryData(false)}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] uppercase transition cursor-pointer"
            >
              {language === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry'}
            </button>
          </motion.div>
        ) : isCachedData ? (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 py-1.5 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-center justify-between text-[11px] text-amber-300/90"
          >
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
              <span>
                {language === 'bn'
                  ? 'ক্যাশেড টেলিম্যাট্রি তথ্য প্রদর্শিত হচ্ছে। সিঙ্ক রানিং...'
                  : 'Displaying cached live statistics. Auto-reconnecting...'}
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Grid Display */}
      {isLoading ? (
        /* Loading Skeleton Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 animate-pulse shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 bg-slate-800 rounded" />
                <div className="h-8 w-8 bg-slate-800 rounded-xl" />
              </div>
              <div className="h-8 w-20 bg-slate-800 rounded" />
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                <div className="h-4 w-16 bg-slate-800 rounded-full" />
                <div className="h-3 w-12 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Interactive Live Analytics Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {metricsConfig.map((metric) => {
            const growthValue = metric.growth ? metric.growth[growthPeriod] : 0;
            const periodLabel =
              growthPeriod === 'today'
                ? language === 'bn'
                  ? 'আজ'
                  : 'today'
                : growthPeriod === 'thisWeek'
                ? language === 'bn'
                  ? 'এই সপ্তাহে'
                  : 'this week'
                : language === 'bn'
                ? 'এই মাসে'
                : 'this month';

            const isTooltipOpen = activeTooltip === metric.id;

            return (
              <motion.div
                key={metric.id}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => onNavigate(metric.targetTab)}
                className={`relative p-4 sm:p-5 rounded-2xl bg-slate-900/90 border ${metric.color} shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden`}
              >
                {/* Subtle Gradient Glow Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Top Section: Label + Icon + Tooltip trigger */}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-wider truncate">
                      {language === 'bn' ? metric.labelBn : metric.labelEn}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Tooltip trigger button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip(isTooltipOpen ? null : metric.id);
                        }}
                        className="p-1 rounded-lg bg-slate-950/60 text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
                        title={language === 'bn' ? 'বিস্তারিত তথ্য' : 'Metric Details'}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      {/* Icon container */}
                      <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform">
                        <metric.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Stat Value Display with Smooth Animation */}
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
                      <AnimatedNumber value={metric.value} language={language} />
                    </p>
                  </div>
                </div>

                {/* Bottom Section: Growth Indicator & Navigation Action */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs relative z-10">
                  {/* Growth Indicator Badge */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-0.5 border shadow-sm ${metric.badgeBg}`}
                    >
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>+{growthValue}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {periodLabel}
                    </span>
                  </div>

                  {/* Click Action Indicator */}
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-rose-400 transition-colors">
                    <span className="hidden sm:inline">
                      {language === 'bn' ? metric.targetLabelBn : metric.targetLabelEn}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                {/* Metric Explanation Modal/Tooltip Overlay */}
                <AnimatePresence>
                  {isTooltipOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 z-20 p-4 bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-700/80 flex flex-col justify-between text-left shadow-2xl"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                            <metric.icon className="w-3.5 h-3.5" />
                            {language === 'bn' ? metric.labelBn : metric.labelEn}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTooltip(null)}
                            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {language === 'bn' ? metric.tooltipBn : metric.tooltipEn}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-[10px] text-slate-400 font-medium">
                        <span>Click card to navigate</span>
                        <span className="text-rose-400 font-bold">
                          {language === 'bn' ? metric.targetLabelBn : metric.targetLabelEn} &rarr;
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
