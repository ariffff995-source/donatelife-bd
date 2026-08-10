'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { User } from '../types';
import {
  Search,
  UserCheck,
  Phone,
  Check,
  MapPin,
  Calendar,
  Heart,
  ShieldAlert,
  Copy,
  AlertTriangle,
  RefreshCw,
  X,
  Facebook,
  ExternalLink,
  ShieldCheck,
  Users,
  Award,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchViewProps {
  currentUser: User | null;
  initialFilters?: {
    bloodGroup?: string;
    division?: string;
    district?: string;
    upazila?: string;
    availableOnly?: boolean;
  };
  onFiltersChange?: (filters: any) => void;
}

interface PublicDonor {
  donorId: string;
  name: string;
  avatarUrl: string | null;
  bloodGroup: string;
  division: string;
  district: string;
  upazila: string;
  gender: string;
  isAvailable: boolean;
  isVerified: boolean;
  totalDonations: number;
  lastDonationDate: string | null;
  nextEligibleDate: string | null;
  isEligibleNow: boolean;
  showPhone: boolean;
  phone: string | null;
  showFacebook: boolean;
  facebookUrl: string | null;
  createdAt: string;
}

interface DirectoryStats {
  totalDonors: number;
  verifiedDonors: number;
  availableDonors: number;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function SearchView({ currentUser, initialFilters }: SearchViewProps) {
  const { language, t } = useLanguage();

  // Search Query State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Data States
  const [donors, setDonors] = useState<PublicDonor[]>([]);
  const [stats, setStats] = useState<DirectoryStats>({
    totalDonors: 0,
    verifiedDonors: 0,
    availableDonors: 0,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });

  // UI Loading States
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State for viewing public profile details
  const [selectedDonor, setSelectedDonor] = useState<PublicDonor | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  // Fetch Public Donors from Backend API
  const fetchDonors = useCallback(
    async (queryTerm: string, pageNum: number, append = false, isManualRefresh = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const res = await api.donors.search(
          {
            q: queryTerm,
            page: pageNum,
            limit: 12,
            public: true,
          },
          { forceRefresh: isManualRefresh }
        );

        // Handle structured JSON response
        const newDonors: PublicDonor[] = Array.isArray(res) ? res : res?.donors || [];
        const newStats: DirectoryStats = res?.stats || {
          totalDonors: newDonors.length,
          verifiedDonors: newDonors.filter((d: any) => d.isVerified).length,
          availableDonors: newDonors.filter((d: any) => d.isAvailable).length,
        };
        const newPagination: PaginationState = res?.pagination || {
          page: pageNum,
          limit: 12,
          total: newDonors.length,
          totalPages: 1,
          hasMore: false,
        };

        if (append) {
          setDonors(prev => [...prev, ...newDonors]);
        } else {
          setDonors(newDonors);
        }

        setStats(newStats);
        setPagination(newPagination);

        if (isManualRefresh) {
          const msg =
            language === 'bn'
              ? `রক্তদাতা তালিকা আপডেট করা হয়েছে (${newPagination.total} জন রক্তদাতা)`
              : `Directory refreshed successfully! (${newPagination.total} public donors)`;
          showToast(msg, 'success');
        }
      } catch (err: any) {
        console.error('Failed to fetch donors directory:', err);
        const errorMsg =
          err.message ||
          (language === 'bn'
            ? 'রক্তদাতা তালিকা লোড করতে ব্যর্থ হয়েছে।'
            : 'Failed to load public donor directory.');
        setError(errorMsg);
        if (isManualRefresh) {
          showToast(errorMsg, 'error');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [language, showToast]
  );

  // Trigger search when debounced query changes
  useEffect(() => {
    fetchDonors(debouncedQuery, 1, false, false);
  }, [debouncedQuery, fetchDonors]);

  // Load next page of donors (Infinite scroll / Pagination)
  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchDonors(debouncedQuery, pagination.page + 1, true, false);
    }
  };

  const handleRefresh = () => {
    if (loading) return;
    fetchDonors(debouncedQuery, 1, false, true);
  };

  const handleCopyNumber = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick Suggestion Search Chips
  const quickSearchChips = ['O+', 'A+', 'B+', 'AB+', 'O-', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 max-w-md w-full shadow-2xl px-4 sm:px-0 pointer-events-auto"
          >
            <div
              className={`p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between gap-3 text-xs font-bold shadow-xl ${
                toast.type === 'success'
                  ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40'
                  : 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-rose-950/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {toast.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => setToast(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'যাচাইকৃত জাতীয় রক্তদাতা ডাটাবেজ' : 'Verified National Donor Registry'}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">
            {language === 'bn' ? 'পাবলিক রক্তদাতা ডিরেক্টরি' : 'Public Donor Directory'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {language === 'bn'
              ? 'নিবন্ধিত সকল রক্তদাতার তথ্য সরাসরি অনুসন্ধান করুন। রক্তের গ্রুপ, বিভাগ বা জেলার নাম লিখে খুঁজুন।'
              : 'Browse all registered voluntary blood donors across Bangladesh. Search instantly by Blood Group, Division, District, or Donor ID.'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto shrink-0 shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          <span>{loading ? (language === 'bn' ? 'রিফ্রেশ হচ্ছে...' : 'Refreshing...') : (language === 'bn' ? 'রিফ্রেশ তালিকা' : 'Refresh Roster')}</span>
        </button>
      </div>

      {/* Requirement 9: Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Registered Donors */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 text-left flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full filter blur-xl group-hover:bg-indigo-500/10 transition"></div>
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {language === 'bn' ? 'মোট নিবন্ধিত রক্তদাতা' : 'Total Registered Donors'}
            </p>
            <h3 className="text-2xl font-black text-slate-100 tracking-tight">
              {stats.totalDonors.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-500">
              {language === 'bn' ? 'নিবন্ধিত সাধারণ ব্যবহারকারী' : 'Active public donors'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Verified Donors */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 text-left flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl group-hover:bg-emerald-500/10 transition"></div>
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {language === 'bn' ? 'যাচাইকৃত রক্তদাতা' : 'Verified Donors'}
            </p>
            <h3 className="text-2xl font-black text-emerald-400 tracking-tight">
              {stats.verifiedDonors.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-500">
              {language === 'bn' ? 'পরিচয় যাচাই সম্পূর্ণ' : 'Identity verified'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Available Donors */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 text-left flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full filter blur-xl group-hover:bg-rose-500/10 transition"></div>
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {language === 'bn' ? 'জরুরি প্রস্তুত রক্তদাতা' : 'Available Donors'}
            </p>
            <h3 className="text-2xl font-black text-rose-400 tracking-tight">
              {stats.availableDonors.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-500">
              {language === 'bn' ? 'রক্তদানে বর্তমানে প্রস্তুত' : 'Ready for emergency call'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 fill-rose-500/20" />
          </div>
        </div>
      </div>

      {/* Requirements 2 & 3: Powerful Real-time Search Box (Debounced 300ms) */}
      <div className="bg-slate-900 border border-slate-800/90 p-5 rounded-3xl space-y-4 shadow-xl text-left relative overflow-hidden">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'রক্তের গ্রুপ (যেমন A+, O-), বিভাগ, জেলা বা রক্তদাতার নাম দিয়ে খুঁজুন...'
                : 'Search donors by Blood Group (e.g. A+, O-), Division, District, Name, or Donor ID...'
            }
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold pl-12 pr-10 py-4 rounded-2xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/40 transition placeholder:text-slate-500"
            aria-label="Search blood donors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 transition rounded-lg hover:bg-slate-800"
              title="Clear Search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1">
            {language === 'bn' ? 'দ্রুত ফিল্টার:' : 'Quick Filters:'}
          </span>
          {quickSearchChips.map(chip => (
            <button
              key={chip}
              onClick={() => setSearchQuery(chip === searchQuery ? '' : chip)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                searchQuery.toLowerCase() === chip.toLowerCase()
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header / Counter */}
      <div className="flex justify-between items-center text-xs text-slate-400 px-1">
        <span>
          {searchQuery ? (
            <>
              {language === 'bn' ? 'অনুসন্ধান ফলাফল:' : 'Matching results for'}{' '}
              <strong className="text-rose-400">"{searchQuery}"</strong> (
              <strong className="text-slate-200">{pagination.total}</strong>{' '}
              {language === 'bn' ? 'জন' : 'donors'})
            </>
          ) : (
            <>
              {language === 'bn' ? 'সর্বমোট রক্তদাতা:' : 'Showing all registered donors:'}{' '}
              <strong className="text-rose-400">{pagination.total}</strong>
            </>
          )}
        </span>

        {error && <span className="text-rose-400 font-bold">{error}</span>}
      </div>

      {/* Requirement 4 & 6: Donors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div
              key={n}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-64 animate-pulse flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 py-3">
                <div className="h-3 bg-slate-800 rounded w-full"></div>
                <div className="h-3 bg-slate-800 rounded w-4/5"></div>
              </div>
              <div className="h-10 bg-slate-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-slate-200 font-extrabold text-base">
            {language === 'bn' ? 'কোন রক্তদাতা পাওয়া যায়নি' : 'No Donors Found'}
          </h4>
          <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? language === 'bn'
                ? `"${searchQuery}" এর সাথে মিলে এমন কোনো রক্তদাতা পাওয়া যায়নি। দয়া করে অনুসন্ধানের শব্দ পরিবর্তন করুন।`
                : `No registered blood donors matched "${searchQuery}". Try searching with a broader location or blood group.`
              : language === 'bn'
              ? 'বর্তমানে কোনো রক্তদাতা নিবন্ধিত নেই।'
              : 'No registered blood donors found in system database.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              {language === 'bn' ? 'অনুসন্ধান মুছুন' : 'Clear Search Query'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map(donor => (
            <div
              key={donor.donorId}
              className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 hover:shadow-2xl transition-all duration-300 text-left shadow-lg space-y-4 relative overflow-hidden flex flex-col justify-between group"
            >
              {/* Header: Photo, Name, Donor ID & Availability */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  {donor.avatarUrl ? (
                    <img
                      src={donor.avatarUrl}
                      alt={donor.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow-md shrink-0 bg-slate-950"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-black text-sm uppercase shrink-0 shadow-inner">
                      {donor.name
                        ? donor.name
                            .split(' ')
                            .map(n => n[0])
                            .slice(0, 2)
                            .join('')
                        : 'U'}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1">
                        {donor.name}
                      </h4>
                      {donor.isVerified && (
                        <span title="Verified Donor">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 font-bold">
                      {donor.donorId}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      {donor.upazila ? `${donor.upazila}, ` : ''}
                      {donor.district}, {donor.division}
                    </p>
                  </div>
                </div>

                {/* Availability Badge */}
                <span
                  className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase shrink-0 border tracking-wider ${
                    donor.isAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-950/20'
                      : 'bg-slate-800/80 text-slate-500 border-slate-800'
                  }`}
                >
                  {donor.isAvailable
                    ? language === 'bn'
                      ? 'প্রস্তুত'
                      : 'Available'
                    : language === 'bn'
                    ? 'বিশ্রামে'
                    : 'Resting'}
                </span>
              </div>

              {/* Public Information Grid */}
              <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-3">
                  {/* Blood Group */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                      {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                    </span>
                    <span className="text-sm font-black text-rose-500">
                      {donor.bloodGroup}
                    </span>
                  </div>

                  {/* Total Donations */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                      {language === 'bn' ? 'মোট রক্তদান' : 'Total Donations'}
                    </span>
                    <span className="text-xs font-black text-slate-200">
                      {donor.totalDonations}{' '}
                      {language === 'bn'
                        ? 'বার'
                        : donor.totalDonations === 1
                        ? 'time'
                        : 'times'}
                    </span>
                  </div>

                  {/* Last Donation Date */}
                  <div className="flex flex-col gap-0.5 col-span-2 border-t border-slate-800/40 pt-2">
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                      {language === 'bn' ? 'সর্বশেষ রক্তদান' : 'Last Donation'}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {donor.lastDonationDate ? (
                        new Date(donor.lastDonationDate).toLocaleDateString(
                          language === 'bn' ? 'bn-BD' : 'en-US',
                          { day: 'numeric', month: 'short', year: 'numeric' }
                        )
                      ) : (
                        <span className="text-slate-500 font-bold">
                          {language === 'bn' ? 'কখনো রক্তদান করেননি' : 'Never donated'}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Next Eligible Donation Date */}
                  <div className="flex flex-col gap-0.5 col-span-2 border-t border-slate-800/40 pt-2">
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                      {language === 'bn' ? 'পরবর্তী রক্তদানের সম্ভাব্য তারিখ' : 'Next Eligible Date'}
                    </span>
                    <span className="text-xs font-bold">
                      {donor.isEligibleNow ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          {language === 'bn' ? 'এখনই রক্তদানে সক্ষম' : 'Eligible Now'}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold">
                          {donor.nextEligibleDate
                            ? new Date(donor.nextEligibleDate).toLocaleDateString(
                                language === 'bn' ? 'bn-BD' : 'en-US',
                                { day: 'numeric', month: 'short', year: 'numeric' }
                              )
                            : language === 'bn'
                            ? 'প্রক্রিয়াধীন'
                            : 'Pending'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Profile Action */}
              <button
                onClick={() => setSelectedDonor(donor)}
                className="w-full bg-slate-950 hover:bg-slate-800 text-rose-400 hover:text-rose-300 text-xs font-bold py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'প্রোফাইল দেখুন' : 'View Public Profile'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Requirement 10: Server-side Pagination / Load More */}
      {pagination.hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-extrabold uppercase tracking-wider rounded-2xl transition shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                <span>{language === 'bn' ? 'লোড হচ্ছে...' : 'Loading More Donors...'}</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-rose-400" />
                <span>
                  {language === 'bn'
                    ? `আরও রক্তদাতা দেখুন (${donors.length} / ${pagination.total})`
                    : `Load More Donors (${donors.length} of ${pagination.total})`}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Requirement 6 & 7: View Public Profile Modal */}
      <AnimatePresence>
        {selectedDonor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDonor(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full relative z-10 text-left space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-rose-300 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                  Public Donor Profile
                </h4>
                <button
                  onClick={() => setSelectedDonor(null)}
                  className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Card Header */}
              <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-black text-xl text-rose-400 shrink-0">
                  {selectedDonor.bloodGroup}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-base font-black text-slate-100">
                      {selectedDonor.name}
                    </h5>
                    {selectedDonor.isVerified && (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 font-bold">
                    Donor ID: {selectedDonor.donorId}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedDonor.upazila ? `${selectedDonor.upazila}, ` : ''}
                    {selectedDonor.district}, {selectedDonor.division}
                  </p>
                </div>
              </div>

              {/* Ethical Warning */}
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-2 items-start text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Emergency Contact Protocol:</strong> Please contact voluntary blood donors strictly for genuine medical emergencies. Respect donor privacy and rest hours.
                </p>
              </div>

              {/* Phone Showcase / Privacy Notice */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {language === 'bn' ? 'যোগাযোগের মাধ্যম' : 'Contact Details'}
                </p>

                {selectedDonor.showPhone && selectedDonor.phone ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-base font-black text-slate-100 select-all tracking-wide">
                      {selectedDonor.phone}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleCopyNumber(selectedDonor.phone!)}
                        className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition cursor-pointer"
                        title="Copy Phone Number"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={`tel:${selectedDonor.phone}`}
                        className="p-2 text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-md flex items-center justify-center cursor-pointer"
                        title="Dial Phone"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {language === 'bn'
                        ? 'রক্তদাতা মোবাইল নম্বর গোপনীয় রেখেছেন। জরুরি অনুরোধ পোস্ট করে মেসেজ পাঠান।'
                        : 'Phone number kept private by donor. Create an Emergency Request to broadcast notifications.'}
                    </span>
                  </div>
                )}
              </div>

              {/* Facebook Profile Link */}
              {selectedDonor.showFacebook && selectedDonor.facebookUrl && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {language === 'bn' ? 'ফেসবুক প্রোফাইল' : 'Facebook Profile'}
                  </p>
                  <a
                    href={
                      selectedDonor.facebookUrl.startsWith('http')
                        ? selectedDonor.facebookUrl
                        : `https://${
                            selectedDonor.facebookUrl.includes('facebook.com')
                              ? ''
                              : 'www.facebook.com/'
                          }${selectedDonor.facebookUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 px-4 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 rounded-xl border border-[#1877F2]/30 text-[#1877F2] transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      <span className="text-xs font-bold text-slate-200">
                        {language === 'bn' ? 'ফেসবুক লিংক খুলুন' : 'Visit Facebook Profile'}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <button
                onClick={() => setSelectedDonor(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-3 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close Profile'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
