import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // We can support existing string IDs and Firebase UIDs
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  bloodGroup: text('blood_group').notNull(),
  division: text('division').notNull(),
  district: text('district').notNull(),
  upazila: text('upazila').notNull(),
  policeStation: text('police_station'),
  lastDonationDate: text('last_donation_date'),
  isAvailable: boolean('is_available').default(true).notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  avatarUrl: text('avatar_url'),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  isPhoneVerified: boolean('is_phone_verified').default(false).notNull(),
  isDonorVerified: boolean('is_donor_verified').default(false).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedAt: text('verified_at'),
  verifiedBy: text('verified_by'),
  verificationNote: text('verification_note'),
  verificationDocument: text('verification_document'),
  verificationStatus: text('verification_status').default('none').notNull(),
  facebookUrl: text('facebook_url'),
  showFacebook: boolean('show_facebook').default(false).notNull(),
  gender: text('gender'),
  address: text('address'),
  password: text('password'), // Saved plaintext or hashed password for custom auth flow
  favoriteAmbulances: jsonb('favorite_ambulances'), // Stores string[] of ambulance IDs
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Blood Requests Table
export const requests = pgTable('requests', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  patientName: text('patient_name').notNull(),
  bloodGroup: text('blood_group').notNull(),
  unitsNeeded: integer('units_needed').notNull(),
  hospitalName: text('hospital_name').notNull(),
  division: text('division').notNull(),
  district: text('district').notNull(),
  upazila: text('upazila').notNull(),
  policeStation: text('police_station'),
  contactPhone: text('contact_phone').notNull(),
  reason: text('reason').notNull(),
  status: text('status').default('pending').notNull(), // 'pending_approval' | 'pending' | 'rejected' | 'fulfilled' | 'cancelled'
  requiredDate: text('required_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Donation History Table
export const donations = pgTable('donations', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  recipientName: text('recipient_name').notNull(),
  bloodGroup: text('blood_group').notNull(),
  donationDate: text('donation_date').notNull(),
  hospitalName: text('hospital_name').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Notifications Table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  type: text('type').notNull(), // 'request_match' | 'system' | 'alert'
  relatedId: text('related_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Hospitals Table
export const hospitals = pgTable('hospitals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  division: text('division').notNull(),
  district: text('district').notNull(),
  upazila: text('upazila').notNull(),
  policeStation: text('police_station'),
  address: text('address').notNull(),
  contactPhone: text('contact_phone').notNull(),
  services: jsonb('services').notNull(), // Stores array of string services
  type: text('type').notNull(), // 'government' | 'private'
});

// 6. Blood Banks Table
export const bloodBanks = pgTable('blood_banks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  division: text('division').notNull(),
  district: text('district').notNull(),
  upazila: text('upazila').notNull(),
  policeStation: text('police_station'),
  address: text('address').notNull(),
  contactPhone: text('contact_phone').notNull(),
  availableGroups: jsonb('available_groups').notNull(), // Stores Record<BloodGroup, number>
});

// 7. Admins Table
export const admins = pgTable('admins', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'super-admin' | 'moderator'
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Activity Logs Table
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  adminUsername: text('admin_username').notNull(),
  adminRole: text('admin_role').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull(),
});

// 9. Blog Posts Table
export const blogs = pgTable('blogs', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  tags: jsonb('tags').notNull(), // Array of strings
  featuredImageIdea: text('featured_image_idea').notNull(),
  en: jsonb('en').notNull(), // EN BlogContent JSON
  bn: jsonb('bn').notNull(), // BN BlogContent JSON
});

// 10. CMS Content Table
export const cmsContent = pgTable('cms_content', {
  id: text('id').primaryKey(), // 'home' | 'search' | 'requests' | 'helpdesk' | 'footer' | 'contact' | 'settings' | 'announcements'
  draft: jsonb('draft').notNull(),
  published: jsonb('published'),
  isPublished: boolean('is_published').default(true).notNull(),
  updatedBy: text('updated_by').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Media Manager Table
export const media = pgTable('media', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(), // base64 or storage url
  type: text('type').notNull(), // 'image' | 'icon' | 'banner' | 'logo' | 'blog'
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  uploadedBy: text('uploaded_by').notNull(),
});

// 12. Ambulances Table
export const ambulances = pgTable('ambulances', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  division: text('division').notNull(),
  district: text('district').notNull(),
  upazila: text('upazila').notNull(),
  policeStation: text('police_station'),
  address: text('address').notNull(),
  contactPhone: text('contact_phone').notNull(),
  serviceArea: text('service_area'),
  availableTypes: jsonb('available_types').notNull(), // Stores string[] of AC, Non-AC, ICU, etc.
  openingHours: text('opening_hours'),
  provider: text('provider'), // 'Government' | 'Private'
  isAvailable247: boolean('is_available_247').default(true).notNull(),
  whatsapp: text('whatsapp'),
  googleMapsLink: text('google_maps_link'),
  averageResponseTime: text('average_response_time'),
  imageUrl: text('image_url'),
  isVerified: boolean('is_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Enhanced Details
  driverName: text('driver_name'),
  orgLogoUrl: text('org_logo_url'),
  vehicleNumber: text('vehicle_number'),
  startingFare: integer('starting_fare'),
  paymentMethods: jsonb('payment_methods'), // stores string[] of Cash, bKash, Nagad, Card
  emergencyContactPerson: text('emergency_contact_person'),

  // Live Status
  liveStatus: text('live_status').default('Available').notNull(), // 'Available' | 'Busy' | 'Offline'

  // Ratings & Reviews
  averageRating: text('average_rating').default('5.0').notNull(),
  totalReviews: integer('total_reviews').default(0).notNull(),
  reviews: jsonb('reviews'), // stores array of Review objects

  // Distance & Coverage
  coverageRadius: integer('coverage_radius'), // in km

  // Call analytics and Admin features
  isFeatured: boolean('is_featured').default(false).notNull(),
  totalCalls: integer('total_calls').default(0).notNull(),
  totalWaClicks: integer('total_wa_clicks').default(0).notNull(),
});
