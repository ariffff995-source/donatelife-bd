'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../data/translations';
import { locationTranslations } from '../data/location-translations';
import { api } from '../lib/api';
import { parseLocationValue } from '../utils/locationHelper';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  translateLocation: (englishName: string) => string;
  formatLocation: (loc: { division?: string | null; district?: string | null; upazila?: string | null; policeStation?: string | null }) => string;
  cmsData: Record<string, any>;
  refreshCms: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, initialLanguage }) => {
  const [cmsData, setCmsData] = useState<Record<string, any>>({});
  // Use initialLanguage passed from server cookie (or default 'bn') for 100% identical SSR & client hydration HTML
  const [language, setLanguageState] = useState<Language>(initialLanguage || 'bn');
  const [mounted, setMounted] = useState(false);

  const refreshCms = async () => {
    try {
      const data = await api.cms.fetchAll();
      setCmsData(data || {});
    } catch (err) {
      console.warn('Error fetching dynamic CMS data in LanguageContext, falling back to static translations:', err);
      setCmsData({});
    }
  };

  useEffect(() => {
    setMounted(true);
    // Sync with localStorage post-hydration if stored preference exists
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('donatelife_lang');
      if (saved === 'en' || saved === 'bn') {
        setLanguageState(saved);
      }
    }
    refreshCms();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('donatelife_lang', lang);
      document.cookie = `donatelife_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(new Event('language_changed'));
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('donatelife_lang');
        if (saved === 'en' || saved === 'bn') {
          setLanguageState(saved);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('language_changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('language_changed', handleStorageChange);
    };
  }, []);

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let obj: any = undefined;

    // Try resolving from cmsData first
    if (keys.length > 0) {
      const pageId = keys[0];
      const section = cmsData[pageId];
      if (section) {
        let temp: any = section;
        for (let i = 1; i < keys.length; i++) {
          if (temp && typeof temp === 'object') {
            temp = temp[keys[i]];
          } else {
            temp = undefined;
            break;
          }
        }
        if (temp !== undefined) {
          if (temp && typeof temp === 'object' && ('en' in temp || 'bn' in temp)) {
            obj = temp[language] || temp['en'];
          } else {
            obj = temp;
          }
        }
      }
    }

    // Fallback to static translations
    if (obj === undefined) {
      obj = translations[language];
      for (const k of keys) {
        if (obj && typeof obj === 'object') {
          obj = obj[k];
        } else {
          obj = undefined;
          break;
        }
      }
    }

    if (obj === undefined) {
      // Fallback to English key if not found
      let fallbackObj: any = translations['en'];
      for (const k of keys) {
        if (fallbackObj && typeof fallbackObj === 'object') {
          fallbackObj = fallbackObj[k];
        } else {
          fallbackObj = undefined;
          break;
        }
      }
      obj = fallbackObj;
    }

    if (obj === undefined) {
      return key; // If key still not found, return the key itself
    }

    let result = String(obj);

    // Replace placeholders like {year} or {count}
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    // Convert English digits to Bangla digits if language is Bangla
    if (language === 'bn') {
      result = result.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
    }

    return result;
  };

  const translateLocation = (englishName: string): string => {
    if (!englishName) return '';
    if (language === 'en') {
      return englishName;
    }
    const directTranslation = locationTranslations[englishName];
    if (directTranslation) {
      return directTranslation;
    }

    // Smart fallback translation for Police Stations, Thanas, and Model Thanas
    if (englishName.endsWith(' Police Station')) {
      const base = englishName.substring(0, englishName.length - ' Police Station'.length);
      return `${locationTranslations[base] || base} থানা`;
    }
    if (englishName.endsWith(' Model Thana')) {
      const base = englishName.substring(0, englishName.length - ' Model Thana'.length);
      return `${locationTranslations[base] || base} মডেল থানা`;
    }
    if (englishName.endsWith(' Thana')) {
      const base = englishName.substring(0, englishName.length - ' Thana'.length);
      return `${locationTranslations[base] || base} থানা`;
    }

    return englishName;
  };

  const formatLocation = (loc: { division?: string | null; district?: string | null; upazila?: string | null; policeStation?: string | null }): string => {
    if (!loc) return '';
    const parts: string[] = [];
    
    // Parse using the centralized language-aware function
    const ps = parseLocationValue(loc.policeStation, language, translateLocation);
    const upz = parseLocationValue(loc.upazila, language, translateLocation);
    const dist = parseLocationValue(loc.district, language, translateLocation);
    const div = parseLocationValue(loc.division, language, translateLocation);

    if (ps) parts.push(ps);
    if (upz) parts.push(upz);
    if (dist) parts.push(dist);
    if (div) parts.push(div);

    return parts.filter(Boolean).join(' → ');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateLocation, formatLocation, cmsData, refreshCms }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
