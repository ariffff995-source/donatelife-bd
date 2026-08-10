'use client';

import React, { useEffect } from 'react';
import { MapPin, Building2, Navigation, Shield, Droplet } from 'lucide-react';
import { BANGLADESH_LOCATIONS, DIVISIONS, BLOOD_GROUPS } from '../data/bangladesh-locations';
import { useLanguage } from '../contexts/LanguageContext';
import SearchableSelect from './SearchableSelect';
import { getEnglishLocationValue, formatLocationSaveValue } from '../utils/locationHelper';

interface LocationSelectorProps {
  division: string;
  district: string;
  upazila: string;
  policeStation?: string;
  fullAddress?: string;
  bloodGroup?: string;
  onChange: (field: 'division' | 'district' | 'upazila' | 'policeStation' | 'fullAddress' | 'bloodGroup', value: string) => void;
  required?: boolean;
  disabled?: boolean;
  gridClassName?: string;
  showFullAddress?: boolean;
  showBloodGroup?: boolean;
  layoutMode?: 'default' | 'compact-2col';
}

export default function LocationSelector({
  division,
  district,
  upazila,
  policeStation,
  fullAddress,
  bloodGroup,
  onChange,
  required = false,
  disabled = false,
  gridClassName,
  showFullAddress = true,
  showBloodGroup = false,
  layoutMode = 'default'
}: LocationSelectorProps) {
  const { language, t, translateLocation } = useLanguage();

  const cleanDivision = getEnglishLocationValue(division);
  const cleanDistrict = getEnglishLocationValue(district);
  const cleanUpz = getEnglishLocationValue(upazila);

  // Robust case-insensitive key search in BANGLADESH_LOCATIONS
  const divKeys = Object.keys(BANGLADESH_LOCATIONS);
  const matchedDivKey = divKeys.find(k => k.toLowerCase() === cleanDivision.toLowerCase());
  const selectedDivisionData = matchedDivKey ? BANGLADESH_LOCATIONS[matchedDivKey] : null;

  const availableDistricts = selectedDivisionData ? Object.keys(selectedDivisionData.districts) : [];
  const matchedDistKey = availableDistricts.find(k => k.toLowerCase() === cleanDistrict.toLowerCase());
  
  const availableUpazilas = selectedDivisionData && matchedDistKey 
    ? Object.keys(selectedDivisionData.districts[matchedDistKey] || {}) 
    : [];
  const matchedUpzKey = availableUpazilas.find(k => k.toLowerCase() === cleanUpz.toLowerCase());
    
  const availablePoliceStations = selectedDivisionData && matchedDistKey && matchedUpzKey
    ? selectedDivisionData.districts[matchedDistKey][matchedUpzKey] || []
    : [];

  // Reset downstream selections if parent selections are invalid or cleared
  useEffect(() => {
    if (!cleanDivision) {
      if (district) onChange('district', '');
      if (upazila) onChange('upazila', '');
      if (policeStation) onChange('policeStation', '');
    } else if (cleanDistrict && availableDistricts.length > 0) {
      const isDistValid = availableDistricts.some(d => d.toLowerCase() === cleanDistrict.toLowerCase());
      if (!isDistValid) {
        onChange('district', '');
        onChange('upazila', '');
        if (policeStation !== undefined) {
          onChange('policeStation', '');
        }
      } else if (cleanUpz && availableUpazilas.length > 0) {
        const isUpzValid = availableUpazilas.some(u => u.toLowerCase() === cleanUpz.toLowerCase());
        if (!isUpzValid) {
          onChange('upazila', '');
          if (policeStation !== undefined) {
            onChange('policeStation', '');
          }
        } else if (policeStation && availablePoliceStations.length > 0) {
          const cleanPS = getEnglishLocationValue(policeStation);
          const isPsValid = availablePoliceStations.some(p => p.toLowerCase() === cleanPS.toLowerCase());
          if (!isPsValid) {
            onChange('policeStation', '');
          }
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division, district, upazila, policeStation, cleanDivision, cleanDistrict, cleanUpz]);

  // Synchronous change handlers for user actions to guarantee immediate resets
  const handleDivisionChange = (val: string) => {
    onChange('division', val);
    onChange('district', '');
    onChange('upazila', '');
    if (policeStation !== undefined) {
      onChange('policeStation', '');
    }
  };

  const handleDistrictChange = (val: string) => {
    onChange('district', val);
    onChange('upazila', '');
    if (policeStation !== undefined) {
      onChange('policeStation', '');
    }
  };

  const handleUpazilaChange = (val: string) => {
    onChange('upazila', val);
    if (policeStation !== undefined) {
      onChange('policeStation', '');
    }
  };

  const handlePoliceStationChange = (val: string) => {
    onChange('policeStation', val);
  };

  // Option generators
  const divisionOptions = DIVISIONS.map(div => ({
    value: formatLocationSaveValue(div, translateLocation),
    label: translateLocation(div)
  }));

  const districtOptions = availableDistricts.map(dist => ({
    value: formatLocationSaveValue(dist, translateLocation),
    label: translateLocation(dist)
  }));

  const upazilaOptions = availableUpazilas.map(up => ({
    value: formatLocationSaveValue(up, translateLocation),
    label: translateLocation(up)
  }));

  const policeStationOptions = availablePoliceStations.map(ps => ({
    value: formatLocationSaveValue(ps, translateLocation),
    label: translateLocation(ps)
  }));

  const bloodGroupOptions = BLOOD_GROUPS.map(bg => ({
    value: bg,
    label: bg
  }));

  // Resolve matching state values from lists to support legacy unformatted inputs
  const getMatchedValue = (propVal: string | undefined, options: { value: string }[]) => {
    if (!propVal) return '';
    const cleanProp = getEnglishLocationValue(propVal).toLowerCase();
    const found = options.find(opt => getEnglishLocationValue(opt.value).toLowerCase() === cleanProp);
    return found ? found.value : propVal;
  };

  const selectedDivisionValue = getMatchedValue(division, divisionOptions);
  const selectedDistrictValue = getMatchedValue(district, districtOptions);
  const selectedUpazilaValue = getMatchedValue(upazila, upazilaOptions);
  const selectedPoliceStationValue = getMatchedValue(policeStation, policeStationOptions);

  if (layoutMode === 'compact-2col') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
        {/* 1. Division */}
        <div className="col-span-1 w-full min-w-0 flex flex-col text-left" id="loc-sel-division-container">
          <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
            {t('location.division')} {required && <span className="text-rose-500">*</span>}
          </label>
          <SearchableSelect
            id="loc-sel-division"
            options={divisionOptions}
            value={selectedDivisionValue}
            onChange={handleDivisionChange}
            placeholder={t('location.selectDivision')}
            disabled={disabled}
            required={required}
            icon={<MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />}
            heightClassName="h-[46px] sm:h-[50px]"
          />
        </div>

        {/* 2. District */}
        <div className="col-span-1 w-full min-w-0 flex flex-col text-left" id="loc-sel-district-container">
          <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
            {t('location.district')} {required && <span className="text-rose-500">*</span>}
          </label>
          <SearchableSelect
            id="loc-sel-district"
            options={districtOptions}
            value={selectedDistrictValue}
            onChange={handleDistrictChange}
            placeholder={!division ? (language === 'bn' ? 'প্রথমে বিভাগ নির্বাচন করুন' : 'Select Division first') : t('location.selectDistrict')}
            disabled={disabled || !division}
            required={required}
            icon={<Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />}
            heightClassName="h-[46px] sm:h-[50px]"
          />
        </div>

        {/* 3. Upazila/Thana */}
        <div className="col-span-1 w-full min-w-0 flex flex-col text-left" id="loc-sel-upazila-container">
          <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
            {policeStation !== undefined ? t('location.upazila') : (language === 'bn' ? 'উপজেলা/থানা' : 'Upazila/Thana')} {required && <span className="text-rose-500">*</span>}
          </label>
          <SearchableSelect
            id="loc-sel-upazila"
            options={upazilaOptions}
            value={selectedUpazilaValue}
            onChange={handleUpazilaChange}
            placeholder={!district ? (language === 'bn' ? 'প্রথমে জেলা নির্বাচন করুন' : 'Select District first') : (policeStation !== undefined ? t('location.selectUpazila') : (language === 'bn' ? 'উপজেলা/থানা নির্বাচন করুন' : 'Select Upazila/Thana'))}
            disabled={disabled || !district}
            required={required}
            icon={<Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />}
            heightClassName="h-[46px] sm:h-[50px]"
          />
        </div>

        {/* 4. Blood Group */}
        {(showBloodGroup || bloodGroup !== undefined) && (
          <div className="col-span-1 w-full min-w-0 flex flex-col text-left" id="loc-sel-blood-group-container">
            <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
              {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'} {required && <span className="text-rose-500">*</span>}
            </label>
            <SearchableSelect
              id="loc-sel-blood-group"
              options={bloodGroupOptions}
              value={bloodGroup || ''}
              onChange={(val) => onChange('bloodGroup', val)}
              placeholder={language === 'bn' ? 'গ্রুপ নির্বাচন করুন' : 'Select Blood Group'}
              disabled={disabled}
              required={required}
              icon={<Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />}
              heightClassName="h-[46px] sm:h-[50px]"
            />
          </div>
        )}

        {/* Optional Police Station if present */}
        {policeStation !== undefined && (
          <div className="col-span-1 w-full min-w-0 flex flex-col text-left" id="loc-sel-police-station-container">
            <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
              {language === 'bn' ? 'থানা নির্বাচন করুন' : 'Police Station'} {required && <span className="text-rose-500">*</span>}
            </label>
            <SearchableSelect
              id="loc-sel-police-station"
              options={policeStationOptions}
              value={selectedPoliceStationValue}
              onChange={handlePoliceStationChange}
              placeholder={!upazila ? (language === 'bn' ? 'প্রথমে উপজেলা নির্বাচন করুন' : 'Select Upazila first') : (language === 'bn' ? 'থানা নির্বাচন করুন' : 'Select Police Station')}
              disabled={disabled || !upazila}
              required={required}
              icon={<Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />}
              heightClassName="h-[46px] sm:h-[50px]"
            />
          </div>
        )}

        {/* 5. Full Address (Full Width Spanning 2 Columns on Desktop) */}
        {(showFullAddress || fullAddress !== undefined) && (
          <div className="col-span-1 md:col-span-2 w-full flex flex-col text-left" id="loc-sel-full-address-container">
            <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
              {language === 'bn' ? 'বিস্তারিত ঠিকানা' : 'Full Address'}
            </label>
            <div className="relative w-full">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0 pointer-events-none" />
              <input
                type="text"
                id="loc-sel-full-address"
                value={fullAddress || ''}
                onChange={(e) => onChange('fullAddress', e.target.value)}
                placeholder={language === 'bn' ? 'বিস্তারিত ঠিকানা লিখুন (গ্রাম, রোড, এলাকা, ল্যান্ডমার্ক)' : 'Enter Full Address (Village, Road, Area, Landmark)'}
                disabled={disabled}
                className="w-full h-[46px] sm:h-[50px] bg-slate-900/70 border border-slate-750/70 hover:border-rose-500/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-slate-100 placeholder-slate-500/80 rounded-xl sm:rounded-2xl pl-9 sm:pl-11 pr-3.5 sm:pr-4 outline-none transition-all duration-200 backdrop-blur-xl shadow-inner shadow-slate-950/40 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs sm:text-sm text-left"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const containerGridClass = gridClassName || `grid grid-cols-1 ${policeStation !== undefined ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3 sm:gap-4 w-full`;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      <div className={containerGridClass}>
        {/* Division */}
        <div className="col-span-1 w-full min-w-0 flex flex-col text-left" id="loc-sel-division-container">
          <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
            {t('location.division')} {required && <span className="text-rose-500">*</span>}
          </label>
          <SearchableSelect
            id="loc-sel-division"
            options={divisionOptions}
            value={selectedDivisionValue}
            onChange={handleDivisionChange}
            placeholder={t('location.selectDivision')}
            disabled={disabled}
            required={required}
            icon={<MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />}
            heightClassName="h-[46px] sm:h-[50px]"
          />
        </div>

        {/* District */}
        <div className="col-span-1 w-full min-w-0 flex flex-col text-left" id="loc-sel-district-container">
          <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
            {t('location.district')} {required && <span className="text-rose-500">*</span>}
          </label>
          <SearchableSelect
            id="loc-sel-district"
            options={districtOptions}
            value={selectedDistrictValue}
            onChange={handleDistrictChange}
            placeholder={!division ? (language === 'bn' ? 'প্রথমে বিভাগ নির্বাচন করুন' : 'Select Division first') : t('location.selectDistrict')}
            disabled={disabled || !division}
            required={required}
            icon={<Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />}
            heightClassName="h-[46px] sm:h-[50px]"
          />
        </div>

        {/* Upazila */}
        <div className="col-span-1 w-full min-w-0 flex flex-col text-left" id="loc-sel-upazila-container">
          <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
            {policeStation !== undefined ? t('location.upazila') : (language === 'bn' ? 'উপজেলা/থানা' : 'Upazila/Thana')} {required && <span className="text-rose-500">*</span>}
          </label>
          <SearchableSelect
            id="loc-sel-upazila"
            options={upazilaOptions}
            value={selectedUpazilaValue}
            onChange={handleUpazilaChange}
            placeholder={!district ? (language === 'bn' ? 'প্রথমে জেলা নির্বাচন করুন' : 'Select District first') : (policeStation !== undefined ? t('location.selectUpazila') : (language === 'bn' ? 'উপজেলা/থানা নির্বাচন করুন' : 'Select Upazila/Thana'))}
            disabled={disabled || !district}
            required={required}
            icon={<Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />}
            heightClassName="h-[46px] sm:h-[50px]"
          />
        </div>

        {/* Police Station */}
        {policeStation !== undefined && (
          <div className="col-span-1 w-full min-w-0 flex flex-col text-left" id="loc-sel-police-station-container">
            <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
              {language === 'bn' ? 'থানা নির্বাচন করুন' : 'Police Station'} {required && <span className="text-rose-500">*</span>}
            </label>
            <SearchableSelect
              id="loc-sel-police-station"
              options={policeStationOptions}
              value={selectedPoliceStationValue}
              onChange={handlePoliceStationChange}
              placeholder={!upazila ? (language === 'bn' ? 'প্রথমে উপজেলা নির্বাচন করুন' : 'Select Upazila first') : (language === 'bn' ? 'থানা নির্বাচন করুন' : 'Select Police Station')}
              disabled={disabled || !upazila}
              required={required}
              icon={<Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />}
              heightClassName="h-[46px] sm:h-[50px]"
            />
          </div>
        )}
      </div>

      {/* Full Address Input Field */}
      {(showFullAddress || fullAddress !== undefined) && (
        <div className="w-full flex flex-col text-left" id="loc-sel-full-address-container">
          <label className="text-[10px] sm:text-xs font-bold text-rose-300/90 mb-1 ml-1 uppercase tracking-wider flex items-center gap-1">
            {language === 'bn' ? 'বিস্তারিত ঠিকানা' : 'Full Address'} {required && <span className="text-rose-500">*</span>}
          </label>
          <div className="relative w-full">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0 pointer-events-none" />
            <input
              type="text"
              id="loc-sel-full-address"
              value={fullAddress || ''}
              onChange={(e) => onChange('fullAddress', e.target.value)}
              placeholder={language === 'bn' ? 'বিস্তারিত ঠিকানা লিখুন (গ্রাম, রোড, এলাকা, ল্যান্ডমার্ক)' : 'Enter Full Address (Village, Road, Area, Landmark)'}
              disabled={disabled}
              required={required}
              className="w-full h-[46px] sm:h-[50px] bg-slate-900/70 border border-slate-750/70 hover:border-rose-500/40 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-slate-100 placeholder-slate-500/80 rounded-xl sm:rounded-2xl pl-9 sm:pl-11 pr-3.5 sm:pr-4 outline-none transition-all duration-200 backdrop-blur-xl shadow-inner shadow-slate-950/40 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs sm:text-sm text-left"
            />
          </div>
        </div>
      )}
    </div>
  );
}
