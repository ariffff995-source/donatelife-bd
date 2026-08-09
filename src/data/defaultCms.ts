export const defaultCmsConfig: Record<string, any> = {
  home: {
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
  search: {
    title: { en: "Find Active Donors", bn: "সক্রিয় রক্তদাতা খুঁজুন" },
    subtitle: { en: "Filter through verified volunteers in Bangladesh to get immediate blood donation support.", bn: "জরুরী প্রয়োজনে রক্তের জন্য বাংলাদেশে আমাদের যাচাইকৃত স্বেচ্ছাসেবী রক্তদাতাদের তালিকা থেকে অনুসন্ধান করুন।" },
    emptyStateMessage: { en: "No donors found matching your exact parameters. Try widening your search criteria.", bn: "আপনার নির্বাচিত এলাকায় বা গ্রুপে কোনো রক্তদাতা পাওয়া যায়নি। অনুসন্ধানের পরিধি বাড়িয়ে চেষ্টা করুন।" },
    helpText: { en: "Please check donor availability status before initiating contact. Respect donor resting periods.", bn: "দয়া করে যোগাযোগের পূর্বে রক্তদাতার প্রস্তুতির অবস্থা যাচাই করে নিন। রক্তদাতার বিশ্রামের সময়কে শ্রদ্ধা করুন।" },
    infoCardTitle: { en: "Critical Matchmaking Instructions", bn: "জরুরী রক্ত খোঁজার নির্দেশনাবলী" },
    infoCardBody: { en: "Always call on the verified phone numbers directly. In case of emergencies, do not wait on SMS responses.", bn: "সবসময় সরাসরি যাচাইকৃত ফোন নম্বরে কল করুন। অত্যন্ত জরুরী প্রয়োজনে শুধু এসএমএসের উত্তরের জন্য অপেক্ষা করবেন না।" }
  },
  requests: {
    title: { en: "Live Emergency Requests", bn: "চলতি জরুরী অনুরোধসমূহ" },
    instructions: { en: "Please verify patient credentials, hospital location and date before responding to emergency request streams.", bn: "দয়া করে আবেদনের সত্যতা, হাসপাতালের অবস্থান এবং প্রয়োজনীয় তারিখ যাচাই করে সাড়া দিন।" },
    alertMessage: { en: "Urgent: Direct response required for clinical operations.", bn: "জরুরী: চিকিৎসাধীন রোগীর জীবন রক্ষায় সরাসরি সাড়া প্রয়োজন।" },
    helpText: { en: "Falsifying clinical emergencies is a punishable offense under cyber safety laws.", bn: "ভুয়া জরুরী রক্তের অনুরোধ প্রচার করা সাইবার নিরাপত্তা আইনের অধীনে একটি দণ্ডনীয় অপরাধ।" },
    successMessage: { en: "Emergency request posted successfully! Local donors have been notified.", bn: "জরুরী রক্তের আবেদনটি সফলভাবে প্রচার করা হয়েছে! স্থানীয় রক্তদাতাদের জানিয়ে দেওয়া হয়েছে।" }
  },
  helpdesk: {
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
  footer: {
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
  contact_info: {
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
  website_settings: {
    siteName: "DonateLife BD",
    logoUrl: "/assets/logo.png",
    faviconUrl: "/favicon.ico",
    themeColors: {
      primary: "#f43f5e",
      secondary: "#0f172a",
      accent: "#fda4af"
    },
    defaultLanguage: "bn",
    seoTitle: "DonateLife BD - Real-time Blood Matchmaking Network Bangladesh",
    seoDescription: "Search available blood donors instantly across Bangladesh. Verified volunteers, directories of hospitals and blood banks.",
    openGraphImage: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80",
    googleAnalyticsId: "G-XXXXXXXXXX"
  },
  announcements: {
    topNoticeBar: {
      enabled: true,
      type: "info",
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
  }
};
