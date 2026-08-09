'use client';

import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LocationMapProps {
  locationQuery: string;
  displayName: string;
  height?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  locationQuery,
  displayName,
  height = 'h-64'
}) => {
  const { language } = useLanguage();
  
  // Clean location query for the map
  const encodedQuery = encodeURIComponent(`${locationQuery}, Bangladesh`);
  const embedUrl = `https://maps.google.com/maps?q=${encodedQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {language === 'bn' ? 'গুগল ম্যাপ লোকেশন' : 'Google Maps Location'}
          </span>
        </div>
        <a
          href={externalMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
        >
          <span>{language === 'bn' ? 'নেভিগেশন খুলুন' : 'Open Directions'}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className={`w-full ${height} rounded-xl overflow-hidden border border-slate-800/80 relative bg-slate-950`}>
        <iframe
          title={`Map of ${displayName}`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={embedUrl}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale invert opacity-80 contrast-125 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <span>{displayName}</span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400/80 flex items-center gap-1">
          <Navigation className="w-3 h-3 animate-pulse" />
          {language === 'bn' ? 'লাইভ জিপিএস সিঙ্ক' : 'Live GPS Synced'}
        </span>
      </div>
    </div>
  );
};
