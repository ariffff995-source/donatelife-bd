'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, HeartHandshake, Building2, Droplet, Truck, Users, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { GlobalSearchResultItem, GlobalSearchResults } from '../types';
import { api } from '../lib/api';

interface GlobalSearchProps {
  onNavigate: (tab: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResults>({
    donors: [],
    requests: [],
    hospitals: [],
    bloodBanks: [],
    ambulances: [],
    volunteers: [],
    blogs: [],
    faqs: []
  });

  const searchRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut CMD+K or CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced real-time global search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ donors: [], requests: [], hospitals: [], bloodBanks: [], ambulances: [], volunteers: [], blogs: [], faqs: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res: any = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`).then(r => r.json()).catch(() => null);
        if (res && res.results) {
          setResults(res.results);
        }
      } catch (err) {
        console.error('Global search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const totalHits =
    results.donors.length +
    results.requests.length +
    results.hospitals.length +
    results.bloodBanks.length +
    results.ambulances.length +
    results.volunteers.length +
    results.blogs.length +
    results.faqs.length;

  const handleSelectResult = (item: GlobalSearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    if (item.type === 'donor') onNavigate('donors');
    else if (item.type === 'request') onNavigate('requests');
    else if (item.type === 'hospital') onNavigate('hospitals');
    else if (item.type === 'blood_bank') onNavigate('blood-banks');
    else if (item.type === 'ambulance') onNavigate('ambulances');
    else if (item.type === 'blog') onNavigate('blog');
    else if (item.type === 'faq') onNavigate('helpdesk');
    else onNavigate('donors');
  };

  return (
    <>
      {/* Trigger Search Bar Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/90 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner group cursor-pointer"
        aria-label="Open Global Search"
      >
        <Search className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition" />
        <span className="hidden md:inline font-medium">
          {language === 'bn' ? 'গ্লোবাল সার্চ...' : 'Global Search...'}
        </span>
        <span className="hidden md:inline text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
          ⌘K
        </span>
      </button>

      {/* Global Search Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div
            ref={searchRef}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative"
          >
            {/* Search Input Box */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/80">
              <Search className="w-5 h-5 text-rose-500 mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder={
                  language === 'bn'
                    ? 'রক্তদাতা, হাসপাতাল, অ্যাম্বুলেন্স, ব্লাড ব্যাংক, ব্লগ সল্যুশন খুঁজুন...'
                    : 'Search donors, blood requests, hospitals, blood banks, ambulances, blogs...'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-lg text-slate-400 hover:text-white mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
              >
                ESC
              </button>
            </div>

            {/* Results Output */}
            <div className="overflow-y-auto p-4 space-y-4 max-h-[60vh] scrollbar-thin">
              {loading && (
                <div className="flex items-center justify-center py-10 space-x-2 text-rose-400 text-xs font-medium">
                  <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>{language === 'bn' ? 'অনুসন্ধান করা হচ্ছে...' : 'Searching database across all entities...'}</span>
                </div>
              )}

              {!loading && query && totalHits === 0 && (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-bold text-slate-300">
                    {language === 'bn' ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching results found'}
                  </p>
                  <p className="text-xs text-slate-500">
                    "{query}" {language === 'bn' ? 'এর সাথে মিলে যাওয়ার মতো কোনো ডাটা পাওয়া যায়নি।' : 'did not match any donors, hospitals, or emergency services.'}
                  </p>
                </div>
              )}

              {/* Render Grouped Search Category Blocks */}
              {!loading && (
                <>
                  {renderSearchGroup(language === 'bn' ? '🩸 রক্তদাতা' : '🩸 Voluntary Donors', results.donors, User, handleSelectResult)}
                  {renderSearchGroup(language === 'bn' ? '🚨 রক্তের আবেদন' : '🚨 Blood Requests', results.requests, HeartHandshake, handleSelectResult)}
                  {renderSearchGroup(language === 'bn' ? '🏥 হাসপাতালসমূহ' : '🏥 Hospitals', results.hospitals, Building2, handleSelectResult)}
                  {renderSearchGroup(language === 'bn' ? '💉 ব্লাড ব্যাংক' : '💉 Blood Banks', results.bloodBanks, Droplet, handleSelectResult)}
                  {renderSearchGroup(language === 'bn' ? '🚑 অ্যাম্বুলেন্স' : '🚑 Ambulances', results.ambulances, Truck, handleSelectResult)}
                  {renderSearchGroup(language === 'bn' ? '🤝 ভলান্টিয়ার্স' : '🤝 Volunteers', results.volunteers, Users, handleSelectResult)}
                  {renderSearchGroup(language === 'bn' ? '📖 ব্লগ নিবন্ধ' : '📖 Blog Articles', results.blogs, BookOpen, handleSelectResult)}
                  {renderSearchGroup(language === 'bn' ? '❓ সচরাচর প্রশ্ন (FAQ)' : '❓ FAQs', results.faqs, HelpCircle, handleSelectResult)}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function renderSearchGroup(
  title: string,
  items: GlobalSearchResultItem[],
  Icon: React.ElementType,
  onSelect: (item: GlobalSearchResultItem) => void
) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
        <span className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5 text-rose-400" />
          {title}
        </span>
        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>

      <div className="grid grid-cols-1 gap-1">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 hover:bg-rose-500/10 border border-slate-800/80 hover:border-rose-500/30 transition-all cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-bold text-slate-100 group-hover:text-rose-400 transition">{item.title}</h5>
                {item.badge && (
                  <span className="text-[9px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition transform group-hover:translate-x-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
