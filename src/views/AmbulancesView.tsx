'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Ambulance } from '../types';
import { DIVISIONS, districtsOf } from '../data/bangladesh-locations';
import { 
  Phone, Search, MapPin, Clock, ArrowUpRight, 
  Map, Check, X, Shield, Sparkles, AlertCircle, Copy, Truck, Star, ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LocationMap } from '../components/LocationMap';
import SearchableSelect from '../components/SearchableSelect';
import { getEnglishLocationValue } from '../utils/locationHelper';
import { useAppContext } from '../providers';

export default function AmbulancesView() {
  const { language, t, translateLocation, formatLocation } = useLanguage();
  const { currentUser } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [upazilaFilter, setUpazilaFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [is247Only, setIs247Only] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ query: string; name: string } | null>(null);
  const [detailsAmbulance, setDetailsAmbulance] = useState<Ambulance | null>(null);

  // Review states
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const fetchAmbulances = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const list = await api.ambulances.list();
      setAmbulances(list || []);
    } catch (err: any) {
      console.error('Failed to fetch ambulances', err);
      setFetchError(err?.message || 'Failed to load ambulance directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailsAmbulance || !commentInput.trim()) return;
    setSubmittingReview(true);
    setReviewMessage(null);
    try {
      const res = await api.ambulances.addReview(detailsAmbulance.id, {
        rating: ratingInput,
        comment: commentInput.trim(),
      });
      setReviewMessage('Thank you! Review submitted successfully.');
      setCommentInput('');
      fetchAmbulances();
      setDetailsAmbulance(prev => prev ? {
        ...prev,
        reviews: [...(prev.reviews || []), res.review],
        averageRating: res.averageRating,
        totalReviews: res.totalReviews
      } : null);
    } catch (err: any) {
      setReviewMessage(err?.message || 'Failed to post review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredAmbulances = ambulances.filter((amb) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || amb.name.toLowerCase().includes(q) || amb.address.toLowerCase().includes(q) || (amb.driverName && amb.driverName.toLowerCase().includes(q));

    const engDivision = getEnglishLocationValue(divisionFilter);
    const matchDiv = !divisionFilter || (amb.division && amb.division.toLowerCase() === engDivision.toLowerCase());

    const engDistrict = getEnglishLocationValue(districtFilter);
    const matchDist = !districtFilter || (amb.district && amb.district.toLowerCase() === engDistrict.toLowerCase());

    const matchUpazila = !upazilaFilter || (amb.upazila && amb.upazila.toLowerCase().includes(upazilaFilter.toLowerCase()));

    const matchType = !typeFilter || (amb.availableTypes && amb.availableTypes.some(t => t.toLowerCase().includes(typeFilter.toLowerCase())));

    const match247 = !is247Only || amb.isAvailable247;

    return matchQuery && matchDiv && matchDist && matchUpazila && matchType && match247;
  });

  const totalPages = Math.ceil(filteredAmbulances.length / itemsPerPage);
  const displayedAmbulances = filteredAmbulances.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const AMBULANCE_TYPES = ['AC Ambulance', 'Non-AC Ambulance', 'ICU Ambulance', 'Freezer Ambulance'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            24/7 Emergency Dispatch
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Ambulance Service Directory
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Instant dispatch contact numbers for AC, ICU, Non-AC, and Freezer ambulances across all 64 districts.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search provider name, driver, address..."
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <SearchableSelect
                options={[{ label: 'All Ambulance Types', value: '' }, ...AMBULANCE_TYPES.map(t => ({ label: t, value: t }))]}
                value={typeFilter}
                onChange={(val) => { setTypeFilter(val); setPage(1); }}
                placeholder="Ambulance Type"
              />
            </div>
            <div>
              <SearchableSelect
                options={[{ label: 'All Divisions', value: '' }, ...DIVISIONS.map(d => ({ label: d, value: d }))]}
                value={divisionFilter}
                onChange={(val) => { setDivisionFilter(val); setDistrictFilter(''); setUpazilaFilter(''); setPage(1); }}
                placeholder="Division"
              />
            </div>
            <div>
              <SearchableSelect
                options={[{ label: 'All Districts', value: '' }, ...(divisionFilter ? districtsOf(divisionFilter) : []).map(d => ({ label: d, value: d }))]}
                value={districtFilter}
                onChange={(val) => { setDistrictFilter(val); setUpazilaFilter(''); setPage(1); }}
                placeholder="District"
                disabled={!divisionFilter}
              />
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl min-h-[44px]">
              <label className="text-xs font-bold text-slate-300 uppercase cursor-pointer select-none">24/7 Available Only</label>
              <input
                type="checkbox"
                checked={is247Only}
                onChange={(e) => { setIs247Only(e.target.checked); setPage(1); }}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex items-center justify-center py-20 font-mono text-xs text-slate-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            Loading Ambulance Directory...
          </div>
        ) : fetchError ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-rose-400">{fetchError}</p>
            <button onClick={fetchAmbulances} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200">
              Try Again
            </button>
          </div>
        ) : displayedAmbulances.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">No Ambulances Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing type or location filters.</p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedAmbulances.map((amb) => (
              <motion.div
                key={amb.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-lg group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Truck className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {amb.isVerified && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified Provider
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {amb.averageResponseTime || '30 mins'} Response
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      {amb.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      {formatLocation(amb)}
                    </p>
                  </div>

                  {/* Available Types */}
                  {amb.availableTypes && amb.availableTypes.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Available Ambulances</span>
                      <div className="flex flex-wrap gap-1.5">
                        {amb.availableTypes.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-200 border border-slate-800 font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rating display */}
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{amb.averageRating || '5.0'}</span>
                    <span className="text-slate-500 text-[10px]">({amb.totalReviews || 0} reviews)</span>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-800/80 mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {amb.contactPhone}
                    </span>
                    <button
                      onClick={() => handleCopyPhone(amb.id, amb.contactPhone)}
                      className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-white border border-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedId === amb.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDetailsAmbulance(amb)}
                      className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl transition text-center cursor-pointer"
                    >
                      View Details
                    </button>
                    <a
                      href={`tel:${amb.contactPhone}`}
                      className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase rounded-xl transition text-center flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Dispatch
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-slate-400 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Details & Review Modal */}
      <AnimatePresence>
        {detailsAmbulance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => { setDetailsAmbulance(null); setReviewMessage(null); }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800 cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{detailsAmbulance.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {formatLocation(detailsAmbulance)}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Full Address</span>
                  <p>{detailsAmbulance.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Dispatch Number</span>
                    <p className="font-mono text-emerald-400 font-bold">{detailsAmbulance.contactPhone}</p>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Driver Name</span>
                    <p className="font-bold text-slate-200">{detailsAmbulance.driverName || 'Verified Crew'}</p>
                  </div>
                </div>

                {detailsAmbulance.availableTypes && detailsAmbulance.availableTypes.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Fleet Vehicles</span>
                    <div className="flex flex-wrap gap-1.5">
                      {detailsAmbulance.availableTypes.map((type, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Reviews */}
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <span className="font-bold text-slate-300 uppercase text-xs">Patient & User Reviews</span>
                  
                  {detailsAmbulance.reviews && detailsAmbulance.reviews.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {detailsAmbulance.reviews.filter(r => !r.isHidden).map((r, i) => (
                        <div key={i} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-200">{r.userName || 'Anonymous User'}</span>
                            <span className="flex items-center gap-1 text-amber-400 font-bold"><Star className="w-3 h-3 fill-amber-400" /> {r.rating}</span>
                          </div>
                          <p className="text-slate-400 text-xs">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs italic">No reviews submitted yet.</p>
                  )}

                  {/* Add Review Form */}
                  <form onSubmit={handleAddReview} className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Leave a Review</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRatingInput(star)}
                            className="cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${ratingInput >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write your experience..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    ></textarea>
                    {reviewMessage && <p className="text-xs text-emerald-400 font-bold">{reviewMessage}</p>}
                    <button
                      type="submit"
                      disabled={submittingReview || !commentInput.trim()}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50 cursor-pointer"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Service Review'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedLocation({ query: `${detailsAmbulance.name}, ${detailsAmbulance.address}`, name: detailsAmbulance.name })}
                  className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Map className="w-4 h-4 text-amber-400" />
                  View Map
                </button>
                <a
                  href={`tel:${detailsAmbulance.contactPhone}`}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Dispatch
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Map View Modal */}
      <AnimatePresence>
        {selectedLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Map className="w-5 h-5 text-amber-400" />
                  {selectedLocation.name}
                </h3>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <LocationMap locationQuery={selectedLocation.query} displayName={selectedLocation.name} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}