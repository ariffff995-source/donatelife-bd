'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Hospital } from '../types';
import { DIVISIONS, districtsOf } from '../data/bangladesh-locations';
import { 
  Building, Search, MapPin, Phone, Clock, ArrowUpRight, 
  Map, Check, X, Shield, Sparkles, AlertCircle, Copy
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LocationMap } from '../components/LocationMap';
import SearchableSelect from '../components/SearchableSelect';
import { getEnglishLocationValue } from '../utils/locationHelper';

export default function HospitalsView() {
  const { language, t, translateLocation, formatLocation } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [upazilaFilter, setUpazilaFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ query: string; name: string } | null>(null);
  const [detailsHospital, setDetailsHospital] = useState<Hospital | null>(null);

  const fetchHospitals = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const list = await api.directories.hospitals('', '');
      setHospitals(list || []);
    } catch (err: any) {
      console.error('Failed to fetch hospitals', err);
      setFetchError(err?.message || 'Failed to load hospital directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHospitals = hospitals.filter((hosp) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || hosp.name.toLowerCase().includes(q) || hosp.address.toLowerCase().includes(q) || (hosp.services || []).some(s => s.toLowerCase().includes(q));

    const engDivision = getEnglishLocationValue(divisionFilter);
    const matchDiv = !divisionFilter || (hosp.division && hosp.division.toLowerCase() === engDivision.toLowerCase());

    const engDistrict = getEnglishLocationValue(districtFilter);
    const matchDist = !districtFilter || (hosp.district && hosp.district.toLowerCase() === engDistrict.toLowerCase());

    const matchUpazila = !upazilaFilter || (hosp.upazila && hosp.upazila.toLowerCase().includes(upazilaFilter.toLowerCase()));

    return matchQuery && matchDiv && matchDist && matchUpazila;
  });

  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage);
  const displayedHospitals = filteredHospitals.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Building className="w-4 h-4" />
            Clinical Network Directory
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Hospitals & Specialized Clinics
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Verified public and private healthcare centers across Bangladesh with 24/7 emergency response departments.
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
              placeholder="Search hospital name, clinical department, address..."
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div>
              <input
                type="text"
                value={upazilaFilter}
                onChange={(e) => { setUpazilaFilter(e.target.value); setPage(1); }}
                placeholder="Filter Upazila / Area"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex items-center justify-center py-20 font-mono text-xs text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            Loading Hospitals Directory...
          </div>
        ) : fetchError ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-rose-400">{fetchError}</p>
            <button onClick={fetchHospitals} className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200">
              Try Again
            </button>
          </div>
        ) : displayedHospitals.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">No Hospitals Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting search filters or location selections.</p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedHospitals.map((hosp) => (
              <motion.div
                key={hosp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-lg group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      24/7 Service
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {hosp.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      {formatLocation(hosp)}
                    </p>
                  </div>

                  {hosp.services && hosp.services.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Key Services</span>
                      <div className="flex flex-wrap gap-1.5">
                        {hosp.services.slice(0, 4).map((srv, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
                            {srv}
                          </span>
                        ))}
                        {hosp.services.length > 4 && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                            +{hosp.services.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-5 border-t border-slate-800/80 mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {hosp.contactPhone}
                    </span>
                    <button
                      onClick={() => handleCopyPhone(hosp.id, hosp.contactPhone)}
                      className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-white border border-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedId === hosp.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDetailsHospital(hosp)}
                      className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl transition text-center cursor-pointer"
                    >
                      View Details
                    </button>
                    <a
                      href={`tel:${hosp.contactPhone}`}
                      className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition text-center flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call Emergency
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

      {/* Details Modal */}
      <AnimatePresence>
        {detailsHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 relative"
            >
              <button
                onClick={() => setDetailsHospital(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Building className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{detailsHospital.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {formatLocation(detailsHospital)}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Full Address</span>
                  <p>{detailsHospital.address}</p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">Emergency Hotline</span>
                  <p className="font-mono text-emerald-400 font-bold">{detailsHospital.contactPhone}</p>
                </div>

                {detailsHospital.services && detailsHospital.services.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Services</span>
                    <div className="flex flex-wrap gap-1.5">
                      {detailsHospital.services.map((srv, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg">
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedLocation({ query: `${detailsHospital.name}, ${detailsHospital.address}`, name: detailsHospital.name })}
                  className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Map className="w-4 h-4 text-indigo-400" />
                  View Map
                </button>
                <a
                  href={`tel:${detailsHospital.contactPhone}`}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Emergency Hotline
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
                  <Map className="w-5 h-5 text-indigo-400" />
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