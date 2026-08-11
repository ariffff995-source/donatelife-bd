import { pgTable, text, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    phone: text('phone').notNull(),
    bloodGroup: text('blood_group').notNull(),
    division: text('division').notNull(),
    district: text('district').notNull(),
    upazila: text('upazila').notNull(),
    policeStation: text('police_station'),
    latitude: text('latitude'),
    longitude: text('longitude'),
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
    password: text('password'),
    favoriteAmbulances: jsonb('favorite_ambulances'),
    donorId: text('donor_id').unique(),
    showPhone: boolean('show_phone').default(false).notNull(),
    about: text('about'),
    age: integer('age'),
    reputationScore: integer('reputation_score').default(0).notNull(),
    totalDonationsCount: integer('total_donations_count').default(0).notNull(),
    successfulDonationsCount: integer('successful_donations_count').default(0).notNull(),
    responseRate: integer('response_rate').default(100).notNull(),
    acceptanceRate: integer('acceptance_rate').default(100).notNull(),
    donationStreak: integer('donation_streak').default(0).notNull(),
    notifyEmail: boolean('notify_email').default(true).notNull(),
    notifySms: boolean('notify_sms').default(true).notNull(),
    notifyPush: boolean('notify_push').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('users_blood_group_idx').on(table.bloodGroup),
    index('users_division_district_idx').on(table.division, table.district),
    index('users_available_idx').on(table.isAvailable),
  ]
);

// 2. Blood Requests Table
export const requests = pgTable(
  'requests',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
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
    status: text('status').default('pending').notNull(),
    requiredDate: text('required_date').notNull(),
    timeline: jsonb('timeline'),
    matchedDonorId: text('matched_donor_id'),
    donorAcceptedAt: timestamp('donor_accepted_at'),
    donatedAt: timestamp('donated_at'),
    completedAt: timestamp('completed_at'),
    cancelledAt: timestamp('cancelled_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('requests_status_idx').on(table.status),
    index('requests_blood_group_idx').on(table.bloodGroup),
    index('requests_user_id_idx').on(table.userId),
  ]
);

// 3. Donation History Table
export const donations = pgTable(
  'donations',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    recipientName: text('recipient_name').notNull(),
    bloodGroup: text('blood_group').notNull(),
    donationDate: text('donation_date').notNull(),
    hospitalName: text('hospital_name').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('donations_user_id_idx').on(table.userId),
  ]
);

// 4. Notifications Table
export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    type: text('type').notNull(),
    relatedId: text('related_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notifications_user_id_idx').on(table.userId),
  ]
);

// 5. Hospitals Table
export const hospitals = pgTable(
  'hospitals',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    division: text('division').notNull(),
    district: text('district').notNull(),
    upazila: text('upazila').notNull(),
    policeStation: text('police_station'),
    address: text('address').notNull(),
    contactPhone: text('contact_phone').notNull(),
    services: jsonb('services').notNull(),
    type: text('type').notNull(),
    icuBedsTotal: integer('icu_beds_total').default(10).notNull(),
    icuBedsAvailable: integer('icu_beds_available').default(3).notNull(),
    generalBedsTotal: integer('general_beds_total').default(100).notNull(),
    generalBedsAvailable: integer('general_beds_available').default(25).notNull(),
    emergencyBedsTotal: integer('emergency_beds_total').default(20).notNull(),
    emergencyBedsAvailable: integer('emergency_beds_available').default(5).notNull(),
    bedAvailabilityLastUpdated: timestamp('bed_availability_last_updated').defaultNow().notNull(),
    isVerified: boolean('is_verified').default(true).notNull(),
  },
  (table) => [
    index('hospitals_location_idx').on(table.division, table.district),
  ]
);

// 6. Blood Banks Table
export const bloodBanks = pgTable(
  'blood_banks',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    division: text('division').notNull(),
    district: text('district').notNull(),
    upazila: text('upazila').notNull(),
    policeStation: text('police_station'),
    address: text('address').notNull(),
    contactPhone: text('contact_phone').notNull(),
    availableGroups: jsonb('available_groups').notNull(),
  },
  (table) => [
    index('blood_banks_location_idx').on(table.division, table.district),
  ]
);

// 7. Admins Table
export const admins = pgTable('admins', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(),
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
  tags: jsonb('tags').notNull(),
  featuredImageIdea: text('featured_image_idea').notNull(),
  en: jsonb('en').notNull(),
  bn: jsonb('bn').notNull(),
});

// 10. CMS Content Table
export const cmsContent = pgTable('cms_content', {
  id: text('id').primaryKey(),
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
  url: text('url').notNull(),
  type: text('type').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  uploadedBy: text('uploaded_by').notNull(),
});

// 12. Ambulances Table
export const ambulances = pgTable(
  'ambulances',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    division: text('division').notNull(),
    district: text('district').notNull(),
    upazila: text('upazila').notNull(),
    policeStation: text('police_station'),
    address: text('address').notNull(),
    contactPhone: text('contact_phone').notNull(),
    serviceArea: text('service_area'),
    availableTypes: jsonb('available_types').notNull(),
    openingHours: text('opening_hours'),
    provider: text('provider'),
    isAvailable247: boolean('is_available_247').default(true).notNull(),
    whatsapp: text('whatsapp'),
    googleMapsLink: text('google_maps_link'),
    averageResponseTime: text('average_response_time'),
    imageUrl: text('image_url'),
    isVerified: boolean('is_verified').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    driverName: text('driver_name'),
    orgLogoUrl: text('org_logo_url'),
    vehicleNumber: text('vehicle_number'),
    startingFare: integer('starting_fare'),
    paymentMethods: jsonb('payment_methods'),
    emergencyContactPerson: text('emergency_contact_person'),
    liveStatus: text('live_status').default('Available').notNull(),
    averageRating: text('average_rating').default('5.0').notNull(),
    totalReviews: integer('total_reviews').default(0).notNull(),
    reviews: jsonb('reviews'),
    coverageRadius: integer('coverage_radius'),
    isFeatured: boolean('is_featured').default(false).notNull(),
    totalCalls: integer('total_calls').default(0).notNull(),
    totalWaClicks: integer('total_wa_clicks').default(0).notNull(),
  },
  (table) => [
    index('ambulances_location_idx').on(table.division, table.district),
  ]
);

// 13. Notification Logs Table
export const notificationLogs = pgTable('notification_logs', {
  id: text('id').primaryKey(),
  donorId: text('donor_id').notNull(),
  requestId: text('request_id').notNull(),
  type: text('type').notNull(),
  recipientEmail: text('recipient_email'),
  status: text('status').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Feature Visibility Settings Table
export const featureSettings = pgTable('feature_settings', {
  id: text('id').primaryKey(),
  featureKey: text('feature_key').notNull().unique(),
  enabled: boolean('enabled').default(false).notNull(),
  maintenanceMode: boolean('maintenance_mode').default(false).notNull(),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 14b. Feature Flags Table (Drizzle schema)
export const featureFlags = pgTable('feature_flags', {
  id: text('id').primaryKey(),
  featureKey: text('feature_key').notNull().unique(),
  status: text('status').notNull().default('public'), // 'public' | 'hidden' | 'maintenance'
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 15. Persistent OTP Verification Table
export const otps = pgTable(
  'otps',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    code: text('code').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('otps_email_idx').on(table.email),
  ]
);

// 16. Favorite Donors Table (Prevent Duplicates)
export const donorFavorites = pgTable(
  'donor_favorites',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    favoriteDonorId: text('favorite_donor_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('donor_favorites_user_id_idx').on(table.userId),
  ]
);

// 17. Volunteers Table
export const volunteers = pgTable('volunteers', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  division: text('division').notNull(),
  district: text('district').notNull(),
  upazila: text('upazila').notNull(),
  role: text('role').default('Regional Coordinator').notNull(),
  status: text('status').default('Active').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// 18. Testimonials Table
export const testimonials = pgTable('testimonials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  comment: text('comment').notNull(),
  rating: integer('rating').default(5).notNull(),
  avatarUrl: text('avatar_url'),
  isApproved: boolean('is_approved').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 19. Reports Table
export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  generatedBy: text('generated_by').notNull(),
  fileUrl: text('file_url'),
  status: text('status').default('Completed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 20. Backups Table
export const backups = pgTable('backups', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  type: text('type').default('Automated Daily').notNull(),
  status: text('status').default('Success').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 21. System Settings Table
export const systemSettings = pgTable('system_settings', {
  id: text('id').primaryKey(),
  settingKey: text('setting_key').notNull().unique(),
  settingValue: jsonb('setting_value').notNull(),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 22. SEO Settings Table
export const seoSettings = pgTable('seo_settings', {
  id: text('id').primaryKey(),
  pageRoute: text('page_route').notNull().unique(),
  metaTitle: text('meta_title').notNull(),
  metaDescription: text('meta_description').notNull(),
  ogImage: text('og_image'),
  keywords: jsonb('keywords'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 23. QR Cards & Certificates Table
export const donorCertificates = pgTable('donor_certificates', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  certificateCode: text('certificate_code').notNull().unique(),
  title: text('title').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  pdfUrl: text('pdf_url'),
});



