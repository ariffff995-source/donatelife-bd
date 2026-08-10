export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  division: string;
  district: string;
  upazila: string;
  policeStation?: string | null;
  lastDonationDate: string | null; // ISO string or date string
  isAvailable: boolean;
  isAdmin: boolean;
  avatarUrl?: string; // Base64 profile photo data URI
  createdAt: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isDonorVerified?: boolean;
  isVerified?: boolean;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  verificationNote?: string | null;
  verificationDocument?: string;
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  donorId?: string | null;
  showPhone?: boolean;
  facebookUrl?: string;
  showFacebook?: boolean;
  gender?: 'male' | 'female' | 'other' | string;
  address?: string;
  favoriteAmbulances?: string[];
}

export interface DonationHistory {
  id: string;
  userId: string;
  recipientName: string;
  bloodGroup: BloodGroup;
  donationDate: string;
  hospitalName: string;
  notes?: string;
  createdAt: string;
}

export interface BloodRequest {
  id: string;
  userId: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName: string;
  division: string;
  district: string;
  upazila: string;
  policeStation?: string | null;
  contactPhone: string;
  reason: string;
  status: 'pending_approval' | 'pending' | 'rejected' | 'fulfilled' | 'cancelled';
  requiredDate: string;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  division: string;
  district: string;
  upazila: string;
  policeStation?: string | null;
  address: string;
  contactPhone: string;
  services: string[];
  type: 'government' | 'private';
}

export interface BloodBank {
  id: string;
  name: string;
  division: string;
  district: string;
  upazila: string;
  policeStation?: string | null;
  address: string;
  contactPhone: string;
  availableGroups: Record<BloodGroup, number>; // units available
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'request_match' | 'system' | 'alert';
  createdAt: string;
  relatedId?: string;
}

export interface PlatformStats {
  totalDonors: number;
  totalRequests: number;
  activeRequests: number;
  totalHospitals: number;
  totalBloodBanks: number;
  successfulDonations: number;
  bloodGroupDistribution?: Record<string, number>;
  requestStatusDistribution?: {
    pending_approval: number;
    pending: number;
    fulfilled: number;
    cancelled: number;
    rejected: number;
  };
}

export interface TelemetryGrowth {
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface TelemetryData {
  totalDonors: number;
  activeRequests: number;
  totalHospitals: number;
  successfulDonations: number;
  growth: {
    donors: TelemetryGrowth;
    activeRequests: TelemetryGrowth;
    hospitals: TelemetryGrowth;
    donations: TelemetryGrowth;
  };
  lastUpdated: string;
}

export interface BlogSection {
  type: 'h2' | 'h3' | 'paragraph' | 'bullet' | 'table' | 'callout';
  heading?: string;
  text?: string;
  items?: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
}

export interface BlogContent {
  seoTitle: string;
  metaTitle: string;
  metaDescription: string;
  introduction: string;
  tableOfContents: { label: string; anchor: string }[];
  fullArticle: BlogSection[];
  faqs: { question: string; answer: string }[];
  conclusion: string;
  cta: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  category: string;
  tags: string[];
  featuredImageIdea: string;
  en: BlogContent;
  bn: BlogContent;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isHidden: boolean;
}

export interface Ambulance {
  id: string;
  name: string;
  division: string;
  district: string;
  upazila: string;
  policeStation?: string | null;
  address: string;
  contactPhone: string;
  serviceArea?: string | null;
  availableTypes: string[];
  openingHours?: string | null;
  provider?: string | null;
  isAvailable247?: boolean;
  whatsapp?: string | null;
  googleMapsLink?: string | null;
  averageResponseTime?: string | null;
  imageUrl?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  updatedAt?: string;

  // Enhanced Details
  driverName?: string | null;
  orgLogoUrl?: string | null;
  vehicleNumber?: string | null;
  startingFare?: number | null;
  paymentMethods?: string[];
  emergencyContactPerson?: string | null;

  // Live Status
  liveStatus?: 'Available' | 'Busy' | 'Offline' | string;

  // Ratings & Reviews
  averageRating?: string;
  totalReviews?: number;
  reviews?: Review[] | null;

  // Distance & Coverage
  coverageRadius?: number | null;

  // Analytics & Admin
  isFeatured?: boolean;
  totalCalls?: number;
  totalWaClicks?: number;
}

export interface CMSContent {
  id: string;
  draft: any;
  published: any;
  isPublished: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export type FeatureStatus = 'Public' | 'Hidden' | 'Maintenance';

export interface FeatureSetting {
  id: string;
  featureKey: string;
  name?: string;
  description?: string;
  enabled: boolean;
  maintenanceMode: boolean;
  status: FeatureStatus;
  updatedBy?: string | null;
  updatedAt?: string;
}

