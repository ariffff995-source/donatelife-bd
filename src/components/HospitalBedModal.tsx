'use client';

import React, { useState } from 'react';
import { X, Building2, ShieldCheck, Activity, Bed, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Hospital } from '../types';

interface HospitalBedModalProps {
  hospital: Hospital;
  isOpen: boolean;
  onClose: () => void;
  onUpdateBeds?: (hospitalId: string, updatedBeds: any) => void;
  isAdmin?: boolean;
}

export const HospitalBedModal: React.FC<HospitalBedModalProps> = ({
  hospital,
  isOpen,
  onClose,
  onUpdateBeds,
  isAdmin = false
}) => {
  const { language } = useLanguage();

  const [icuTotal, setIcuTotal] = useState(hospital.icuBedsTotal ?? 10);
  const [icuAvailable, setIcuAvailable] = useState(hospital.icuBedsAvailable ?? 3);
  const [generalTotal, setGeneralTotal] = useState(hospital.generalBedsTotal ?? 100);
  const [generalAvailable, setGeneralAvailable] = useState(hospital.generalBedsAvailable ?? 25);
  const [emergencyTotal, setEmergencyTotal] = useState(hospital.emergencyBedsTotal ?? 20);
  const [emergencyAvailable, setEmergencyAvailable] = useState(hospital.emergencyBedsAvailable ?? 5);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        hospitalId: hospital.id,
        icuBedsTotal: Number(icuTotal),
        icuBedsAvailable: Number(icuAvailable),
        generalBedsTotal: Number(generalTotal),
        generalBedsAvailable: Number(generalAvailable),
        emergencyBedsTotal: Number(emergencyTotal),
        emergencyBedsAvailable: Number(emergencyAvailable)
      };

      const res = await fetch('/api/hospitals/beds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res && res.success) {
        if (onUpdateBeds) onUpdateBeds(hospital.id, payload);
        onClose();
      } else {
        alert('Failed to update bed availability.');
      }
    } catch (err) {
      console.error('Error updating bed counts:', err);
    } finally {
      setSaving(false);
    }
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
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <span>{hospital.name}</span>
              {hospital.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'bn' ? 'লাইভ আইসিইউ ও বেড প্রাপ্যতা পরিচালনা' : 'Live ICU & Bed Availability Management'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* ICU Beds Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <h4 className="font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Bed className="w-3.5 h-3.5" />
              ICU Beds (আইসিইউ বেড)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Available (ফাঁকা)</label>
                <input
                  type="number"
                  min="0"
                  value={icuAvailable}
                  onChange={(e) => setIcuAvailable(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Total (মোট)</label>
                <input
                  type="number"
                  min="0"
                  value={icuTotal}
                  onChange={(e) => setIcuTotal(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* General Beds Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <h4 className="font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Bed className="w-3.5 h-3.5" />
              General Beds (সাধারণ বেড)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Available (ফাঁকা)</label>
                <input
                  type="number"
                  min="0"
                  value={generalAvailable}
                  onChange={(e) => setGeneralAvailable(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Total (মোট)</label>
                <input
                  type="number"
                  min="0"
                  value={generalTotal}
                  onChange={(e) => setGeneralTotal(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Emergency Beds Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Bed className="w-3.5 h-3.5" />
              Emergency Beds (জরুরি বেড)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Available (ফাঁকা)</label>
                <input
                  type="number"
                  min="0"
                  value={emergencyAvailable}
                  onChange={(e) => setEmergencyAvailable(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Total (মোট)</label>
                <input
                  type="number"
                  min="0"
                  value={emergencyTotal}
                  onChange={(e) => setEmergencyTotal(Number(e.target.value))}
                  disabled={!isAdmin}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {isAdmin && (
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? <span className="animate-spin font-mono">...</span> : <Check className="w-4 h-4" />}
              <span>{language === 'bn' ? 'তথ্য সেভ করুন' : 'Save Bed Updates'}</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
