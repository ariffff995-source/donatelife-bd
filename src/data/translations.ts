export type Language = 'en' | 'bn';

export const translations = {
  en: {
    // General / Common
    common: {
      appName: "DonateLife BD",
      tagline: "Bangladesh",
      bloodGroup: "Blood Group",
      division: "Division",
      district: "District",
      upazila: "Upazila/Thana",
      search: "Search",
      loading: "Loading...",
      required: "Required",
      cancel: "Cancel",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      submit: "Submit",
      success: "Success",
      error: "Error",
      pending: "Pending",
      fulfilled: "Fulfilled",
      cancelled: "Cancelled",
      all: "All",
      status: "Status",
      contact: "Contact",
      phone: "Phone Number",
      email: "Email Address",
      password: "Password",
      name: "Full Name",
      actions: "Actions",
      admin: "Admin",
      available: "Available",
      unavailable: "Unavailable",
      selectBloodGroup: "Select Blood Group",
      selectDivision: "Select Division",
      selectDistrict: "Select District",
      selectUpazila: "Select Upazila/Thana",
      confirmDelete: "Are you sure you want to delete this?",
      noData: "No data available",
      lastDonation: "Last Donation",
      daysAgo: "days ago",
      neverDonated: "Never donated",
      gender: "Gender",
      male: "Male",
      female: "Female",
      other: "Other",
      yes: "Yes",
      no: "No"
    },

    // Navbar
    navbar: {
      home: "Home",
      findDonors: "Find Donors",
      emergencyRequests: "Emergency Requests",
      helpdesk: "Emergency Helpdesk",
      directories: "Directories",
      blogs: "Health Blog",
      requestBlood: "Request Blood",
      donorLogin: "Donor Login",
      donorDashboard: "Donor Dashboard",
      adminConsole: "Admin Console",
      logoutSession: "Logout Session",
      notifications: "Notifications",
      newNotif: "New",
      noNotif: "No notifications yet",
      markRead: "Mark as read"
    },

    // Home View
    home: {
      badge: "Emergency Blood Matchmaking",
      heroTitleLine1: "Every drop of blood is a",
      heroTitleAccent: "Ray of New Hope",
      heroDesc: "Bangladesh's advanced, real-time blood matcher. Bridging the gap between volunteer donors and clinical emergencies across all 8 divisions, 64 districts, and sub-districts instantly.",
      registerAsDonor: "Register as Donor",
      myDonorConsole: "My Donor Console",
      databaseGuard: "Database Guard",
      databaseGuardDesc: "100% verified identities & health checks",
      
      // Instant Finder
      finderTitle: "Instant Blood Finder",
      finderDesc: "Match blood group with division, district & sub-district instantly to find available donors.",
      searchDonorsBtn: "Search Donors",

      // Live Feed
      liveFeedTitle: "Live Emergency Requests",
      liveFeedDesc: "Help save lives by responding to active clinical requests in your area.",
      requiredOn: "Required on",
      units: "Units",
      hospital: "Hospital",
      respond: "Respond",
      viewAllRequests: "View All Requests",
      noRequests: "No active requests right now. Create one if you need blood.",

      // Stats
      statsTitle: "Our Platform Impact",
      statsDesc: "Connecting thousands of heroes across the country with instant tracking.",
      statVerifiedDonors: "Verified Donors",
      statActiveRequests: "Active Requests",
      statClinicalIntegrations: "Clinical Integrations",
      statTotalBanks: "Total Banks",
      statMatches: "Successful Matches",

      // Eligibility
      eligibilityTitle: "Can I Donate Blood?",
      eligibilityDesc: "Check the quick eligibility guidelines before making your blood donation.",
      ruleAge: "Age Constraint",
      ruleAgeDesc: "Must be between 18 and 60 years old.",
      ruleWeight: "Weight Threshold",
      ruleWeightDesc: "Must weigh at least 50 kg (110 lbs).",
      ruleInterval: "Interval Limit",
      ruleIntervalDesc: "Minimum 120 days (4 months) since last donation.",
      ruleHealth: "Health Standard",
      ruleHealthDesc: "Must not have chronic diseases or ongoing fever."
    },

    // Auth View
    auth: {
      welcomeBack: "Welcome Back",
      accessDashboard: "Access your dashboard & update availability.",
      joinAsDonor: "Join as a Hero",
      createAccountDesc: "Register to receive clinical matches and save lives.",
      resetPasswordTitle: "Reset Password",
      resetPasswordDesc: "Request a reset token or enter new password.",
      
      loginTitle: "Welcome Back",
      loginSubtitle: "Access your dashboard & update availability.",
      signupTitle: "Join as a Hero",
      signupSubtitle: "Register to receive clinical matches and save lives.",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot Password?",
      fullName: "Full Name",
      
      loginTab: "Donor Login",
      signupTab: "New Donor Signup",
      resetTab: "Reset Password",

      forgotPasswordLink: "Forgot Password?",
      backToLogin: "Back to Login",
      
      // Signup exclusive fields
      avatarLabel: "Profile Picture (Optional - Drag or Click)",
      avatarDesc: "Upload your photo for donor directory verification.",
      facebookLabel: "Facebook Profile (Optional)",
      facebookPlaceholder: "Profile URL or Username",
      showFacebookLabel: "Show Facebook Profile",
      facebookError: "Please enter a valid Facebook URL or username",
      
      // Action Buttons
      loginBtn: "Access Dashboard",
      signupBtn: "Create Hero Account",
      sendResetLinkBtn: "Generate Reset Token",
      updatePasswordBtn: "Update Password & Login",

      // Errors & Info
      invalidEmail: "Please provide a valid email address.",
      fieldError: "Please fill in all required fields.",
      passwordMin: "Password must be at least 6 characters long.",
      emailExists: "An account with this email address already exists.",
      resetTokenGenerated: "Reset instructions have been generated. Use the token to reset.",
      resetSuccess: "Password reset successful! You can now log in.",
      passwordsDoNotMatch: "Passwords do not match."
    },

    // Search View
    search: {
      title: "Find Active Donors",
      subtitle: "Filter through verified volunteers in Bangladesh to get immediate blood donation support.",
      availableOnlyToggle: "Show Available Donors Only",
      donorCount: "Found {count} registered donors matching criteria",
      lastDonated: "Last Donated",
      availableNow: "Available Now",
      eligibleIn: "Eligible in {days} days",
      verifiedHero: "Verified Hero",
      contactDonor: "Contact Donor",
      noDonorsFound: "No donors found matching your exact parameters. Try widening your search.",
      callAlertTitle: "Confirm Call",
      callAlertDesc: "Would you like to initiate a call to {name} at {phone} for emergency blood?",
      cannotCall: "Calling is only supported on mobile devices, please dial {phone}"
    },

    // Emergency Requests View
    requests: {
      title: "Live Emergency Requests",
      subtitle: "Active clinical requirements. View, manage, or post an urgent blood requirement across Bangladesh.",
      postRequestBtn: "Post Urgent Request",
      allRequests: "All Requests",
      myRequests: "My Requests",
      patientName: "Patient Name",
      unitsNeeded: "Units Needed",
      hospitalName: "Hospital Name",
      requiredDate: "Required Date",
      contactPhone: "Contact Phone",
      reason: "Clinical Reason",
      reasonPlaceholder: "Explain the emergency (e.g., Thalassemia crisis, surgery, accident)...",
      noRequestsFound: "No active blood requests found matching filters.",
      
      // Post Modal
      modalTitle: "Post Emergency Blood Request",
      modalSubtitle: "Broadcasting your requirement to matching donors in the local area instantly.",
      postBtn: "Broadcast Request",
      successAlert: "Emergency request posted successfully! Local donors have been notified.",
      updateStatusSuccess: "Request status updated successfully.",
      statusUpdated: "Status Updated",
      
      // Request Card
      postedBy: "Posted by",
      contactHero: "Call Contact"
    },

    // Directories View
    directory: {
      title: "Healthcare Directories",
      subtitle: "Locate medical organizations, government hospitals, private clinics, and local blood banks instantly.",
      hospitalsTab: "Hospitals & Clinics",
      bloodBanksTab: "Blood Banks & Storage",
      searchPlaceholder: "Search by name or keyword...",
      government: "Government Hospital",
      private: "Private Clinic",
      servicesLabel: "Offered Services",
      bloodAvailability: "Available Blood Units",
      noOrganizations: "No organizations found matching search criteria.",
      contactFacility: "Call Facility",
      unitsAvailable: "units"
    },

    // Dashboard View
    dashboard: {
      title: "Donor Dashboard",
      welcome: "Welcome back, Hero!",
      statusCardTitle: "Your Donation Status",
      statusAvailable: "Active & Available to Save Lives",
      statusUnavailable: "Resting (Not Available)",
      statusToggleLabel: "Toggle Availability Status",
      statsDonationsCount: "Total Donations Saved",
      statsLastDonated: "Your Last Donation Date",
      
      // Log Donation Form
      logDonationTitle: "Log a Donation",
      logDonationDesc: "Keep your profile accurate. Logging a donation sets you as 'Resting' for 120 days.",
      recipientName: "Recipient Name",
      donationDate: "Donation Date",
      notes: "Experience Notes (Optional)",
      logBtn: "Record Donation",
      logSuccess: "Donation logged successfully! Your donation history is updated.",

      // Edit Profile
      editProfileTitle: "Edit Profile Details",
      editProfileDesc: "Keep your contact info and region accurate to receive local notifications.",
      facebookLabel: "Facebook Profile (Optional)",
      facebookPlaceholder: "Profile URL or Username",
      showFacebookLabel: "Show Facebook Profile",
      updateBtn: "Update Profile Info",
      profileSuccess: "Profile updated successfully!",

      // Donation History List
      historyTitle: "My Donation History",
      noHistory: "No recorded donations yet. Log your first donation above!",
      recordedOn: "Recorded on"
    },

    // Admin Console
    admin: {
      title: "System Admin Control",
      subtitle: "Monitor platform metrics, adjust user permissions, and moderate active emergency request broadcasts.",
      tabStats: "Statistics",
      tabUsers: "User Accounts",
      tabRequests: "Active Requests",
      
      // Stat Cards
      totalDonors: "Registered Donors",
      totalRequests: "Total Requests",
      pendingRequests: "Pending Requests",
      fulfilledRequests: "Fulfilled Requests",
      totalHospitals: "Registered Hospitals",
      totalBloodBanks: "Blood Banks",
      
      // Tables & Actions
      tableUser: "User",
      tableContact: "Contact info",
      tableLocation: "Region",
      tableRole: "Role",
      tableAction: "Action",
      makeAdmin: "Make Admin",
      removeAdmin: "Revoke Admin",
      deleteUser: "Delete User",
      deleteRequest: "Delete Request",
      
      adminRole: "Administrator",
      donorRole: "Verified Donor",
      
      roleUpdateSuccess: "User role toggled successfully.",
      userDeleteSuccess: "User deleted successfully.",
      requestDeleteSuccess: "Request deleted successfully.",
      cannotToggleSelf: "You cannot change your own admin role."
    },

    // Footer
    footer: {
      desc: "DonateLife BD is a real-time, volunteer-driven clinical platform dedicated to accelerating blood matching across Bangladesh. Join us to save lives.",
      quickLinks: "Quick Navigation",
      legal: "Security & Legal",
      terms: "Terms of Service",
      privacy: "Privacy Protocol",
      contactUs: "Emergency Helpdesk",
      copyright: "© {year} DonateLife BD. Serving Bangladesh with code and heart."
    },

    // Location Selectors
    location: {
      division: "Division",
      district: "District",
      upazila: "Upazila/Thana",
      selectDivision: "Select Division",
      selectDistrict: "Select District",
      selectUpazila: "Select Upazila/Thana"
    }
  },
  bn: {
    // General / Common
    common: {
      appName: "DonateLife BD",
      tagline: "বাংলাদেশ",
      bloodGroup: "রক্তের গ্রুপ",
      division: "বিভাগ",
      district: "জেলা",
      upazila: "উপজেলা/থানা",
      search: "অনুসন্ধান",
      loading: "লোড হচ্ছে...",
      required: "প্রয়োজনীয়",
      cancel: "বাতিল",
      save: "সংরক্ষণ",
      edit: "সম্পাদনা",
      delete: "মুছে ফেলুন",
      submit: "জমা দিন",
      success: "সফল",
      error: "ত্রুটি",
      pending: "অপেক্ষমান",
      fulfilled: "সম্পন্ন",
      cancelled: "বাতিলকৃত",
      all: "সব",
      status: "অবস্থা",
      contact: "যোগাযোগ",
      phone: "ফোন নম্বর",
      email: "ইমেইল ঠিকানা",
      password: "পাসওয়ার্ড",
      name: "সম্পূর্ণ নাম",
      actions: "পদক্ষেপ",
      admin: "অ্যাডমিন",
      available: "প্রস্তুত",
      unavailable: "প্রস্তুত নয়",
      selectBloodGroup: "রক্তের গ্রুপ নির্বাচন করুন",
      selectDivision: "বিভাগ নির্বাচন করুন",
      selectDistrict: "জেলা নির্বাচন করুন",
      selectUpazila: "উপজেলা/থানা নির্বাচন করুন",
      confirmDelete: "আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান?",
      noData: "কোন তথ্য পাওয়া যায়নি",
      lastDonation: "সর্বশেষ রক্তদান",
      daysAgo: "দিন আগে",
      neverDonated: "কখনো রক্ত দেননি",
      gender: "লিঙ্গ",
      male: "পুরুষ",
      female: "মহিলা",
      other: "অন্যান্য",
      yes: "হ্যাঁ",
      no: "না"
    },

    // Navbar
    navbar: {
      home: "হোম",
      findDonors: "রক্তদাতা খুঁজুন",
      emergencyRequests: "জরুরী অনুরোধসমূহ",
      helpdesk: "জরুরী হেল্পডেস্ক",
      directories: "ডিরেক্টরি",
      blogs: "স্বাস্থ্য ব্লগ",
      requestBlood: "রক্তের আবেদন",
      donorLogin: "রক্তদাতা লগইন",
      donorDashboard: "রক্তদাতা ড্যাশবোর্ড",
      adminConsole: "অ্যাডমিন প্যানেল",
      logoutSession: "লগআউট",
      notifications: "বিজ্ঞপ্তি",
      newNotif: "নতুন",
      noNotif: "কোন নতুন বিজ্ঞপ্তি নেই",
      markRead: "পঠিত হিসেবে চিহ্নিত করুন"
    },

    // Home View
    home: {
      badge: "জরুরী রক্ত মেলবন্ধন প্ল্যাটফর্ম",
      heroTitleLine1: "রক্তের প্রতিটি ফোঁটা একটি",
      heroTitleAccent: "নতুন আশার আলো",
      heroDesc: "বাংলাদেশের একটি উন্নত, রিয়েল-টাইম রক্ত মেলবন্ধন প্ল্যাটফর্ম। ৮টি বিভাগ, ৬৪টি জেলা এবং উপজেলা জুড়ে স্বেচ্ছাসেবী রক্তদাতাদের সাথে জরুরী রোগীদের তাৎক্ষণিক যোগাযোগ স্থাপন করে।",
      registerAsDonor: "রক্তদাতা হিসেবে যুক্ত হোন",
      myDonorConsole: "আমার ড্যাশবোর্ড",
      databaseGuard: "সুরক্ষিত ডাটাবেজ",
      databaseGuardDesc: "১০০% যাচাইকৃত পরিচয় ও স্বাস্থ্য পরীক্ষা",
      
      // Instant Finder
      finderTitle: "তাৎক্ষণিক রক্ত অনুসন্ধান",
      finderDesc: "রক্তের গ্রুপ এবং বিভাগ, জেলা ও উপজেলা নির্বাচন করে তাৎক্ষণিকভাবে আপনার এলাকায় প্রস্তুত রক্তদাতাদের খুঁজুন।",
      searchDonorsBtn: "রক্তদাতা খুঁজুন",

      // Live Feed
      liveFeedTitle: "চলতি জরুরী অনুরোধসমূহ",
      liveFeedDesc: "আপনার এলাকার সক্রিয় রোগীদের রক্তের অনুরোধে সাড়া দিয়ে প্রাণ বাঁচাতে এগিয়ে আসুন।",
      requiredOn: "প্রয়োজনের তারিখ",
      units: "ব্যাগ/ইউনিট",
      hospital: "হাসপাতাল",
      respond: "সাড়া দিন",
      viewAllRequests: "সকল অনুরোধ দেখুন",
      noRequests: "বর্তমানে কোন রক্তের অনুরোধ নেই। আপনার রক্তের প্রয়োজন হলে একটি অনুরোধ তৈরি করুন।",

      // Stats
      statsTitle: "আমাদের প্ল্যাটফর্মের প্রভাব",
      statsDesc: "সারা দেশ জুড়ে হাজার হাজার জীবনরক্ষকারী যোদ্ধাদের সাথে তাৎক্ষণিক যোগাযোগ স্থাপন।",
      statVerifiedDonors: "যাচাইকৃত রক্তদাতা",
      statActiveRequests: "সক্রিয় অনুরোধ",
      statClinicalIntegrations: "ক্লিনিকাল ইন্টিগ্রেশন",
      statTotalBanks: "মোট ব্লাড ব্যাংক",
      statMatches: "সফল রক্তদান",

      // Eligibility
      eligibilityTitle: "আমি কি রক্ত দিতে পারবো?",
      eligibilityDesc: "রক্তদানের আগে যোগ্যতা যাচাইয়ের নির্দেশনাবলী দেখে নিন।",
      ruleAge: "বয়সের সীমা",
      ruleAgeDesc: "বয়স অবশ্যই ১৮ থেকে ৬০ বছরের মধ্যে হতে হবে।",
      ruleWeight: "ওজনের সীমা",
      ruleWeightDesc: "ওজন কমপক্ষে ৫০ কেজি (১১০ পাউন্ড) হতে হবে।",
      ruleInterval: "রক্তদানের মধ্যবর্তী সময়",
      ruleIntervalDesc: "সর্বশেষ রক্তদানের পর কমপক্ষে ১২০ দিন (৪ মাস) অতিবাহিত হতে হবে।",
      ruleHealth: "শারীরিক সুস্থতা",
      ruleHealthDesc: "কোন দীর্ঘস্থায়ী রোগ বা জ্বর থাকা যাবে না।"
    },

    // Auth View
    auth: {
      welcomeBack: "স্বাগতম",
      accessDashboard: "ড্যাশবোর্ডে প্রবেশ করে আপনার রক্তদানের তথ্য আপডেট করুন।",
      joinAsDonor: "জীবনরক্ষক হিসেবে যুক্ত হোন",
      createAccountDesc: "নিবন্ধন করুন, জরুরী অনুরোধের নোটিফিকেশন পান এবং মানুষের জীবন বাঁচান।",
      resetPasswordTitle: "পাসওয়ার্ড রিসেট",
      resetPasswordDesc: "পাসওয়ার্ড রিসেট টোকেন অনুরোধ করুন অথবা নতুন পাসওয়ার্ড সেট করুন।",
      
      loginTitle: "স্বাগতম",
      loginSubtitle: "ড্যাশবোর্ডে প্রবেশ করে আপনার রক্তদানের তথ্য আপডেট করুন।",
      signupTitle: "জীবনরক্ষক হিসেবে যুক্ত হোন",
      signupSubtitle: "নিবন্ধন করুন, জরুরী অনুরোধের নোটিফিকেশন পান এবং মানুষের জীবন বাঁচান।",
      email: "ইমেইল ঠিকানা",
      password: "পাসওয়ার্ড",
      confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      fullName: "সম্পূর্ণ নাম",
      
      loginTab: "রক্তদাতা লগইন",
      signupTab: "নতুন রক্তদাতার নিবন্ধন",
      resetTab: "পাসওয়ার্ড রিসেট",

      forgotPasswordLink: "পাসওয়ার্ড ভুলে গেছেন?",
      backToLogin: "লগইন পেজে ফিরুন",
      
      // Signup exclusive fields
      avatarLabel: "প্রোফাইল ছবি (ঐচ্ছিক - ড্র্যাগ করুন বা ক্লিক করুন)",
      avatarDesc: "ডিরেক্টরিতে যাচাইয়ের জন্য আপনার একটি ছবি আপলোড করুন।",
      facebookLabel: "ফেসবুক প্রোফাইল (ঐচ্ছিক)",
      facebookPlaceholder: "প্রোফাইল ইউআরএল বা ইউজারনেম",
      showFacebookLabel: "ফেসবুক প্রোফাইল প্রদর্শন করুন",
      facebookError: "দয়া করে সঠিক ফেসবুক ইউআরএল বা ইউজারনেম প্রদান করুন",
      
      // Action Buttons
      loginBtn: "ড্যাশবোর্ডে প্রবেশ করুন",
      signupBtn: "অ্যাকাউন্ট তৈরি করুন",
      sendResetLinkBtn: "রিসেট টোকেন তৈরি করুন",
      updatePasswordBtn: "পাসওয়ার্ড পরিবর্তন ও লগইন",

      // Errors & Info
      invalidEmail: "দয়া করে একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।",
      fieldError: "দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।",
      passwordMin: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
      emailExists: "এই ইমেইল ঠিকানা দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।",
      resetTokenGenerated: "রিসেটের নির্দেশনা তৈরি হয়েছে। রিসেট করতে টোকেনটি ব্যবহার করুন।",
      resetSuccess: "পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন লগইন করতে পারেন।",
      passwordsDoNotMatch: "পাসওয়ার্ড দুটি মেলেনি।"
    },

    // Search View
    search: {
      title: "সক্রিয় রক্তদাতা খুঁজুন",
      subtitle: "জরুরী প্রয়োজনে রক্তের জন্য বাংলাদেশে আমাদের যাচাইকৃত স্বেচ্ছাসেবী রক্তদাতাদের তালিকা থেকে অনুসন্ধান করুন।",
      availableOnlyToggle: "শুধুমাত্র প্রস্তুত রক্তদাতাদের দেখান",
      donorCount: "প্রদত্ত শর্তের সাথে মিলে যাওয়া {count} জন রক্তদাতা পাওয়া গেছে",
      lastDonated: "সর্বশেষ রক্তদান",
      availableNow: "বর্তমানে প্রস্তুত",
      eligibleIn: "{days} দিন পর রক্ত দিতে পারবেন",
      verifiedHero: "যাচাইকৃত রক্তদাতা",
      contactDonor: "যোগাযোগ করুন",
      noDonorsFound: "আপনার নির্বাচিত এলাকায় বা গ্রুপে কোনো রক্তদাতা পাওয়া যায়নি। অনুসন্ধানের পরিধি বাড়িয়ে চেষ্টা করুন।",
      callAlertTitle: "কল করার অনুরোধ নিশ্চিত করুন",
      callAlertDesc: "আপনি কি রক্তদানের জন্য {name}-কে {phone} নম্বরে কল করতে চান?",
      cannotCall: "সরাসরি কল করার সুবিধা শুধুমাত্র মোবাইল ডিভাইসে প্রযোজ্য, দয়া করে ডায়াল করুন: {phone}"
    },

    // Emergency Requests View
    requests: {
      title: "চলতি জরুরী অনুরোধসমূহ",
      subtitle: "সক্রিয় জরুরী রক্তের প্রয়োজনসমূহ। দেখুন, সাড়া দিন অথবা আপনার এলাকার জন্য রক্তের আবেদন পোস্ট করুন।",
      postRequestBtn: "জরুরী রক্তের আবেদন করুন",
      allRequests: "সকল অনুরোধ",
      myRequests: "আমার অনুরোধসমূহ",
      patientName: "রোগীর নাম",
      unitsNeeded: "রক্তের পরিমাণ (ব্যাগ)",
      hospitalName: "হাসপাতালের নাম",
      requiredDate: "রক্ত দেওয়ার তারিখ",
      contactPhone: "যোগাযোগের ফোন নম্বর",
      reason: "জরুরী কারণ",
      reasonPlaceholder: "জরুরী অবস্থার বিস্তারিত লিখুন (যেমন: থ্যালাসেমিয়া, অপারেশন, দুর্ঘটনা)...",
      noRequestsFound: "কোন সক্রিয় রক্তের অনুরোধ পাওয়া যায়নি।",
      
      // Post Modal
      modalTitle: "জরুরী রক্তের আবেদন তৈরি করুন",
      modalSubtitle: "আবেদন করার সাথে সাথেই আপনার এলাকার সমগোত্রীয় রক্তদাতাদের কাছে নোটিফিকেশন চলে যাবে।",
      postBtn: "আবেদন প্রচার করুন",
      successAlert: "জরুরী রক্তের আবেদনটি সফলভাবে প্রচার করা হয়েছে! স্থানীয় রক্তদাতাদের জানিয়ে দেওয়া হয়েছে।",
      updateStatusSuccess: "আবেদনের অবস্থা সফলভাবে আপডেট করা হয়েছে।",
      statusUpdated: "অবস্থা আপডেট হয়েছে",
      
      // Request Card
      postedBy: "আবেদন করেছেন",
      contactHero: "কল করুন"
    },

    // Directories View
    directory: {
      title: "স্বাস্থ্যসেবা ডিরেক্টরি",
      subtitle: "সরকারি হাসপাতাল, বেসরকারি ক্লিনিক এবং স্থানীয় ব্লাড ব্যাংকের ঠিকানা ও তথ্য তাৎক্ষণিকভাবে খুঁজুন।",
      hospitalsTab: "হাসপাতাল ও ক্লিনিক",
      bloodBanksTab: "ব্লাড ব্যাংক ও স্টোরেজ",
      searchPlaceholder: "নাম বা কীওয়ার্ড দিয়ে খুঁজুন...",
      government: "সরকারি হাসপাতাল",
      private: "বেসরকারি ক্লিনিক",
      servicesLabel: "সেবাসমূহ",
      bloodAvailability: "রক্তের মজুদ",
      noOrganizations: "খোঁজাখুজি করা তথ্যের সাথে মিলে যাওয়া কোন প্রতিষ্ঠান পাওয়া যায়নি।",
      contactFacility: "প্রতিষ্ঠানে কল করুন",
      unitsAvailable: "ব্যাগ"
    },

    // Dashboard View
    dashboard: {
      title: "রক্তদাতা ড্যাশবোর্ড",
      welcome: "স্বাগতম, হে জীবনরক্ষক!",
      statusCardTitle: "আপনার রক্তদানের অবস্থা",
      statusAvailable: "সক্রিয় ও রক্তদানে প্রস্তুত",
      statusUnavailable: "বিশ্রামে আছেন (প্রস্তুত নন)",
      statusToggleLabel: "রক্তদানের প্রস্তুতি পরিবর্তন করুন",
      statsDonationsCount: "মোট রক্তদান সংখ্যা",
      statsLastDonated: "সর্বশেষ রক্তদানের তারিখ",
      
      // Log Donation Form
      logDonationTitle: "রক্তদানের রেকর্ড যুক্ত করুন",
      logDonationDesc: "আপনার প্রোফাইল সঠিক রাখুন। রক্তদান নথিভুক্ত করলে আপনার প্রোফাইল ১২০ দিনের জন্য বিশ্রামে চলে যাবে।",
      recipientName: "রক্তগ্রহীতার নাম",
      donationDate: "রক্তদানের তারিখ",
      notes: "অভিজ্ঞতা / মন্তব্য (ঐচ্ছিক)",
      logBtn: "রেকর্ড সংরক্ষণ করুন",
      logSuccess: "রক্তদানের রেকর্ড সফলভাবে সংরক্ষিত হয়েছে! আপনার রক্তদানের ইতিহাস আপডেট করা হয়েছে।",

      // Edit Profile
      editProfileTitle: "প্রোফাইল তথ্য সংশোধন",
      editProfileDesc: "আপনার এলাকার জরুরী নোটিফিকেশন পেতে যোগাযোগের তথ্য এবং অঞ্চল সঠিক রাখুন।",
      facebookLabel: "ফেসবুক প্রোফাইল (ঐচ্ছিক)",
      facebookPlaceholder: "প্রোফাইল ইউআরএল বা ইউজারনেম",
      showFacebookLabel: "ফেসবুক প্রোফাইল প্রদর্শন করুন",
      updateBtn: "তথ্য আপডেট করুন",
      profileSuccess: "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!",

      // Donation History List
      historyTitle: "আমার রক্তদানের ইতিহাস",
      noHistory: "এখনো কোন রক্তদানের রেকর্ড নেই। উপর থেকে আপনার প্রথম রক্তদানের রেকর্ড যুক্ত করুন!",
      recordedOn: "নথিভুক্ত হয়েছে"
    },

    // Admin Console
    admin: {
      title: "সিস্টেম অ্যাডমিন প্যানেল",
      subtitle: "প্ল্যাটফর্মের সামগ্রিক পারফরম্যান্স পর্যবেক্ষণ, ব্যবহারকারী নিয়ন্ত্রণ এবং জরুরী রক্তের অনুরোধসমূহ মডারেট করুন।",
      tabStats: "পরিসংখ্যান",
      tabUsers: "ব্যবহারকারী অ্যাকাউন্টস",
      tabRequests: "সক্রিয় অনুরোধসমূহ",
      
      // Stat Cards
      totalDonors: "নিবন্ধিত রক্তদাতা",
      totalRequests: "মোট অনুরোধ",
      pendingRequests: "অপেক্ষমান অনুরোধ",
      fulfilledRequests: "সম্পন্ন অনুরোধ",
      totalHospitals: "নিবন্ধিত হাসপাতাল",
      totalBloodBanks: "ব্লাড ব্যাংক সংখ্যা",
      
      // Tables & Actions
      tableUser: "ব্যবহারকারী",
      tableContact: "যোগাযোগের তথ্য",
      tableLocation: "অঞ্চল",
      tableRole: "পদবী",
      tableAction: "পদক্ষেপ",
      makeAdmin: "অ্যাডমিন করুন",
      removeAdmin: "অ্যাডমিন বাতিল করুন",
      deleteUser: "অ্যাকাউন্ট মুছুন",
      deleteRequest: "অনুরোধ মুছুন",
      
      adminRole: "অ্যাডমিনিস্ট্রেটর",
      donorRole: "যাচাইকৃত রক্তদাতা",
      
      roleUpdateSuccess: "ব্যবহারকারীর পদবী সফলভাবে পরিবর্তিত হয়েছে।",
      userDeleteSuccess: "ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে।",
      requestDeleteSuccess: "অনুরোধ সফলভাবে মুছে ফেলা হয়েছে।",
      cannotToggleSelf: "আপনি নিজের অ্যাডমিন পদবী পরিবর্তন করতে পারবেন না।"
    },

    // Footer
    footer: {
      desc: "DonateLife BD একটি সম্পূর্ণ স্বেচ্ছাসেবী ও রিয়েল-টাইম প্ল্যাটফর্ম, যা বাংলাদেশে রক্তের জরুরী প্রয়োজন মেটাতে নিয়োজিত। যুক্ত হোন এবং জীবন বাঁচান।",
      quickLinks: "সহজ নেভিগেশন",
      legal: "নিরাপত্তা ও আইনি শর্তাবলী",
      terms: "ব্যবহারের শর্তাবলী",
      privacy: "গোপনীয়তা নীতিমালা",
      contactUs: "জরুরী হেল্পডেস্ক",
      copyright: "© {year} DonateLife BD। কোড এবং ভালোবাসায় বাংলাদেশের সেবায় নিয়োজিত।"
    },

    // Location Selectors
    location: {
      division: "বিভাগ",
      district: "জেলা",
      upazila: "উপজেলা/থানা",
      selectDivision: "বিভাগ নির্বাচন করুন",
      selectDistrict: "জেলা নির্বাচন করুন",
      selectUpazila: "উপজেলা/থানা নির্বাচন করুন"
    }
  }
};
