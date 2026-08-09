'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Lock, Mail, Phone, User as UserIcon, Calendar, ArrowRight, ShieldAlert, Key, Upload, Facebook } from 'lucide-react';
import { api, setAuthTokens } from '../lib/api';
import LocationSelector from '../components/LocationSelector';
import { BLOOD_GROUPS } from '../data/bangladesh-locations';
import { BloodGroup, User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthViewProps {
  onAuthSuccess: (user: User) => void;
  onNavigate: (tabId: string) => void;
}

export default function AuthView({ onAuthSuccess, onNavigate }: AuthViewProps) {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
  // Temp states for password reset
  const [resetEmail, setResetEmail] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: 'O+' as BloodGroup,
    gender: 'male',
    division: '',
    district: '',
    upazila: '',
    policeStation: '',
    fullAddress: '',
    password: '',
    confirmPassword: '',
    facebookUrl: '',
    showFacebook: true
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        setError(language === 'bn' ? 'প্রোফাইল ছবি ১ মেগাবাইটের চেয়ে ছোট হতে হবে' : 'Profile photo must be smaller than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationChange = (field: 'division' | 'district' | 'upazila' | 'policeStation' | 'fullAddress', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Strict form validation
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError(language === 'bn' ? 'অনুগ্রহ করে সঠিক ফরম্যাটে ইমেইল প্রদান করুন (যেমন: name@domain.com)' : 'Please provide a valid email address format (e.g. name@domain.com)');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await api.auth.login({
        email: formData.email,
        password: formData.password
      });
      
      setAuthTokens(response.token, response.refreshToken);
      onAuthSuccess(response.user);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || (language === 'bn' ? 'লগইন বিবরণ ভুল। অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড পরীক্ষা করুন।' : 'Invalid login details. Please check email/password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Form Validations
    if (formData.name.trim().length < 3) {
      setError(language === 'bn' ? 'পূর্ণ নাম কমপক্ষে ৩ অক্ষরের হতে হবে' : 'Full Name must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError(language === 'bn' ? 'অনুগ্রহ করে সঠিক ফরম্যাটে ইমেইল প্রদান করুন' : 'Please provide a valid email address format');
      setLoading(false);
      return;
    }

    if (!formData.phone.match(/^01[3-9]\d{8}$/)) {
      setError(language === 'bn' ? 'অনুগ্রহ করে সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: ০১৭১২৩৪৫৬৭৮)' : 'Please provide a valid Bangladeshi mobile number (e.g., 01712345678)');
      setLoading(false);
      return;
    }

    if (!formData.division || !formData.district || !formData.upazila || !formData.policeStation) {
      setError(language === 'bn' ? 'অনুগ্রহ করে বিভাগ, জেলা, উপজেলা এবং থানা নির্ধারণ করুন' : 'Please specify your division, district, upazila, and police station');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.facebookUrl && formData.facebookUrl.trim() !== '') {
      const fbVal = formData.facebookUrl.trim();
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
      const response = await api.auth.signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        gender: formData.gender,
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        policeStation: formData.policeStation || null,
        address: formData.fullAddress || undefined,
        password: formData.password,
        avatarUrl: avatarUrl || undefined,
        facebookUrl: formData.facebookUrl.trim() || undefined,
        showFacebook: formData.showFacebook
      });

      setAuthTokens(response.token, response.refreshToken);
      onAuthSuccess(response.user);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || (language === 'bn' ? 'নিবন্ধন ব্যর্থ হয়েছে। অনুগ্রহ করে অন্য ইমেইল ঠিকানা ব্যবহার করুন।' : 'Signup failed. Please try a different email address.'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await api.auth.forgotPassword(formData.email);
      setResetEmail(formData.email);
      setSuccessMessage(language === 'bn' ? 'পাসওয়ার্ড রিসেটের নির্দেশনা তৈরি করা হয়েছে। আপনি এখন আপনার পাসওয়ার্ড রিসেট করতে পারেন।' : 'Reset instructions generated. You can now reset your password.');
      setMode('reset');
    } catch (err: any) {
      setError(err.message || (language === 'bn' ? 'ইমেইল ঠিকানা পাওয়া যায়নি।' : 'Email address not found.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.auth.resetPassword({
        email: resetEmail,
        newPassword: formData.password
      });
      setSuccessMessage(language === 'bn' ? 'আপনার পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে। অনুগ্রহ করে লগইন করুন।' : 'Your password has been reset successfully. Please login.');
      setMode('login');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err: any) {
      setError(err.message || (language === 'bn' ? 'পাসওয়ার্ড রিসেট করতে ব্যর্থ হয়েছে।' : 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <motion.div 
        layout
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md"
      >
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full filter blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-500/5 rounded-full filter blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
          </div>
          
          {mode === 'login' && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">{t('auth.loginTitle')}</h2>
              <p className="text-xs text-slate-400 mt-1">{t('auth.loginSubtitle')}</p>
            </>
          )}

          {mode === 'signup' && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">{t('auth.signupTitle')}</h2>
              <p className="text-xs text-slate-400 mt-1">{t('auth.signupSubtitle')}</p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">{language === 'bn' ? 'অ্যাকাউন্ট পাসওয়ার্ড পুনরুদ্ধার' : 'Recover Account Password'}</h2>
              <p className="text-xs text-slate-400 mt-1">{language === 'bn' ? 'আপনার ইমেইল দিন এবং আমরা পাসওয়ার্ড রিসেট করার তাৎক্ষণিক অ্যাক্সেস দেব।' : 'Enter your email and we will grant instant access to reset your password.'}</p>
            </>
          )}

          {mode === 'reset' && (
            <>
              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">{language === 'bn' ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Configure New Password'}</h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'bn' ? `${resetEmail}-এর জন্য নতুন পাসওয়ার্ড সেট করা হচ্ছে।` : `Setting a password for ${resetEmail}.`}
              </p>
            </>
          )}
        </div>

        {/* Status Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-left flex gap-2.5 items-start"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium text-left"
            >
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Forms */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="text-xs font-bold text-slate-400">{t('auth.password')}</label>
                <button 
                  type="button" 
                  onClick={() => { setError(null); setMode('forgot'); }} 
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-rose-950/40 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...') : t('auth.loginBtn')}
              <ArrowRight className="w-4.5 h-4.5" />
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
              {language === 'bn' ? 'রক্তদাতার অ্যাকাউন্ট নেই?' : "Don't have a donor account?"}{' '}
              <button 
                type="button" 
                onClick={() => { setError(null); setMode('signup'); }} 
                className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
              >
                {t('auth.signupBtn')}
              </button>
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-6 text-left">
            {/* Profile Photo Selector */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 border border-slate-800 rounded-2xl mb-2">
              <label className="text-xs font-bold text-slate-400 mb-3 text-center">{language === 'bn' ? 'রক্তদাতার প্রোফাইল ছবি (ঐচ্ছিক)' : 'Donor Profile Photo (Optional)'}</label>
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 group">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-slate-600" />
                  )}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-xs text-rose-400 font-bold cursor-pointer"
                    >
                      {language === 'bn' ? 'ছবি মুছুন' : 'Remove'}
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/60 cursor-pointer transition text-xs font-bold text-slate-300">
                    <Upload className="w-4 h-4 text-rose-500" />
                    <span>{language === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-500">{language === 'bn' ? 'সর্বোচ্চ সাইজ ১ মেগাবাইট। পিএনজি, জেপিজি অথবা ওয়েবপি ফরম্যাট।' : 'Max size 1MB. PNG, JPG or WEBP formats.'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{t('auth.fullName')}</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Rahman Malik"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm h-12"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{t('common.gender')}</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm font-semibold h-12"
                >
                  <option value="male" className="bg-slate-950">{t('common.male')}</option>
                  <option value="female" className="bg-slate-950">{t('common.female')}</option>
                  <option value="other" className="bg-slate-950">{t('common.other')}</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{t('common.bloodGroup')}</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm font-semibold h-12"
                >
                  {BLOOD_GROUPS.map(bg => (
                    <option key={bg} value={bg} className="bg-slate-950">{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{t('auth.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="rahman@example.com"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number (BD)'}</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="01712345678"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Facebook Profile & Privacy Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/40 pt-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{t('auth.facebookLabel')}</label>
                <div className="relative">
                  <Facebook className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    name="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={handleInputChange}
                    placeholder={t('auth.facebookPlaceholder')}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end pb-1.5 pl-1">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="showFacebook"
                    checked={formData.showFacebook}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-rose-500 focus:ring-rose-500 focus:ring-opacity-25"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-300">{t('auth.showFacebookLabel')}</span>
                    <span className="text-[10px] text-slate-500">
                      {formData.showFacebook 
                        ? (language === 'bn' ? 'চালু (ডিরেক্টরিতে দেখানো হবে)' : 'On (Shown on directory)') 
                        : (language === 'bn' ? 'বন্ধ (গোপন রাখা হবে)' : 'Off (Will be hidden)')}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Cascading Location Picker */}
            <div className="border-t border-slate-800/40 pt-4">
              <p className="text-xs font-bold text-slate-400 mb-2 ml-1">{language === 'bn' ? 'বাংলাদেশ প্রাথমিক এলাকা' : 'Bangladesh Primary Location'}</p>
              <LocationSelector
                division={formData.division}
                district={formData.district}
                upazila={formData.upazila}
                policeStation={formData.policeStation}
                fullAddress={formData.fullAddress}
                onChange={handleLocationChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/40 pt-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{t('auth.password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-rose-950/40 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (language === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating account...') : t('auth.signupBtn')}
              <ArrowRight className="w-4.5 h-4.5" />
            </button>

            <p className="text-center text-xs text-slate-500 mt-4">
              {language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
              <button 
                type="button" 
                onClick={() => { setError(null); setMode('login'); }} 
                className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
              >
                {t('auth.loginBtn')}
              </button>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-5 text-left">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{language === 'bn' ? 'নিবন্ধিত ইমেইল ঠিকানা' : 'Registered Email Address'}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (language === 'bn' ? 'অনুসন্ধান করা হচ্ছে...' : 'Searching...') : (language === 'bn' ? 'অ্যাকাউন্ট যাচাই করুন' : 'Validate Account')}
              <Key className="w-4.5 h-4.5" />
            </button>

            <button
              type="button"
              onClick={() => { setError(null); setMode('login'); }}
              className="w-full bg-transparent hover:bg-slate-800/20 text-slate-400 text-xs py-2.5 rounded-xl border border-slate-800 transition cursor-pointer"
            >
              {language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-5 text-left">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 mb-1 ml-1">{language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10.5 pr-4 py-3 rounded-xl outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/80 transition text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (language === 'bn' ? 'পাসওয়ার্ড আপডেট করা হচ্ছে...' : 'Updating Password...') : (language === 'bn' ? 'নতুন পাসওয়ার্ড সংরক্ষণ করুন' : 'Save New Password')}
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </form>
        )}

      </motion.div>
    </div>
  );
}