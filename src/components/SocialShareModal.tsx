'use client';

import React, { useState } from 'react';
import { X, Share2, Copy, Check, Facebook, MessageCircle, Send, Twitter } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BloodRequest } from '../types';

interface SocialShareModalProps {
  request: BloodRequest;
  isOpen: boolean;
  onClose: () => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  request,
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/requests?id=${request.id}`
    : `https://donatelifebd.com/requests?id=${request.id}`;

  const shareText = language === 'bn'
    ? `🚨 জরুরি রক্তের প্রয়োজন! 🩸 ব্লাড গ্রুপ: ${request.bloodGroup} | স্থান: ${request.hospitalName}, ${request.district} | ফোন: ${request.contactPhone}। জীবন বাঁচাতে শেয়ার করুন!`
    : `🚨 Urgent Blood Required! 🩸 Group: ${request.bloodGroup} | Hospital: ${request.hospitalName}, ${request.district} | Contact: ${request.contactPhone}. Please share to save a life!`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = [
    {
      name: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
    },
    {
      name: 'WhatsApp',
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      icon: MessageCircle,
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`
    },
    {
      name: 'Telegram',
      color: 'bg-sky-500 hover:bg-sky-400 text-white',
      icon: Send,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    },
    {
      name: 'X (Twitter)',
      color: 'bg-slate-800 hover:bg-slate-700 text-white',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100">
              {language === 'bn' ? 'সোশ্যাল মিডিয়ায় শেয়ার করুন' : 'Share Emergency Blood Request'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'bn' ? '১টি শেয়ারের মাধ্যমে জীবন বাঁচানো সম্ভব হতে পারে' : 'Help connect with voluntary blood donors faster'}
            </p>
          </div>
        </div>

        {/* OpenGraph Preview Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
              OpenGraph Preview
            </span>
            <span className="text-xs font-mono font-bold text-rose-500">{request.bloodGroup} Needed</span>
          </div>
          <h4 className="text-xs font-bold text-slate-200">{request.patientName} — {request.hospitalName}</h4>
          <p className="text-[11px] text-slate-400 line-clamp-2">{request.reason}</p>
        </div>

        {/* Social Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {shareLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition-all ${link.color}`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </a>
            );
          })}
        </div>

        {/* Copy Link Input */}
        <div className="pt-2 border-t border-slate-800">
          <label className="text-[11px] font-bold text-slate-400 mb-1.5 block">
            {language === 'bn' ? 'সরাসরি লিঙ্ক কপি করুন' : 'Direct Request Link'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
