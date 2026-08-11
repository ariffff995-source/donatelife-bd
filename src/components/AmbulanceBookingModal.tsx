'use client';

import React, { useState } from 'react';
import { X, Truck, Phone, Clock, MapPin, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Ambulance } from '../types';

interface AmbulanceBookingModalProps {
  ambulance: Ambulance;
  isOpen: boolean;
  onClose: () => void;
}

export const AmbulanceBookingModal: React.FC<AmbulanceBookingModalProps> = ({
  ambulance,
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const [patientName, setPatientName] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationHospital, setDestinationHospital] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [vehicleType, setVehicleType] = useState(ambulance.availableTypes[0] || 'AC Ambulance');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress || !contactPhone) {
      alert(language === 'bn' ? 'অনুগ্রহ করে পিকআপ ঠিকানা এবং মোবাইল নম্বর দিন।' : 'Please provide pickup address and contact phone.');
      return;
    }

    setSubmitted(true);
    // Instant WhatsApp / Call trigger
    const msg = encodeURIComponent(
      `🚨 EMERGENCY AMBULANCE BOOKING 🚑\n\nPatient: ${patientName || 'Emergency Patient'}\nPickup Location: ${pickupAddress}\nDestination: ${destinationHospital || 'Not Specified'}\nContact: ${contactPhone}\nVehicle Requested: ${vehicleType}`
    );

    const targetPhone = ambulance.whatsapp || ambulance.contactPhone;
    setTimeout(() => {
      window.open(`https://api.whatsapp.com/send?phone=${targetPhone.replace(/[^0-9]/g, '')}&text=${msg}`, '_blank');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <span>{language === 'bn' ? 'জরুরি অ্যাম্বুলেন্স বুকিং' : 'Emergency Ambulance Dispatch'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold">
                {ambulance.liveStatus || 'Available'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">{ambulance.name} — {ambulance.district}</p>
          </div>
        </div>

        {/* ETA & Driver info card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-4 h-4 text-emerald-400" />
              {language === 'bn' ? 'আনুমানিক সময় (ETA):' : 'Estimated Arrival (ETA):'}
            </span>
            <span className="font-bold font-mono text-emerald-400">
              ~{ambulance.averageResponseTime || '15 mins'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300 pt-1.5 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5 text-slate-400">
              <User className="w-4 h-4 text-rose-400" />
              {language === 'bn' ? 'ড্রাইভার বিবরণ:' : 'Driver:'}
            </span>
            <span className="font-bold text-slate-200">
              {ambulance.driverName || 'Verified Driver'} ({ambulance.contactPhone})
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="text-sm font-bold text-slate-100">
              {language === 'bn' ? 'জরুরি রিকোয়েস্ট পাঠানো হয়েছে!' : 'Emergency Dispatch Requested!'}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {language === 'bn'
                ? 'ড্রাইভারের সাথে হোয়াটসঅ্যাপ সিঙ্ক খোলা হচ্ছে। সরাসরি ফোন করতে নিচে চাপুন।'
                : 'WhatsApp dispatch initialized. You can also call driver directly below.'}
            </p>
            <div className="pt-2">
              <a
                href={`tel:${ambulance.contactPhone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
              >
                <Phone className="w-4 h-4" />
                <span>{language === 'bn' ? 'সরাসরি ফোন দিন' : 'Call Driver Now'} ({ambulance.contactPhone})</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {language === 'bn' ? 'রোগীর নাম (ঐচ্ছিক)' : 'Patient Name (Optional)'}
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'রোগীর নাম' : 'Patient Name'}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {language === 'bn' ? 'পিকআপ ঠিকানা *' : 'Pickup Location Address *'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'bn' ? 'রোড/বাড়ি/থানা/জেলা' : 'Full Pickup Address'}
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {language === 'bn' ? 'গন্তব্য হাসপাতাল' : 'Destination Hospital'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'হাসপাতালের নাম' : 'Hospital Name'}
                  value={destinationHospital}
                  onChange={(e) => setDestinationHospital(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  {language === 'bn' ? 'গাড়ির ধরণ' : 'Vehicle Type'}
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  {ambulance.availableTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                {language === 'bn' ? 'যোগাযোগের ফোন নম্বর *' : 'Contact Phone Number *'}
              </label>
              <input
                type="tel"
                required
                placeholder="01700000000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-rose-950/40 transition cursor-pointer mt-2"
            >
              {language === 'bn' ? 'জরুরি বুকিং নিশ্চিত করুন' : 'Confirm Emergency Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
