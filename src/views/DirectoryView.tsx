'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Hospital, BloodBank, Ambulance } from '../types';
import { DIVISIONS, BLOOD_GROUPS, BANGLADESH_LOCATIONS } from '../data/bangladesh-locations';
import { 
  Search, MapPin, Phone, Shield, Library, Activity, Droplet, Star, 
  ArrowUpRight, Map, Check, Heart, Clock, CreditCard, Truck, 
  UserCheck, EyeOff, Eye, X, Sparkles, Navigation, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppContext } from '../providers';
import { LocationMap } from '../components/LocationMap';
import SearchableSelect from '../components/SearchableSelect';
import { getEnglishLocationValue } from '../utils/locationHelper';

export default function DirectoryView() {
  const { language, t, translateLocation, formatLocation } = useLanguage();
  const { currentUser, setCurrentUser } = useAppContext();

  // -------------------------------------------------------------
  // Section 1: Hospitals & Clinics State
  // -------------------------------------------------------------
  const [hospSearchQuery, setHospSearchQuery] = useState('');
  const [hospDivisionFilter, setHospDivisionFilter] = useState('');
  const [hospDistrictFilter, setHospDistrictFilter] = useState('');
  const [hospUpazilaFilter, setHospUpazilaFilter] = useState('');

  // -------------------------------------------------------------
  // Section 2: Blood Banks & Storage State
  // -------------------------------------------------------------
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [bankDivisionFilter, setBankDivisionFilter] = useState('');
  const [bankDistrictFilter, setBankDistrictFilter] = useState('');
  const [bankUpazilaFilter, setBankUpazilaFilter] = useState('');

  // -------------------------------------------------------------
  // Section 3: Ambulance Directory State
  // -------------------------------------------------------------
  const [ambSearchQuery, setAmbSearchQuery] = useState('');
  const [ambDivisionFilter, setAmbDivisionFilter] = useState('');
  const [ambDistrictFilter, setAmbDistrictFilter] = useState('');
  const [ambUpazilaFilter, setAmbUpazilaFilter] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [is247Filter, setIs247Filter] = useState(false);
  const [isVerifiedFilter, setIsVerifiedFilter] = useState(false);
  const [sortOption, setSortOption] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Common UI & Modal States
  const [selectedLocation, setSelectedLocation] = useState<{ query: string; name: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);

  // Review posting states
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Data fetching states
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDirectories = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [hospList, bankList, ambList] = await Promise.all([
        api.directories.hospitals('', ''),
        api.directories.bloodBanks('', ''),
        api.ambulances.list()
      ]);
      setHospitals(hospList || []);
      setBloodBanks(bankList || []);
      setAmbulances(ambList || []);
      setFetchError(null);
    } catch (err: any) {
      console.error('Failed to load directories', err);
      setFetchError(err?.message || 'Failed to retrieve directory listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectories();
  }, []);

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareContact = (amb: Ambulance) => {
    const text = `${amb.name}\nPhone: ${amb.contactPhone}\nAddress: ${amb.address}, ${formatLocation(amb)}\nAvailable 24/7: ${amb.isAvailable247 ? 'Yes' : 'No'}`;
    if (navigator.share) {
      navigator.share({
        title: amb.name,
        text: text,
        url: window.location.href
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(text);
      alert(language === 'bn' ? 'অ্যাম্বুলেন্সের যোগাযোগের বিবরণ ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Ambulance contact details copied to clipboard!');
    }
  };

  // Helper for cascading dropdowns
  const divisionOptions = [
    { value: '', label: language === 'bn' ? 'সব বিভাগ' : 'All Divisions' },
    ...DIVISIONS.map(div => ({
      value: div,
      label: translateLocation(div)
    }))
  ];

  const getCascadingLocationOptions = (divisionVal: string, districtVal: string) => {
    const cleanDiv = getEnglishLocationValue(divisionVal);
    const cleanDist = getEnglishLocationValue(districtVal);

    const matchedDivKey = Object.keys(BANGLADESH_LOCATIONS).find(k => k.toLowerCase() === cleanDiv.toLowerCase());
    const selectedDivData = matchedDivKey ? BANGLADESH_LOCATIONS[matchedDivKey] : null;

    const districtOptions = [
      { value: '', label: language === 'bn' ? 'সব জেলা' : 'All Districts' },
      ...(selectedDivData
        ? Object.keys(selectedDivData.districts).map(dist => ({
            value: dist,
            label: translateLocation(dist)
          }))
        : [])
    ];

    const matchedDistKey = selectedDivData && cleanDist
      ? Object.keys(selectedDivData.districts).find(k => k.toLowerCase() === cleanDist.toLowerCase())
      : null;

    const upazilaOptions = [
      { value: '', label: language === 'bn' ? 'সব উপজেলা' : 'All Upazilas' },
      ...(selectedDivData && matchedDistKey && selectedDivData.districts[matchedDistKey]
        ? Object.keys(selectedDivData.districts[matchedDistKey]).map(upz => ({
            value: upz,
            label: translateLocation(upz)
          }))
        : [])
    ];

    return { districtOptions, upazilaOptions };
  };

  // Filtered Hospitals
  const filteredHospitals = (hospitals || []).filter(hosp => {
    if (!hosp) return false;
    const matchesDivision = !hospDivisionFilter || (hosp.division && hosp.division.toLowerCase() === hospDivisionFilter.toLowerCase());
    const matchesDistrict = !hospDistrictFilter || (hosp.district && hosp.district.toLowerCase() === hospDistrictFilter.toLowerCase());
    const matchesUpazila = !hospUpazilaFilter || (hosp.upazila && hosp.upazila.toLowerCase() === hospUpazilaFilter.toLowerCase());
    const matchesSearch = !hospSearchQuery ||
      (hosp.name && hosp.name.toLowerCase().includes(hospSearchQuery.toLowerCase())) ||
      (hosp.address && hosp.address.toLowerCase().includes(hospSearchQuery.toLowerCase())) ||
      (hosp.district && hosp.district.toLowerCase().includes(hospSearchQuery.toLowerCase())) ||
      hosp.services?.some(s => s && s.toLowerCase().includes(hospSearchQuery.toLowerCase()));

    return matchesDivision && matchesDistrict && matchesUpazila && matchesSearch;
  });

  // Filtered Blood Banks
  const filteredBloodBanks = (bloodBanks || []).filter(bank => {
    if (!bank) return false;
    const matchesDivision = !bankDivisionFilter || (bank.division && bank.division.toLowerCase() === bankDivisionFilter.toLowerCase());
    const matchesDistrict = !bankDistrictFilter || (bank.district && bank.district.toLowerCase() === bankDistrictFilter.toLowerCase());
    const matchesUpazila = !bankUpazilaFilter || (bank.upazila && bank.upazila.toLowerCase() === bankUpazilaFilter.toLowerCase());
    const matchesSearch = !bankSearchQuery ||
      (bank.name && bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase())) ||
      (bank.address && bank.address.toLowerCase().includes(bankSearchQuery.toLowerCase())) ||
      (bank.district && bank.district.toLowerCase().includes(bankSearchQuery.toLowerCase()));

    return matchesDivision && matchesDistrict && matchesUpazila && matchesSearch;
  });

  // Filtered Ambulances
  const filteredAmbulances = (ambulances || []).filter(amb => {
    if (!amb) return false;
    const matchesDivision = !ambDivisionFilter || (amb.division && amb.division.toLowerCase() === ambDivisionFilter.toLowerCase());
    const matchesDistrict = !ambDistrictFilter || (amb.district && amb.district.toLowerCase() === ambDistrictFilter.toLowerCase());
    const matchesUpazila = !ambUpazilaFilter || (amb.upazila && amb.upazila.toLowerCase() === ambUpazilaFilter.toLowerCase());
    const matchesServiceType = !serviceTypeFilter || amb.availableTypes?.some(t => t && t.toLowerCase().includes(serviceTypeFilter.toLowerCase()));
    const matches247 = !is247Filter || amb.isAvailable247 === true;
    const matchesVerified = !isVerifiedFilter || amb.isVerified === true;
    const matchesActive = amb.isActive !== false;

    const matchesSearch = !ambSearchQuery || 
      (amb.name && amb.name.toLowerCase().includes(ambSearchQuery.toLowerCase())) ||
      (amb.address && amb.address.toLowerCase().includes(ambSearchQuery.toLowerCase())) ||
      (amb.district && amb.district.toLowerCase().includes(ambSearchQuery.toLowerCase())) ||
      (amb.upazila && amb.upazila.toLowerCase().includes(ambSearchQuery.toLowerCase())) ||
      amb.availableTypes?.some(t => t && t.toLowerCase().includes(ambSearchQuery.toLowerCase()));

    return matchesDivision && matchesDistrict && matchesUpazila && matchesServiceType && matches247 && matchesVerified && matchesActive && matchesSearch;
  });

  const sortedAmbulances = [...filteredAmbulances].sort((a, b) => {
    if (sortOption === 'fare_asc') {
      return (a.startingFare || 0) - (b.startingFare || 0);
    }
    if (sortOption === 'fare_desc') {
      return (b.startingFare || 0) - (a.startingFare || 0);
    }
    if (sortOption === 'rating_desc') {
      return parseFloat(b.averageRating || '0') - parseFloat(a.averageRating || '0');
    }
    if (sortOption === 'response_asc') {
      const getMinTime = (str: string | null) => {
        if (!str) return 999;
        const match = str.match(/\d+/);
        return match ? parseInt(match[0], 10) : 999;
      };
      return getMinTime(a.averageResponseTime) - getMinTime(b.averageResponseTime);
    }
    if (sortOption === 'name_asc') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return 0;
  });

  // Premium Toggle favorite callback
  const handleToggleFavorite = async (ambId: string) => {
    if (!currentUser) {
      alert(language === 'bn' ? 'অ্যাম্বুলেন্সটি পছন্দ তালিকায় যোগ করতে অনুগ্রহ করে লগইন করুন।' : 'Please log in to add this ambulance to your favorites list.');
      return;
    }
    try {
      const res = await api.ambulances.toggleFavorite(ambId);
      if (res.success) {
        setCurrentUser(prev => prev ? { ...prev, favoriteAmbulances: res.favoriteAmbulances } : null);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const handleCallClick = (ambId: string) => {
    api.ambulances.clickCall(ambId).catch(err => console.error('Call click track failed', err));
  };

  const handleWaClick = (ambId: string) => {
    api.ambulances.clickWa(ambId).catch(err => console.error('WA click track failed', err));
  };

  const handlePostReview = async (ambId: string) => {
    if (!commentInput.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে একটি মন্তব্য লিখুন।' : 'Please provide a comment before submitting.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.ambulances.addReview(ambId, { rating: ratingInput, comment: commentInput });
      if (res.success) {
        const updatedAmbulance = {
          ...selectedAmbulance!,
          averageRating: res.averageRating,
          totalReviews: res.totalReviews,
          reviews: [...(selectedAmbulance!.reviews || []), res.review]
        };
        setSelectedAmbulance(updatedAmbulance);
        setAmbulances(prev => prev.map(a => a.id === ambId ? updatedAmbulance : a));
        setCommentInput('');
        setRatingInput(5);
      }
    } catch (err) {
      console.error('Failed to submit review', err);
      alert(language === 'bn' ? 'মন্তব্য জমা দিতে ব্যর্থ হয়েছে।' : 'Could not submit your review. Ensure you are signed in.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleHideReview = async (ambId: string, reviewId: string) => {
    try {
      const res = await api.ambulances.toggleHideReview(ambId, reviewId);
      if (res.success) {
        const updatedAmbulance = {
          ...selectedAmbulance!,
          averageRating: res.averageRating,
          totalReviews: res.totalReviews,
          reviews: res.reviews
        };
        setSelectedAmbulance(updatedAmbulance);
        setAmbulances(prev => prev.map(a => a.id === ambId ? updatedAmbulance : a));
      }
    } catch (err) {
      console.error('Moderator action failed', err);
    }
  };

  const getAmbulanceCoords = (id: string, district: string) => {
    let baseLat = 23.7461;
    let baseLng = 90.3742;

    if (district.toLowerCase().includes('chittagong')) {
      baseLat = 22.3569;
      baseLng = 91.7832;
    } else if (district.toLowerCase().includes('sylhet')) {
      baseLat = 24.8949;
      baseLng = 91.8687;
    } else if (district.toLowerCase().includes('rajshahi')) {
      baseLat = 24.3636;
      baseLng = 88.6241;
    }

    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latOffset = ((hash % 100) / 1000) - 0.05;
    const lngOffset = (((hash * 13) % 100) / 1000) - 0.05;

    return { lat: baseLat + latOffset, lng: baseLng + lngOffset };
  };

  const calculateDistance = (coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLng = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const enableLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationError(null);
      },
      (err) => {
        setLocationError(err.message);
      }
    );
  };

  const simulateLocation = () => {
    setUserCoords({ lat: 23.7461, lng: 90.3742 });
    setLocationError(null);
  };

  const getStatusBadge = (status?: string) => {
    const s = status || 'Available';
    if (s === 'Busy') {
      return (
        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[9px] font-black uppercase tracking-wide flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          {language === 'bn' ? 'ব্যস্ত' : 'Busy'}
        </span>
      );
    } else if (s === 'Offline') {
      return (
        <span className="px-2 py-0.5 bg-slate-800/80 text-slate-400 border border-slate-700 rounded-md text-[9px] font-black uppercase tracking-wide flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          {language === 'bn' ? 'অফলাইন' : 'Offline'}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[9px] font-black uppercase tracking-wide flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        {language === 'bn' ? 'উপলব্ধ' : 'Available'}
      </span>
    );
  };

  const hospLocOptions = getCascadingLocationOptions(hospDivisionFilter, hospDistrictFilter);
  const bankLocOptions = getCascadingLocationOptions(bankDivisionFilter, bankDistrictFilter);
  const ambLocOptions = getCascadingLocationOptions(ambDivisionFilter, ambDistrictFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Title Header */}
      <header className="text-left space-y-2 border-b border-slate-800/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">{t('directory.title')}</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">{t('directory.subtitle')}</p>
      </header>

      {fetchError && (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-400 space-y-4 max-w-md mx-auto p-6" role="alert">
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="font-extrabold text-sm text-slate-200">
              {language === 'bn' ? 'লোড করতে ব্যর্থ হয়েছে' : 'Failed to load directory data'}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">{fetchError}</p>
          </div>
          <button
            onClick={fetchDirectories}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 rounded-xl transition cursor-pointer"
          >
            {language === 'bn' ? 'আবার চেষ্টা করুন' : 'Retry'}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: HOSPITALS & CLINICS                                            */}
      {/* ========================================================================= */}
      <section id="hospitals-section" className="space-y-6 text-left">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Library className="w-5 h-5" />
            </div>
            <span>{language === 'bn' ? '১. হাসপাতাল ও ক্লিনিক সমূহ' : '1. Hospitals & Clinics'}</span>
          </h2>
          <p className="text-xs text-slate-400 pl-11">
            {language === 'bn' ? 'বাংলাদেশের ৬৪ জেলার রক্ত সঞ্চালন সুবিধাসম্পন্ন সকল সরকারী ও বেসরকারী হাসপাতাল' : 'Transfusion-equipped government and private hospital centers across 64 districts.'}
          </p>
        </div>

        {/* Hospitals Search & Filters */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {language === 'bn' ? 'হাসপাতাল অনুসন্ধান' : 'Search Hospitals'}
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={hospSearchQuery}
                  onChange={(e) => setHospSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'নাম, সেবা অথবা জেলা দিয়ে হাসপাতাল খুঁজুন...' : 'Search hospitals by name, service or district...'}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {language === 'bn' ? 'বিভাগ ফিল্টার' : 'Filter Division'}
              </label>
              <SearchableSelect
                options={divisionOptions}
                value={hospDivisionFilter}
                onChange={(div) => { setHospDivisionFilter(div); setHospDistrictFilter(''); setHospUpazilaFilter(''); }}
                placeholder={language === 'bn' ? 'সব বিভাগ' : 'All Divisions'}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {language === 'bn' ? 'জেলা ফিল্টার' : 'Filter District'}
              </label>
              <SearchableSelect
                options={hospLocOptions.districtOptions}
                value={hospDistrictFilter}
                onChange={(dist) => { setHospDistrictFilter(dist); setHospUpazilaFilter(''); }}
                placeholder={language === 'bn' ? 'সব জেলা' : 'All Districts'}
              />
            </div>
          </div>
        </div>

        {/* Hospitals Output Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded-md w-3/4" />
                <div className="h-3 bg-slate-850 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 p-6 space-y-3">
            <p className="font-bold text-sm text-slate-300">{language === 'bn' ? 'কোনো হাসপাতাল পাওয়া যায়নি' : 'No hospitals found'}</p>
            <button onClick={() => { setHospSearchQuery(''); setHospDivisionFilter(''); setHospDistrictFilter(''); setHospUpazilaFilter(''); }} className="text-xs text-rose-400 font-bold hover:underline">
              {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHospitals.map((hosp) => (
              <motion.div 
                key={hosp.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 leading-tight">{hosp.name}</h3>
                      <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded mt-1.5 ${
                        hosp.type === 'private' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {hosp.type === 'private' ? t('directory.private') : t('directory.government')}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-rose-400 shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5 pt-1">
                    <MapPin className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <span>{hosp.address} ({formatLocation(hosp)})</span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hosp.services.map((srv, i) => (
                      <span key={i} className="text-[9px] font-semibold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-1 rounded">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedLocation({ query: hosp.name, name: hosp.name })}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-lg hover:border-slate-700 transition"
                  >
                    <Map className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'মানচিত্র' : 'View Map'}
                  </button>
                  <a
                    href={`tel:${hosp.contactPhone}`}
                    className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 bg-slate-950 px-3.5 py-1.5 border border-slate-800 rounded-lg hover:border-slate-700 transition font-mono"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {language === 'bn' ? hosp.contactPhone.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : hosp.contactPhone}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: BLOOD BANKS & STORAGE                                         */}
      {/* ========================================================================= */}
      <section id="bloodbanks-section" className="space-y-6 text-left pt-6 border-t border-slate-800/60">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Droplet className="w-5 h-5 fill-rose-400/10" />
            </div>
            <span>{language === 'bn' ? '২. ব্লাড ব্যাংক ও স্টোরেজ সেন্টার' : '2. Blood Banks & Storage'}</span>
          </h2>
          <p className="text-xs text-slate-400 pl-11">
            {language === 'bn' ? 'লাইভ রক্তের স্টক ইনভেন্টরি তথ্য সহ কেন্দ্রীয় ও আঞ্চলিক অফিসিয়াল ব্লাড ব্যাংকসমূহ' : 'Central & regional official blood repositories with real-time stock inventories.'}
          </p>
        </div>

        {/* Blood Banks Search & Filters */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {language === 'bn' ? 'ব্লাড ব্যাংক অনুসন্ধান' : 'Search Blood Repositories'}
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={bankSearchQuery}
                  onChange={(e) => setBankSearchQuery(e.target.value)}
                  placeholder={language === 'bn' ? 'নাম অথবা ঠিকানা দিয়ে ব্লাড ব্যাংক খুঁজুন...' : 'Search blood repositories by name or address...'}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {language === 'bn' ? 'বিভাগ ফিল্টার' : 'Filter Division'}
              </label>
              <SearchableSelect
                options={divisionOptions}
                value={bankDivisionFilter}
                onChange={(div) => { setBankDivisionFilter(div); setBankDistrictFilter(''); setBankUpazilaFilter(''); }}
                placeholder={language === 'bn' ? 'সব বিভাগ' : 'All Divisions'}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {language === 'bn' ? 'জেলা ফিল্টার' : 'Filter District'}
              </label>
              <SearchableSelect
                options={bankLocOptions.districtOptions}
                value={bankDistrictFilter}
                onChange={(dist) => { setBankDistrictFilter(dist); setBankUpazilaFilter(''); }}
                placeholder={language === 'bn' ? 'সব জেলা' : 'All Districts'}
              />
            </div>
          </div>
        </div>

        {/* Blood Banks Output Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded-md w-3/4" />
                <div className="h-3 bg-slate-850 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredBloodBanks.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 p-6 space-y-3">
            <p className="font-bold text-sm text-slate-300">{language === 'bn' ? 'কোনো ব্লাড ব্যাংক পাওয়া যায়নি' : 'No blood repositories found'}</p>
            <button onClick={() => { setBankSearchQuery(''); setBankDivisionFilter(''); setBankDistrictFilter(''); setBankUpazilaFilter(''); }} className="text-xs text-rose-400 font-bold hover:underline">
              {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBloodBanks.map((bank) => (
              <motion.div 
                key={bank.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 leading-tight">{bank.name}</h3>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        {bank.address} ({formatLocation(bank)})
                      </p>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 shrink-0">
                      <Droplet className="w-4 h-4 fill-emerald-400/10" />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mb-2">
                      {t('directory.bloodAvailability')} ({language === 'bn' ? 'ব্যাগ' : 'Units'})
                    </p>
                    <div className="grid grid-cols-4 gap-2 font-mono">
                      {BLOOD_GROUPS.map((bg) => {
                        const count = bank.availableGroups[bg] || 0;
                        return (
                          <div 
                            key={bg} 
                            className={`p-2 rounded-lg border text-center transition-all ${
                              count > 5 
                                ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400' 
                                : count > 0 
                                  ? 'bg-amber-500/5 border-amber-500/15 text-amber-400' 
                                  : 'bg-slate-950 border-slate-850 text-slate-600'
                            }`}
                          >
                            <p className="text-[10px] font-black">{bg}</p>
                            <p className="text-xs font-black tracking-tight mt-0.5">
                              {language === 'bn' ? String(count).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : count}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedLocation({ query: bank.name, name: bank.name })}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-slate-950 px-3 py-1.5 border border-slate-800 rounded-lg hover:border-slate-700 transition"
                  >
                    <Map className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'মানচিত্র' : 'View Map'}
                  </button>
                  <a
                    href={`tel:${bank.contactPhone}`}
                    className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 bg-slate-950 px-3.5 py-1.5 border border-slate-800 rounded-lg hover:border-slate-700 transition font-mono"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {language === 'bn' ? bank.contactPhone.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : bank.contactPhone}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: AMBULANCE DIRECTORY                                            */}
      {/* ========================================================================= */}
      <section id="ambulances-section" className="space-y-6 text-left pt-6 border-t border-slate-800/60">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Phone className="w-5 h-5 text-rose-400" />
            </div>
            <span>{language === 'bn' ? '৩. অ্যাম্বুলেন্স সার্ভিস ডিরেক্টরি' : '3. Ambulance Directory'}</span>
          </h2>
          <p className="text-xs text-slate-400 pl-11">
            {language === 'bn' ? '২৪/৭ জরুরি অ্যাম্বুলেন্স সার্ভিস, আইসিইউ সাপোর্ট ও ফ্রিজার অ্যাম্বুলেন্স ফ্লীটসমূহ' : '24/7 emergency ambulance fleets, ICU & freezer ambulances across Bangladesh.'}
          </p>
        </div>

        {/* Dynamic Statistics Panel for Ambulances */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700/80 transition-all text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{language === 'bn' ? 'মোট অ্যাম্বুলেন্স' : 'Total Providers'}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-rose-500">{ambulances.length}</span>
              <Truck className="w-4 h-4 text-slate-600 shrink-0" />
            </div>
          </div>
          
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700/80 transition-all text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{language === 'bn' ? 'উপলব্ধ এখন' : 'Available Now'}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-emerald-400">
                {ambulances.filter(a => a.liveStatus === 'Available' || !a.liveStatus).length}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700/80 transition-all text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{language === 'bn' ? 'ভেরিফাইড প্রোভাইডার' : 'Verified'}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-indigo-400">{ambulances.filter(a => a.isVerified).length}</span>
              <Shield className="w-4 h-4 text-indigo-400 fill-indigo-400/10" />
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700/80 transition-all text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{language === 'bn' ? 'আইসিইউ সেবা' : 'ICU Support'}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-amber-500">{ambulances.filter(a => a.availableTypes?.some(t => t.toLowerCase().includes('icu'))).length}</span>
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl col-span-2 md:col-span-1 flex flex-col justify-between hover:border-slate-700/80 transition-all text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{language === 'bn' ? '২৪/৭ সার্ভিস' : '24/7 Services'}</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-sky-400">{ambulances.filter(a => a.isAvailable247).length}</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
          </div>
        </div>

        {/* Geolocation Distance Estimator control */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-200">
                {language === 'bn' ? 'দূরত্ব ও পৌঁছানোর আনুমানিক সময়' : 'Distance & ETA Estimator'}
              </h3>
            </div>
            <p className="text-[10px] text-slate-400">
              {userCoords 
                ? (language === 'bn' 
                    ? `সক্রিয় অবস্থান: (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}) - অ্যাম্বুলেন্সের দূরত্ব পরিমাপ করা হয়েছে।` 
                    : `Active Coordinates: (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}) - Showing distance and arrival time.`)
                : (language === 'bn'
                    ? 'আপনার অবস্থান শেয়ার করুন অথবা ধানমণ্ডিতে অবস্থান সিমুলেট করে দূরত্ব ও সময় পরীক্ষা করুন।'
                    : 'Share your device location or simulate Dhanmondi coordinates to see estimated response distance & ETA.')
              }
            </p>
          </div>

          <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={enableLiveLocation}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                userCoords && !locationError
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-extrabold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {language === 'bn' ? 'আমার লাইভ অবস্থান' : 'My Live Location'}
            </button>
            <button
              onClick={simulateLocation}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                userCoords && userCoords.lat === 23.7461
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-extrabold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {language === 'bn' ? 'সিমুলেট করুন (ঢাকা)' : 'Simulate Location (Dhaka)'}
            </button>
          </div>
        </div>

        {/* Ambulances Search & Filters */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {language === 'bn' ? 'অ্যাম্বুলেন্স অনুসন্ধান' : 'Search Ambulance Services'}
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={ambSearchQuery}
                  onChange={(e) => { setAmbSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder={language === 'bn' ? 'নাম অথবা অঞ্চল দিয়ে অ্যাম্বুলেন্স খুঁজুন...' : 'Search ambulance services by name, type or region...'}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {language === 'bn' ? 'বিভাগ ফিল্টার' : 'Filter Division'}
              </label>
              <SearchableSelect
                options={divisionOptions}
                value={ambDivisionFilter}
                onChange={(div) => { setAmbDivisionFilter(div); setAmbDistrictFilter(''); setAmbUpazilaFilter(''); setCurrentPage(1); }}
                placeholder={language === 'bn' ? 'সব বিভাগ' : 'All Divisions'}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {language === 'bn' ? 'জেলা ফিল্টার' : 'Filter District'}
              </label>
              <SearchableSelect
                options={ambLocOptions.districtOptions}
                value={ambDistrictFilter}
                onChange={(dist) => { setAmbDistrictFilter(dist); setAmbUpazilaFilter(''); setCurrentPage(1); }}
                placeholder={language === 'bn' ? 'সব জেলা' : 'All Districts'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {language === 'bn' ? 'সার্ভিস টাইপ' : 'Service Type'}
              </label>
              <select
                value={serviceTypeFilter}
                onChange={(e) => { setServiceTypeFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3.5 py-2.5 rounded-xl text-xs outline-none focus:border-rose-500/80 transition font-semibold"
              >
                <option value="">{language === 'bn' ? 'সব টাইপ' : 'All Types'}</option>
                <option value="ICU Support">{language === 'bn' ? 'আইসিইউ সাপোর্ট' : 'ICU Support'}</option>
                <option value="AC Ambulance">{language === 'bn' ? 'এসি অ্যাম্বুলেন্স' : 'AC Ambulance'}</option>
                <option value="Non-AC Ambulance">{language === 'bn' ? 'নন-এসি অ্যাম্বুলেন্স' : 'Non-AC Ambulance'}</option>
                <option value="Freezer Ambulance">{language === 'bn' ? 'ফ্রিজার অ্যাম্বুলেন্স' : 'Freezer Ambulance'}</option>
                <option value="Neonatal Support">{language === 'bn' ? 'নবজাতক সাপোর্ট' : 'Neonatal Support'}</option>
              </select>
            </div>

            <div className="flex items-center gap-4 sm:col-span-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={is247Filter}
                  onChange={(e) => { setIs247Filter(e.target.checked); setCurrentPage(1); }}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-850 focus:ring-rose-500"
                />
                <span className="text-xs font-semibold text-slate-300">
                  {language === 'bn' ? '২৪/৭ উপলব্ধ' : '24/7 Available'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={isVerifiedFilter}
                  onChange={(e) => { setIsVerifiedFilter(e.target.checked); setCurrentPage(1); }}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-850 focus:ring-rose-500"
                />
                <span className="text-xs font-semibold text-slate-300">
                  {language === 'bn' ? 'শুধুমাত্র ভেরিফাইড' : 'Verified Only'}
                </span>
              </label>

              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'bn' ? 'ক্রমানুসারে:' : 'Sort By:'}
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                  className="bg-slate-950 border border-slate-800 text-slate-100 px-2.5 py-1.5 rounded-lg text-xs outline-none focus:border-rose-500/80 transition"
                >
                  <option value="default">{language === 'bn' ? 'ডিফল্ট' : 'Default'}</option>
                  <option value="fare_asc">{language === 'bn' ? 'ভাড়া: কম থেকে বেশি' : 'Fare: Low to High'}</option>
                  <option value="fare_desc">{language === 'bn' ? 'ভাড়া: বেশি থেকে কম' : 'Fare: High to Low'}</option>
                  <option value="rating_desc">{language === 'bn' ? 'রেটিং: সর্বোচ্চ' : 'Highest Rating'}</option>
                  <option value="response_asc">{language === 'bn' ? 'দ্রুত রেসপন্স' : 'Fastest Response'}</option>
                  <option value="name_asc">{language === 'bn' ? 'নাম: অ-ক' : 'Name: A-Z'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Ambulances Output Cards List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded-md w-3/4" />
                <div className="h-3 bg-slate-850 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : sortedAmbulances.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 p-6 space-y-3">
            <p className="font-bold text-sm text-slate-300">{language === 'bn' ? 'কোনো অ্যাম্বুলেন্স সার্ভিস খুঁজে পাওয়া যায়নি' : 'No ambulance services found'}</p>
            <button onClick={() => { setAmbSearchQuery(''); setAmbDivisionFilter(''); setAmbDistrictFilter(''); setServiceTypeFilter(''); setIs247Filter(false); setIsVerifiedFilter(false); setSortOption('default'); setCurrentPage(1); }} className="text-xs text-rose-400 font-bold hover:underline">
              {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(() => {
                const itemsPerPage = 6;
                const totalPages = Math.ceil(sortedAmbulances.length / itemsPerPage);
                const activePage = Math.min(currentPage, Math.max(totalPages, 1));
                const paginatedAmbulances = sortedAmbulances.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

                return paginatedAmbulances.map((amb) => {
                  const isFav = currentUser?.favoriteAmbulances?.includes(amb.id) || false;
                  const ambCoords = getAmbulanceCoords(amb.id, amb.district);
                  const dist = userCoords ? calculateDistance(userCoords, ambCoords) : null;
                  const eta = dist ? Math.max(5, Math.round((dist / 30) * 60 + 5)) : null;

                  return (
                    <motion.div 
                      key={amb.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-slate-900/65 backdrop-blur-md border rounded-2xl flex flex-col justify-between hover:shadow-lg hover:shadow-rose-950/10 transition-all duration-300 group text-left ${
                        amb.isFeatured ? 'border-rose-500/30 ring-1 ring-rose-500/10' : 'border-slate-800/85 hover:border-rose-500/20'
                      }`}
                    >
                      <div className="p-4 sm:p-5 space-y-4">
                        <div className="flex gap-4 items-start">
                          <div className="relative shrink-0">
                            <img 
                              src={amb.imageUrl || 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=200&q=80'} 
                              alt={amb.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-800 shadow-inner group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                            {amb.orgLogoUrl && (
                              <img
                                src={amb.orgLogoUrl}
                                alt="Org logo"
                                className="w-7 h-7 object-cover rounded-full border border-slate-950 absolute -bottom-1 -right-1 z-10 shadow-lg"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            )}
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1 items-center justify-between">
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className={`px-1.5 py-0.5 border rounded text-[8px] font-black uppercase tracking-wider ${
                                  amb.provider === 'Government' 
                                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' 
                                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                }`}>
                                  {language === 'bn' 
                                    ? (amb.provider === 'Private' ? 'বেসরকারি' : 'সরকারি') 
                                    : amb.provider
                                  }
                                </span>
                                
                                {amb.isVerified && (
                                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[8px] font-black uppercase tracking-wide">
                                    <Shield className="w-2.5 h-2.5 fill-emerald-400/10" />
                                    {language === 'bn' ? 'ভেরিফাইড' : 'Verified'}
                                  </span>
                                )}

                                {amb.isFeatured && (
                                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[8px] font-black uppercase tracking-wide">
                                    <Sparkles className="w-2.5 h-2.5 fill-amber-400/10" />
                                    {language === 'bn' ? 'ফিচার্ড' : 'Featured'}
                                  </span>
                                )}

                                {amb.isAvailable247 && (
                                  <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[8px] font-black tracking-wide animate-pulse uppercase">
                                    24/7
                                  </span>
                                )}
                              </div>

                              {getStatusBadge(amb.liveStatus)}
                            </div>
                            
                            <div className="flex items-start justify-between gap-1.5">
                              <h3 className="font-extrabold text-slate-100 text-sm leading-snug group-hover:text-rose-400 transition-colors duration-200 truncate">
                                {amb.name}
                              </h3>
                              
                              <button
                                onClick={() => handleToggleFavorite(amb.id)}
                                className={`p-1.5 bg-slate-950/80 border rounded-lg transition shrink-0 focus-visible:ring-2 focus-visible:ring-rose-500 outline-none ${
                                  isFav ? 'text-rose-500 border-rose-500/30 bg-rose-500/10' : 'text-slate-500 border-slate-800 hover:text-rose-400 hover:border-rose-500/20'
                                }`}
                                title="Toggle favorite"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2.5 items-center text-[10px] text-slate-400">
                              {amb.averageResponseTime && (
                                <p className="font-semibold font-mono flex items-center gap-0.5">
                                  ⏱️ {language === 'bn' ? 'গড় সময়:' : 'Response Time:'} <strong className="text-rose-400 font-bold">{amb.averageResponseTime}</strong>
                                </p>
                              )}
                              <div className="flex items-center gap-0.5 bg-slate-950/80 border border-slate-850 px-1.5 py-0.5 rounded-md font-bold text-amber-400">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{amb.averageRating || '5.0'}</span>
                                <span className="text-slate-500 text-[9px] font-semibold">({amb.totalReviews || 0})</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-950/40 border border-slate-850/60 p-2.5 rounded-xl text-[11px]">
                          <div>
                            <span className="text-slate-500 font-bold uppercase text-[8px] block">{language === 'bn' ? 'গাড়ি নম্বর' : 'Vehicle Number'}</span>
                            <span className="text-slate-300 font-bold font-mono">{amb.vehicleNumber || 'Dhaka Metro-11-XX'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold uppercase text-[8px] block">{language === 'bn' ? 'শুরুর ভাড়া' : 'Starting fare'}</span>
                            <span className="text-rose-400 font-extrabold font-mono">
                              {amb.startingFare 
                                ? `৳ ${language === 'bn' ? String(amb.startingFare).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : amb.startingFare}` 
                                : (language === 'bn' ? 'আলোচনা সাপেক্ষে' : 'Negotiable')}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-slate-300">
                          <p className="flex items-start gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="leading-relaxed text-slate-300 text-xs">
                              {amb.address}, {formatLocation(amb)}
                            </span>
                          </p>
                        </div>

                        {dist !== null && (
                          <div className="bg-indigo-500/5 border border-indigo-500/10 p-2 rounded-xl flex items-center justify-between text-xs font-mono text-indigo-300">
                            <span className="flex items-center gap-1">
                              <Navigation className="w-3.5 h-3.5 animate-bounce" />
                              {language === 'bn' ? 'দূরত্ব:' : 'Distance:'} <strong>{dist.toFixed(1)} km</strong>
                            </span>
                            <span>
                              ⏱️ {language === 'bn' ? 'সময়:' : 'ETA:'} <strong>{eta} mins</strong>
                            </span>
                          </div>
                        )}

                        {amb.availableTypes && amb.availableTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {amb.availableTypes.map((type, i) => (
                              <span key={i} className="text-[9px] font-bold text-slate-300 bg-slate-950/80 border border-slate-850/80 px-2.5 py-0.5 rounded-md">
                                🚌 {type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-850 p-4 sm:p-5 pt-4 flex flex-col gap-3">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <a
                            href={`tel:${amb.contactPhone}`}
                            onClick={() => handleCallClick(amb.id)}
                            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black rounded-xl transition duration-200 shadow-md font-mono h-[44px] flex-1 sm:flex-initial"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {language === 'bn' ? 'কল করুন' : 'Call'}
                          </a>

                          {amb.whatsapp && (
                            <a
                              href={`https://wa.me/${amb.whatsapp.replace(/\+/g, '')}`}
                              onClick={() => handleWaClick(amb.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition duration-200 shadow-md h-[44px] flex-1 sm:flex-initial"
                            >
                              WhatsApp
                            </a>
                          )}

                          <a
                            href={amb.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(amb.name + ' ' + (amb.address || 'Bangladesh'))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-950 hover:bg-slate-850 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 hover:text-indigo-300 text-xs font-bold rounded-xl transition duration-200 shadow-md h-[44px] flex-1 sm:flex-initial"
                          >
                            <Map className="w-3.5 h-3.5" />
                            {language === 'bn' ? 'ম্যাপ' : 'Map'}
                          </a>

                          <button
                            onClick={() => {
                              setSelectedAmbulance(amb);
                              setCommentInput('');
                              setRatingInput(5);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-750 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl transition duration-200 h-[44px] flex-1 sm:flex-initial"
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {language === 'bn' ? 'তথ্য' : 'Details'}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 justify-end w-full">
                          <button
                            onClick={() => handleCopyPhone(amb.id, amb.contactPhone)}
                            className={`flex items-center justify-center gap-1.5 px-3.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-xl text-xs font-bold border border-slate-800 transition duration-200 h-[44px] cursor-pointer flex-1 sm:flex-initial ${
                              copiedId === amb.id ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : ''
                            }`}
                          >
                            {copiedId === amb.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                {language === 'bn' ? 'কপি হয়েছে' : 'Copied'}
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                                {language === 'bn' ? 'কপি' : 'Copy'}
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleShareContact(amb)}
                            className="flex items-center justify-center gap-1.5 px-3.5 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-xl text-xs font-bold border border-slate-800 transition duration-200 h-[44px] cursor-pointer flex-1 sm:flex-initial"
                          >
                            {language === 'bn' ? 'শেয়ার' : 'Share'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>

            {/* Pagination Controls */}
            {(() => {
              const itemsPerPage = 6;
              const totalPages = Math.ceil(sortedAmbulances.length / itemsPerPage);
              const activePage = Math.min(currentPage, Math.max(totalPages, 1));

              if (totalPages <= 1) return null;

              return (
                <div className="flex items-center justify-center gap-2 pt-6 flex-wrap">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={activePage === 1}
                    className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-800 text-xs text-slate-300 font-bold rounded-xl transition cursor-pointer"
                  >
                    {language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold border transition cursor-pointer ${
                        activePage === pNum
                          ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-950/20'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-750'
                      }`}
                    >
                      {language === 'bn' ? String(pNum).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]) : pNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={activePage === totalPages}
                    className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-800 text-xs text-slate-300 font-bold rounded-xl transition cursor-pointer"
                  >
                    {language === 'bn' ? 'পরবর্তী' : 'Next'}
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* Map modal overlay */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/60 pb-3 text-left">
              <h3 className="text-sm font-bold text-slate-100">{selectedLocation.name}</h3>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
            
            <LocationMap locationQuery={selectedLocation.query} displayName={selectedLocation.name} height="h-96" />
          </div>
        </div>
      )}

      {/* Ambulance Details Modal */}
      <AnimatePresence>
        {selectedAmbulance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-slate-900/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 text-left my-8"
            >
              <div className="flex justify-between items-start border-b border-slate-800/80 pb-4">
                <div className="flex gap-3 items-center">
                  <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/15">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-100">{selectedAmbulance.name}</h3>
                    <p className="text-[11px] text-slate-400">{selectedAmbulance.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAmbulance(null)}
                  className="p-1.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-100 rounded-xl border border-slate-800 hover:border-slate-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                    {language === 'bn' ? 'অ্যাম্বুলেন্সের মূল বিবরণ' : 'Ambulance Core Details'}
                  </h3>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        {language === 'bn' ? 'চালক ও জরুরি পরিচিতি' : 'Driver & Contact'}
                      </span>
                      <p className="text-xs text-slate-200">
                        {language === 'bn' ? 'চালক:' : 'Driver:'} <strong className="font-extrabold">{selectedAmbulance.driverName || (language === 'bn' ? 'অনুরোধ সাপেক্ষে' : 'On Request')}</strong>
                      </p>
                      <p className="text-xs text-slate-300">
                        {language === 'bn' ? 'জরুরি পরিচালক:' : 'Manager:'} <strong>{selectedAmbulance.emergencyContactPerson || 'Office'}</strong>
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {language === 'bn' ? 'পেমেন্ট পদ্ধতি ও ভাড়া' : 'Payment & Fare Details'}
                      </span>
                      <p className="text-xs text-slate-200">
                        {language === 'bn' ? 'ভাড়া শুরু:' : 'Starting Fare:'} <strong className="text-rose-400 font-black">
                          {selectedAmbulance.startingFare ? `৳ ${selectedAmbulance.startingFare}` : (language === 'bn' ? 'আলোচনা সাপেক্ষে' : 'Negotiable')}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase flex justify-between">
                      <span>{language === 'bn' ? 'ব্যবহারকারী রিভিউসমূহ' : 'User Reviews'}</span>
                      <span className="text-amber-400">★ {selectedAmbulance.averageRating || '5.0'}</span>
                    </h3>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {!(selectedAmbulance.reviews) || selectedAmbulance.reviews.filter(r => !r.isHidden).length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-4">
                          {language === 'bn' ? 'কোনো রিভিউ এখনো জমা দেওয়া হয়নি।' : 'No verified reviews submitted yet.'}
                        </p>
                      ) : (
                        selectedAmbulance.reviews.map((rev) => {
                          const showToUser = !rev.isHidden || currentUser?.isAdmin;
                          if (!showToUser) return null;

                          return (
                            <div key={rev.id} className="p-2.5 rounded-xl border space-y-1 text-xs text-left bg-slate-950/60 border-slate-850">
                              <div className="flex justify-between items-center">
                                <strong className="text-slate-200">{rev.userName}</strong>
                                <span className="text-amber-400 font-extrabold font-mono">★ {rev.rating}</span>
                              </div>
                              <p className="text-slate-400 italic">"{rev.comment}"</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-2xl space-y-2.5 mt-2">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">
                      {language === 'bn' ? 'আপনার রিভিউ যোগ করুন' : 'Write a Review'}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setRatingInput(star)} className="text-amber-400 hover:scale-110 transition">
                          <Star className={`w-4 h-4 ${ratingInput >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder={language === 'bn' ? 'রিভিউ মন্তব্য লিখুন...' : 'Write feedback...'}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl text-xs px-3 py-1.5 outline-none focus:border-rose-500 text-slate-100"
                      />
                      <button
                        onClick={() => handlePostReview(selectedAmbulance.id)}
                        disabled={submittingReview}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                      >
                        {submittingReview ? '...' : (language === 'bn' ? 'জমা দিন' : 'Post')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
