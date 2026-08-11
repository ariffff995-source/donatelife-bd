import { locationTranslations } from '../data/location-translations';

/**
 * Extracts the English name from a combined "English | Bangla" location string.
 */
export function getEnglishLocationValue(val: string | null | undefined): string {
  if (!val) return '';
  if (val.includes('|')) {
    return val.split('|')[0].trim();
  }
  return val;
}

/**
 * Extracts the Bangla name from a combined "English | Bangla" location string.
 * Falls back to translateLocation if not present.
 */
export function getBanglaLocationValue(val: string | null | undefined, fallbackTranslate?: (eng: string) => string): string {
  if (!val) return '';
  if (val.includes('|')) {
    return val.split('|')[1].trim();
  }
  if (fallbackTranslate) {
    return fallbackTranslate(val);
  }
  return val;
}

/**
 * Parses a location string into English or Bangla based on active language.
 */
export function parseLocationValue(
  val: string | null | undefined, 
  language: 'en' | 'bn', 
  translateLocation: (english: string) => string
): string {
  if (!val) return '';
  if (val.includes('|')) {
    const parts = val.split('|').map(s => s.trim());
    if (language === 'bn') {
      return parts[1] || translateLocation(parts[0]);
    }
    return parts[0];
  }
  return language === 'bn' ? translateLocation(val) : val;
}

/**
 * Formats a location to save in "English | Bangla" format.
 */
export function formatLocationSaveValue(english: string, translateLocation: (english: string) => string): string {
  if (!english) return '';
  const cleanEng = getEnglishLocationValue(english);
  const bangla = translateLocation(cleanEng);
  if (bangla && bangla !== cleanEng) {
    return `${cleanEng} | ${bangla}`;
  }
  return cleanEng;
}

/**
 * Safely normalizes location values (handling "English | Bangla" compound values) 
 * so that we can check validity against the local dataset.
 */
export function isLocationValid(
  field: 'division' | 'district' | 'upazila' | 'policeStation',
  value: string,
  dataset: any,
  parentState: { division?: string; district?: string; upazila?: string }
): boolean {
  if (!value) return false;
  const cleanVal = getEnglishLocationValue(value);
  const cleanDiv = getEnglishLocationValue(parentState.division || '');
  const cleanDist = getEnglishLocationValue(parentState.district || '');
  const cleanUpz = getEnglishLocationValue(parentState.upazila || '');

  if (field === 'division') {
    return !!dataset[cleanVal];
  }
  if (field === 'district') {
    if (!cleanDiv || !dataset[cleanDiv]) return false;
    return !!dataset[cleanDiv].districts[cleanVal];
  }
  if (field === 'upazila') {
    if (!cleanDiv || !dataset[cleanDiv] || !cleanDist) return false;
    return !!dataset[cleanDiv].districts[cleanDist]?.[cleanVal];
  }
  if (field === 'policeStation') {
    if (!cleanDiv || !dataset[cleanDiv] || !cleanDist || !cleanUpz) return false;
    const stations = dataset[cleanDiv].districts[cleanDist]?.[cleanUpz] || [];
    return stations.includes(cleanVal);
  }
  return false;
}

/**
 * Formats division, district, upazila, policeStation into a unified string.
 * Format: Police Station → Upazila → District → Division
 * Handles legacy data without policeStation and language translations.
 */
export function formatLocationDisplay(
  division: string | null | undefined,
  district: string | null | undefined,
  upazila: string | null | undefined,
  policeStation: string | null | undefined,
  language: 'en' | 'bn',
  translateLocation: (english: string) => string
): string {
  const div = parseLocationValue(division, language, translateLocation);
  const dist = parseLocationValue(district, language, translateLocation);
  const upz = parseLocationValue(upazila, language, translateLocation);
  const ps = parseLocationValue(policeStation, language, translateLocation);

  const parts: string[] = [];
  if (ps) parts.push(ps);
  if (upz) parts.push(upz);
  if (dist) parts.push(dist);
  if (div) {
    parts.push(div);
  }

  if (parts.length === 0) return '';
  return parts.join(' → ');
}

/**
 * Calculates real distance in kilometers using the Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return Infinity;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

/**
 * Formats distance with localized numbers and unit.
 */
export function formatDistance(distanceKm: number, language: 'en' | 'bn'): string {
  if (distanceKm === Infinity || isNaN(distanceKm)) return '';
  if (language === 'bn') {
    const bnNums: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯', '.': '.'
    };
    const formatted = distanceKm.toString().split('').map(char => bnNums[char] || char).join('');
    return `${formatted} কিমি দূরে`;
  }
  return `${distanceKm} km away`;
}

/**
 * Fallback coordinates for Bangladesh divisions and major districts if GPS is unavailable.
 */
export const BANGLADESH_LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Divisions
  'dhaka': { lat: 23.8103, lng: 90.4125 },
  'chittagong': { lat: 22.3569, lng: 91.7832 },
  'chattogram': { lat: 22.3569, lng: 91.7832 },
  'rajshahi': { lat: 24.3745, lng: 88.6042 },
  'khulna': { lat: 22.8456, lng: 89.5403 },
  'barisal': { lat: 22.7010, lng: 90.3535 },
  'barishal': { lat: 22.7010, lng: 90.3535 },
  'sylhet': { lat: 24.8949, lng: 91.8687 },
  'rangpur': { lat: 25.7439, lng: 89.2752 },
  'mymensingh': { lat: 24.7471, lng: 90.4203 },

  // Key Districts
  'comilla': { lat: 23.4607, lng: 91.1809 },
  'cumilla': { lat: 23.4607, lng: 91.1809 },
  'gazipur': { lat: 24.0023, lng: 90.4264 },
  'narayanganj': { lat: 23.6238, lng: 90.5000 },
  'bogura': { lat: 24.8481, lng: 89.3730 },
  'bogra': { lat: 24.8481, lng: 89.3730 },
  'jessore': { lat: 23.1664, lng: 89.2081 },
  'jashore': { lat: 23.1664, lng: 89.2081 },
  'coxs bazar': { lat: 21.4272, lng: 92.0058 },
  'tangail': { lat: 24.2513, lng: 89.9167 },
  'dinajpur': { lat: 25.6279, lng: 88.6332 },
  'pabna': { lat: 24.0064, lng: 89.2483 },
  'feni': { lat: 23.0159, lng: 91.3976 },
  'noakhali': { lat: 22.8696, lng: 91.0993 },
  'kushtia': { lat: 23.9013, lng: 89.1204 },
  'faridpur': { lat: 23.6071, lng: 89.8406 }
};

/**
 * Gets estimated coordinates for a donor based on lat/lng or fallback division/district.
 */
export function getCoordinatesForLocation(
  latStr?: string | null,
  lngStr?: string | null,
  district?: string | null,
  division?: string | null
): { lat: number; lng: number } {
  if (latStr && lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  const cleanDist = getEnglishLocationValue(district || '').toLowerCase();
  const cleanDiv = getEnglishLocationValue(division || '').toLowerCase();

  if (cleanDist && BANGLADESH_LOCATION_COORDINATES[cleanDist]) {
    // Add small random jitter (±0.02 deg ~ 2km) to avoid exact overlapping markers
    const coord = BANGLADESH_LOCATION_COORDINATES[cleanDist];
    return {
      lat: coord.lat + (Math.random() - 0.5) * 0.03,
      lng: coord.lng + (Math.random() - 0.5) * 0.03
    };
  }

  if (cleanDiv && BANGLADESH_LOCATION_COORDINATES[cleanDiv]) {
    const coord = BANGLADESH_LOCATION_COORDINATES[cleanDiv];
    return {
      lat: coord.lat + (Math.random() - 0.5) * 0.05,
      lng: coord.lng + (Math.random() - 0.5) * 0.05
    };
  }

  // Default Bangladesh center (Dhaka)
  return {
    lat: 23.8103 + (Math.random() - 0.5) * 0.05,
    lng: 90.4125 + (Math.random() - 0.5) * 0.05
  };
}


