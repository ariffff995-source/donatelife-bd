'use client';

import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, Heart, Edit, X, Save, MapPin, Tag, FileText } from 'lucide-react';
import { User } from '../types';
import { api } from '../lib/api';

interface LastDonationCardProps {
  currentUser: User;
  language: 'en' | 'bn';
  donationsCount: number;
  onDonationUpdated: () => Promise<void>;
}

export const LastDonationCard: React.FC<LastDonationCardProps> = ({
  currentUser,
  language,
  donationsCount,
  onDonationUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [donationDate, setDonationDate] = useState(
    currentUser.lastDonationDate || new Date().toISOString().split('T')[0]
  );
  const [donationType, setDonationType] = useState('Whole Blood');
  const [donationLocation, setDonationLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Translations
  const t = {
    cardTitle: language === 'bn' ? 'সর্বশেষ রক্তদান' : 'Last Donation',
    lastDonationDate: language === 'bn' ? 'সর্বশেষ রক্তদানের তারিখ' : 'Last Donation Date',
    totalDonations: language === 'bn' ? 'মোট রক্তদান' : 'Total Donations',
    daysSince: language === 'bn' ? 'রক্তদানহীন অতিবাহিত দিন' : 'Days Since Last Donation',
    nextEligibleDate: language === 'bn' ? 'পরবর্তী রক্তদানের সম্ভাব্য তারিখ' : 'Next Eligible Donation Date',
    eligibilityStatus: language === 'bn' ? 'রক্তদানের যোগ্যতা ও অবস্থা' : 'Donation Eligibility Status',
    
    // Status labels
    eligibleNow: language === 'bn' ? '🟢 এখনই রক্তদানে প্রস্তুত' : '🟢 Eligible to Donate',
    eligibleIn: language === 'bn' ? '🟡 {days} দিন পর রক্তদানে প্রস্তুত' : '🟡 Eligible in {days} Days',
    firstDonationPending: language === 'bn' ? '🟢 এখনই রক্তদানে প্রস্তুত (প্রথম রক্তদান)' : '🟢 Eligible to Donate (First Donation)',
    noDonationRecord: language === 'bn' ? 'কোন রেকর্ড নেই' : 'No recorded donations',
    notApplicable: language === 'bn' ? 'প্রযোজ্য নয়' : 'N/A',

    // Buttons
    btnEdit: language === 'bn' ? '✏️ রক্তদানের তথ্য আপডেট করুন' : '✏️ Edit Last Donation',
    btnSave: language === 'bn' ? '✅ রক্তদান সংরক্ষণ করুন' : '✅ Save Donation',
    btnCancel: language === 'bn' ? '❌ বাতিল' : '❌ Cancel',

    // Form labels
    formTitle: language === 'bn' ? 'রক্তদানের তথ্য আপডেট' : 'Update Last Donation',
    formDateLabel: language === 'bn' ? 'রক্তদানের তারিখ' : 'Last Donation Date',
    formTypeLabel: language === 'bn' ? 'রক্তদানের ধরন' : 'Blood Donation Type',
    formLocationLabel: language === 'bn' ? 'রক্তদানের স্থান / হাসপাতাল (ঐচ্ছিক)' : 'Donation Location (Optional)',
    formNotesLabel: language === 'bn' ? 'অভিজ্ঞতা / মন্তব্য (ঐচ্ছিক)' : 'Notes (Optional)',

    // Blood Types
    typeWhole: language === 'bn' ? 'হোল ব্লাড (Whole Blood)' : 'Whole Blood',
    typePlasma: language === 'bn' ? 'প্লাজমা (Plasma)' : 'Plasma',
    typePlatelets: language === 'bn' ? 'প্লাটিলেট (Platelets)' : 'Platelets',
    typeOthers: language === 'bn' ? 'অন্যান্য (Others)' : 'Others',

    // Validation & Messages
    errFutureDate: language === 'bn' ? 'ভবিষ্যতের তারিখ নির্বাচন করা সম্ভব নয়।' : 'Last donation date cannot be in the future.',
    errInvalidDate: language === 'bn' ? 'অনুগ্রহ করে একটি সঠিক তারিখ নির্বাচন করুন।' : 'Please select a valid last donation date.',
    msgSuccess: language === 'bn' ? 'রক্তদানের তথ্য সফলভাবে সংরক্ষিত ও আপডেট করা হয়েছে!' : 'Donation updated and logged successfully!',
  };

  const toBnNum = (num: number | string) => {
    return String(num).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthsBn = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    if (language === 'bn') {
      return `${toBnNum(day)} ${monthsBn[month]} ${toBnNum(year)}`;
    } else {
      return `${day} ${monthsEn[month]} ${year}`;
    }
  };

  // Recalculate variables
  const lastDonationDateStr = currentUser.lastDonationDate;
  let diffDays = 0;
  let isEligible = true;
  let daysRemaining = 0;
  let nextDateStr = '';

  if (lastDonationDateStr) {
    const lastDate = new Date(lastDonationDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    isEligible = diffDays >= 120;
    daysRemaining = 120 - diffDays;

    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + 120);
    nextDateStr = nextDate.toISOString().split('T')[0];
  }

  const handleEditClick = () => {
    setDonationDate(currentUser.lastDonationDate || new Date().toISOString().split('T')[0]);
    setDonationLocation('');
    setNotes('');
    setError(null);
    setSuccess(null);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!donationDate) {
      setError(t.errInvalidDate);
      setLoading(false);
      return;
    }

    const selectedDate = new Date(donationDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Allow today

    if (selectedDate > today) {
      setError(t.errFutureDate);
      setLoading(false);
      return;
    }

    try {
      // 1. Create a dynamic donation record to PostgreSQL database
      // The backend /api/donations endpoint is used to log user donations
      const payload = {
        recipientName: language === 'bn' ? 'স্বেচ্ছায় রক্তদান' : 'Voluntary Donation',
        bloodGroup: currentUser.bloodGroup,
        donationDate: donationDate,
        hospitalName: donationLocation.trim() || (language === 'bn' ? 'নির্দিষ্ট নয়' : 'Not Specified'),
        notes: `[Type: ${donationType}] ${notes.trim()}`.trim(),
      };

      await api.donations.create(payload);

      // 2. Refresh the overall dashboard and trigger parent state updates
      await onDonationUpdated();

      // Show success
      setSuccess(t.msgSuccess);
      setIsEditing(false);

      // Clear success banner after 4 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 4000);
    } catch (err: any) {
      console.error('Error saving last donation:', err);
      setError(err.message || (language === 'bn' ? 'রক্তদানের তথ্য সংরক্ষণে ব্যর্থ হয়েছে।' : 'Failed to save donation details.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="last-donation-card"
      className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:border-slate-700/60 transition-all duration-300 text-left"
    >
      {/* Dynamic Glow Effects based on Eligibility / State */}
      {isEditing ? (
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-rose-500/5 rounded-full filter blur-2xl"></div>
      ) : isEligible ? (
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl animate-pulse"></div>
      ) : (
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl"></div>
      )}
      <div className="absolute -left-10 -top-10 w-32 h-32 bg-slate-500/5 rounded-full filter blur-2xl"></div>

      {/* Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 pb-4 border-b border-slate-800/60">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
          <span>{t.cardTitle}</span>
        </h3>

        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 rounded-xl text-xs font-bold border border-rose-500/20 hover:border-rose-500/40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>{t.btnEdit}</span>
          </button>
        )}
      </div>

      {/* Success Banner */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* View State */}
      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Last Donation Date */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/50 transition-colors flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <Calendar className="w-4.5 h-4.5 text-rose-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate" title={t.lastDonationDate}>
                {t.lastDonationDate}
              </p>
              <p className="text-xs font-extrabold text-slate-200 mt-1 truncate">
                {lastDonationDateStr ? formatDate(lastDonationDateStr) : t.noDonationRecord}
              </p>
            </div>
          </div>

          {/* 2. Total Donations */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/50 transition-colors flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500/20" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate" title={t.totalDonations}>
                {t.totalDonations}
              </p>
              <p className="text-xs font-extrabold text-slate-200 mt-1">
                {language === 'bn' ? toBnNum(donationsCount) : donationsCount}
              </p>
            </div>
          </div>

          {/* 3. Days Since Last Donation */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/50 transition-colors flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate" title={t.daysSince}>
                {t.daysSince}
              </p>
              <p className="text-xs font-extrabold text-slate-200 mt-1">
                {!lastDonationDateStr
                  ? t.notApplicable
                  : language === 'bn'
                  ? `${toBnNum(diffDays)} দিন`
                  : `${diffDays} Days`}
              </p>
            </div>
          </div>

          {/* 4. Next Eligible Donation Date */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/50 transition-colors flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <Calendar className="w-4.5 h-4.5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate" title={t.nextEligibleDate}>
                {t.nextEligibleDate}
              </p>
              <p className="text-xs font-extrabold text-slate-200 mt-1 truncate">
                {lastDonationDateStr ? formatDate(nextDateStr) : t.notApplicable}
              </p>
            </div>
          </div>

          {/* 5. Eligibility Status */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/50 transition-colors flex items-start gap-3 sm:col-span-2 lg:col-span-1">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              {!lastDonationDateStr || isEligible ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4.5 h-4.5 text-amber-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate" title={t.eligibilityStatus}>
                {t.eligibilityStatus}
              </p>
              <div className="mt-1 flex items-center">
                {!lastDonationDateStr ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="shrink-0">{t.firstDonationPending}</span>
                  </span>
                ) : isEligible ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 relative">
                    <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    <span className="ml-1.5 shrink-0">{t.eligibleNow}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span className="shrink-0">
                      {t.eligibleIn.replace('{days}', language === 'bn' ? toBnNum(daysRemaining) : String(daysRemaining))}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit State - Update Last Donation Form */
        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-950/40 border border-slate-800 p-5 sm:p-6 rounded-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-900">
            <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{t.formTitle}</span>
            </h4>
            <button
              type="button"
              onClick={handleCancelClick}
              className="text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Date Picker */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.formDateLabel}</span>
              </label>
              <input
                type="date"
                required
                value={donationDate}
                max={new Date().toISOString().split('T')[0]} // Prevent selecting future dates
                onChange={(e) => setDonationDate(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-100 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
              />
            </div>

            {/* 2. Blood Donation Type Dropdown */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.formTypeLabel}</span>
              </label>
              <select
                value={donationType}
                onChange={(e) => setDonationType(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-100 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition cursor-pointer"
              >
                <option value="Whole Blood">{t.typeWhole}</option>
                <option value="Plasma">{t.typePlasma}</option>
                <option value="Platelets">{t.typePlatelets}</option>
                <option value="Others">{t.typeOthers}</option>
              </select>
            </div>

            {/* 3. Donation Location Input (Optional) */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.formLocationLabel}</span>
              </label>
              <input
                type="text"
                value={donationLocation}
                onChange={(e) => setDonationLocation(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল' : 'e.g. Dhaka Medical College Hospital'}
                className="bg-slate-900 border border-slate-800 text-slate-100 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
              />
            </div>

            {/* 4. Notes Input (Optional) */}
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.formNotesLabel}</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={language === 'bn' ? 'আপনার অভিজ্ঞতার কথা লিখুন...' : 'Write about your experience...'}
                className="bg-slate-900 border border-slate-800 text-slate-100 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition resize-none"
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-900">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700/50 transition cursor-pointer disabled:opacity-50"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : t.btnSave}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
