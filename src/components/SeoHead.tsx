import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SeoHeadProps {
  activeTab: string;
  customTitle?: string;
  customDescription?: string;
}

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://donatelifebd.com';

export default function SeoHead({ activeTab, customTitle, customDescription }: SeoHeadProps) {
  const { language } = useLanguage();

  useEffect(() => {
    let title = 'DonateLife BD | Emergency Blood Network Bangladesh';
    let description = 'Connect with voluntary blood donors across 64 districts in Bangladesh. Post emergency blood requests, locate blood banks, hospitals, and ambulance services 24/7.';
    let keywords = 'blood donor bangladesh, emergency blood request bd, blood group search dhaka, blood bank directory bangladesh, ambulance service bd';
    let path = '/';
    let jsonLd: object[] = [];

    // Base Organization Schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'MedicalOrganization',
      'name': 'DonateLife BD',
      'url': SITE_URL,
      'logo': `${SITE_URL}/favicon.svg`,
      'description': 'Emergency Blood Donation & Voluntary Donor Network in Bangladesh',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'BD'
      },
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+880-1700-000000',
        'contactType': 'Emergency Blood Hotline',
        'availableLanguage': ['English', 'Bengali']
      }
    };

    // Base WebSite Schema
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'DonateLife BD',
      'url': SITE_URL,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${SITE_URL}/search?bloodGroup={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    // Tab-specific SEO details & structured data
    switch (activeTab) {
      case 'home':
        title = language === 'bn' 
          ? 'DonateLife BD | বাংলাদেশে জরুরি রক্তদাতা ও ব্লাড ব্যাংক নেটওয়ার্ক'
          : 'DonateLife BD | Emergency Blood Network Bangladesh';
        description = language === 'bn'
          ? 'বাংলাদেশের ৬৪ জেলা ও উপেজলায় স্বেচ্ছায় রক্তদাতাদের খুঁজুন। ২৪/৭ ঘণ্টার জরুরি রক্তের রিকোয়েস্ট ও হাসপাতালের তথ্য।'
          : 'Find voluntary blood donors across 64 districts and all upazilas in Bangladesh. Instant search, 24/7 emergency blood requests & helpline.';
        path = '/';
        jsonLd = [
          organizationSchema,
          websiteSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'EmergencyService',
            'name': 'DonateLife BD Emergency Blood Request Helpline',
            'serviceType': 'Blood Donation & Donor Search',
            'areaServed': 'Bangladesh',
            'availableLanguage': ['en', 'bn']
          }
        ];
        break;

      case 'donors':
        title = language === 'bn'
          ? 'সকল রক্তদাতা ডিরেক্টরি | DonateLife BD'
          : 'All Donors Directory | Verified Blood Donors Bangladesh | DonateLife BD';
        description = language === 'bn'
          ? 'বাংলাদেশের নিবন্ধিত ও সকল যাচাইকৃত রক্তদাতাদের পাবলিক তালিকা। নাম, ডোনার আইডি ও জেলা অনুযায়ী খুঁজুন।'
          : 'Browse verified volunteer blood donors across Bangladesh. Search by donor name, unique Donor ID (e.g. DBD-000001), or district with complete privacy protection.';
        keywords = 'all blood donors, donor directory bangladesh, DBD donor id, volunteer blood donors';
        path = '/donors';
        jsonLd = [
          organizationSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
              { '@type': 'ListItem', 'position': 2, 'name': 'All Donors', 'item': `${SITE_URL}/donors` }
            ]
          }
        ];
        break;

      case 'search':
        title = language === 'bn'
          ? 'রক্তদাতা খুঁজুন | ৮ বিভাগ ও ৬৪ জেলা | DonateLife BD'
          : 'Find Voluntary Blood Donors | 64 Districts Bangladesh | DonateLife BD';
        description = language === 'bn'
          ? 'রক্তের গ্রুপ, বিভাগ, জেলা ও থানা অনুযায়ী নিকটস্থ রক্তদাতা খুঁজুন। A+, B+, O+, AB+ এবং নেগেটিভ রক্তের জরুরি কন্টাক্ট।'
          : 'Search blood donors by Blood Group, Division, District, and Upazila/Thana. Instant access to verified A+, B+, O+, AB+ & negative group donors in Bangladesh.';
        keywords = 'find blood donor bd, search A+ donor dhaka, O negative blood bangladesh, upazila blood donor search';
        path = '/search';
        jsonLd = [
          organizationSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
              { '@type': 'ListItem', 'position': 2, 'name': 'Find Donors', 'item': `${SITE_URL}/search` }
            ]
          },
          {
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            'name': 'Bangladesh Voluntary Blood Donor Directory',
            'description': 'Searchable directory of verified blood donors across Bangladesh'
          }
        ];
        break;

      case 'requests':
        title = language === 'bn'
          ? 'জরুরি রক্তের আবেদন | লাইভ পোস্ট ও সাহায্য | DonateLife BD'
          : 'Emergency Blood Requests | Urgent Blood Need Bangladesh | DonateLife BD';
        description = language === 'bn'
          ? 'জরুরি রক্তের প্রয়োজন? বিনামূল্যে রক্ত পেতে দ্রুত আবেদন তৈরি করুন বা রক্তদানের জন্য এগিয়ে আসুন।'
          : 'Post urgent blood requests or respond to emergency patient needs across hospitals in Bangladesh. Real-time patient alerts & donor responses.';
        keywords = 'emergency blood request, urgent blood need dhaka, blood post bangladesh, hospital blood request';
        path = '/requests';
        jsonLd = [
          organizationSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
              { '@type': 'ListItem', 'position': 2, 'name': 'Emergency Requests', 'item': `${SITE_URL}/requests` }
            ]
          }
        ];
        break;

      case 'directories':
        title = language === 'bn'
          ? 'হাসপাতাল, ব্লাড ব্যাংক ও অ্যাম্বুলেন্স ডিরেক্টরি | DonateLife BD'
          : 'Bangladesh Medical Directory | Hospitals, Blood Banks & Ambulances';
        description = language === 'bn'
          ? 'বাংলাদেশের হাসপাতাল, ব্লাড ব্যাংক এবং ২৪ ঘণ্টা জরুরি অ্যাম্বুলেন্স সেবার যাচাইকৃত ফোন নম্বর ও ঠিকানা।'
          : 'Verified contact numbers and addresses of top hospitals, blood banks, and 24/7 emergency ambulance services across Bangladesh.';
        keywords = 'hospital directory bangladesh, blood bank phone numbers bd, 24/7 ambulance service dhaka, emergency hospital contacts';
        path = '/directories';
        jsonLd = [
          organizationSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
              { '@type': 'ListItem', 'position': 2, 'name': 'Emergency Directories', 'item': `${SITE_URL}/directories` }
            ]
          }
        ];
        break;

      case 'helpdesk':
        title = language === 'bn'
          ? 'জরুরি হেল্পডেস্ক ও প্রশ্নাবলী | DonateLife BD'
          : 'Emergency Blood Helpdesk & FAQ | DonateLife BD Bangladesh';
        description = language === 'bn'
          ? 'রক্তদানের নিয়মাবলী, কারা রক্ত দিতে পারবেন, এবং রক্তের জরুরি ফোন নম্বরসমূহ।'
          : 'Emergency support desk, blood donor eligibility rules, donation interval guidance, and 24/7 helpline contacts in Bangladesh.';
        keywords = 'blood donation rules bangladesh, blood donation eligibility, emergency blood hotline bd, how to donate blood';
        path = '/helpdesk';
        jsonLd = [
          organizationSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
              { '@type': 'ListItem', 'position': 2, 'name': 'Helpdesk & FAQ', 'item': `${SITE_URL}/helpdesk` }
            ]
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'Who can donate blood in Bangladesh?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Any healthy person between 18 to 60 years old weighing at least 45kg with hemoglobin over 12g/dl can donate blood every 3 to 4 months.'
                }
              },
              {
                '@type': 'Question',
                'name': 'How do I search for a blood donor near me?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Go to the Find Donors tab on DonateLife BD, select required Blood Group, Division, District, and Upazila to find verified local voluntary donors.'
                }
              }
            ]
          }
        ];
        break;

      case 'blog':
        title = language === 'bn'
          ? 'রক্তদান ব্লগ ও স্বাস্থ্য সচেতনতা | DonateLife BD'
          : 'Blood Donation Articles & Health Guides | DonateLife BD Blog';
        description = language === 'bn'
          ? 'রক্তদানের উপকারিতা, থ্যালাসেমিয়া সচেতনতা এবং স্বাস্থ্য সংক্রান্ত টিপস জানতে পড়ুন।'
          : 'Read health articles, medical guidelines, thalassemeia awareness guides, and blood donation tips written by healthcare specialists in Bangladesh.';
        keywords = 'blood donation benefits, thalassemia guidance bangladesh, health blog bd, blood donation interval';
        path = '/blog';
        jsonLd = [
          organizationSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
              { '@type': 'ListItem', 'position': 2, 'name': 'Health Blog', 'item': `${SITE_URL}/blog` }
            ]
          }
        ];
        break;

      case 'auth':
        title = language === 'bn'
          ? 'সাইন ইন ও রেজিস্ট্রেশন | DonateLife BD'
          : 'Donor Registration & Sign In | DonateLife BD';
        description = language === 'bn'
          ? 'স্বেচ্ছায় রক্তদাতা হিসেবে নাম নিবন্ধন করুন বা একাউন্টে লগইন করুন।'
          : 'Register as a voluntary blood donor in Bangladesh or sign in to update your donation availability status.';
        path = '/auth';
        break;

      case 'dashboard':
        title = language === 'bn'
          ? 'ড্যাশবোর্ড | DonateLife BD'
          : 'Donor Portal & Dashboard | DonateLife BD';
        description = 'Manage blood donation status, update location, and track blood request history.';
        path = '/dashboard';
        break;

      case 'admin':
        title = 'Admin Panel | DonateLife BD';
        description = 'Administration management portal for DonateLife BD platform.';
        path = '/admin';
        break;

      default:
        break;
    }

    if (customTitle) title = customTitle;
    if (customDescription) description = customDescription;

    // 1. Update Title
    document.title = title;

    // Helper function to set or create meta tag
    const setMeta = (nameAttr: string, attrVal: string, contentVal: string) => {
      let el = document.querySelector(`meta[${nameAttr}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    // 2. Meta Tags
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', `${SITE_URL}${path}`);
    setMeta('property', 'twitter:title', title);
    setMeta('property', 'twitter:description', description);
    setMeta('property', 'twitter:url', `${SITE_URL}${path}`);

    // 3. Update Canonical URL Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE_URL}${path}`);

    // 4. Update JSON-LD Structured Data
    let script = document.getElementById('json-ld-schema');
    if (script) {
      script.remove();
    }
    if (jsonLd.length > 0) {
      const newScript = document.createElement('script');
      newScript.id = 'json-ld-schema';
      newScript.type = 'application/ld+json';
      newScript.text = JSON.stringify(jsonLd);
      document.head.appendChild(newScript);
    }

    // 5. Update HTML lang attribute
    document.documentElement.lang = language;
  }, [activeTab, language, customTitle, customDescription]);

  return null;
}
