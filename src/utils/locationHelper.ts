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
    // Some formats say "Dhaka Division" or "Dhaka" - let's keep it clean
    parts.push(div);
  }

  if (parts.length === 0) return '';
  return parts.join(' → ');
}

