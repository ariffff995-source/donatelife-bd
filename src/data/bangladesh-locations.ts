import { BloodGroup } from '../types';
import bdUpazilaData from './bd-upazila.json';

export interface LocationEntry {
  thana: string;
  district: string;
  division: string;
}

export interface Division {
  id: string;
  name: string;
  districts: Record<string, Record<string, string[]>>; // District Name -> Upazila/Thana Name -> list of Police Stations
}

// Clean and normalize location data
export const BD_UPAZILA_DATA: LocationEntry[] = (bdUpazilaData as LocationEntry[]).map(item => ({
  thana: item.thana.trim(),
  district: item.district.trim(),
  division: item.division.trim()
}));

// Build BANGLADESH_LOCATIONS object dynamically from bd-upazila.json
const locationsMap: Record<string, Division> = {};

// Sort entries alphabetically by division, district, thana
const sortedEntries = [...BD_UPAZILA_DATA].sort((a, b) => {
  if (a.division !== b.division) return a.division.localeCompare(b.division);
  if (a.district !== b.district) return a.district.localeCompare(b.district);
  return a.thana.localeCompare(b.thana);
});

sortedEntries.forEach(({ thana, district, division }) => {
  if (!locationsMap[division]) {
    locationsMap[division] = {
      id: division.toLowerCase().replace(/\s+/g, '-'),
      name: division,
      districts: {}
    };
  }

  if (!locationsMap[division].districts[district]) {
    locationsMap[division].districts[district] = {};
  }

  if (!locationsMap[division].districts[district][thana]) {
    // Add default police station entry for compatibility
    locationsMap[division].districts[district][thana] = [`${thana} Police Station`];
  }
});

export const BANGLADESH_LOCATIONS: Record<string, Division> = locationsMap;

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Unique, sorted Divisions
export const DIVISIONS = Object.keys(BANGLADESH_LOCATIONS).sort((a, b) => a.localeCompare(b));

// Helper Functions
export function allDivision(): string[] {
  const divisions = new Set<string>();
  BD_UPAZILA_DATA.forEach(item => {
    if (item.division) divisions.add(item.division);
  });
  return Array.from(divisions).sort((a, b) => a.localeCompare(b));
}

export function allDistricts(divisionFilter?: string): string[] {
  const districts = new Set<string>();
  BD_UPAZILA_DATA.forEach(item => {
    if (!divisionFilter || item.division.toLowerCase() === divisionFilter.toLowerCase()) {
      if (item.district) districts.add(item.district);
    }
  });
  return Array.from(districts).sort((a, b) => a.localeCompare(b));
}

export function districtsOf(division: string): string[] {
  if (!division) return [];
  const districts = new Set<string>();
  BD_UPAZILA_DATA.forEach(item => {
    if (item.division.toLowerCase() === division.toLowerCase()) {
      if (item.district) districts.add(item.district);
    }
  });
  return Array.from(districts).sort((a, b) => a.localeCompare(b));
}

export function thanaNamesOf(district: string): string[] {
  if (!district) return [];
  const thanas = new Set<string>();
  BD_UPAZILA_DATA.forEach(item => {
    if (item.district.toLowerCase() === district.toLowerCase()) {
      if (item.thana) thanas.add(item.thana);
    }
  });
  return Array.from(thanas).sort((a, b) => a.localeCompare(b));
}

export function upazilaNamesOf(district: string): string[] {
  return thanaNamesOf(district);
}
