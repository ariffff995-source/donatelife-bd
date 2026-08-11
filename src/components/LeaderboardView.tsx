'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Flame, Star, ShieldCheck, Heart, Sparkles, UserCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User } from '../types';
import { getReputationBadge, calculateReputationScore } from '../utils/gamification';

interface LeaderboardViewProps {
  onSelectDonor?: (donor: User) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onSelectDonor }) => {
  const { language } = useLanguage();
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  const [sortBy, setSortBy] = useState<'donations' | 'reputation' | 'xp' | 'streak'>('donations');
  const [donors, setDonors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?timeframe=${timeframe}&sortBy=${sortBy}`).then(r => r.json());
        if (res && res.donors) {
          setDonors(res.donors);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [timeframe, sortBy]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
              <span>🏆 {language === 'bn' ? 'টপ ডোনার লিডারবোর্ড' : 'Top Donor Leaderboard'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-wider">
                Honor Roll
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'বাংলাদেশের সেরা রক্তদাতাদের কৃতিত্ব এবং র‍্যাঙ্কিং'
                : 'Recognizing top voluntary blood donors across Bangladesh'}
            </p>
          </div>
        </div>

        {/* Timeframe Tabs & Sort Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-xl transition ${
                timeframe === 'monthly'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'মাসিক লিডারবোর্ড' : 'Monthly'}
            </button>
            <button
              onClick={() => setTimeframe('yearly')}
              className={`px-3 py-1.5 rounded-xl transition ${
                timeframe === 'yearly'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'বার্ষিক লিডারবোর্ড' : 'Yearly'}
            </button>
          </div>

          {/* Sort By Filter */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold px-3 py-2 rounded-2xl focus:outline-none"
          >
            <option value="donations">{language === 'bn' ? 'রক্তদান সংখ্যা' : 'Donations'}</option>
            <option value="reputation">{language === 'bn' ? 'রেপুটেশন স্কোর' : 'Reputation Score'}</option>
            <option value="xp">{language === 'bn' ? 'এক্সপি (XP)' : 'XP Points'}</option>
            <option value="streak">{language === 'bn' ? 'ডোনেশন স্ট্রিক' : 'Donation Streak'}</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium Displays */}
      {!loading && donors.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Rank 2 (Silver) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 text-center relative flex flex-col items-center justify-center space-y-2 order-2 md:order-1">
            <div className="w-8 h-8 rounded-full bg-slate-400 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-md">
              #2
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-400 flex items-center justify-center font-black text-rose-400 text-lg">
              {donors[1].bloodGroup}
            </div>
            <h4 className="text-sm font-bold text-slate-100">{donors[1].name}</h4>
            <p className="text-xs text-slate-400">{donors[1].district}</p>
            <div className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-200 text-xs font-mono font-bold">
              {donors[1].totalDonationsCount || 0} Donations
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="bg-gradient-to-b from-amber-500/10 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 text-center relative flex flex-col items-center justify-center space-y-2 order-1 md:order-2 transform md:-translate-y-3 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base shadow-xl">
              👑 #1
            </div>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center font-black text-amber-300 text-xl shadow-lg">
              {donors[0].bloodGroup}
            </div>
            <h4 className="text-base font-black text-white">{donors[0].name}</h4>
            <p className="text-xs text-amber-200/80">{donors[0].district}</p>
            <div className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs shadow-md">
              🏆 {donors[0].totalDonationsCount || 0} Donations
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 text-center relative flex flex-col items-center justify-center space-y-2 order-3">
            <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
              #3
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-amber-700 flex items-center justify-center font-black text-rose-400 text-lg">
              {donors[2].bloodGroup}
            </div>
            <h4 className="text-sm font-bold text-slate-100">{donors[2].name}</h4>
            <p className="text-xs text-slate-400">{donors[2].district}</p>
            <div className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-200 text-xs font-mono font-bold">
              {donors[2].totalDonationsCount || 0} Donations
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard List Table */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-12 text-center space-y-2 text-rose-400 text-xs font-medium">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <span>{language === 'bn' ? 'লিডারবোর্ড লোড হচ্ছে...' : 'Loading leaderboard ranks...'}</span>
          </div>
        ) : (
          donors.map((donor, idx) => {
            const rep = getReputationBadge(calculateReputationScore(donor));
            return (
              <div
                key={donor.id || idx}
                onClick={() => onSelectDonor && onSelectDonor(donor)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 hover:bg-rose-500/10 border border-slate-800/80 hover:border-rose-500/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-extrabold text-slate-400 flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 font-black text-sm flex items-center justify-center">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-rose-400 transition">{donor.name}</h4>
                      {donor.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${rep.bgColor} ${rep.color} ${rep.borderColor} border`}>
                        {rep.badgeEmoji} {rep.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{donor.upazila}, {donor.district}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs font-extrabold text-slate-200 block">
                      {donor.totalDonationsCount || 0} {language === 'bn' ? 'বার দান' : 'Donations'}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono block">
                      Score: {calculateReputationScore(donor)} pts
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
