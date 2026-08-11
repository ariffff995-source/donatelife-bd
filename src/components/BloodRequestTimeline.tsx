'use client';

import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, UserCheck, HeartHandshake, CheckCheck, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BloodRequest, RequestTimelineEvent } from '../types';

interface BloodRequestTimelineProps {
  request: BloodRequest;
  onUpdateStatus?: (status: string) => void;
  isAdminOrOwner?: boolean;
}

export const TIMELINE_STAGES = [
  { key: 'created', label: 'Request Created', labelBn: 'আবেদন তৈরি', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-800' },
  { key: 'approved', label: 'Approved', labelBn: 'অনুমোদিত', icon: ShieldCheck, color: 'text-sky-400', bg: 'bg-sky-500/20' },
  { key: 'matched', label: 'Donor Matched', labelBn: 'রক্তদাতা ম্যাচ করা হয়েছে', icon: UserCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  { key: 'accepted', label: 'Donor Accepted', labelBn: 'রক্তদাতা সম্মতি দিয়েছেন', icon: HeartHandshake, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { key: 'donated', label: 'Blood Donated', labelBn: 'রক্তদান সম্পন্ন', icon: CheckCircle2, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  { key: 'completed', label: 'Completed', labelBn: 'সম্পূর্ণ সফল', icon: CheckCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
];

export const BloodRequestTimeline: React.FC<BloodRequestTimelineProps> = ({
  request,
  onUpdateStatus,
  isAdminOrOwner = false
}) => {
  const { language } = useLanguage();

  const isCancelled = request.status === 'cancelled' || request.status === 'rejected';

  // Map request status to stage index
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'pending_approval': return 0;
      case 'pending':
      case 'approved': return 1;
      case 'matched': return 2;
      case 'accepted': return 3;
      case 'donated': return 4;
      case 'fulfilled':
      case 'completed': return 5;
      case 'cancelled':
      case 'rejected': return -1;
      default: return 1;
    }
  };

  const currentIndex = getStageIndex(request.status);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>🩸 {language === 'bn' ? 'রক্তদানের টাইমলাইন' : 'Blood Request Timeline'}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn' ? 'জরুরি আবেদনের রিয়েল-টাইম লাইফসাইকেল' : 'Real-time emergency request lifecycle'}
          </p>
        </div>

        {isCancelled ? (
          <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-400 text-xs font-bold flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            {request.status === 'rejected' ? (language === 'bn' ? 'বাতিলকৃত' : 'Rejected') : (language === 'bn' ? 'আবেদন বাতিল' : 'Cancelled')}
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 animate-pulse" />
            {language === 'bn' ? 'সক্রিয় ট্র্যাকিং' : 'Live Tracking'}
          </span>
        )}
      </div>

      {/* Vertical Steps Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {TIMELINE_STAGES.map((stage, idx) => {
          const isDone = !isCancelled && idx <= currentIndex;
          const isCurrent = !isCancelled && idx === currentIndex;
          const Icon = stage.icon;

          // Look for explicit timestamp in timeline array if present
          const timelineEvt = request.timeline?.find((e: RequestTimelineEvent) => e.status === stage.key);
          const timestampDisplay = timelineEvt?.timestamp
            ? new Date(timelineEvt.timestamp).toLocaleString()
            : idx === 0
            ? new Date(request.createdAt).toLocaleString()
            : null;

          return (
            <div key={stage.key} className="relative flex items-start gap-3">
              <div
                className={`absolute -left-6 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                } ${isCurrent ? 'ring-4 ring-rose-500/20 animate-pulse' : ''}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
                <div className="flex items-center justify-between">
                  <h5 className={`text-xs font-bold ${isDone ? 'text-slate-100' : 'text-slate-400'}`}>
                    {language === 'bn' ? stage.labelBn : stage.label}
                  </h5>
                  {timestampDisplay && (
                    <span className="text-[10px] font-mono text-slate-500">{timestampDisplay}</span>
                  )}
                </div>

                {isCurrent && (
                  <p className="text-[11px] text-rose-400 font-medium mt-1">
                    ⚡ {language === 'bn' ? 'বর্তমান ধাপ পর্যালোচনা চলছে' : 'Current active stage in progress'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin / Owner Status Update Actions */}
      {isAdminOrOwner && onUpdateStatus && !isCancelled && (
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-auto">
            {language === 'bn' ? 'স্ট্যাটাস আপডেট:' : 'Update Stage:'}
          </span>
          {currentIndex < 1 && (
            <button
              onClick={() => onUpdateStatus('approved')}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
            >
              {language === 'bn' ? 'অনুমোদন করুন' : 'Approve'}
            </button>
          )}
          {currentIndex < 2 && (
            <button
              onClick={() => onUpdateStatus('matched')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
            >
              {language === 'bn' ? 'ডোনার ম্যাচ করুন' : 'Match Donor'}
            </button>
          )}
          {currentIndex < 3 && (
            <button
              onClick={() => onUpdateStatus('accepted')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
            >
              {language === 'bn' ? 'ডোনার সম্মতি' : 'Donor Accepted'}
            </button>
          )}
          {currentIndex < 4 && (
            <button
              onClick={() => onUpdateStatus('donated')}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
            >
              {language === 'bn' ? 'রক্তদান সম্পন্ন' : 'Blood Donated'}
            </button>
          )}
          {currentIndex < 5 && (
            <button
              onClick={() => onUpdateStatus('fulfilled')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
            >
              {language === 'bn' ? 'সম্পূর্ণ করুন' : 'Mark Completed'}
            </button>
          )}
          <button
            onClick={() => onUpdateStatus('cancelled')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold transition"
          >
            {language === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
        </div>
      )}
    </div>
  );
};
