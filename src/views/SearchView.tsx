'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { BloodGroup, User } from '../types';
import LocationSelector from '../components/LocationSelector';
import {
  Phone,
  Check,
  MapPin,
  Heart,
  ShieldAlert,
  Copy,
  AlertTriangle,
  RefreshCw,
  X,
  Facebook,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchViewProps {
  currentUser: User | null;
  initialFilters?: {
    bloodGroup?: BloodGroup | '';
    division?: string;
    district?: string;
    upazila?: string;
    policeStation?: string;
    fullAddress?: string;
    availableOnly?: boolean;
  };
  onFiltersChange?: (filters: any) => void;
}

const getGenderLabel = (d: User | any, language: 'en' | 'bn') => {
  if (d.gender === 'female') {
    return language === 'bn' ? 'মহিলা' : 'Female';
  }
  if (d.gender === 'other') {
    return language === 'bn' ? 'অন্যান্য' : 'Other';
  }
  return language === 'bn' ? 'পুরুষ' : 'Male';
};

export default function SearchView({ currentUser, initialFilters, onFiltersChange }: SearchViewProps) {
  const { language, formatLocation } = useLanguage();
  const [donors, setDonors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [filters, setFilters] = useState({
    bloodGroup: (initialFilters?.bloodGroup || '') as BloodGroup | '',
    division: initialFilters?.division || '',
    district: initialFilters?.district || '',
    upazila: initialFilters?.upazila || '',
    policeStation: initialFilters?.policeStation || '',
    fullAddress: initialFilters?.fullAddress || '',
    availableOnly: initialFilters?.availableOnly !== undefined ? initialFilters.availableOnly : true
  });

  // Sync if initialFilters changes
  useEffect(() => {
    if (initialFilters) {
      setFilters({
        bloodGroup: initialFilters.bloodGroup || '',
        division: initialFilters.division || '',
        district: initialFilters.district || '',
        upazila: initialFilters.upazila || '',
        policeStation: initialFilters.policeStation || '',
        fullAddress: initialFilters.fullAddress || '',
        availableOnly: initialFilters.availableOnly !== undefined ? initialFilters.availableOnly : true
      });
    }
  }, [initialFilters]);

  // Update parent filters if callback exists
  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Modal State for contacting donor
  const [selectedDonor, setSelectedDonor] = useState<User | any | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  const handleLocationChange = (field: 'division' | 'district' | 'upazila' | 'policeStation' | 'fullAddress' | 'bloodGroup', value: string) => {
    setFilters(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'division') {
        updated.district = '';
        updated.upazila = '';
        updated.policeStation = '';
      } else if (field === 'district') {
        updated.upazila = '';
        updated.policeStation = '';
      } else if (field === 'upazila') {
        updated.policeStation = '';
      }
      if (onFiltersChange) {
        onFiltersChange(updated);
      }
      return updated;
    });
  };

  const fetchDonors = useCallback(async (isManualRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.donors.search(filters, { forceRefresh: isManualRefresh });
      const donorArray = Array.isArray(list) ? list : (list?.donors || []);
      setDonors(donorArray);

      if (isManualRefresh) {
        const count = donorArray.length;
        const msg = language === 'bn'
          ? `রক্তদাতা তালিকা সফলভাবে রিফ্রেশ করা হয়েছে (${count} জন সংগতিপূর্ণ)`
          : `Donor directory refreshed successfully! (${count} matching donor${count === 1 ? '' : 's'} found)`;
        showToast(msg, 'success');
      }
    } catch (err: any) {
      const errorMsg = err.message || (language === 'bn' ? 'রক্তদাতা অনুসন্ধান ব্যর্থ হয়েছে।' : 'Failed to search donors.');
      setError(errorMsg);
      if (isManualRefresh) {
        showToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, language, showToast]);

  const handleRefresh = () => {
    if (loading) return;
    fetchDonors(true);
  };

  // Auto-search on filter change
  useEffect(() => {
    fetchDonors(false);
  }, [fetchDonors]);

  const handleCopyNumber = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 relative">
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

      {/* Title Header */}
      <div className="text-left">
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          {language === 'bn' ? 'রক্তদাতা অনুসন্ধান কেন্দ্র' : 'Smart Voluntary Donor Directory'}
        </h1>
        <p className="text-xs text-slate-400">
          {language === 'bn'
            ? 'বাংলাদেশের ৬৪ জেলা ও উপজেলায় যাচাইকৃত রক্তদাতা খুঁজুন।'
            : 'Search verified voluntary donors in Bangladesh with high-precision location filtering.'}
        </p>
      </div>

      {/* Filter Panel (Glassmorphic card) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-rose-300">Filtering Parameters</h3>

        <LocationSelector
          division={filters.division}
          district={filters.district}
          upazila={filters.upazila}
          bloodGroup={filters.bloodGroup}
          fullAddress={filters.fullAddress}
          onChange={handleLocationChange}
          showBloodGroup={true}
          showFullAddress={true}
          layoutMode="compact-2col"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateFilters({ ...filters, availableOnly: !filters.availableOnly })}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex cursor-pointer ${
                filters.availableOnly ? 'bg-rose-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <motion.div layout className="w-4.5 h-4.5 bg-white rounded-full shadow-sm" />
            </button>
            <span className="text-xs font-bold text-slate-300">
              {language === 'bn' ? 'শুধুমাত্র সক্রিয় রক্তদাতা প্রদর্শন করুন' : 'Show Available Donors Only'}
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="w-full sm:w-auto h-[50px] px-6 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 text-xs font-bold uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-2 border border-slate-700/80 shrink-0 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            {loading
              ? language === 'bn'
                ? 'রিফ্রেশ হচ্ছে...'
                : 'Refreshing...'
              : language === 'bn'
              ? 'রিফ্রেশ তালিকা'
              : 'Refresh Roster'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">
            Search returned <strong className="text-rose-400">{donors.length}</strong> matching donors
          </span>
          {error && <span className="text-red-400 font-medium">{error}</span>}
        </div>

        {donors.length === 0 ? (
          <div className="text-center py-24 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-slate-300 font-bold text-sm">No Matching Donors Found</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-normal">
              Try broadening your location scope (e.g. searching at District level instead of Upazila) or checking the "Show Available Donors Only" filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map(donor => (
              <div
                key={donor.id || (donor as any).donorId}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 hover:shadow-xl transition-all duration-300 text-left shadow-lg space-y-4 relative overflow-hidden flex flex-col justify-between group"
              >
                {/* Header: Avatar, Name, and Availability */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    {/* Profile Photo / Avatar */}
                    {donor.avatarUrl ? (
                      <img
                        src={donor.avatarUrl}
                        alt={donor.name}
                        className="w-12 h-12 rounded-full object-cover border border-slate-700 shadow-md shrink-0 bg-slate-950"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-extrabold text-sm uppercase shrink-0 shadow-inner">
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
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-rose-400 transition-colors line-clamp-1">
                        {donor.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                        {formatLocation(donor)}
                      </p>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 border tracking-wider ${
                      donor.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800/85 text-slate-500 border-slate-800'
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

                {/* Donor Information Section */}
                <div className="space-y-2 text-xs text-slate-300 bg-slate-950/45 p-3.5 rounded-xl border border-slate-800/60">
                  {/* Verification Status */}
                  {(donor.isVerified || (donor as any).isDonorVerified || (donor as any).verificationStatus === 'approved') && (
                    <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold uppercase tracking-wider pb-1.5 border-b border-slate-800/60 mb-2">
                      <ShieldCheck className="w-3.5 h-3.5 fill-emerald-500/10 text-emerald-400" />
                      {language === 'bn' ? 'যাচাইকৃত রক্তদাতা' : 'Verified Donor'}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-3">
                    {/* Blood Group */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                      </span>
                      <span className="text-xs font-black text-rose-500">
                        {donor.bloodGroup}
                      </span>
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        {language === 'bn' ? 'লিঙ্গ' : 'Gender'}
                      </span>
                      <span className="text-xs font-bold text-slate-300">
                        {getGenderLabel(donor, language)}
                      </span>
                    </div>

                    {/* Last Donation Date */}
                    <div className="flex flex-col gap-0.5 col-span-2 border-t border-slate-800/30 pt-1.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        {language === 'bn' ? 'সর্বশেষ রক্তদান' : 'Last Donation'}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        {donor.lastDonationDate ? (
                          new Date(donor.lastDonationDate).toLocaleDateString(
                            language === 'bn' ? 'bn-BD' : 'en-US',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }
                          )
                        ) : (
                          <span className="text-slate-500 font-bold">
                            {language === 'bn' ? 'কখনো রক্তদান করেননি' : 'Never donated'}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Total Donations */}
                    <div className="flex flex-col gap-0.5 col-span-2 border-t border-slate-800/30 pt-1.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        {language === 'bn' ? 'মোট রক্তদান' : 'Total Donations'}
                      </span>
                      <span className="text-xs font-extrabold text-slate-200">
                        {(donor as any).totalDonations !== undefined ? (
                          language === 'bn' ? (
                            `${(donor as any).totalDonations
                              .toString()
                              .replace(/\d/g, (d: string) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)])} বার`
                          ) : (
                            `${(donor as any).totalDonations} ${
                              (donor as any).totalDonations === 1 ? 'time' : 'times'
                            }`
                          )
                        ) : language === 'bn' ? (
                          '০ বার'
                        ) : (
                          '0 times'
                        )}
                      </span>
                    </div>

                    {/* Complete Location Path */}
                    <div className="flex flex-col gap-0.5 col-span-2 border-t border-slate-800/30 pt-1.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        {language === 'bn' ? 'জেলা ও বিভাগ' : 'District & Division'}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {formatLocation(donor)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDonor(donor)}
                    className="flex-1 bg-slate-950 hover:bg-slate-800 text-rose-400 hover:text-rose-300 text-xs font-bold py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'যোগাযোগ করুন' : 'Request Contact'}
                  </button>
                  {donor.facebookUrl && (donor as any).showFacebook !== false && (
                    <a
                      href={
                        donor.facebookUrl.startsWith('http')
                          ? donor.facebookUrl
                          : `https://${
                              donor.facebookUrl.includes('facebook.com') ? '' : 'www.facebook.com/'
                            }${donor.facebookUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 text-[#1877F2] hover:text-[#1877F2]/90 rounded-xl transition flex items-center justify-center shrink-0"
                      title={language === 'bn' ? 'ফেসবুক প্রোফাইল' : 'Facebook Profile'}
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Contact Details Popup Modal */}
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

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full relative z-10 text-left space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-rose-300 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                  Contact Registration Details
                </h4>
                <button
                  onClick={() => setSelectedDonor(null)}
                  className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center font-extrabold text-lg text-rose-400 border border-rose-500/20">
                  {selectedDonor.bloodGroup}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-100">{selectedDonor.name}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">{formatLocation(selectedDonor)}</p>
                </div>
              </div>

              {/* Ethics Warning */}
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-2 items-start text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Ethical Use Only:</strong> Ensure you are contacting this volunteer solely for a genuine, active medical emergency. Avoid calling at extreme times of night unless clinically desperate.
                </p>
              </div>

              {/* Phone number showcase with Privacy Protection */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {language === 'bn' ? 'যোগাযোগের ফোন নম্বর' : 'Verified Contact Number'}
                </p>
                {selectedDonor.phone && selectedDonor.showPhone !== false ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-base font-extrabold text-slate-200 select-all tracking-wide">
                      {selectedDonor.phone}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleCopyNumber(selectedDonor.phone)}
                        className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition cursor-pointer"
                        title="Copy Number"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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

              {/* Optional Facebook profile */}
              {selectedDonor.facebookUrl && selectedDonor.showFacebook !== false && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {language === 'bn' ? 'ফেসবুক প্রোফাইল' : 'Facebook Profile'}
                  </p>
                  <a
                    href={
                      selectedDonor.facebookUrl.startsWith('http')
                        ? selectedDonor.facebookUrl
                        : `https://${
                            selectedDonor.facebookUrl.includes('facebook.com') ? '' : 'www.facebook.com/'
                          }${selectedDonor.facebookUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 px-4 bg-[#1877F2]/5 hover:bg-[#1877F2]/10 rounded-xl border border-[#1877F2]/20 hover:border-[#1877F2]/40 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Facebook className="w-4.5 h-4.5 text-[#1877F2]" />
                      <span className="text-xs font-bold text-slate-200 group-hover:text-slate-100 transition-colors">
                        {selectedDonor.facebookUrl.replace(/^(https?:\/\/)?(www\.)?facebook\.com\//, '')}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#1877F2] hover:underline flex items-center gap-0.5 shrink-0">
                      {language === 'bn' ? 'ভিজিট করুন' : 'Visit Profile'}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                </div>
              )}

              <button
                onClick={() => setSelectedDonor(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-3 rounded-xl border border-slate-700/60 transition cursor-pointer"
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
