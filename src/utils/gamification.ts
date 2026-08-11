import { User } from '../types';

export interface DonorBadge {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  icon: string;
  color: string;
}

export interface DonorTier {
  level: number;
  title: string;
  titleBn: string;
  minXp: number;
  maxXp: number;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
}

export const DONOR_TIERS: DonorTier[] = [
  {
    level: 1,
    title: 'Volunteer Donor',
    titleBn: 'স্বেচ্ছাসেবক রক্তদাতা',
    minXp: 0,
    maxXp: 99,
    badgeColor: 'text-slate-300',
    badgeBg: 'bg-slate-800/80',
    badgeBorder: 'border-slate-700'
  },
  {
    level: 2,
    title: 'Bronze Life Saver',
    titleBn: 'ব্রোঞ্জ জীবন রক্ষক',
    minXp: 100,
    maxXp: 299,
    badgeColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30'
  },
  {
    level: 3,
    title: 'Silver Guardian',
    titleBn: 'সিলভার অভিভাবক',
    minXp: 300,
    maxXp: 599,
    badgeColor: 'text-slate-100',
    badgeBg: 'bg-slate-100/10',
    badgeBorder: 'border-slate-300/30'
  },
  {
    level: 4,
    title: 'Gold Humanitarian',
    titleBn: 'গোল্ড মানবহিতৈষী',
    minXp: 600,
    maxXp: 999,
    badgeColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/10',
    badgeBorder: 'border-yellow-500/30'
  },
  {
    level: 5,
    title: 'Platinum Hero of BD',
    titleBn: 'প্ল্যাটিনাম হিরো অফ বিডি',
    minXp: 1000,
    maxXp: Infinity,
    badgeColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30'
  }
];

export function calculateDonorXP(user: User, donationCount: number = 0): number {
  let xp = 0;

  // 100 XP per donation
  xp += donationCount * 100;

  // 50 XP for Medical Verification
  if (user.isVerified || user.isDonorVerified) {
    xp += 50;
  }

  // 20 XP for Phone Verification
  if (user.isPhoneVerified) {
    xp += 20;
  }

  // 10 XP for Email Verification
  if (user.isEmailVerified) {
    xp += 10;
  }

  // 10 XP for complete profile
  if (user.avatarUrl && user.address) {
    xp += 10;
  }

  return xp;
}

export function getDonorTier(xp: number): DonorTier {
  for (let i = DONOR_TIERS.length - 1; i >= 0; i--) {
    if (xp >= DONOR_TIERS[i].minXp) {
      return DONOR_TIERS[i];
    }
  }
  return DONOR_TIERS[0];
}

export function getTierProgress(xp: number): { currentXp: number; nextLevelXp: number; progressPercent: number } {
  const currentTier = getDonorTier(xp);
  const isMaxTier = currentTier.level === DONOR_TIERS.length;

  if (isMaxTier) {
    return { currentXp: xp, nextLevelXp: xp, progressPercent: 100 };
  }

  const nextTier = DONOR_TIERS[currentTier.level];
  const range = nextTier.minXp - currentTier.minXp;
  const progressInLevel = xp - currentTier.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((progressInLevel / range) * 100)));

  return {
    currentXp: xp,
    nextLevelXp: nextTier.minXp,
    progressPercent
  };
}

export function getDonorBadges(user: User, donationCount: number = 0): DonorBadge[] {
  const badges: DonorBadge[] = [];

  if (user.isVerified || user.isDonorVerified) {
    badges.push({
      id: 'verified',
      name: 'Medically Verified',
      nameBn: 'মেডিকেল ভেরিফাইড',
      description: 'Document and health criteria verified by DonateLife BD clinical board.',
      descriptionBn: 'ডকুমেন্ট ও স্বাস্থ্য তথ্যাবলী অফিসিয়ালি যাচাইকৃত।',
      icon: 'ShieldCheck',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    });
  }

  if (donationCount >= 1) {
    badges.push({
      id: 'first_donation',
      name: 'First Donation',
      nameBn: 'প্রথম রক্তদান',
      description: 'Saved your first life through voluntary donation.',
      descriptionBn: 'প্রথমবারের মতো রক্তদান সম্পন্ন করেছেন।',
      icon: 'Heart',
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10'
    });
  }

  if (donationCount >= 5) {
    badges.push({
      id: 'regular_donor',
      name: 'Star Supporter',
      nameBn: 'স্টার সাপোর্টার',
      description: 'Completed 5+ blood donations.',
      descriptionBn: '৫টিরও বেশি সফল রক্তদান সম্পন্ন করেছেন।',
      icon: 'Star',
      color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
    });
  }

  if (donationCount >= 10) {
    badges.push({
      id: 'veteran_saver',
      name: 'Veteran Life Saver',
      nameBn: 'ভেটেরান রক্তদাতা',
      description: 'Completed 10+ blood donations in Bangladesh.',
      descriptionBn: '১০টিরও বেশি রক্তদান সম্পন্ন করে দৃষ্টান্ত স্থাপন করেছেন।',
      icon: 'Award',
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
    });
  }

  if (user.isAvailable) {
    badges.push({
      id: 'available_now',
      name: 'Active Responder',
      nameBn: 'প্রস্তুত রক্তদাতা',
      description: 'Currently eligible and available for emergency dispatch.',
      descriptionBn: 'জরুরি রক্তদানের জন্য প্রস্তুত ও উপলব্ধ।',
      icon: 'CheckCircle2',
      color: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
    });
  }

  return badges;
}

export interface ReputationBadge {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tierBn: string;
  badgeEmoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  score: number;
}

export function calculateReputationScore(
  user: User | any,
  donationCount: number = 0
): number {
  let score = user.reputationScore || 0;

  if (score === 0) {
    const totalDonations = donationCount || user.totalDonationsCount || 0;
    const successfulDonations = user.successfulDonationsCount || totalDonations;

    score += totalDonations * 50; // Total donations (+50 each)
    score += successfulDonations * 100; // Successful donations (+100 each)

    // Verification status (+50)
    if (user.isVerified || user.isDonorVerified || user.verificationStatus === 'approved') {
      score += 50;
    }

    // Response time (+20)
    if ((user.responseRate ?? 100) >= 80) {
      score += 20;
    }

    // Acceptance rate (+30)
    if ((user.acceptanceRate ?? 100) >= 80) {
      score += 30;
    }

    // Profile completion (+20)
    if (user.avatarUrl && user.address && user.phone) {
      score += 20;
    }

    // Last Active (+10)
    if (user.isAvailable) {
      score += 10;
    }
  }

  return score;
}

export function getReputationBadge(score: number): ReputationBadge {
  if (score >= 801) {
    return {
      tier: 'Platinum',
      tierBn: 'প্ল্যাটিনাম',
      badgeEmoji: '💎',
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      score
    };
  }
  if (score >= 401) {
    return {
      tier: 'Gold',
      tierBn: 'গোল্ড',
      badgeEmoji: '🥇',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      score
    };
  }
  if (score >= 151) {
    return {
      tier: 'Silver',
      tierBn: 'সিলভার',
      badgeEmoji: '🥈',
      color: 'text-slate-200',
      bgColor: 'bg-slate-300/10',
      borderColor: 'border-slate-300/30',
      score
    };
  }
  return {
    tier: 'Bronze',
    tierBn: 'ব্রোঞ্জ',
    badgeEmoji: '🥉',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    score
  };
}

