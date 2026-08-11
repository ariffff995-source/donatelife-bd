'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ShieldCheck, Heart, Phone, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { calculateHaversineDistance, formatDistance, getCoordinatesForLocation } from '../utils/locationHelper';
import { getReputationBadge, calculateReputationScore } from '../utils/gamification';

interface DonorLocationItem {
  id?: string;
  donorId?: string;
  name: string;
  bloodGroup: string;
  division: string;
  district: string;
  upazila: string;
  latitude?: string | null;
  longitude?: string | null;
  isAvailable?: boolean;
  isVerified?: boolean;
  phone?: string | null;
  showPhone?: boolean;
  reputationScore?: number;
  totalDonations?: number;
}

interface NearbyDonorsMapProps {
  donors: DonorLocationItem[];
  userLat?: number | null;
  userLng?: number | null;
  onLocationDetected?: (lat: number, lng: number) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  onSelectDonor?: (donor: DonorLocationItem) => void;
}

export const NearbyDonorsMap: React.FC<NearbyDonorsMapProps> = ({
  donors,
  userLat,
  userLng,
  onLocationDetected,
  radiusKm,
  setRadiusKm,
  onSelectDonor
}) => {
  const { language } = useLanguage();
  const [isLocating, setIsLocating] = useState(false);
  const [activeDonor, setActiveDonor] = useState<DonorLocationItem | null>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'bn' ? 'আপনার ব্রাউজারে জিওলোকেশন সমর্থিত নয়।' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        if (onLocationDetected) {
          onLocationDetected(pos.coords.latitude, pos.coords.longitude);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed or denied:', err);
        alert(language === 'bn' ? 'জিপিএস লোকেশন পাওয়া যায়নি। অনুগ্রহ করে পারমিশন চেক করুন।' : 'GPS location access denied or unavailable.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Map center location
  const centerLat = userLat || 23.8103;
  const centerLng = userLng || 90.4125;

  const encodedQuery = encodeURIComponent(`${centerLat},${centerLng}`);
  const embedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=${userLat ? '13' : '10'}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              {language === 'bn' ? '🗺️ লাইভ নিকটস্থ রক্তদাতা ম্যাপ' : '🗺️ Live Nearby Donors Map'}
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
                GPS Radar
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {userLat && userLng
                ? (language === 'bn' ? `আপনার জিপিএস অবস্থানের ${radiusKm} কিমি ব্যাসার্ধে অনুসন্ধান চলছে` : `Searching within ${radiusKm}km radius of your GPS location`)
                : (language === 'bn' ? 'জেলা/বিভাগ ভিত্তিক জিপিএস সিঙ্ক' : 'GPS synced location map')}
            </p>
          </div>
        </div>

        {/* Action buttons & Radius selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Radius Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] font-bold text-slate-400 px-2">{language === 'bn' ? 'ব্যাসার্ধ:' : 'Radius:'}</span>
            {[5, 10, 20, 50].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  radiusKm === r
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>

          {/* Browser Geolocation Button */}
          <button
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? (language === 'bn' ? 'খুঁজছে...' : 'Locating...') : (language === 'bn' ? 'আমার জিপিএস অন করুন' : 'Use My GPS')}</span>
          </button>
        </div>
      </div>

      {/* Embed Map Container */}
      <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-950 shadow-inner">
        <iframe
          title="Nearby Donors Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={embedUrl}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale invert opacity-80 contrast-125 hover:opacity-100 transition-all duration-300"
        />

        {/* Radar Overlay Badge */}
        <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800/90 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-slate-300 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="font-mono text-[11px]">
            {userLat ? `${donors.length} ${language === 'bn' ? 'জন রক্তদাতা নিকটে' : 'Donors Nearby'}` : (language === 'bn' ? 'জিপিএস সক্রিয় করুন' : 'Enable GPS for exact distance')}
          </span>
        </div>
      </div>

      {/* Selected Donor Quick Action Bar */}
      {activeDonor && (
        <div className="bg-slate-950 border border-rose-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 font-extrabold text-sm shrink-0">
              {activeDonor.bloodGroup}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-100">{activeDonor.name}</h4>
                {activeDonor.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {(() => {
                  const rep = getReputationBadge(calculateReputationScore(activeDonor));
                  return (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${rep.bgColor} ${rep.color} ${rep.borderColor} border`}>
                      {rep.badgeEmoji} {rep.tier}
                    </span>
                  );
                })()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeDonor.upazila}, {activeDonor.district}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeDonor.showPhone && activeDonor.phone && (
              <a
                href={`tel:${activeDonor.phone}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কল' : 'Call'}</span>
              </a>
            )}
            <button
              onClick={() => onSelectDonor && onSelectDonor(activeDonor)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
            >
              {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
