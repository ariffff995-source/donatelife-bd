'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, BloodRequest, Notification } from '../types';
import { api } from '../lib/api';
import LocationSelector from '../components/LocationSelector';
import { Heart, Save, Calendar, CheckCircle2, AlertCircle, RefreshCw, X, MessageSquare, ExternalLink, Upload, Facebook, MapPin, QrCode, Award, Download, Star, ShieldCheck } from 'lucide-react';
import { BLOOD_GROUPS } from '../data/bangladesh-locations';
import { useLanguage } from '../contexts/LanguageContext';
import { LastDonationCard } from '../components/LastDonationCard';
import { DonorCardModal } from '../components/DonorCardModal';
import { DonationCertificateModal } from '../components/DonationCertificateModal';
import { calculateDonorXP, getDonorTier, getTierProgress, getDonorBadges } from '../utils/gamification';
import { downloadCsv, downloadExcel, downloadPdf } from '../utils/exportHelper';

interface DashboardViewProps {
  currentUser: User;
  onProfileUpdate: (updatedUser: User) => void;
  allRequests: BloodRequest[];
  onRefreshRequests: () => void;
}

export default function DashboardView({
  currentUser,
  onProfileUpdate,
  allRequests,
  onRefreshRequests
}: DashboardViewProps) {
  const { language, t, translateLocation, formatLocation } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification states
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [docBase64, setDocBase64] = useState<string | null>(null);
  const [verificationSubmitting, setVerificationSubmitting] = useState(false);

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpMessage(null);
    try {
      const res = await api.auth.sendOTP({ email: currentUser.email });
      setOtpSent(true);
      if (res.code) {
        setActiveOtpCode(res.code);
      }
    } catch (err: any) {
      setOtpMessage(err.message || 'Failed to send verification OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCodeInput.trim()) return;
    setOtpLoading(true);
    setOtpMessage(null);
    try {
      const res = await api.auth.verifyOTP({ email: currentUser.email, code: otpCodeInput });
      onProfileUpdate(res.user);
      setOtpSent(false);
      setActiveOtpCode(null);
    } catch (err: any) {
      setOtpMessage(err.message || 'Invalid verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(language === 'bn' ? 'ফাইল সাইজ ২ মেগাবাইটের চেয়ে ছোট হতে হবে' : 'Document copy must be smaller than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitDoc = async () => {
    if (!docBase64) return;
    setVerificationSubmitting(true);
    try {
      const res = await api.auth.submitDonorVerification({ document: docBase64 });
      onProfileUpdate(res.user);
      setDocBase64(null);
    } catch (err: any) {
      alert(err.message || 'Failed to submit medical verification');
    } finally {
      setVerificationSubmitting(false);
    }
  };
  
  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    phone: currentUser.phone,
    bloodGroup: currentUser.bloodGroup,
    division: currentUser.division,
    district: currentUser.district,
    upazila: currentUser.upazila,
    policeStation: currentUser.policeStation || '',
    lastDonationDate: currentUser.lastDonationDate || '',
    isAvailable: currentUser.isAvailable,
    avatarUrl: currentUser.avatarUrl || '',
    facebookUrl: currentUser.facebookUrl || '',
    showFacebook: currentUser.showFacebook !== false,
    showPhone: currentUser.showPhone === true,
    gender: currentUser.gender || 'male',
    address: currentUser.address || ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
  const [matchedRequests, setMatchedRequests] = useState<BloodRequest[]>([]);

  // Donation History & Log Form States
  const [activeHistoryTab, setActiveHistoryTab] = useState<'donations' | 'requests'>('donations');
  const [donations, setDonations] = useState<any[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showQrCardModal, setShowQrCardModal] = useState(false);
  const [selectedCertDonation, setSelectedCertDonation] = useState<any | null>(null);

  // Gamification calculations
  const donorXp = calculateDonorXP(currentUser, donations.length);
  const donorTier = getDonorTier(donorXp);
  const tierProgress = getTierProgress(donorXp);
  const donorBadges = getDonorBadges(currentUser, donations.length);
  const [donationForm, setDonationForm] = useState({
    recipientName: '',
    bloodGroup: currentUser.bloodGroup,
    donationDate: new Date().toISOString().split('T')[0],
    hospitalName: '',
    notes: ''
  });

  // Calculate eligibility based on last donation date (120 days)
  const [isEligible, setIsEligible] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);

  const loadDonations = async () => {
    try {
      const list = await api.donations.list();
      setDonations(list);
    } catch (err) {
      console.error('Failed to load donations history', err);
    }
  };

  useEffect(() => {
    loadDonations();
    setProfileForm({
      name: currentUser.name,
      phone: currentUser.phone,
      bloodGroup: currentUser.bloodGroup,
      division: currentUser.division,
      district: currentUser.district,
      upazila: currentUser.upazila,
      policeStation: currentUser.policeStation || '',
      lastDonationDate: currentUser.lastDonationDate || '',
      isAvailable: currentUser.isAvailable,
      avatarUrl: currentUser.avatarUrl || '',
      facebookUrl: currentUser.facebookUrl || '',
      showFacebook: currentUser.showFacebook !== false,
      showPhone: currentUser.showPhone === true,
      gender: currentUser.gender || 'male',
      address: currentUser.address || ''
    });
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setError(language === 'bn' ? 'প্রোফাইল ছবি ১ মেগাবাইটের চেয়ে ছোট হতে হবে' : 'Profile photo must be smaller than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({
          ...prev,
          avatarUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const newDon = await api.donations.create(donationForm);
      setDonations(prev => [newDon, ...prev]);
      
      setProfileForm(prev => ({
        ...prev,
        lastDonationDate: donationForm.donationDate
      }));
      
      const meRes = await api.auth.getMe();
      onProfileUpdate(meRes.user);
      
      setDonationForm({
        recipientName: '',
        bloodGroup: currentUser.bloodGroup,
        donationDate: new Date().toISOString().split('T')[0],
        hospitalName: '',
        notes: ''
      });
      setShowLogForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to log donation');
    } finally {
      setLoading(false);
    }
  };

  const handleDonationUpdated = async () => {
    try {
      const meRes = await api.auth.getMe();
      onProfileUpdate(meRes.user);
      await loadDonations();
    } catch (err) {
      console.error('Failed to update donation stats', err);
    }
  };

  useEffect(() => {
    if (profileForm.lastDonationDate) {
      const lastDate = new Date(profileForm.lastDonationDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 120) {
        setIsEligible(false);
        setDaysRemaining(120 - diffDays);
        // Force available status to false if clinically ineligible
        setProfileForm(prev => ({ ...prev, isAvailable: false }));
      } else {
        setIsEligible(true);
        setDaysRemaining(0);
      }
    } else {
      setIsEligible(true);
      setDaysRemaining(0);
    }
  }, [profileForm.lastDonationDate]);

  // Load and segment requests
  useEffect(() => {
    const mine = allRequests.filter(r => r.userId === currentUser.id);
    setMyRequests(mine);

    // Matching active emergencies
    // Criteria: same blood group, same division, created by someone else, pending
    const matches = allRequests.filter(r => 
      r.status === 'pending' && 
      r.userId !== currentUser.id && 
      r.bloodGroup === currentUser.bloodGroup && 
      r.division.toLowerCase() === currentUser.division.toLowerCase()
    );
    setMatchedRequests(matches);
  }, [allRequests, currentUser]);

  const handleLocationChange = (field: 'division' | 'district' | 'upazila' | 'policeStation', value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityToggle = () => {
    if (!isEligible) return; // Prevent enabling if ineligible
    setProfileForm(prev => ({ ...prev, isAvailable: !prev.isAvailable }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (profileForm.facebookUrl && profileForm.facebookUrl.trim() !== '') {
      const fbVal = profileForm.facebookUrl.trim();
      const isFbUrl = fbVal.includes('facebook.com') || fbVal.includes('fb.com');
      let isValid = false;
      if (isFbUrl) {
        const fbRegex = /^(https?:\/\/)?(www\.)?(facebook|fb)\.com\/[a-zA-Z0-9.?=&_-]+$/i;
        isValid = fbRegex.test(fbVal);
      } else {
        const usernameRegex = /^[a-zA-Z0-9.]{3,}$/;
        isValid = usernameRegex.test(fbVal);
      }

      if (!isValid) {
        setError(t('auth.facebookError'));
        setLoading(false);
        return;
      }
    }

    try {
      const response = await api.auth.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        bloodGroup: profileForm.bloodGroup,
        division: profileForm.division,
        district: profileForm.district,
        upazila: profileForm.upazila,
        policeStation: profileForm.policeStation || null,
        lastDonationDate: profileForm.lastDonationDate || null,
        isAvailable: profileForm.isAvailable,
        avatarUrl: profileForm.avatarUrl || '',
        facebookUrl: profileForm.facebookUrl.trim() || '',
        showFacebook: profileForm.showFacebook,
        showPhone: profileForm.showPhone,
        gender: profileForm.gender,
        address: profileForm.address
      });
      onProfileUpdate(response.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: BloodRequest['status']) => {
    try {
      await api.requests.updateStatus(id, status);
      onRefreshRequests(); // trigger list reload
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title Header */}
      <div className="text-left">
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">{t('dashboard.title')}</h2>
        <p className="text-xs text-slate-400">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Profile Settings (Glassmorphism card) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              {isEditing ? t('dashboard.editProfileTitle') : (language === 'bn' ? 'প্রোফাইল বিবরণ' : 'Profile Details')}
            </h3>
            <div className="flex gap-2 items-center">
              {success && (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'bn' ? 'সফলভাবে সংরক্ষিত হয়েছে' : 'Saved successfully'}
                </span>
              )}
              {error && (
                <span className="text-[11px] font-bold text-red-400 bg-red-500/5 px-2.5 py-1 border border-red-500/10 rounded-lg">
                  {error}
                </span>
              )}
              {!isEditing && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQrCardModal(true)}
                    className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold uppercase tracking-wider rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'স্মার্ট কিউআর কার্ড' : 'QR Donor Card'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 rotate-45" />
                    {language === 'bn' ? 'তথ্য সংশোধন' : 'Edit Profile'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isEditing ? (
            <div className="space-y-6 text-left">
              {/* Profile Overview (View Mode) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xl font-bold text-rose-500">{currentUser.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="space-y-1.5 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <h4 className="text-base font-extrabold text-slate-100">{currentUser.name}</h4>
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 font-sans">
                        {currentUser.bloodGroup}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatLocation(currentUser)}</span>
                    </p>
                  </div>
                </div>

                {/* Gamification Tier Badge */}
                <div className={`px-3.5 py-2 rounded-xl border ${donorTier.badgeBg} ${donorTier.badgeBorder} text-center space-y-0.5 shrink-0`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">LEVEL {donorTier.level} • {donorXp} XP</span>
                  <span className={`text-xs font-black ${donorTier.badgeColor} flex items-center justify-center gap-1`}>
                    <Award className="w-3.5 h-3.5" />
                    {language === 'bn' ? donorTier.titleBn : donorTier.title}
                  </span>
                </div>
              </div>

              {/* Grid of Profile Metadata details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">Official Donor ID</p>
                  <p className="text-sm font-mono font-black text-white">{currentUser.donorId || 'DBD-UNKNOWN'}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{language === 'bn' ? 'যোগাযোগের মোবাইল নম্বর' : 'Contact Phone'}</p>
                  <p className="text-xs font-bold text-slate-200">{currentUser.phone}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</p>
                  <p className="text-xs font-bold text-slate-200">{currentUser.email}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{language === 'bn' ? 'লিঙ্গ' : 'Gender'}</p>
                  <p className="text-xs font-bold text-slate-200">
                    {currentUser.gender === 'female'
                      ? (language === 'bn' ? 'মহিলা' : 'Female')
                      : currentUser.gender === 'other'
                      ? (language === 'bn' ? 'অন্যান্য' : 'Other')
                      : (language === 'bn' ? 'পুরুষ' : 'Male')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{language === 'bn' ? 'সর্বশেষ রক্তদানের তারিখ' : 'Last Donation Date'}</p>
                  <p className="text-xs font-bold text-slate-200">
                    {currentUser.lastDonationDate 
                      ? (language === 'bn' ? currentUser.lastDonationDate.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : currentUser.lastDonationDate)
                      : (language === 'bn' ? 'কোন রেকর্ড নেই' : 'No donations recorded')}
                  </p>
                </div>

                {currentUser.address && (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1 sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{language === 'bn' ? 'বিস্তারিত ঠিকানা' : 'Detailed Address'}</p>
                    <p className="text-xs font-bold text-slate-200">{currentUser.address}</p>
                  </div>
                )}

                {currentUser.facebookUrl && currentUser.showFacebook && (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1 sm:col-span-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{language === 'bn' ? 'ফেসবুক প্রোফাইল' : 'Facebook Profile'}</p>
                      <p className="text-xs font-bold text-slate-300 truncate max-w-xs">{currentUser.facebookUrl}</p>
                    </div>
                    <a
                      href={currentUser.facebookUrl.startsWith('http') ? currentUser.facebookUrl : `https://facebook.com/${currentUser.facebookUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition cursor-pointer"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => {
              handleProfileSubmit(e);
              setIsEditing(false);
            }} className="space-y-6 text-left">
            {/* Profile Avatar Selection */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl mb-2">
              <div className="relative w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 group">
                {profileForm.avatarUrl ? (
                  <img src={profileForm.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xl font-bold text-rose-500">{profileForm.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="space-y-1.5 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-300">{language === 'bn' ? 'প্রোফাইল ছবি' : 'Profile Picture'}</p>
                <div className="flex flex-wrap gap-2.5 items-center justify-center sm:justify-start">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/60 cursor-pointer transition text-[11px] font-bold text-slate-300">
                    <Save className="w-3.5 h-3.5 text-rose-500" />
                    <span>{language === 'bn' ? 'নতুন ছবি আপলোড করুন' : 'Upload New Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {profileForm.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setProfileForm(prev => ({ ...prev, avatarUrl: '' }))}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500/60 text-[11px] font-bold text-red-400 transition cursor-pointer"
                    >
                      {language === 'bn' ? 'ছবি মুছুন' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1">{t('auth.fullName')}</label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleFormChange}
                  required
                  className="bg-slate-950 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1">{language === 'bn' ? 'যোগাযোগের মোবাইল নম্বর' : 'Contact Phone (BD)'}</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleFormChange}
                  required
                  className="bg-slate-950 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1">{t('common.gender')}</label>
                <select
                  name="gender"
                  value={profileForm.gender}
                  onChange={handleFormChange}
                  required
                  className="bg-slate-950 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition font-bold text-left"
                >
                  <option value="male" className="bg-slate-950">{t('common.male')}</option>
                  <option value="female" className="bg-slate-950">{t('common.female')}</option>
                  <option value="other" className="bg-slate-950">{t('common.other')}</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1">{t('common.bloodGroup')}</label>
                <select
                  name="bloodGroup"
                  value={profileForm.bloodGroup}
                  onChange={handleFormChange}
                  className="bg-slate-950 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition font-bold text-left"
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg} className="bg-slate-950">{bg}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1">{language === 'bn' ? 'সর্বশেষ রক্তদানের তারিখ' : 'Last Donation Date'}</label>
                <div className="relative">
                  <input
                    type="date"
                    name="lastDonationDate"
                    value={profileForm.lastDonationDate}
                    onChange={handleFormChange}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                  />
                </div>
              </div>
            </div>

            {/* Facebook Profile & Privacy Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-800/60 pt-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1">{t('auth.facebookLabel')}</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    name="facebookUrl"
                    value={profileForm.facebookUrl}
                    onChange={handleFormChange}
                    placeholder={t('auth.facebookPlaceholder')}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end pb-1.5 pl-1 space-y-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="showFacebook"
                    checked={profileForm.showFacebook}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, showFacebook: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-rose-500 focus:ring-rose-500 focus:ring-opacity-25"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-300">{t('auth.showFacebookLabel')}</span>
                    <span className="text-[10px] text-slate-500">
                      {profileForm.showFacebook 
                        ? (language === 'bn' ? 'চালু (ডিরেক্টরিতে দেখানো হবে)' : 'On (Shown on directory)') 
                        : (language === 'bn' ? 'বন্ধ (গোপন রাখা হবে)' : 'Off (Will be hidden)')}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="showPhone"
                    checked={profileForm.showPhone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, showPhone: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-rose-500 focus:ring-rose-500 focus:ring-opacity-25"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-300">
                      {language === 'bn' ? 'মোবাইল নম্বর জনসমক্ষে দেখান' : 'Show Phone Publicly'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {profileForm.showPhone 
                        ? (language === 'bn' ? 'সবাই দেখতে পাবে' : 'Visible to public') 
                        : (language === 'bn' ? 'গোপন রাখা হয়েছে' : 'Hidden from public (Recommended)')}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Geographical Hierarchy Selector */}
            <div className="border-t border-slate-800/60 pt-4">
              <p className="text-xs font-bold text-slate-400 mb-3">{language === 'bn' ? 'প্রাথমিক এলাকা' : 'Primary Base Location'}</p>
              <LocationSelector
                division={profileForm.division}
                district={profileForm.district}
                upazila={profileForm.upazila}
                policeStation={profileForm.policeStation}
                onChange={handleLocationChange}
                required
              />
            </div>

            {/* Address Field */}
            <div className="flex flex-col border-t border-slate-800/60 pt-4">
              <label className="text-xs font-bold text-slate-400 mb-2">{language === 'bn' ? 'বিস্তারিত ঠিকানা' : 'Detailed Address'}</label>
              <input
                type="text"
                name="address"
                value={profileForm.address}
                onChange={handleFormChange}
                placeholder={language === 'bn' ? 'বাসা/রোড নম্বর, মহল্লা বা গ্রাম' : 'House/Road No, Area or Village'}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
              />
            </div>

            {/* Availability Toggle */}
            <div className="border-t border-slate-800/60 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-left max-w-md">
                <p className="text-xs font-bold text-slate-200">{language === 'bn' ? 'সক্রিয় রক্তদাতার প্রাপ্যতা' : 'Active Donor Availability'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {language === 'bn' ? 'আপনার প্রোফাইল স্থানীয় রক্ত অনুসন্ধানে দৃশ্যমান করতে অন করুন। চিকিৎসা সুরক্ষার জন্য, আপনি যদি গত ১২০ দিনের মধ্যে রক্ত দান করে থাকেন তবে এটি স্বয়ংক্রিয়ভাবে অনুপলব্ধ সেট হয়ে যাবে।' : 'Toggle on to make your profile visible in local blood searches. For clinical safety, if you have donated blood within the last 120 days, this is automatically set to unavailable.'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleAvailabilityToggle}
                  disabled={!isEligible}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none flex ${
                    profileForm.isAvailable ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                  } ${!isEligible ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <motion.div 
                    layout 
                    className="w-4.5 h-4.5 bg-white rounded-full shadow-md"
                  />
                </button>
                <span className={`text-xs font-bold ${profileForm.isAvailable ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {profileForm.isAvailable ? (language === 'bn' ? 'সক্রিয়' : 'ACTIVE') : (language === 'bn' ? 'অফলাইন' : 'OFFLINE')}
                </span>
              </div>
            </div>

            {/* Ineligibility Warning banner */}
            {!isEligible && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex gap-2.5 items-start text-amber-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold uppercase tracking-wide text-[10px]">{language === 'bn' ? 'চিকিৎসাগতভাবে রক্তদানে অনুপযুক্ত' : 'Clinically Ineligible to Donate'}</p>
                  <p className="leading-relaxed">
                    {language === 'bn' ? (
                      <span>সর্বশেষ রক্তদানের তারিখ অনুযায়ী, লোহিত রক্তকণিকা পুনরায় পূরণের জন্য আপনার শরীরের আরও সময়ের প্রয়োজন। আপনি আর <strong className="text-amber-100">{String(daysRemaining).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)])} দিন</strong> পর আবার রক্ত দিতে পারবেন।</span>
                    ) : (
                      <span>Based on your last donation date, your body needs more time to replenish red blood cells. You will be eligible to donate again in <strong className="text-amber-100">{daysRemaining} days</strong>.</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-950/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <Save className="w-4.5 h-4.5" />
                {loading ? (language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving Profile...') : (language === 'bn' ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save Profile Settings')}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer font-sans"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </form>
          )}
        </div>

        {/* Right Column - Status Overview & Local Matches */}
        <div className="lg:col-span-4 space-y-6 w-full text-left">
          
          {/* Card 1: Donor Status Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-600/5 rounded-full filter blur-xl"></div>
            
            <h4 className="text-xs font-bold uppercase tracking-widest text-rose-300">{language === 'bn' ? 'রক্তদাতার অবস্থা' : 'Donor Status'}</h4>
            <div className="flex items-center gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 font-extrabold text-lg text-rose-400">
                {currentUser.bloodGroup}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                  {currentUser.isVerified || currentUser.isDonorVerified || currentUser.verificationStatus === 'approved' ? (
                    <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      ✓ {language === 'bn' ? 'যাচাইকৃত রক্তদাতা' : 'Verified Donor'}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[10px]">
                      {language === 'bn' ? 'স্বেচ্ছাসেবক রক্তদাতা' : 'Volunteer Donor'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-3.5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{language === 'bn' ? 'লিঙ্গ:' : 'Gender:'}</span>
                <span className="font-bold text-slate-200">
                  {currentUser.gender === 'female'
                    ? (language === 'bn' ? 'মহিলা' : 'Female')
                    : currentUser.gender === 'other'
                    ? (language === 'bn' ? 'অন্যান্য' : 'Other')
                    : (language === 'bn' ? 'পুরুষ' : 'Male')}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{language === 'bn' ? 'মোট আবেদনকৃত অনুরোধ:' : 'Total Requests Made:'}</span>
                <span className="font-bold text-slate-200">{language === 'bn' ? String(myRequests.length).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : myRequests.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{language === 'bn' ? 'মূল বিভাগ:' : 'Base Division:'}</span>
                <span className="font-bold text-slate-200">{translateLocation(currentUser.division)}</span>
              </div>
              {currentUser.address && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 shrink-0">{language === 'bn' ? 'ঠিকানা:' : 'Address:'}</span>
                  <span className="font-bold text-slate-200 text-right truncate pl-4" title={currentUser.address}>{currentUser.address}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{language === 'bn' ? 'অ্যাকাউন্টের ভূমিকা:' : 'Account Role:'}</span>
                <span className={`font-extrabold uppercase text-[10px] px-2 py-0.5 rounded ${currentUser.isAdmin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  {currentUser.isAdmin ? (language === 'bn' ? 'প্রধান এডমিন' : 'Lead Admin') : (language === 'bn' ? 'রক্তদাতা' : 'Donor')}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Matching Regional Emergency Feeds */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-widest text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              {language === 'bn' ? 'জরুরী মেলবন্ধন' : 'Emergency Matches'}
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              {language === 'bn' ? (
                <span>লাইভ রক্তের আবেদন যাতে <strong className="text-rose-300">{translateLocation(currentUser.division)}</strong>-এ <strong className="text-rose-300">{currentUser.bloodGroup}</strong> রক্তের সন্ধান করা হচ্ছে।</span>
              ) : (
                <span>Live matching requests seeking <strong className="text-rose-300">{currentUser.bloodGroup}</strong> in <strong className="text-rose-300">{currentUser.division}</strong>.</span>
              )}
            </p>

            <div className="space-y-3 pt-1">
              {matchedRequests.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  {language === 'bn' ? 'কোনো সক্রিয় জরুরী রক্তের আবেদন মেলেনি। মিললে আপনাকে জানানো হবে।' : 'No active emergency matches. You will be notified.'}
                </div>
              ) : (
                matchedRequests.map(req => (
                  <div key={req.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/60 hover:border-rose-500/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <h5 className="text-xs font-bold text-slate-200">{req.patientName}</h5>
                      <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        {language === 'bn' ? String(req.unitsNeeded).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : req.unitsNeeded} {language === 'bn' ? 'ব্যাগ' : 'Units'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-1">{req.hospitalName}</p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-900 text-[10px]">
                      <span className="text-slate-500">{formatLocation(req)}</span>
                      <a href={`tel:${req.contactPhone}`} className="text-rose-400 font-bold hover:underline flex items-center gap-0.5">
                        {language === 'bn' ? `কল করুন: ${req.contactPhone.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)])}` : `Call ${req.contactPhone}`}
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 3: Account Verification Panel */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-widest text-rose-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {language === 'bn' ? 'অ্যাকাউন্ট এবং রক্তদাতা যাচাইকরণ' : 'Account & Donor Verification'}
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              {language === 'bn' ? 'আপনার মোবাইল/ইমেইল এবং চিকিৎসা সনদ যাচাই করে প্ল্যাটফর্মে সত্যতা নিশ্চিত করুন।' : 'Verify your contact methods and submit medical records to claim your official volunteer badge.'}
            </p>

            <div className="space-y-4 pt-1">
              {/* Email & Phone OTP Status */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">{language === 'bn' ? 'যোগাযোগ মাধ্যম যাচাই' : 'Contact Methods'}</p>
                    <p className="text-[10px] text-slate-500">{currentUser.email} | {currentUser.phone}</p>
                  </div>
                  {currentUser.isEmailVerified ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {language === 'bn' ? 'অযাচাইকৃত' : 'Unverified'}
                    </span>
                  )}
                </div>

                {!currentUser.isEmailVerified && (
                  <div className="pt-2 border-t border-slate-900 space-y-2">
                    {!otpSent ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold rounded-lg transition"
                      >
                        {otpLoading ? (language === 'bn' ? 'কোড পাঠানো হচ্ছে...' : 'Sending OTP...') : (language === 'bn' ? 'ইমেইল ও মোবাইল যাচাই করুন (OTP)' : 'Verify Contact via OTP')}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {activeOtpCode && (
                          <div className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                            ✨ {language === 'bn' ? `ডিমো যাচাইকরণ কোড: ${activeOtpCode}` : `Demo Verification Code: ${activeOtpCode}`}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-Digit OTP"
                            value={otpCodeInput}
                            onChange={(e) => setOtpCodeInput(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-rose-500 font-mono text-center tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otpLoading}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition"
                          >
                            {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm'}
                          </button>
                        </div>
                        {otpMessage && <p className="text-[10px] text-red-400 font-medium">{otpMessage}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Administrative Verification Badge */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">{language === 'bn' ? 'অ্যাডমিন যাচাইকরণ ব্যাজ' : 'Admin Verification Status'}</p>
                    <p className="text-[10px] text-slate-500">{language === 'bn' ? 'অ্যাডমিন প্যানেল দ্বারা ম্যানুয়াল যাচাইকরণ' : 'Manual verification by admin panel'}</p>
                  </div>
                  {currentUser.isVerified ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 shrink-0">
                      ✓ {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                      {language === 'bn' ? 'যাচাই করা হয়নি' : 'Not Verified'}
                    </span>
                  )}
                </div>
                {currentUser.isVerified && currentUser.verifiedAt && (
                  <p className="text-[9px] text-slate-500 pt-1 border-t border-slate-900 leading-relaxed font-mono">
                    {language === 'bn' ? `যাচাই করেছেন: ${currentUser.verifiedBy || 'অ্যাডমিন'} (${new Date(currentUser.verifiedAt).toLocaleDateString()})` : `Verified by: ${currentUser.verifiedBy || 'Admin'} on ${new Date(currentUser.verifiedAt).toLocaleDateString()}`}
                    {currentUser.verificationNote && <span className="block mt-0.5 italic text-slate-600 font-sans">" {currentUser.verificationNote} "</span>}
                  </p>
                )}
              </div>

              {/* Medical Donor Verification Badge */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">{language === 'bn' ? 'চিকিৎসা যাচাইকরণ ব্যাজ' : 'Medical Donor Badge'}</p>
                    <p className="text-[10px] text-slate-500">{language === 'bn' ? 'মেডিকেল প্যানেল দ্বারা যাচাইকৃত' : 'Verified by our Medical Panel'}</p>
                  </div>
                  {currentUser.isDonorVerified || currentUser.verificationStatus === 'approved' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 shrink-0">
                      🎖️ {language === 'bn' ? 'ভেরিফাইড রক্তদাতা' : 'Verified Donor'}
                    </span>
                  ) : currentUser.verificationStatus === 'pending' ? (
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0 animate-pulse">
                      ⏳ {language === 'bn' ? 'পর্যালোচনায় আছে' : 'Pending Review'}
                    </span>
                  ) : currentUser.verificationStatus === 'rejected' ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 shrink-0">
                      ❌ {language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                      {language === 'bn' ? 'কোনো আবেদন নেই' : 'No Badge Claimed'}
                    </span>
                  )}
                </div>

                {(!currentUser.isDonorVerified && currentUser.verificationStatus !== 'approved' && currentUser.verificationStatus !== 'pending') && (
                  <div className="pt-2 border-t border-slate-900 space-y-2.5">
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {language === 'bn' ? 'ব্যাজ পেতে আপনার ব্লাড ডোনার কার্ড অথবা সরকারি বা কোনো হাসপাতালের রক্তদান পরীক্ষার সনদের স্ক্যান কপি আপলোড করুন।' : 'Upload a photo of your Blood Donor card or a clinical blood group certificate to prove your credentials.'}
                    </p>
                    
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-slate-800 hover:border-rose-500/40 rounded-lg cursor-pointer transition text-[11px] font-bold text-slate-400 bg-slate-900/40">
                        <Upload className="w-3.5 h-3.5 text-rose-500" />
                        <span>{docBase64 ? (language === 'bn' ? 'আরেকটি ফাইল নির্বাচন করুন' : 'Change Document') : (language === 'bn' ? 'সনদের স্ক্যান কপি সিলেক্ট করুন' : 'Select Scan Copy')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDocChange}
                          className="hidden"
                        />
                      </label>
                      {docBase64 && (
                        <div className="space-y-2">
                          <p className="text-[9px] text-emerald-400 font-bold truncate">✓ {language === 'bn' ? 'ফাইল রেডি আছে' : 'Verification Document Loaded'}</p>
                          <button
                            type="button"
                            onClick={handleSubmitDoc}
                            disabled={verificationSubmitting}
                            className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-lg transition"
                          >
                            {verificationSubmitting ? (language === 'bn' ? 'জমা দেওয়া হচ্ছে...' : 'Submitting Application...') : (language === 'bn' ? 'যাচাইকরণের জন্য আবেদন জমা দিন' : 'Submit for Medical Verification')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentUser.verificationStatus === 'pending' && (
                  <div className="pt-2 border-t border-slate-900 text-slate-400 text-[10px] leading-relaxed flex gap-1.5">
                    <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{language === 'bn' ? 'আমাদের চিকিৎসা কর্মকর্তারা আপনার সনদ পর্যালোচনা করছেন। আগামী ২৪ ঘণ্টার মধ্যে যাচাইকরণ সম্পন্ন হবে।' : 'Our medical board is inspecting your submitted credentials. Verification status will update within 24 hours.'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Last Donation Premium Glassmorphism Card */}
      <LastDonationCard
        currentUser={currentUser}
        language={language}
        donationsCount={donations.length}
        onDonationUpdated={handleDonationUpdated}
      />

      {/* Lower Section - Tabbed Volunteer Donation Records & Request Histories */}
      <section className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl text-left shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setActiveHistoryTab('donations')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeHistoryTab === 'donations'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              {t('dashboard.donationHistoryTab')}
            </button>
            <button
              onClick={() => setActiveHistoryTab('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeHistoryTab === 'requests'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {t('dashboard.requestHistoryTab')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeHistoryTab === 'donations' && donations.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => downloadCsv(`Donation_History_${currentUser.name.replace(/\s+/g, '_')}`, donations)}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-800 transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-emerald-400" />
                  CSV
                </button>
                <button
                  onClick={() => downloadExcel(`Donation_History_${currentUser.name.replace(/\s+/g, '_')}`, donations)}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-800 transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-indigo-400" />
                  Excel
                </button>
                <button
                  onClick={() => downloadPdf(`Donation_History_${currentUser.name.replace(/\s+/g, '_')}`, `Donation History - ${currentUser.name}`, [{ header: 'Recipient', key: 'recipientName' }, { header: 'Hospital', key: 'hospitalName' }, { header: 'Group', key: 'bloodGroup' }, { header: 'Date', key: 'donationDate' }], donations)}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] font-bold border border-slate-800 transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-rose-400" />
                  PDF
                </button>
              </div>
            )}

            {activeHistoryTab === 'donations' && !showLogForm && (
              <button
                onClick={() => setShowLogForm(true)}
                className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 rounded-xl text-xs font-bold border border-rose-500/20 transition shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5" /> {t('dashboard.logDonationBtn')}
              </button>
            )}
          </div>
        </div>

        {activeHistoryTab === 'donations' ? (
          <div>
            <AnimatePresence mode="wait">
              {showLogForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleLogDonationSubmit}
                  className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 mb-6 text-left"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      {t('dashboard.logDonationBtn')}
                    </h4>
                    <button type="button" onClick={() => setShowLogForm(false)} className="text-slate-500 hover:text-slate-300 transition cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 mb-1">{language === 'bn' ? 'রক্তগ্রহীতার নাম / রোগী (ঐচ্ছিক)' : 'Recipient Name / Patient (Optional)'}</label>
                      <input
                        type="text"
                        required
                        value={donationForm.recipientName}
                        onChange={(e) => setDonationForm(prev => ({ ...prev, recipientName: e.target.value }))}
                        placeholder={language === 'bn' ? 'যেমন: সেলিম উদ্দিন' : 'e.g. Salim Uddin'}
                        className="bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 mb-1">{language === 'bn' ? 'রক্তদানের তারিখ' : 'Donation Date'}</label>
                      <input
                        type="date"
                        required
                        value={donationForm.donationDate}
                        onChange={(e) => setDonationForm(prev => ({ ...prev, donationDate: e.target.value }))}
                        className="bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 mb-1">{t('requests.hospitalName')}</label>
                      <input
                        type="text"
                        required
                        value={donationForm.hospitalName}
                        onChange={(e) => setDonationForm(prev => ({ ...prev, hospitalName: e.target.value }))}
                        placeholder={language === 'bn' ? 'যেমন: ঢাকা মেডিকেল কলেজ হাসপাতাল' : 'e.g. Dhaka Medical College Hospital'}
                        className="bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-slate-400 mb-1">{language === 'bn' ? 'দানকৃত রক্তের গ্রুপ' : 'Blood Group Donated'}</label>
                      <select
                        value={donationForm.bloodGroup}
                        onChange={(e) => setDonationForm(prev => ({ ...prev, bloodGroup: e.target.value as any }))}
                        className="bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs outline-none focus:border-rose-500/80 transition font-bold"
                      >
                        {BLOOD_GROUPS.map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-400 mb-1">{language === 'bn' ? 'মন্তব্য / রিমার্কস (ঐচ্ছিক)' : 'Notes / Remarks (Optional)'}</label>
                    <input
                      type="text"
                      value={donationForm.notes}
                      onChange={(e) => setDonationForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder={language === 'bn' ? 'যেমন: চিকিৎসা সফল হয়েছে, অনেক ভালো লেগেছে!' : 'e.g. Direct donation for bypass surgery patient, felt great!'}
                      className="bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLogForm(false)}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] font-bold transition cursor-pointer"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'bn' ? 'লগ সংরক্ষণ করুন' : 'Save Donation Log'}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {donations.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl space-y-2">
                <Heart className="w-8 h-8 text-slate-700 mx-auto" />
                <p>{language === 'bn' ? 'আপনি এখনো কোনো রক্তদানের লগ সংরক্ষণ করেননি।' : 'You have not logged any blood donations yet.'}</p>
                <p className="text-[10px] text-slate-600">{language === 'bn' ? 'আপনার স্বেচ্ছাসেবামূলক অবদানের জন্য গর্বিত হোন এবং আপনার প্রথম রেকর্ডটি যুক্ত করুন!' : 'Be proud of your volunteer contributions and log your first record!'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                      <th className="py-3 px-4">{language === 'bn' ? 'রক্তগ্রহীতার নাম / রক্তের গ্রুপ' : 'Recipient Name / Blood Group'}</th>
                      <th className="py-3 px-4">{t('requests.hospitalName')}</th>
                      <th className="py-3 px-4">{language === 'bn' ? 'রক্তদানের তারিখ' : 'Donation Date'}</th>
                      <th className="py-3 px-4">{language === 'bn' ? 'সনদপত্র' : 'Certificate'}</th>
                      <th className="py-3 px-4 text-right">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {donations.map((don) => (
                      <tr key={don.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 border border-emerald-500/10">
                              {don.bloodGroup}
                            </div>
                            <span className="font-bold text-slate-200">{don.recipientName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-300 font-medium">{don.hospitalName}</td>
                        <td className="py-4 px-4 text-slate-400 font-semibold">
                          {language === 'bn' ? don.donationDate.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : don.donationDate}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedCertDonation(don)}
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Award className="w-3 h-3" />
                            {language === 'bn' ? 'সনদ দেখুন' : 'Certificate'}
                          </button>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[9px] font-bold rounded uppercase">
                            {language === 'bn' ? 'সম্পন্ন' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {myRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                {language === 'bn' ? 'আপনি এই প্ল্যাটফর্মে কোনো জরুরী রক্তের আবেদন জমা দেননি।' : 'You have not submitted any emergency blood requests on this platform.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                      <th className="py-3 px-4">{language === 'bn' ? 'রোগী / গ্রুপ' : 'Patient / Group'}</th>
                      <th className="py-3 px-4">{t('requests.unitsNeeded')}</th>
                      <th className="py-3 px-4">{language === 'bn' ? 'হাসপাতাল / স্থান' : 'Hospital / Location'}</th>
                      <th className="py-3 px-4">{t('requests.requiredDate')}</th>
                      <th className="py-3 px-4">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                      <th className="py-3 px-4 text-right">{language === 'bn' ? 'পদক্ষেপ' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center font-bold text-rose-400 border border-rose-500/10">
                              {req.bloodGroup}
                            </div>
                            <div>
                              <p className="font-bold text-slate-200">{req.patientName}</p>
                              <p className="text-[10px] text-slate-500">{language === 'bn' ? 'যোগাযোগ:' : 'Contact:'} {language === 'bn' ? req.contactPhone.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : req.contactPhone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-300 font-semibold">
                          {language === 'bn' ? String(req.unitsNeeded).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : req.unitsNeeded} {language === 'bn' ? 'ব্যাগ' : 'Bottles'}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-300 font-medium">{req.hospitalName}</p>
                          <p className="text-[10px] text-slate-500">{formatLocation(req)}</p>
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-medium">
                          {language === 'bn' ? req.requiredDate.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : req.requiredDate}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            req.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' :
                            req.status === 'fulfilled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {req.status === 'pending' ? t('common.pending') : req.status === 'fulfilled' ? t('common.fulfilled') : t('common.cancelled')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {req.status === 'pending' ? (
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'fulfilled')}
                                className="px-2.5 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-lg font-bold border border-emerald-500/20 transition cursor-pointer"
                              >
                                {language === 'bn' ? 'সম্পন্ন চিহ্নিত করুন' : 'Mark Fulfill'}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold border border-slate-700/60 transition cursor-pointer"
                              >
                                {t('common.cancel')}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">{language === 'bn' ? 'কোনো পদক্ষেপ নেই' : 'No actions'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Smart QR Donor Card Modal */}
      {showQrCardModal && (
        <DonorCardModal
          user={currentUser}
          onClose={() => setShowQrCardModal(false)}
        />
      )}

      {/* Official Certificate Modal */}
      {selectedCertDonation && (
        <DonationCertificateModal
          user={currentUser}
          donation={selectedCertDonation}
          onClose={() => setSelectedCertDonation(null)}
        />
      )}
    </div>
  );
}