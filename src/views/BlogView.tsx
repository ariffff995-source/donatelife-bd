'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { allBlogPosts } from '../data/blogs';
import { BlogPost, BlogContent } from '../types';
import { api } from '../lib/api';
import { 
  BookOpen, 
  Search, 
  Heart, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft, 
  Tag, 
  Globe, 
  Sparkles, 
  Share2, 
  Bookmark, 
  Award, 
  Clock,
  Shield,
  HelpCircle,
  Menu,
  CheckCircle2,
  Facebook,
  Twitter,
  Link,
  Check,
  Calendar,
  User
} from 'lucide-react';

interface BlogViewProps {
  onNavigate: (tabId: string) => void;
}

export default function BlogView({ onNavigate }: BlogViewProps) {
  const { language, t } = useLanguage();
  const [blogs, setBlogs] = useState<BlogPost[]>(allBlogPosts);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [localLanguage, setLocalLanguage] = useState<'en' | 'bn'>(language);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const topRef = useRef<HTMLDivElement>(null);

  // Fetch blogs dynamically from the server on mount
  useEffect(() => {
    let active = true;
    const loadBlogs = async () => {
      try {
        const data = await api.blogs.list();
        if (active && data && data.length > 0) {
          setBlogs(data);
        }
      } catch (err) {
        console.error('Failed to load dynamic blog posts from server:', err);
      }
    };
    loadBlogs();
    return () => {
      active = false;
    };
  }, []);

  // Keep local language in sync with global language context initially
  useEffect(() => {
    setLocalLanguage(language);
  }, [language]);

  // Scroll to top when post changes
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedPost]);

  // Extract all categories
  const categories = ['All', ...Array.from(new Set(blogs.map(post => post.category)))];

  // Filter posts based on search query, category, and tags
  const filteredPosts = blogs.filter(post => {
    const content = localLanguage === 'en' ? post.en : post.bn;
    const matchesSearch = 
      content.seoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.introduction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  const handleShare = (slug: string) => {
    const fullUrl = `${window.location.origin}/blog/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const getEstimatedReadTime = (post: BlogPost): string => {
    const wordCount = post.en.fullArticle.reduce((acc, sec) => acc + (sec.text?.split(' ').length || 0) + (sec.items?.length || 0) * 5, 0);
    const minutes = Math.max(2, Math.ceil(wordCount / 200));
    return localLanguage === 'en' ? `${minutes} min read` : `${minutes === 2 ? '২' : '৩'} মিনিট পড়ার সময়`;
  };

  const currentContent = selectedPost ? (localLanguage === 'en' ? selectedPost.en : selectedPost.bn) : null;

  const [activeSection, setActiveSection] = useState<string>('');

  // Active section tracking for Table of Contents
  useEffect(() => {
    if (!selectedPost) return;
    const handleScroll = () => {
      const sections = currentContent?.tableOfContents?.map(toc => document.getElementById(toc.anchor)) || [];
      const scrollPosition = window.scrollY + 120;
      
      let currentActive = '';
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          currentActive = section.id;
        }
      }
      setActiveSection(currentActive || (currentContent?.tableOfContents?.[0]?.anchor || ''));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedPost, localLanguage, currentContent]);

  // Schema.org structured data, page titles, and canonical tags
  useEffect(() => {
    if (!selectedPost) {
      const existingSchema = document.getElementById('blog-structured-data');
      if (existingSchema) existingSchema.remove();
      return;
    }
    
    const content = localLanguage === 'en' ? selectedPost.en : selectedPost.bn;
    const canonicalUrl = `${window.location.origin}/blog/${selectedPost.slug}`;

    // Schema.org structured JSON-LD
    let existingSchema = document.getElementById('blog-structured-data');
    if (existingSchema) existingSchema.remove();

    const schemaJson = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": content.seoTitle,
      "description": content.metaDescription,
      "url": canonicalUrl,
      "datePublished": "2026-07-01T08:00:00+06:00",
      "dateModified": "2026-07-04T12:00:00+06:00",
      "author": {
        "@type": "Organization",
        "name": "DonateLife BD Medical Review Board",
        "url": window.location.origin
      },
      "publisher": {
        "@type": "Organization",
        "name": "DonateLife BD",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      }
    };

    const script = document.createElement('script');
    script.id = 'blog-structured-data';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(schemaJson);
    document.head.appendChild(script);

    // Dynamic head tags
    document.title = `${content.seoTitle} | DonateLife BD`;
    
    return () => {
      const existingSchema = document.getElementById('blog-structured-data');
      if (existingSchema) existingSchema.remove();
      document.title = "DonateLife BD - Blood Donation Platform";
    };
  }, [selectedPost, localLanguage]);

  const shareOnFacebook = () => {
    if (!selectedPost) return;
    const url = `${window.location.origin}/blog/${selectedPost.slug}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnTwitter = () => {
    if (!selectedPost || !currentContent) return;
    const url = `${window.location.origin}/blog/${selectedPost.slug}`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(currentContent.seoTitle)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    if (!selectedPost || !currentContent) return;
    const url = `${window.location.origin}/blog/${selectedPost.slug}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(currentContent.seoTitle + ' ' + url)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-slate-100" ref={topRef}>
      
      <AnimatePresence mode="wait">
        {!selectedPost ? (
          // ==================== LIST VIEW ====================
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* Health Blog Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/10 p-8 md:p-12 mb-8 shadow-xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
              
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-black tracking-widest uppercase">
                  <Sparkles size={12} />
                  {localLanguage === 'en' ? 'Medically Verified Library' : 'চিকিৎসাগতভাবে যাচাইকৃত লাইব্রেরি'}
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  {localLanguage === 'en' ? 'DonateLife BD Health Blog' : 'DonateLife BD স্বাস্থ্য ব্লগ'}
                </h1>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  {localLanguage === 'en' 
                    ? 'Explore medically-accurate guidelines, expert tips, and heartwarming stories on blood donation in Bangladesh. Curated to keep you safe, informed, and inspired.' 
                    : 'বাংলাদেশে রক্তদান নিয়ে চিকিৎসাবিজ্ঞান সম্মত তথ্য, বিশেষজ্ঞ গাইড ও অনুপ্রেরণামূলক কাহিনী জানুন। আপনার সঠিক সচেতনতাই পারে আরেকটি জীবন বাঁচাতে।'}
                </p>
              </div>
            </div>

            {/* Filter and Search controls */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
              {/* Search input */}
              <div className="relative md:col-span-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder={localLanguage === 'en' ? 'Search articles or tags...' : 'নিবন্ধ বা ট্যাগ খুঁজুন...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                />
              </div>

              {/* Categories scrollable list */}
              <div className="md:col-span-8 flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedTag(null);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat && !selectedTag
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {cat === 'All' 
                      ? (localLanguage === 'en' ? 'All Articles' : 'সব নিবন্ধ') 
                      : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Tag Indicator */}
            {selectedTag && (
              <div className="flex items-center gap-2 mb-6 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl w-fit">
                <Tag size={14} className="text-rose-400" />
                <span className="text-xs font-bold text-slate-200">
                  {localLanguage === 'en' ? 'Filtering by tag: ' : 'ট্যাগ অনুযায়ী দেখছেন: '} <strong className="text-rose-400">#{selectedTag}</strong>
                </span>
                <button 
                  onClick={() => setSelectedTag(null)}
                  className="text-slate-400 hover:text-rose-400 text-xs ml-2 font-black"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Blogs List Grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => {
                  const content = localLanguage === 'en' ? post.en : post.bn;
                  return (
                    <motion.div
                      key={post.id}
                      layout
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="bg-slate-900/40 backdrop-blur-md border border-slate-800 hover:border-rose-500/30 rounded-2xl overflow-hidden flex flex-col h-full shadow-lg cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    >
                      {/* Artistic Placeholder representation of Featured Image */}
                      <div className="relative aspect-video w-full bg-gradient-to-br from-rose-950/50 via-slate-900 to-rose-900/30 p-6 flex flex-col justify-between border-b border-slate-800/60">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-black tracking-widest text-rose-400 uppercase w-fit">
                          <BookOpen size={10} />
                          {post.category}
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                            {localLanguage === 'en' ? 'FEATURED CONCEPT' : 'ফিচারড ধারণা'}
                          </p>
                          <p className="text-xs text-rose-300/80 italic font-medium line-clamp-2 leading-relaxed">
                            "{post.featuredImageIdea}"
                          </p>
                        </div>
                        
                        <div className="absolute inset-0 bg-rose-600/5 pointer-events-none"></div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {getEstimatedReadTime(post)}
                            </span>
                            <span>•</span>
                            <span>{post.category}</span>
                          </div>
                          
                          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-2 hover:text-rose-400 transition-colors">
                            {content.seoTitle}
                          </h3>
                          
                          <p className="text-slate-300/90 text-xs leading-relaxed line-clamp-3">
                            {content.introduction}
                          </p>
                        </div>

                        {/* Interactive tags & read button */}
                        <div className="space-y-3 pt-3 border-t border-slate-800/60">
                          <div className="flex flex-wrap gap-1.5">
                            {post.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(tag);
                                  setSelectedCategory('All');
                                }}
                                className="text-[10px] bg-slate-950/80 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 px-2 py-0.5 rounded transition-colors"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-rose-400 text-xs font-black">
                            <span>{localLanguage === 'en' ? 'Read Full Article' : 'সম্পূর্ণ পড়ুন'}</span>
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/20 border border-slate-800 rounded-3xl space-y-3">
                <BookOpen size={40} className="text-slate-600 mx-auto" />
                <p className="text-slate-300 font-bold">
                  {localLanguage === 'en' ? 'No articles found matching your filters.' : 'আপনার ফিল্টারের সাথে মিলে এমন কোনো নিবন্ধ পাওয়া যায়নি।'}
                </p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedTag(null);
                  }}
                  className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl font-bold transition-all"
                >
                  {localLanguage === 'en' ? 'Reset All Filters' : 'সব ফিল্টার রিসেট করুন'}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          // ==================== DETAIL VIEW ====================
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-[11px] text-slate-400 font-mono" aria-label="Breadcrumb">
              <span 
                className="hover:text-rose-400 cursor-pointer transition-colors" 
                onClick={() => setSelectedPost(null)}
              >
                {localLanguage === 'en' ? 'Blog Library' : 'ব্লগ লাইব্রেরি'}
              </span>
              <ChevronRight size={10} className="text-slate-600" />
              <span className="text-rose-400/80 font-bold">{selectedPost.category}</span>
              <ChevronRight size={10} className="text-slate-600 hidden sm:inline" />
              <span className="text-slate-500 truncate max-w-[240px] hidden sm:inline">{currentContent.seoTitle}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Content Column (Main article body) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Back to list and specific language switch for this blog */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-xs font-black group"
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    {localLanguage === 'en' ? 'Back to Blog Library' : 'ব্লগ লাইব্রেরিতে ফিরুন'}
                  </button>

                  <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 px-2 flex items-center gap-1">
                      <Globe size={10} />
                      {localLanguage === 'en' ? 'Read in:' : 'পড়ুন:'}
                    </span>
                    <button
                      onClick={() => setLocalLanguage('en')}
                      className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${
                        localLanguage === 'en' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLocalLanguage('bn')}
                      className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${
                        localLanguage === 'bn' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      বাংলা
                    </button>
                  </div>
                </div>

                {/* Main Article Header Card */}
                <article className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  
                  {/* Meta Tags / category */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-[10px] font-black tracking-widest text-rose-400 uppercase">
                        {selectedPost.category}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock size={12} />
                        {getEstimatedReadTime(selectedPost)}
                      </span>
                    </div>

                    {/* Medical Reviewed Badge */}
                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      <Shield size={12} />
                      {localLanguage === 'en' ? 'Medical Reviewed' : 'চিকিৎসাগতভাবে যাচাইকৃত'}
                    </div>
                  </div>

                  {/* H1 Title */}
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-snug">
                    {currentContent.seoTitle}
                  </h1>

                  {/* Author Information Block */}
                  <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/40">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-rose-950 flex items-center justify-center text-white border border-rose-500/20 font-black font-mono">
                      DL
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                        {localLanguage === 'en' ? 'DonateLife BD Medical Board' : 'DonateLife BD মেডিকেল বোর্ড'}
                        <CheckCircle2 size={12} className="text-rose-500" />
                      </h5>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {localLanguage === 'en' 
                          ? 'Published: July 1, 2026 • Last Updated: July 4, 2026' 
                          : 'প্রকাশিত: ১ জুলাই, ২০২৬ • শেষ আপডেট: ৪ জুলাই, ২০২৬'}
                      </p>
                    </div>
                  </div>

                  {/* Social Share Buttons & Copy Link */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 pb-3 border-b border-slate-800/40">
                    <span className="text-xs text-slate-400 font-mono mr-1">
                      {localLanguage === 'en' ? 'Share:' : 'শেয়ার:'}
                    </span>
                    
                    <button
                      onClick={shareOnFacebook}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Facebook size={14} className="text-[#1877F2]" />
                      <span className="hidden sm:inline">Facebook</span>
                    </button>

                    <button
                      onClick={shareOnTwitter}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Twitter size={14} className="text-[#1DA1F2]" />
                      <span className="hidden sm:inline">Twitter</span>
                    </button>

                    <button
                      onClick={shareOnWhatsApp}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Globe size={14} className="text-[#25D366]" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleShare(selectedPost.slug)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all flex items-center gap-1.5 text-xs font-black ml-auto"
                    >
                      {copiedSlug === selectedPost.slug ? <Check size={14} /> : <Link size={14} />}
                      <span>{copiedSlug === selectedPost.slug ? (localLanguage === 'en' ? 'Copied Link!' : 'লিংক কপিড!') : (localLanguage === 'en' ? 'Copy Link' : 'লিংক কপি করুন')}</span>
                    </button>
                  </div>

                  {/* Introduction Paragraph */}
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed border-l-4 border-rose-500 pl-4 py-1 bg-rose-500/5 rounded-r-xl">
                    {currentContent.introduction}
                  </p>

                  {/* Simulated Article Hero Visual Idea Display Box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full filter blur-xl"></div>
                    <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest">
                      <Sparkles size={14} />
                      {localLanguage === 'en' ? 'Visual Concept Asset' : 'চিত্রকল্প সম্পদ ধারণা'}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "{selectedPost.featuredImageIdea}"
                    </p>
                    <div className="text-[10px] font-mono text-slate-500">
                      {localLanguage === 'en' 
                        ? 'Note: This illustrative design idea matches the local Bangladeshi culture and community aesthetics.' 
                        : 'দ্রষ্টব্য: এই চিত্রধারণাটি আমাদের দেশীয় সংস্কৃতি ও মানুষের সাহায্য করার মনমানসিকতার ওপর ভিত্তি করে তৈরি।'}
                    </div>
                  </div>

                  {/* Dynamic full article rendering */}
                  <div className="space-y-6 text-slate-300 text-sm md:text-base leading-relaxed">
                    {currentContent.fullArticle.map((section, index) => {
                      switch (section.type) {
                        case 'h2':
                          return (
                            <h2 key={index} id={section.heading?.replace(/\s+/g, '-').toLowerCase()} className="text-xl md:text-2xl font-black text-white tracking-tight pt-4 border-b border-slate-800/50 pb-2 flex items-center gap-2">
                              <span className="w-1.5 h-6 bg-rose-500 rounded-full"></span>
                              {section.heading}
                            </h2>
                          );
                        case 'h3':
                          return (
                            <h3 key={index} className="text-lg font-bold text-rose-400 tracking-tight pt-2">
                              {section.heading}
                            </h3>
                          );
                        case 'paragraph':
                          return (
                            <p key={index} className="leading-relaxed">
                              {section.text}
                            </p>
                          );
                        case 'bullet':
                          return (
                            <ul key={index} className="space-y-2.5 pl-4">
                              {section.items?.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-300">
                                  <span className="text-rose-500 font-bold mt-1 text-xs">♥</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        case 'callout':
                          return (
                            <div key={index} className="bg-rose-950/10 border-l-4 border-rose-500 p-4 rounded-r-xl flex items-start gap-3 my-4">
                              <Shield className="text-rose-400 shrink-0 mt-0.5" size={18} />
                              <p className="text-xs md:text-sm text-rose-200 leading-relaxed font-semibold">
                                {section.text}
                              </p>
                            </div>
                          );
                        case 'table':
                          return (
                            <div key={index} className="overflow-x-auto border border-slate-800 rounded-xl my-4 shadow-md scrollbar-thin">
                              <table className="w-full text-left text-xs md:text-sm border-collapse">
                                <thead>
                                  <tr className="bg-slate-950 text-rose-400 font-mono border-b border-slate-800">
                                    {section.tableHeaders?.map((h, i) => (
                                      <th key={i} className="p-3.5 font-black whitespace-nowrap">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {section.tableRows?.map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-slate-800/50 hover:bg-slate-900/40 transition-colors">
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="p-3.5 text-slate-300">{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        default:
                          return <p key={index}>{section.text}</p>;
                      }
                    })}
                  </div>

                  {/* FAQ ACCORDION SECTION */}
                  {currentContent.faqs && currentContent.faqs.length > 0 && (
                    <div className="pt-6 border-t border-slate-800/80 space-y-4">
                      <h3 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
                        <HelpCircle size={18} className="text-rose-400" />
                        {localLanguage === 'en' ? 'Frequently Asked Questions (FAQ)' : 'সাধারণ প্রশ্ন ও উত্তর (FAQ)'}
                      </h3>
                      
                      <div className="space-y-3">
                        {currentContent.faqs.map((faq, i) => (
                          <div key={i} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                            <button
                              onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
                              className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors"
                            >
                              <span className="text-xs md:text-sm font-bold text-slate-200">{faq.question}</span>
                              <ChevronRight size={16} className={`text-slate-400 transition-transform ${activeFAQ === i ? 'rotate-90' : ''}`} />
                            </button>
                            
                            <AnimatePresence>
                              {activeFAQ === i && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="border-t border-slate-800 p-4 bg-slate-950/20 text-xs md:text-sm text-slate-300 leading-relaxed"
                                >
                                  {faq.answer}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conclusion Paragraph */}
                  <div className="pt-6 border-t border-slate-800/80 space-y-2">
                    <h4 className="text-sm font-black tracking-widest text-rose-400 uppercase">
                      {localLanguage === 'en' ? 'Conclusion' : 'উপসংহার'}
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {currentContent.conclusion}
                    </p>
                  </div>

                  {/* Previous & Next Article Navigation */}
                  {(() => {
                    const currentIndex = allBlogPosts.findIndex(p => p.id === selectedPost.id);
                    const prevPost = currentIndex > 0 ? allBlogPosts[currentIndex - 1] : null;
                    const nextPost = currentIndex < allBlogPosts.length - 1 ? allBlogPosts[currentIndex + 1] : null;
                    
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-800/80">
                        {prevPost ? (
                          <div
                            onClick={() => setSelectedPost(prevPost)}
                            className="p-4 rounded-2xl bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1 text-left flex flex-col justify-between group"
                          >
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1">
                              <ChevronLeft size={10} className="group-hover:-translate-x-1 transition-transform text-rose-400" />
                              {localLanguage === 'en' ? 'Previous Article' : 'পূর্ববর্তী নিবন্ধ'}
                            </span>
                            <span className="text-xs font-bold text-slate-300 group-hover:text-rose-400 transition-colors line-clamp-2">
                              {localLanguage === 'en' ? prevPost.en.seoTitle : prevPost.bn.seoTitle}
                            </span>
                          </div>
                        ) : <div className="hidden sm:block"></div>}

                        {nextPost ? (
                          <div
                            onClick={() => setSelectedPost(nextPost)}
                            className="p-4 rounded-2xl bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1 text-right flex flex-col justify-between group"
                          >
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center justify-end gap-1">
                              {localLanguage === 'en' ? 'Next Article' : 'পরবর্তী নিবন্ধ'}
                              <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform text-rose-400" />
                            </span>
                            <span className="text-xs font-bold text-slate-300 group-hover:text-rose-400 transition-colors line-clamp-2">
                              {localLanguage === 'en' ? nextPost.en.seoTitle : nextPost.bn.seoTitle}
                            </span>
                          </div>
                        ) : <div className="hidden sm:block"></div>}
                      </div>
                    );
                  })()}

                  {/* Call To Action Box (Encouraging registration on DonateLife BD) */}
                  <div className="bg-gradient-to-br from-rose-950/50 to-red-950/30 border border-rose-500/20 p-6 rounded-2xl space-y-4 relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full filter blur-2xl text-rose-500"></div>
                    
                    <div className="space-y-2">
                      <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                        <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={18} />
                        {localLanguage === 'en' ? 'Register on DonateLife BD' : 'DonateLife BD-তে যুক্ত হোন'}
                      </h4>
                      <p className="text-xs md:text-sm text-rose-200/90 leading-relaxed">
                        {currentContent.cta}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => onNavigate('auth')}
                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} />
                        {localLanguage === 'en' ? 'Register Now' : 'এখনই নিবন্ধন করুন'}
                      </button>
                      <button
                        onClick={() => onNavigate('requests')}
                        className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-black transition-all"
                      >
                        {localLanguage === 'en' ? 'Emergency Request' : 'জরুরী রক্তের আবেদন'}
                      </button>
                    </div>
                  </div>

                </article>
              </div>

              {/* Right Sidebar Column (TOC, metadata, recent articles) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Dynamic Table of Contents */}
                {currentContent.tableOfContents && currentContent.tableOfContents.length > 0 && (
                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl space-y-4 sticky top-4">
                    <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-black uppercase tracking-widest">
                      <Menu size={14} />
                      {localLanguage === 'en' ? 'Table of Contents' : 'সূচীপত্র'}
                    </div>
                    
                    <ul className="space-y-2.5 text-xs">
                      {currentContent.tableOfContents.map((toc, idx) => {
                        const isActive = activeSection === toc.anchor;
                        return (
                          <li key={idx}>
                            <a
                              href={`#${toc.anchor}`}
                              onClick={(e) => {
                                e.preventDefault();
                                const el = document.getElementById(toc.anchor);
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  setActiveSection(toc.anchor);
                                }
                              }}
                              className={`transition-all duration-200 font-semibold flex items-center gap-1.5 py-1 px-2 rounded-lg ${
                                isActive 
                                  ? 'text-rose-400 bg-rose-500/10 border-l-2 border-rose-500 pl-2' 
                                  : 'text-slate-400 hover:text-rose-400 pl-3'
                              }`}
                            >
                              <span>{toc.label}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Search & Social Snippet Simulator (UX Showcase) */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-black uppercase tracking-widest">
                    <Globe size={14} />
                    {localLanguage === 'en' ? 'Google & Social Preview' : 'সার্চ ও সোশ্যাল প্রিভিউ'}
                  </div>
                  
                  <div className="space-y-4 text-xs">
                    {/* Google Search Snippet */}
                    <div className="space-y-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800/40">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Google SERP Snippet</span>
                      <span className="text-xs text-blue-400 hover:underline cursor-pointer block font-semibold truncate">
                        {currentContent.seoTitle} | DonateLife BD
                      </span>
                      <span className="text-[10px] text-emerald-500 block truncate font-mono">
                        {window.location.origin}/blog/{selectedPost.slug}
                      </span>
                      <p className="text-[10px] text-slate-400 line-clamp-2">
                        {currentContent.metaDescription}
                      </p>
                    </div>

                    {/* Facebook Open Graph Shared Card */}
                    <div className="space-y-1 bg-slate-950/50 rounded-xl border border-slate-800/40 overflow-hidden">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block px-3 pt-2">Facebook Open Graph Preview</span>
                      <div className="aspect-video w-full bg-gradient-to-br from-rose-950/30 to-slate-900 p-4 flex flex-col justify-between border-y border-slate-800/40">
                        <span className="text-[9px] bg-slate-950/80 text-rose-400 px-1.5 py-0.5 rounded font-black w-fit uppercase">DonateLife BD</span>
                        <span className="text-[10px] text-white font-bold line-clamp-2 leading-tight">
                          {currentContent.seoTitle}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-950 space-y-0.5">
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest block">DONATELIFEBD.ORG</span>
                        <span className="text-[10px] font-bold text-slate-200 block truncate">{currentContent.seoTitle}</span>
                        <span className="text-[9px] text-slate-400 block line-clamp-1">{currentContent.metaDescription}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO and Metadata Insight Panel */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-black uppercase tracking-widest">
                    <Award size={14} />
                    {localLanguage === 'en' ? 'SEO Transparency' : 'সার্চ ইঞ্জিন মেটা তথ্য'}
                  </div>

                  <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                    <div>
                      <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-widest">Slug / URL</span>
                      <span className="block font-semibold break-all text-slate-200">/blog/{selectedPost.slug}</span>
                    </div>
                    
                    <div>
                      <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-widest">Meta Title</span>
                      <span className="block font-semibold text-slate-200">{currentContent.metaTitle}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-widest">Meta Description</span>
                      <span className="block text-slate-400">{currentContent.metaDescription}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                      <button
                        onClick={() => handleShare(selectedPost.slug)}
                        className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                      >
                        <Share2 size={12} />
                        {copiedSlug === selectedPost.slug 
                          ? (localLanguage === 'en' ? 'Copied Link!' : 'লিংক কপিড!') 
                          : (localLanguage === 'en' ? 'Share Article' : 'শেয়ার করুন')}
                      </button>

                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">
                        SEO Perfect
                      </span>
                    </div>
                  </div>
                </div>

                {/* Related/Other articles block */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="text-slate-300 font-black text-xs uppercase tracking-widest">
                    {localLanguage === 'en' ? 'More Health Articles' : 'আরও অন্যান্য নিবন্ধ'}
                  </div>

                  <div className="space-y-3">
                    {allBlogPosts
                      .filter(post => post.id !== selectedPost.id)
                      .slice(0, 4)
                      .map(post => {
                        const content = localLanguage === 'en' ? post.en : post.bn;
                        return (
                          <div
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            className="p-3 bg-slate-950/40 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-all space-y-1.5"
                          >
                            <span className="text-[9px] font-black text-rose-400 tracking-widest uppercase block">
                              {post.category}
                            </span>
                            <span className="text-xs font-bold text-white block line-clamp-2 hover:text-rose-400 transition-colors">
                              {content.seoTitle}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
