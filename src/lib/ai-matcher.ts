import { BloodGroup, User, BloodRequest } from '../types';

export interface SmartMatchResult {
  donor: User;
  matchScore: number; // 0 to 100
  isExactGroup: boolean;
  isCompatibleGroup: boolean;
  proximityLevel: 'upazila' | 'district' | 'division' | 'national';
  reasons: string[];
  reasonsBn: string[];
}

// ABO Blood Group Compatibility Rules
// Key: Recipient Group -> Array of compatible Donor Groups
const COMPATIBILITY_MATRIX: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'] // Universal donor only receives O-
};

export function isBloodCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
  const allowed = COMPATIBILITY_MATRIX[recipientGroup] || [];
  return allowed.includes(donorGroup);
}

export function calculateSmartMatch(donor: User, request: BloodRequest): SmartMatchResult {
  let score = 0;
  const reasons: string[] = [];
  const reasonsBn: string[] = [];

  const isExactGroup = donor.bloodGroup === request.bloodGroup;
  const isCompatibleGroup = isBloodCompatible(donor.bloodGroup, request.bloodGroup);

  // 1. Blood Compatibility Score (Max 40 points)
  if (isExactGroup) {
    score += 40;
    reasons.push(`Exact Blood Group match (${donor.bloodGroup})`);
    reasonsBn.push(`সরাসরি ব্লাড গ্রুপ মিল (${donor.bloodGroup})`);
  } else if (isCompatibleGroup) {
    score += 25;
    reasons.push(`Clinically compatible donor group (${donor.bloodGroup} → ${request.bloodGroup})`);
    reasonsBn.push(`চিকিৎসাগতভাবে মানানসই ব্লাড গ্রুপ (${donor.bloodGroup} → ${request.bloodGroup})`);
  } else {
    // Incompatible blood group
    return {
      donor,
      matchScore: 0,
      isExactGroup: false,
      isCompatibleGroup: false,
      proximityLevel: 'national',
      reasons: ['Blood group incompatible'],
      reasonsBn: ['ব্লাড গ্রুপ মিলেনি']
    };
  }

  // 2. Geographic Proximity Score (Max 35 points)
  let proximityLevel: 'upazila' | 'district' | 'division' | 'national' = 'national';
  
  const donorUpazila = (donor.upazila || '').toLowerCase().trim();
  const reqUpazila = (request.upazila || '').toLowerCase().trim();
  const donorDistrict = (donor.district || '').toLowerCase().trim();
  const reqDistrict = (request.district || '').toLowerCase().trim();
  const donorDivision = (donor.division || '').toLowerCase().trim();
  const reqDivision = (request.division || '').toLowerCase().trim();

  if (donorUpazila && reqUpazila && donorUpazila === reqUpazila) {
    score += 35;
    proximityLevel = 'upazila';
    reasons.push('Same Upazila location proximity');
    reasonsBn.push('একই উপজেলায় অবস্থান');
  } else if (donorDistrict && reqDistrict && donorDistrict === reqDistrict) {
    score += 25;
    proximityLevel = 'district';
    reasons.push('Same District location proximity');
    reasonsBn.push('একই জেলায় অবস্থান');
  } else if (donorDivision && reqDivision && donorDivision === reqDivision) {
    score += 15;
    proximityLevel = 'division';
    reasons.push('Same Division location proximity');
    reasonsBn.push('একই বিভাগে অবস্থান');
  } else {
    score += 5;
    reasons.push('Inter-district donor candidate');
    reasonsBn.push('আন্তঃজেলা রক্তদাতা প্রার্থী');
  }

  // 3. Clinical Availability & Interval Score (Max 15 points)
  if (donor.isAvailable) {
    score += 10;
    reasons.push('Active & ready for dispatch');
    reasonsBn.push('রক্তদানে প্রস্তুত');
  }

  if (donor.lastDonationDate) {
    const lastDate = new Date(donor.lastDonationDate);
    const today = new Date();
    const diffDays = Math.ceil(Math.abs(today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 120) {
      score += 5;
      reasons.push('Full 120-day recovery interval completed');
      reasonsBn.push('১২০ দিনের পূর্ণ সুস্থতার সময়সূচি অতিক্রান্ত');
    }
  } else {
    score += 5;
    reasons.push('First-time volunteer candidate');
    reasonsBn.push('প্রথমবারের স্বেচ্ছাসেবক প্রার্থী');
  }

  // 4. Verification Bonus (Max 10 points)
  if (donor.isVerified || donor.isDonorVerified) {
    score += 10;
    reasons.push('Medically verified donor credential');
    reasonsBn.push('অফিসিয়ালি ভেরিফাইড রক্তদাতা');
  }

  return {
    donor,
    matchScore: Math.min(100, score),
    isExactGroup,
    isCompatibleGroup,
    proximityLevel,
    reasons,
    reasonsBn
  };
}

export function getRankedSmartMatches(donors: User[], request: BloodRequest): SmartMatchResult[] {
  return donors
    .map(donor => calculateSmartMatch(donor, request))
    .filter(res => res.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}
