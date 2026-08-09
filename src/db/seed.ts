import { db } from './index';
import {
  users,
  requests,
  donations,
  notifications,
  hospitals,
  bloodBanks,
  admins,
  activityLogs,
  blogs,
  cmsContent,
  media,
  ambulances,
} from './schema';
import { blogPosts as initialBlogPosts } from '../data/blogs';
import { sql } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    console.log('Starting database seeding check...');

    // 1. Seed Admins
    const existingAdmins = await db.execute(sql`SELECT count(*) FROM admins`);
    const adminCount = Number(existingAdmins.rows[0]?.count || 0);
    if (adminCount === 0) {
      console.log('Seeding default administrators...');
      await db.insert(admins).values([
        {
          id: 'admin-1',
          username: 'superadmin',
          name: 'Dr. Arif Rahman (Super)',
          role: 'super-admin',
          passwordHash: 'adminpassword123',
          createdAt: new Date('2026-06-01T00:00:00.000Z'),
        },
        {
          id: 'admin-2',
          username: 'moderator',
          name: 'Sumi Akter (Moderator)',
          role: 'moderator',
          passwordHash: 'modpassword123',
          createdAt: new Date('2026-06-15T00:00:00.000Z'),
        },
        {
          id: 'admin-3',
          username: 'ariful123',
          name: 'Ariful Islam (Admin)',
          role: 'super-admin',
          passwordHash: 'AAfifaAfi128',
          createdAt: new Date(),
        },
      ]);
    }

    // 2. Seed Users
    const existingUsers = await db.execute(sql`SELECT count(*) FROM users`);
    const userCount = Number(existingUsers.rows[0]?.count || 0);
    if (userCount === 0) {
      console.log('Seeding default users...');
      await db.insert(users).values([
        {
          id: 'user-admin',
          name: 'Dr. Arif Rahman',
          email: 'ariffff995@gmail.com',
          phone: '01712345678',
          bloodGroup: 'A+',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Dhanmondi',
          lastDonationDate: '2026-03-15',
          isAvailable: true,
          isAdmin: true,
          createdAt: new Date(),
          isEmailVerified: true,
          isPhoneVerified: true,
          isDonorVerified: true,
          verificationStatus: 'approved',
        },
        {
          id: 'user-2',
          name: 'Tariqul Islam',
          email: 'tariq@gmail.com',
          phone: '01811223344',
          bloodGroup: 'O-',
          division: 'Chittagong',
          district: 'Chittagong',
          upazila: 'Hathazari',
          lastDonationDate: null,
          isAvailable: true,
          isAdmin: false,
          createdAt: new Date(),
        },
        {
          id: 'user-3',
          name: 'Nadia Sultana',
          email: 'nadia@gmail.com',
          phone: '01911223344',
          bloodGroup: 'B+',
          division: 'Sylhet',
          district: 'Sylhet',
          upazila: 'Sylhet Sadar',
          lastDonationDate: null,
          isAvailable: true,
          isAdmin: false,
          createdAt: new Date(),
        },
        {
          id: 'user-4',
          name: 'Mustafizur Rahman',
          email: 'mustafiz@gmail.com',
          phone: '01555555555',
          bloodGroup: 'AB-',
          division: 'Sylhet',
          district: 'Sylhet',
          upazila: 'Sylhet Sadar',
          lastDonationDate: '2026-05-10',
          isAvailable: false,
          isAdmin: false,
          createdAt: new Date(),
        },
        {
          id: 'user-5',
          name: 'Anika Tabassum',
          email: 'anika@gmail.com',
          phone: '01666778899',
          bloodGroup: 'O+',
          division: 'Rajshahi',
          district: 'Rajshahi',
          upazila: 'Boalia',
          lastDonationDate: null,
          isAvailable: true,
          isAdmin: false,
          createdAt: new Date(),
        },
      ]);
    }

    // 3. Seed Hospitals
    const existingHospitals = await db.execute(sql`SELECT count(*) FROM hospitals`);
    const hospitalCount = Number(existingHospitals.rows[0]?.count || 0);
    if (hospitalCount === 0) {
      console.log('Seeding default hospitals...');
      await db.insert(hospitals).values([
        {
          id: 'hosp-1',
          name: 'Dhaka Medical College Hospital (DMCH)',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Ramna',
          address: 'Secretariat Road, Ramna, Dhaka',
          contactPhone: '+8802223386323',
          services: ['Emergency Traumatology', 'Inpatient Transfusion', '24/7 ICU Support', 'Thalassemia Board'],
          type: 'government',
        },
        {
          id: 'hosp-2',
          name: 'Chittagong Medical College Hospital (CMCH)',
          division: 'Chittagong',
          district: 'Chittagong',
          upazila: 'Panchlaish',
          address: 'K.B. Fazlul Kader Road, Panchlaish, Chittagong',
          contactPhone: '+88031619421',
          services: ['Maternal Hemorrhage Unit', 'Emergency Care', 'Cardiac Surgery Support'],
          type: 'government',
        },
        {
          id: 'hosp-3',
          name: 'Sylhet MAG Osmani Medical College',
          division: 'Sylhet',
          district: 'Sylhet',
          upazila: 'Sylhet Sadar',
          address: 'Medical College Road, Sylhet',
          contactPhone: '+880821713481',
          services: ['Pediatric Care', 'Blood Banking', 'Critical Surgery Recovery'],
          type: 'government',
        },
        {
          id: 'hosp-4',
          name: 'Evercare Hospital Dhaka',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Bashundhara',
          address: 'Plot 81, Block E, Bashundhara R/A, Dhaka',
          contactPhone: '10678',
          services: ['24/7 Transfusion Medicine', 'Oncology Ward', 'Neonatal ICU'],
          type: 'private',
        },
        {
          id: 'hosp-5',
          name: 'Square Hospital Dhaka',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Tejgaon',
          address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka',
          contactPhone: '10616',
          services: ['Advanced Cardiac Center', 'Hematology Service', 'Emergency Response Team'],
          type: 'private',
        },
      ]);
    }

    // 4. Seed Blood Banks
    const existingBanks = await db.execute(sql`SELECT count(*) FROM blood_banks`);
    const bankCount = Number(existingBanks.rows[0]?.count || 0);
    if (bankCount === 0) {
      console.log('Seeding default blood banks...');
      await db.insert(bloodBanks).values([
        {
          id: 'bank-1',
          name: 'Bangladesh Red Crescent Blood Center',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Mohammadpur',
          address: '7/5 Aurongzeb Road, Mohammadpur, Dhaka',
          contactPhone: '+88029116563',
          availableGroups: { 'A+': 12, 'A-': 4, 'B+': 18, 'B-': 2, 'AB+': 9, 'AB-': 1, 'O+': 22, 'O-': 3 },
        },
        {
          id: 'bank-2',
          name: 'Quantum Blood Lab & Center',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Sutrapar',
          address: '31/V, Shantiinagar, Kakrail, Dhaka',
          contactPhone: '+8801714010869',
          availableGroups: { 'A+': 25, 'A-': 8, 'B+': 32, 'B-': 5, 'AB+': 14, 'AB-': 3, 'O+': 41, 'O-': 7 },
        },
        {
          id: 'bank-3',
          name: 'Sandhani DMCH Unit',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Ramna',
          address: 'Dhaka Medical College, Ramna, Dhaka',
          contactPhone: '+8801711234511',
          availableGroups: { 'A+': 8, 'A-': 1, 'B+': 11, 'B-': 0, 'AB+': 4, 'AB-': 0, 'O+': 15, 'O-': 2 },
        },
        {
          id: 'bank-4',
          name: 'Badhan Blood Bank (KU Unit)',
          division: 'Khulna',
          district: 'Khulna',
          upazila: 'Khulna Sadar',
          address: 'Khulna University Campus, Khulna',
          contactPhone: '+8801722334455',
          availableGroups: { 'A+': 5, 'A-': 0, 'B+': 8, 'B-': 1, 'AB+': 2, 'AB-': 0, 'O+': 10, 'O-': 1 },
        },
      ]);
    }

    // 5. Seed Blogs
    const existingBlogs = await db.execute(sql`SELECT count(*) FROM blogs`);
    const blogCount = Number(existingBlogs.rows[0]?.count || 0);
    if (blogCount === 0) {
      console.log('Seeding default blog posts...');
      const blogsToInsert = initialBlogPosts.map((b) => ({
        id: b.id,
        slug: b.slug,
        category: b.category,
        tags: b.tags,
        featuredImageIdea: b.featuredImageIdea,
        en: b.en,
        bn: b.bn,
      }));
      await db.insert(blogs).values(blogsToInsert);
    }

    // 6. Seed Blood Requests
    const existingRequests = await db.execute(sql`SELECT count(*) FROM requests`);
    const reqCount = Number(existingRequests.rows[0]?.count || 0);
    if (reqCount === 0) {
      console.log('Seeding default blood requests...');
      await db.insert(requests).values([
        {
          id: 'req-1',
          userId: 'user-2',
          patientName: 'Rabeya Begum',
          bloodGroup: 'AB-',
          unitsNeeded: 2,
          hospitalName: 'Dhaka Medical College Hospital',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Ramna',
          contactPhone: '01711223344',
          reason: 'Scheduled Coronary Artery Bypass Surgery (CABG)',
          status: 'pending',
          requiredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          createdAt: new Date(),
        },
        {
          id: 'req-2',
          userId: 'user-3',
          patientName: 'Master Swapnil',
          bloodGroup: 'O-',
          unitsNeeded: 1,
          hospitalName: 'Sylhet MAG Osmani Medical College',
          division: 'Sylhet',
          district: 'Sylhet',
          upazila: 'Sylhet Sadar',
          contactPhone: '01999887766',
          reason: 'Thalassemia quarterly blood transfusion therapy',
          status: 'pending',
          requiredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          createdAt: new Date(),
        },
        {
          id: 'req-3',
          userId: 'user-4',
          patientName: 'Imran Hossain',
          bloodGroup: 'B+',
          unitsNeeded: 3,
          hospitalName: 'Chittagong Medical College Hospital',
          division: 'Chittagong',
          district: 'Chittagong',
          upazila: 'Panchlaish',
          contactPhone: '01555667788',
          reason: 'Emergency road accident trauma & internal bleeding',
          status: 'fulfilled',
          requiredDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          createdAt: new Date(),
        },
      ]);
    }

    // 7. Seed Donations
    const existingDonations = await db.execute(sql`SELECT count(*) FROM donations`);
    const donationCount = Number(existingDonations.rows[0]?.count || 0);
    if (donationCount === 0) {
      console.log('Seeding default donation histories...');
      await db.insert(donations).values([
        {
          id: 'don-1',
          userId: 'user-admin',
          recipientName: 'Imran Hossain',
          bloodGroup: 'A+',
          donationDate: '2026-03-15',
          hospitalName: 'Evercare Hospital Dhaka',
          notes: 'Regular voluntary blood donation to support a post-surgical recovery.',
          createdAt: new Date(),
        },
      ]);
    }

    // 8. Seed Notifications
    const existingNotifs = await db.execute(sql`SELECT count(*) FROM notifications`);
    const notifCount = Number(existingNotifs.rows[0]?.count || 0);
    if (notifCount === 0) {
      console.log('Seeding default notifications...');
      await db.insert(notifications).values([
        {
          id: 'notif-1',
          userId: 'user-admin',
          title: 'New A+ Blood Request Nearby',
          message: 'A patient needs 2 units of A+ blood at Dhanmondi General Hospital.',
          isRead: false,
          type: 'request_match',
          relatedId: 'req-1',
          createdAt: new Date(),
        },
      ]);
    }

    // 9. Seed Activity Logs
    const existingLogs = await db.execute(sql`SELECT count(*) FROM activity_logs`);
    const logCount = Number(existingLogs.rows[0]?.count || 0);
    if (logCount === 0) {
      console.log('Seeding default activity logs...');
      await db.insert(activityLogs).values([
        {
          id: 'log-1',
          timestamp: new Date('2026-07-03T10:00:00.000Z'),
          adminUsername: 'superadmin',
          adminRole: 'super-admin',
          action: 'System Initialized',
          details: 'Super admin completed platform security audit and initialized databases.',
        },
        {
          id: 'log-2',
          timestamp: new Date('2026-07-04T01:30:00.000Z'),
          adminUsername: 'moderator',
          adminRole: 'moderator',
          action: 'Verified Hospital',
          details: "Approved 'Dhaka Medical College Hospital' service expansion profile.",
        },
      ]);
    }

    // 10. Seed Ambulances
    const existingAmbulances = await db.execute(sql`SELECT count(*) FROM ambulances`);
    const ambulanceCount = Number(existingAmbulances.rows[0]?.count || 0);
    if (ambulanceCount === 0) {
      console.log('Seeding default ambulance directory listings...');
      await db.insert(ambulances).values([
        {
          id: 'amb-1',
          name: 'Al-Amin Emergency Ambulance Service',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Dhanmondi',
          address: 'House 12, Road 5, Dhanmondi, Dhaka',
          contactPhone: '+8801711223399',
          serviceArea: 'Dhaka Division & Nationwide',
          availableTypes: ['AC Ambulance', 'Non-AC Ambulance', 'ICU Support', 'Freezer Ambulance'],
          openingHours: '24 Hours/7 Days Service',
        },
        {
          id: 'amb-2',
          name: 'Chittagong LifeLine Ambulance',
          division: 'Chittagong',
          district: 'Chittagong',
          upazila: 'Panchlaish',
          address: 'Panchlaish R/A (Opposite CMCH), Chittagong',
          contactPhone: '+8801811223399',
          serviceArea: 'Chittagong District',
          availableTypes: ['AC Ambulance', 'Non-AC Ambulance', 'Cardiac ICU Care'],
          openingHours: '24 Hours Service',
        },
        {
          id: 'amb-3',
          name: 'Sylhet Ansar Ambulance Service',
          division: 'Sylhet',
          district: 'Sylhet',
          upazila: 'Sylhet Sadar',
          address: 'Zindabazar Medical Road, Sylhet',
          contactPhone: '+8801911223399',
          serviceArea: 'Sylhet Division',
          availableTypes: ['AC Ambulance', 'Non-AC Ambulance'],
          openingHours: '24/7 Service',
        },
      ]);
    }

    // 11. Seed CMS Content
    const existingCMS = await db.execute(sql`SELECT count(*) FROM cms_content`);
    const cmsCount = Number(existingCMS.rows[0]?.count || 0);
    if (cmsCount === 0) {
      console.log('Seeding default CMS content pages...');
      const cmsPages = [
        {
          id: 'home',
          draft: {
            heroTitleLine1: { en: "Every drop of blood is a", bn: "রক্তের প্রতিটি ফোঁটা একটি" },
            heroTitleAccent: { en: "Ray of New Hope", bn: "নতুন আশার আলো" },
            heroSubtitle: {
              en: "Bangladesh's advanced, real-time blood matcher. Bridging the gap between volunteer donors and clinical emergencies across all 8 divisions, 64 districts, and sub-districts instantly.",
              bn: "বাংলাদেশের একটি উন্নত, রিয়েল-টাইম রক্ত মেলবন্ধন প্ল্যাটফর্ম। ৮টি বিভাগ, ৬৪টি জেলা এবং উপজেলা জুড়ে স্বেচ্ছাসেবী রক্তদাতাদের সাথে জরুরী রোগীদের তাৎক্ষণিক যোগাযোগ স্থাপন করে।"
            },
            heroImage: {
              en: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80",
              bn: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80"
            },
            ctaRegister: { en: "Register as Donor", bn: "রক্তদাতা হিসেবে যুক্ত হোন" },
            ctaDashboard: { en: "My Donor Console", bn: "আমার ড্যাশবোর্ড" },
            ctaFinder: { en: "Search Donors", bn: "রক্তদাতা খুঁজুন" },
            ctaPostRequest: { en: "Post Urgent Request", bn: "জরুরী রক্তের আবেদন করুন" },
            tagline: { en: "Bangladesh", bn: "বাংলাদেশ" },
            statistics: [
              { key: "statVerifiedDonors", label: { en: "Verified Donors", bn: "যাচাইকৃত রক্তদাতা" }, value: "5,200+" },
              { key: "statActiveRequests", label: { en: "Active Requests", bn: "সক্রিয় অনুরোধ" }, value: "120+" },
              { key: "statClinicalIntegrations", label: { en: "Clinical Integrations", bn: "ক্লিনিকাল ইন্টিগ্রেশন" }, value: "45" },
              { key: "statTotalBanks", label: { en: "Total Banks", bn: "মোট ব্লাড ব্যাংক" }, value: "18" },
              { key: "statMatches", label: { en: "Successful Matches", bn: "সফল রক্তদান" }, value: "14,800+" }
            ],
            features: [
              { title: { en: "Database Guard", bn: "সুরক্ষিত ডাটাবেজ" }, desc: { en: "100% verified identities & health checks", bn: "১০০% যাচাইকৃত পরিচয় ও স্বাস্থ্য পরীক্ষা" } },
              { title: { en: "Instant SMS Alerts", bn: "তাৎক্ষণিক এসএমএস অ্যালার্ট" }, desc: { en: "Direct mobile alert dispatched in 2 minutes", bn: "২ মিনিটের মধ্যে মোবাইলে জরুরী বার্তা প্রেরণ" } }
            ],
            testimonials: [
              { author: { en: "Dr. K. Rahman (DMCH)", bn: "ডা. কে. রহমান (ডিএমসিএইচ)" }, text: { en: "This platform has revolutionized clinical emergency blood matching in Bangladesh.", bn: "এই প্ল্যাটফর্মটি বাংলাদেশে জরুরী রক্তের মেলবন্ধন প্রক্রিয়াকে আমূল বদলে দিয়েছে।" } },
              { author: { en: "Sultana Begum (Recipient)", bn: "সুলতানা বেগম (রক্তগ্রহীতা)" }, text: { en: "Found a rare O- negative blood group donor within 20 minutes of registering!", bn: "রেজিস্ট্রেশনের মাত্র ২০ মিনিটের মধ্যে দুর্লভ ও-নেগেটিভ রক্তদাতা পেয়েছি!" } }
            ],
            banners: [
              { title: { en: "Donate Blood, Save a Soul", bn: "রক্ত দিন, জীবন বাঁচান" }, desc: { en: "Volunteering is the highest form of humanity.", bn: "স্বেচ্ছাসেবা মানবতার সর্বোচ্চ পরিচয়।" } }
            ]
          },
          published: null,
          isPublished: true,
          updatedBy: 'superadmin',
          updatedAt: new Date(),
        },
        {
          id: 'search',
          draft: {
            title: { en: "Find Active Donors", bn: "সক্রিয় রক্তদাতা খুঁজুন" },
            subtitle: { en: "Filter through verified volunteers in Bangladesh to get immediate blood donation support.", bn: "জরুরী প্রয়োজনে রক্তের জন্য বাংলাদেশে আমাদের যাচাইকৃত স্বেচ্ছাসেবী রক্তদাতাদের তালিকা থেকে অনুসন্ধান করুন।" },
            emptyStateMessage: { en: "No donors found matching your exact parameters. Try widening your search criteria.", bn: "আপনার নির্বাচিত এলাকায় বা গ্রুপে কোনো রক্তদাতা পাওয়া যায়নি। অনুসন্ধানের পরিধি বাড়িয়ে চেষ্টা করুন।" },
            helpText: { en: "Please check donor availability status before initiating contact. Respect donor resting periods.", bn: "দয়া করে যোগাযোগের পূর্বে রক্তদাতার প্রস্তুতির অবস্থা যাচাই করে নিন। রক্তদাতার বিশ্রামের সময়কে শ্রদ্ধা করুন।" },
            infoCardTitle: { en: "Critical Matchmaking Instructions", bn: "জরুরী রক্ত খোঁজার নির্দেশনাবলী" },
            infoCardBody: { en: "Always call on the verified phone numbers directly. In case of emergencies, do not wait on SMS responses.", bn: "সবসময় সরাসরি যাচাইকৃত ফোন নম্বরে কল করুন। অত্যন্ত জরুরী প্রয়োজনে শুধু এসএমএসের উত্তরের জন্য অপেক্ষা করবেন না।" }
          },
          published: null,
          isPublished: true,
          updatedBy: 'superadmin',
          updatedAt: new Date(),
        },
        {
          id: 'requests',
          draft: {
            title: { en: "Live Emergency Requests", bn: "চলতি জরুরী অনুরোধসমূহ" },
            instructions: { en: "Please verify patient credentials, hospital location and date before responding to emergency request streams.", bn: "দয়া করে আবেদনের সত্যতা, হাসপাতালের অবস্থান এবং প্রয়োজনীয় তারিখ যাচাই করে সাড়া দিন।" },
            alertMessage: { en: "Urgent: Direct response required for clinical operations.", bn: "জরুরী: চিকিৎসাধীন রোগীর জীবন রক্ষায় সরাসরি সাড়া প্রয়োজন।" },
            helpText: { en: "Falsifying clinical emergencies is a punishable offense under cyber safety laws.", bn: "ভুয়া জরুরী রক্তের অনুরোধ প্রচার করা সাইবার নিরাপত্তা আইনের অধীনে একটি দণ্ডনীয় অপরাধ।" },
            successMessage: { en: "Emergency request posted successfully! Local donors have been notified.", bn: "জরুরী রক্তের আবেদনটি সফলভাবে প্রচার করা হয়েছে! স্থানীয় রক্তদাতাদের জানিয়ে দেওয়া হয়েছে।" }
          },
          published: null,
          isPublished: true,
          updatedBy: 'superadmin',
          updatedAt: new Date(),
        },
        {
          id: 'helpdesk',
          draft: {
            contacts: [
              { name: { en: "National Emergency Service", bn: "জাতীয় জরুরী সেবা" }, phone: "999", type: "national" },
              { name: { en: "DonateLife Helpdesk", bn: "ডোনেটলাইফ হেল্পডেস্ক" }, phone: "+8801700000001", email: "help@donatelifebd.org", whatsapp: "+8801700000001" },
              { name: { en: "DMCH Blood Transfusion Dept", bn: "ডিএমসিএইচ রক্ত সঞ্চালন বিভাগ" }, phone: "+8802223386323", type: "hospital" }
            ],
            tips: [
              { title: { en: "Before Donating Blood", bn: "রক্তদানের পূর্বে করণীয়" }, desc: { en: "Drink plenty of water, have a healthy meal, and sleep for at least 6-8 hours.", bn: "প্রচুর পানি পান করুন, পুষ্টিকর খাবার খান এবং রক্তদানের পূর্বে অন্তত ৬-৮ ঘণ্টা ঘুমান।" } },
              { title: { en: "After Donating Blood", bn: "রক্তদানের পর করণীয়" }, desc: { en: "Rest for 10-15 minutes, drink liquids, and avoid heavy lifting for the rest of the day.", bn: "১০-১৫ মিনিট বিশ্রাম নিন, প্রচুর তরল পান করুন এবং সারাদিন ভারী কাজ থেকে বিরত থাকুন।" } }
            ],
            quickActions: [
              { label: { en: "Call Ambulance", bn: "অ্যাম্বুলেন্স ডাকুন" }, phone: "+8801711223399" },
              { label: { en: "Locate Blood Bank", bn: "ব্লাড ব্যাংক খুঁজুন" }, phone: "+8801714010869" }
            ]
          },
          published: null,
          isPublished: true,
          updatedBy: 'superadmin',
          updatedAt: new Date(),
        },
        {
          id: 'footer',
          draft: {
            logoText: { en: "DonateLife BD", bn: "ডোনেটলাইফ বিডি" },
            tagline: { en: "Serving Bangladesh with code and heart.", bn: "কোড এবং ভালোবাসায় বাংলাদেশের সেবায় নিয়োজিত।" },
            description: {
              en: "DonateLife BD is a real-time, volunteer-driven clinical platform dedicated to accelerating blood matching across Bangladesh. Join us to save lives.",
              bn: "DonateLife BD একটি সম্পূর্ণ স্বেচ্ছাসেবী ও রিয়েল-টাইম প্ল্যাটফর্ম, যা বাংলাদেশে রক্তের জরুরী প্রয়োজন মেটাতে নিয়োজিত। যুক্ত হোন এবং জীবন বাঁচান।"
            },
            copyright: { en: "© {year} DonateLife BD. Serving Bangladesh with code and heart.", bn: "© {year} DonateLife BD। কোড এবং ভালোবাসায় বাংলাদেশের সেবায় নিয়োজিত।" },
            socials: {
              facebook: "https://facebook.com/donatelifebd",
              whatsapp: "https://wa.me/8801700000001",
              instagram: "https://instagram.com/donatelifebd",
              linkedin: "https://linkedin.com/company/donatelifebd",
              github: "https://github.com/donatelifebd"
            },
            quickNav: [
              { label: { en: "Find Donors", bn: "রক্তদাতা খুঁজুন" }, path: "search" },
              { label: { en: "Emergency Helpdesk", bn: "জরুরী হেল্পডেস্ক" }, path: "helpdesk" },
              { label: { en: "directories", bn: "ডিরেক্টরি" }, path: "directory" }
            ]
          },
          published: null,
          isPublished: true,
          updatedBy: 'superadmin',
          updatedAt: new Date(),
        },
        {
          id: 'contact_info',
          draft: {
            supportPhone: "+8801700000001",
            supportEmail: "support@donatelifebd.org",
            facebook: "https://facebook.com/donatelifebd",
            whatsapp: "https://wa.me/8801700000001",
            instagram: "https://instagram.com/donatelifebd",
            linkedin: "https://linkedin.com/company/donatelifebd",
            github: "https://github.com/donatelifebd",
            officeAddress: {
              en: "Level 11, SKS Tower, Mohakhali, Dhaka, Bangladesh",
              bn: "লেভেল ১১, এসকেএস টাওয়ার, মহাখালী, ঢাকা, বাংলাদেশ"
            }
          },
          published: null,
          isPublished: true,
          updatedBy: 'superadmin',
          updatedAt: new Date(),
        },
        {
          id: 'website_settings',
          draft: {
            siteName: "DonateLife BD",
            logoUrl: "/assets/logo.png",
            faviconUrl: "/favicon.ico",
            themeColors: {
              primary: "#f43f5e", // Rose 500
              secondary: "#0f172a", // Slate 900
              accent: "#fda4af", // Rose 300
            },
            defaultLanguage: "bn",
            seoTitle: "DonateLife BD - Real-time Blood Matchmaking Network Bangladesh",
            seoDescription: "Search available blood donors instantly across Bangladesh. Verified volunteers, directories of hospitals and blood banks.",
            openGraphImage: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80",
            googleAnalyticsId: "G-XXXXXXXXXX"
          },
          published: null,
          isPublished: true,
          updatedBy: 'superadmin',
          updatedAt: new Date(),
        },
        {
          id: 'announcements',
          draft: {
            topNoticeBar: {
              enabled: true,
              type: "info", // info | warning | emergency
              en: "📢 Voluntary Blood Donation camp on 15th July at TSC, University of Dhaka. Join us!",
              bn: "📢 আগামী ১৫ই জুলাই ঢাকা বিশ্ববিদ্যালয়ের টিএসসিতে স্বেচ্ছায় রক্তদান কর্মসূচী। অংশ নিন!"
            },
            maintenanceNotice: {
              enabled: false,
              en: "We will be undergoing scheduled database maintenance on Sunday at 2:00 AM UTC.",
              bn: "আগামী রবিবার রাত ২:০০ টায় সিস্টেমের সাময়িক রক্ষণাবেক্ষণের কাজ চলবে।"
            },
            emergencyAlert: {
              enabled: true,
              bloodGroup: "O-",
              en: "🚨 Massive surge in O- negative blood requirement requests in Chittagong Division.",
              bn: "🚨 চট্টগ্রাম বিভাগে ও-নেগেটিভ রক্তের রোগীর সংখ্যা আশঙ্কাজনকভাবে বেড়েছে।"
            },
            donationCampaignBanner: {
              enabled: true,
              imageUrl: "https://images.unsplash.com/photo-1536856788636-cfcd9cb336f3?auto=format&fit=crop&w=1200&q=80",
              en: {
                title: "Thalassemia Kids Needs You",
                desc: "Every month, thousands of thalassemia kids depend on O+ and A+ blood group donors. Take the step today.",
                linkText: "Pledge Now"
              },
              bn: {
                title: "থ্যালাসেমিয়া আক্রান্ত শিশুদের পাশে দাঁড়ান",
                desc: "প্রতি মাসে হাজার হাজার থ্যালাসেমিয়া আক্রান্ত শিশুদের রক্তের প্রয়োজন মেটাতে এগিয়ে আসুন।",
                linkText: "আজই অঙ্গীকার করুন"
              }
            }
          },
          published: null,
          isPublished: true,
          updatedBy: 'superadmin',
          updatedAt: new Date(),
        }
      ];

      for (const page of cmsPages) {
        // Copy draft to published to make it live by default on seed
        page.published = page.draft;
        await db.insert(cmsContent).values(page);
      }
    }

    console.log('Database seeding complete!');
  } catch (err) {
    console.error('Error during database seeding:', err);
  }
}
