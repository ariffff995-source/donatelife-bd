'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Ambulance, CMSContent, MediaAsset } from '../types';
import LocationSelector from './LocationSelector';
import { 
  Globe, FileText, Image as ImageIcon, Phone, Plus, Trash2, Check, 
  Upload, Copy, AlertCircle, Edit, Trash, HelpCircle, Server, Eye, ExternalLink, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CmsManager() {
  const { language, refreshCms } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'pages' | 'media' | 'ambulances'>('pages');

  // General Status States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pages CMS state
  const [cmsPages, setCmsPages] = useState<CMSContent[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('home');
  const [selectedPageData, setSelectedPageData] = useState<any>(null);
  const [originalPublishedData, setOriginalPublishedData] = useState<any>(null);

  // Media Manager state
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [uploadFile, setUploadFile] = useState<{ name: string; base64: string; type: string }>({ name: '', base64: '', type: 'image' });
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Ambulance Service State
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);
  const [creatingAmbulance, setCreatingAmbulance] = useState(false);
  const [ambulanceForm, setAmbulanceForm] = useState({
    name: '',
    division: '',
    district: '',
    upazila: '',
    policeStation: '',
    address: '',
    contactPhone: '',
    serviceArea: '',
    availableTypes: [] as string[],
    openingHours: ''
  });

  // Load Initial CMS Data
  const loadCmsPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await api.cms.listDrafts();
      setCmsPages(list || []);
      
      const homePage = list.find(p => p.id === selectedPageId);
      if (homePage) {
        setSelectedPageData(JSON.parse(JSON.stringify(homePage.draft)));
        setOriginalPublishedData(homePage.published);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load CMS pages');
    } finally {
      setLoading(false);
    }
  };

  // Load Media List
  const loadMedia = async () => {
    try {
      setError(null);
      const list = await api.media.list();
      setMediaList(list || []);
    } catch (err: any) {
      console.error('Failed to load media assets', err);
    }
  };

  // Load Ambulances
  const loadAmbulances = async () => {
    try {
      setError(null);
      const list = await api.ambulances.list();
      setAmbulances(list || []);
    } catch (err: any) {
      console.error('Failed to load ambulances', err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'pages') {
      loadCmsPages();
    } else if (activeSubTab === 'media') {
      loadMedia();
    } else if (activeSubTab === 'ambulances') {
      loadAmbulances();
    }
  }, [activeSubTab]);

  // Handle Changing Selected Page ID
  const handlePageSelectChange = (id: string) => {
    setSelectedPageId(id);
    const page = cmsPages.find(p => p.id === id);
    if (page) {
      setSelectedPageData(JSON.parse(JSON.stringify(page.draft)));
      setOriginalPublishedData(page.published);
    } else {
      setSelectedPageData(null);
      setOriginalPublishedData(null);
    }
  };

  // Check if draft has changes compared to published
  const hasChanges = () => {
    if (!selectedPageData || !originalPublishedData) return true;
    return JSON.stringify(selectedPageData) !== JSON.stringify(originalPublishedData);
  };

  // Save Page Draft
  const handleSaveDraft = async () => {
    if (!selectedPageId || !selectedPageData) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await api.cms.saveDraft(selectedPageId, selectedPageData);
      
      // Reload pages list to update local copy
      const list = await api.cms.listDrafts();
      setCmsPages(list || []);
      const updated = list.find(p => p.id === selectedPageId);
      if (updated) {
        setOriginalPublishedData(updated.published);
      }
      setSuccess('Draft configuration saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save page draft.');
    } finally {
      setLoading(false);
    }
  };

  // Publish Page
  const handlePublishPage = async () => {
    if (!selectedPageId) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Save current draft first to ensure published matches edits
      await api.cms.saveDraft(selectedPageId, selectedPageData);
      
      // Make publish request
      await api.cms.publish(selectedPageId);
      
      // Refresh CMS Context for immediate dynamic display on client
      await refreshCms();

      // Reload pages list to update local copy
      const list = await api.cms.listDrafts();
      setCmsPages(list || []);
      const updated = list.find(p => p.id === selectedPageId);
      if (updated) {
        setSelectedPageData(JSON.parse(JSON.stringify(updated.draft)));
        setOriginalPublishedData(updated.published);
      }
      setSuccess('CMS modifications successfully published live to production!');
    } catch (err: any) {
      setError(err.message || 'Failed to publish CMS page.');
    } finally {
      setLoading(false);
    }
  };

  // Unpublish Page
  const handleUnpublishPage = async () => {
    if (!selectedPageId) return;
    if (!window.confirm('Are you sure you want to unpublish this page? It will revert to the default translations.')) return;
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await api.cms.unpublish(selectedPageId);
      
      await refreshCms();

      const list = await api.cms.listDrafts();
      setCmsPages(list || []);
      const updated = list.find(p => p.id === selectedPageId);
      if (updated) {
        setSelectedPageData(JSON.parse(JSON.stringify(updated.draft)));
        setOriginalPublishedData(updated.published);
      }
      setSuccess('CMS section unpublished successfully. Resetting live view to standard templates.');
    } catch (err: any) {
      setError(err.message || 'Failed to unpublish CMS page.');
    } finally {
      setLoading(false);
    }
  };

  // --- Media Manager Operations ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size exceeds the 2MB limit for direct base64 seeding.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setUploadFile(prev => ({
        ...prev,
        name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
        base64: reader.result as string,
        type: file.type.startsWith('image/') ? 'image' : 'icon'
      }));
    };
    reader.onerror = () => {
      setUploadError('Failed to read file contents');
    };
    reader.readAsDataURL(file);
  };

  const handleMediaUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile.name || !uploadFile.base64) {
      setUploadError('Please select a file first.');
      return;
    }

    try {
      setLoading(true);
      setUploadError(null);
      await api.media.upload({ name: uploadFile.name, url: uploadFile.base64, type: uploadFile.type });
      setUploadFile({ name: '', base64: '', type: 'image' });
      await loadMedia();
      setSuccess('Media asset uploaded successfully!');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload media asset.');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this media asset?')) return;
    try {
      setLoading(true);
      await api.media.delete(id);
      await loadMedia();
      setSuccess('Media asset removed from database.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete media asset');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Asset Data URI copied to clipboard! You can paste this in image/logo inputs.');
  };

  // --- Ambulance Directory Operations ---
  const handleAmbulanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Prevent duplicate phone numbers
    const normPhone = ambulanceForm.contactPhone.replace(/\D/g, '').replace(/^(88|0)/, '');
    const isDup = ambulances.some(amb => {
      if (editingAmbulance && amb.id === editingAmbulance.id) return false;
      return amb.contactPhone.replace(/\D/g, '').replace(/^(88|0)/, '') === normPhone;
    });

    if (isDup) {
      setError(language === 'bn' ? 'এই ফোন নম্বরটি ইতিমধ্যে অন্য একটি অ্যাম্বুলেন্স সার্ভিসের জন্য ব্যবহার করা হয়েছে।' : 'This contact phone number is already registered for another ambulance service.');
      return;
    }

    try {
      setLoading(true);

      if (editingAmbulance) {
        await api.ambulances.update(editingAmbulance.id, ambulanceForm);
        setSuccess('Ambulance service directory item updated!');
      } else {
        await api.ambulances.create(ambulanceForm);
        setSuccess('Ambulance service added to active directory!');
      }

      setCreatingAmbulance(false);
      setEditingAmbulance(null);
      await loadAmbulances();
    } catch (err: any) {
      setError(err.message || 'Failed to save ambulance service.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmbulanceDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ambulance service?')) return;
    try {
      setLoading(true);
      await api.ambulances.delete(id);
      await loadAmbulances();
      setSuccess('Ambulance service removed from database.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete ambulance service');
    } finally {
      setLoading(false);
    }
  };

  const startEditAmbulance = (amb: Ambulance) => {
    setEditingAmbulance(amb);
    setAmbulanceForm({
      name: amb.name,
      division: amb.division,
      district: amb.district,
      upazila: amb.upazila,
      policeStation: amb.policeStation || '',
      address: amb.address,
      contactPhone: amb.contactPhone,
      serviceArea: amb.serviceArea || '',
      availableTypes: amb.availableTypes || [],
      openingHours: amb.openingHours || ''
    });
    setCreatingAmbulance(true);
  };

  const startCreateAmbulance = () => {
    setEditingAmbulance(null);
    setAmbulanceForm({
      name: '',
      division: '',
      district: '',
      upazila: '',
      policeStation: '',
      address: '',
      contactPhone: '',
      serviceArea: '',
      availableTypes: ['AC Ambulance', 'Non-AC Ambulance'],
      openingHours: '24 Hours/7 Days Service'
    });
    setCreatingAmbulance(true);
  };

  const toggleAmbulanceType = (type: string) => {
    setAmbulanceForm(prev => {
      const types = [...prev.availableTypes];
      if (types.includes(type)) {
        return { ...prev, availableTypes: types.filter(t => t !== type) };
      } else {
        return { ...prev, availableTypes: [...types, type] };
      }
    });
  };

  // Helper to update state inside CMS fields
  const handleFieldChange = (keyPath: string, val: any) => {
    setSelectedPageData((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = keyPath.split('.');
      let temp = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        temp = temp[keys[i]];
      }
      temp[keys[keys.length - 1]] = val;
      return copy;
    });
  };

  // Helper for biling fields changes
  const handleBilingChange = (keyPath: string, lang: 'en' | 'bn', text: string) => {
    setSelectedPageData((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = keyPath.split('.');
      let temp = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        temp = temp[keys[i]];
      }
      if (!temp[keys[keys.length - 1]]) {
        temp[keys[keys.length - 1]] = { en: '', bn: '' };
      }
      temp[keys[keys.length - 1]][lang] = text;
      return copy;
    });
  };

  // Render inputs depending on CMS section schema
  const renderCmsEditorFields = () => {
    if (!selectedPageData) return null;

    switch (selectedPageId) {
      case 'home':
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">Hero Section Editing</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Hero Title Line 1 (EN)</label>
                <input
                  type="text"
                  value={selectedPageData.heroTitleLine1?.en || ''}
                  onChange={(e) => handleBilingChange('heroTitleLine1', 'en', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Hero Title Line 1 (BN)</label>
                <input
                  type="text"
                  value={selectedPageData.heroTitleLine1?.bn || ''}
                  onChange={(e) => handleBilingChange('heroTitleLine1', 'bn', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Hero Title Accent (EN)</label>
                <input
                  type="text"
                  value={selectedPageData.heroTitleAccent?.en || ''}
                  onChange={(e) => handleBilingChange('heroTitleAccent', 'en', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Hero Title Accent (BN)</label>
                <input
                  type="text"
                  value={selectedPageData.heroTitleAccent?.bn || ''}
                  onChange={(e) => handleBilingChange('heroTitleAccent', 'bn', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Hero Subtitle (EN)</label>
                <textarea
                  rows={2}
                  value={selectedPageData.heroSubtitle?.en || ''}
                  onChange={(e) => handleBilingChange('heroSubtitle', 'en', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Hero Subtitle (BN)</label>
                <textarea
                  rows={2}
                  value={selectedPageData.heroSubtitle?.bn || ''}
                  onChange={(e) => handleBilingChange('heroSubtitle', 'bn', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Hero Medical Network Illustration Image (URL / Data URI)</label>
                <input
                  type="text"
                  value={selectedPageData.heroImage?.en || ''}
                  onChange={(e) => {
                    handleBilingChange('heroImage', 'en', e.target.value);
                    handleBilingChange('heroImage', 'bn', e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  placeholder="Paste visual asset Data URI from Media Manager tab"
                />
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 pt-4">Call To Actions & Buttons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">CTA Register Donor (EN / BN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedPageData.ctaRegister?.en || ''}
                    onChange={(e) => handleBilingChange('ctaRegister', 'en', e.target.value)}
                    placeholder="Register as Donor"
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="text"
                    value={selectedPageData.ctaRegister?.bn || ''}
                    onChange={(e) => handleBilingChange('ctaRegister', 'bn', e.target.value)}
                    placeholder="রক্তদাতা হোন"
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">CTA Finder (EN / BN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedPageData.ctaFinder?.en || ''}
                    onChange={(e) => handleBilingChange('ctaFinder', 'en', e.target.value)}
                    placeholder="Search Donors"
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="text"
                    value={selectedPageData.ctaFinder?.bn || ''}
                    onChange={(e) => handleBilingChange('ctaFinder', 'bn', e.target.value)}
                    placeholder="অনুসন্ধান করুন"
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 pt-4">Banners & Taglines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Main Banner Title (EN / BN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedPageData.banners?.[0]?.title?.en || ''}
                    onChange={(e) => {
                      const copy = [...selectedPageData.banners];
                      copy[0].title.en = e.target.value;
                      handleFieldChange('banners', copy);
                    }}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="text"
                    value={selectedPageData.banners?.[0]?.title?.bn || ''}
                    onChange={(e) => {
                      const copy = [...selectedPageData.banners];
                      copy[0].title.bn = e.target.value;
                      handleFieldChange('banners', copy);
                    }}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Main Banner Subtitle (EN / BN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedPageData.banners?.[0]?.desc?.en || ''}
                    onChange={(e) => {
                      const copy = [...selectedPageData.banners];
                      copy[0].desc.en = e.target.value;
                      handleFieldChange('banners', copy);
                    }}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="text"
                    value={selectedPageData.banners?.[0]?.desc?.bn || ''}
                    onChange={(e) => {
                      const copy = [...selectedPageData.banners];
                      copy[0].desc.bn = e.target.value;
                      handleFieldChange('banners', copy);
                    }}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 pt-4">Bilingual Statistics Labels</h4>
            <div className="space-y-3">
              {selectedPageData.statistics?.map((stat: any, index: number) => (
                <div key={stat.key} className="flex flex-col sm:flex-row gap-2 bg-slate-900/40 p-3 border border-slate-850 rounded-xl items-center">
                  <span className="text-xs font-bold font-mono text-rose-400 w-36 shrink-0">{stat.key}</span>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const copy = [...selectedPageData.statistics];
                      copy[index].value = e.target.value;
                      handleFieldChange('statistics', copy);
                    }}
                    className="w-20 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs font-bold text-center shrink-0"
                  />
                  <input
                    type="text"
                    value={stat.label?.en || ''}
                    placeholder="Label EN"
                    onChange={(e) => {
                      const copy = [...selectedPageData.statistics];
                      copy[index].label.en = e.target.value;
                      handleFieldChange('statistics', copy);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="text"
                    value={stat.label?.bn || ''}
                    placeholder="Label BN"
                    onChange={(e) => {
                      const copy = [...selectedPageData.statistics];
                      copy[index].label.bn = e.target.value;
                      handleFieldChange('statistics', copy);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Search Section Title (EN)</label>
                <input
                  type="text"
                  value={selectedPageData.title?.en || ''}
                  onChange={(e) => handleBilingChange('title', 'en', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Search Section Title (BN)</label>
                <input
                  type="text"
                  value={selectedPageData.title?.bn || ''}
                  onChange={(e) => handleBilingChange('title', 'bn', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Description Subtitle (EN)</label>
                <textarea
                  rows={2}
                  value={selectedPageData.subtitle?.en || ''}
                  onChange={(e) => handleBilingChange('subtitle', 'en', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Description Subtitle (BN)</label>
                <textarea
                  rows={2}
                  value={selectedPageData.subtitle?.bn || ''}
                  onChange={(e) => handleBilingChange('subtitle', 'bn', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Empty Search Results State Message (EN / BN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedPageData.emptyStateMessage?.en || ''}
                    onChange={(e) => handleBilingChange('emptyStateMessage', 'en', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="text"
                    value={selectedPageData.emptyStateMessage?.bn || ''}
                    onChange={(e) => handleBilingChange('emptyStateMessage', 'bn', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'requests':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Page Title (EN / BN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedPageData.title?.en || ''}
                    onChange={(e) => handleBilingChange('title', 'en', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="text"
                    value={selectedPageData.title?.bn || ''}
                    onChange={(e) => handleBilingChange('title', 'bn', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Guidelines & Instructions (EN)</label>
                <textarea
                  rows={2}
                  value={selectedPageData.instructions?.en || ''}
                  onChange={(e) => handleBilingChange('instructions', 'en', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Guidelines & Instructions (BN)</label>
                <textarea
                  rows={2}
                  value={selectedPageData.instructions?.bn || ''}
                  onChange={(e) => handleBilingChange('instructions', 'bn', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Success Submission Banner Text (EN / BN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedPageData.successMessage?.en || ''}
                    onChange={(e) => handleBilingChange('successMessage', 'en', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="text"
                    value={selectedPageData.successMessage?.bn || ''}
                    onChange={(e) => handleBilingChange('successMessage', 'bn', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'helpdesk':
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">Emergency Helpline Contacts</h4>
            <div className="space-y-3">
              {selectedPageData.contacts?.map((contact: any, index: number) => (
                <div key={index} className="bg-slate-900/50 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-end">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full text-left">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Contact Name (EN / BN)</label>
                      <input
                        type="text"
                        value={contact.name?.en || ''}
                        onChange={(e) => {
                          const copy = [...selectedPageData.contacts];
                          copy[index].name.en = e.target.value;
                          handleFieldChange('contacts', copy);
                        }}
                        placeholder="EN Name"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs mb-1"
                      />
                      <input
                        type="text"
                        value={contact.name?.bn || ''}
                        onChange={(e) => {
                          const copy = [...selectedPageData.contacts];
                          copy[index].name.bn = e.target.value;
                          handleFieldChange('contacts', copy);
                        }}
                        placeholder="BN Name"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs font-bangla"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={contact.phone || ''}
                        onChange={(e) => {
                          const copy = [...selectedPageData.contacts];
                          copy[index].phone = e.target.value;
                          handleFieldChange('contacts', copy);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Optional WhatsApp / Email</label>
                      <input
                        type="text"
                        value={contact.whatsapp || ''}
                        placeholder="WhatsApp (e.g. +8801700...)"
                        onChange={(e) => {
                          const copy = [...selectedPageData.contacts];
                          copy[index].whatsapp = e.target.value;
                          handleFieldChange('contacts', copy);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs mb-1 font-mono"
                      />
                      <input
                        type="text"
                        value={contact.email || ''}
                        placeholder="Email Address"
                        onChange={(e) => {
                          const copy = [...selectedPageData.contacts];
                          copy[index].email = e.target.value;
                          handleFieldChange('contacts', copy);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const copy = selectedPageData.contacts.filter((_: any, idx: number) => idx !== index);
                      handleFieldChange('contacts', copy);
                    }}
                    className="w-10 h-10 shrink-0 bg-red-950/20 hover:bg-red-900/20 text-red-400 border border-red-900/30 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const copy = [...(selectedPageData.contacts || [])];
                  copy.push({ name: { en: "New Agency", bn: "নতুন সংস্থা" }, phone: "", type: "custom" });
                  handleFieldChange('contacts', copy);
                }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-400 hover:text-white bg-rose-550/10 hover:bg-rose-600 rounded-xl transition border border-rose-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Helpline Contact
              </button>
            </div>

            <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 pt-4">Clinical Preparation Tips & Guidelines</h4>
            <div className="space-y-4">
              {selectedPageData.tips?.map((tip: any, index: number) => (
                <div key={index} className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Tip Title (EN / BN)</label>
                      <input
                        type="text"
                        value={tip.title?.en || ''}
                        onChange={(e) => {
                          const copy = [...selectedPageData.tips];
                          copy[index].title.en = e.target.value;
                          handleFieldChange('tips', copy);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs mb-1"
                      />
                      <input
                        type="text"
                        value={tip.title?.bn || ''}
                        onChange={(e) => {
                          const copy = [...selectedPageData.tips];
                          copy[index].title.bn = e.target.value;
                          handleFieldChange('tips', copy);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs font-bangla"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Tip Detail Description (EN / BN)</label>
                      <textarea
                        rows={2}
                        value={tip.desc?.en || ''}
                        onChange={(e) => {
                          const copy = [...selectedPageData.tips];
                          copy[index].desc.en = e.target.value;
                          handleFieldChange('tips', copy);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs mb-1"
                      />
                      <textarea
                        rows={2}
                        value={tip.desc?.bn || ''}
                        onChange={(e) => {
                          const copy = [...selectedPageData.tips];
                          copy[index].desc.bn = e.target.value;
                          handleFieldChange('tips', copy);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs font-bangla"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Footer Tagline Tag (EN)</label>
                <input
                  type="text"
                  value={selectedPageData.tagline?.en || ''}
                  onChange={(e) => handleBilingChange('tagline', 'en', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Footer Tagline Tag (BN)</label>
                <input
                  type="text"
                  value={selectedPageData.tagline?.bn || ''}
                  onChange={(e) => handleBilingChange('tagline', 'bn', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Tagline Details (EN)</label>
                <input
                  type="text"
                  value={selectedPageData.description?.en || ''}
                  onChange={(e) => handleBilingChange('description', 'en', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Tagline Details (BN)</label>
                <input
                  type="text"
                  value={selectedPageData.description?.bn || ''}
                  onChange={(e) => handleBilingChange('description', 'bn', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                />
              </div>
            </div>
          </div>
        );

      case 'contact_info':
        return (
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Support Contact Phone</label>
                <input
                  type="text"
                  value={selectedPageData.supportPhone || ''}
                  onChange={(e) => handleFieldChange('supportPhone', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Support Contact Email</label>
                <input
                  type="email"
                  value={selectedPageData.supportEmail || ''}
                  onChange={(e) => handleFieldChange('supportEmail', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Facebook Brand Page</label>
                <input
                  type="text"
                  value={selectedPageData.facebook || ''}
                  onChange={(e) => handleFieldChange('facebook', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">WhatsApp Official Link</label>
                <input
                  type="text"
                  value={selectedPageData.whatsapp || ''}
                  onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-mono"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Office Headquarters Address (EN / BN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedPageData.officeAddress?.en || ''}
                    placeholder="English address"
                    onChange={(e) => handleBilingChange('officeAddress', 'en', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  />
                  <input
                    type="text"
                    value={selectedPageData.officeAddress?.bn || ''}
                    placeholder="Bangla address"
                    onChange={(e) => handleBilingChange('officeAddress', 'bn', e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'website_settings':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">Platform Brand Name</label>
                <input
                  type="text"
                  value={selectedPageData.siteName || ''}
                  onChange={(e) => handleFieldChange('siteName', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">SEO Head Meta Title</label>
                <input
                  type="text"
                  value={selectedPageData.seoTitle || ''}
                  onChange={(e) => handleFieldChange('seoTitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-semibold uppercase block mb-1">SEO Description</label>
                <textarea
                  rows={2}
                  value={selectedPageData.seoDescription || ''}
                  onChange={(e) => handleFieldChange('seoDescription', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                />
              </div>
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">Top Header Live Notice Announcement</h4>
            <div className="bg-slate-900/50 p-4 border border-slate-850 rounded-2xl space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Enable Top Announcement Bar</span>
                <input
                  type="checkbox"
                  checked={selectedPageData.topNoticeBar?.enabled || false}
                  onChange={(e) => {
                    const notice = { ...selectedPageData.topNoticeBar, enabled: e.target.checked };
                    handleFieldChange('topNoticeBar', notice);
                  }}
                  className="w-4 h-4 text-rose-500 bg-slate-900 border-slate-800 rounded focus:ring-rose-500 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">English Announcement Notice</label>
                  <input
                    type="text"
                    value={selectedPageData.topNoticeBar?.en || ''}
                    onChange={(e) => {
                      const notice = { ...selectedPageData.topNoticeBar, en: e.target.value };
                      handleFieldChange('topNoticeBar', notice);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bangla">Bangla Announcement Notice</label>
                  <input
                    type="text"
                    value={selectedPageData.topNoticeBar?.bn || ''}
                    onChange={(e) => {
                      const notice = { ...selectedPageData.topNoticeBar, bn: e.target.value };
                      handleFieldChange('topNoticeBar', notice);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2 pt-4">Emergency Red Alert System</h4>
            <div className="bg-rose-950/10 p-4 border border-rose-900/20 rounded-2xl space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400">Dispatch System-wide Red Alert</span>
                <input
                  type="checkbox"
                  checked={selectedPageData.emergencyAlert?.enabled || false}
                  onChange={(e) => {
                    const alert = { ...selectedPageData.emergencyAlert, enabled: e.target.checked };
                    handleFieldChange('emergencyAlert', alert);
                  }}
                  className="w-4 h-4 text-rose-500 bg-slate-900 border-slate-800 rounded focus:ring-rose-500 cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Blood Group Alert</label>
                  <input
                    type="text"
                    value={selectedPageData.emergencyAlert?.bloodGroup || ''}
                    onChange={(e) => {
                      const alert = { ...selectedPageData.emergencyAlert, bloodGroup: e.target.value };
                      handleFieldChange('emergencyAlert', alert);
                    }}
                    placeholder="e.g. O-"
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">English Warning Message</label>
                  <input
                    type="text"
                    value={selectedPageData.emergencyAlert?.en || ''}
                    onChange={(e) => {
                      const alert = { ...selectedPageData.emergencyAlert, en: e.target.value };
                      handleFieldChange('emergencyAlert', alert);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bangla">Bangla Warning Message</label>
                  <input
                    type="text"
                    value={selectedPageData.emergencyAlert?.bn || ''}
                    onChange={(e) => {
                      const alert = { ...selectedPageData.emergencyAlert, bn: e.target.value };
                      handleFieldChange('emergencyAlert', alert);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bangla"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-slate-400 text-xs">Unsupported schema editor.</p>;
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* CMS Sub-tabs Selection */}
      <div className="flex border-b border-slate-800 pb-1 gap-2">
        <button
          onClick={() => setActiveSubTab('pages')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'pages' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Pages Content Management
        </button>
        <button
          onClick={() => setActiveSubTab('media')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'media' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Media Asset Manager
        </button>
        <button
          onClick={() => setActiveSubTab('ambulances')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ambulances' ? 'border-rose-500 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Phone className="w-4 h-4" /> Ambulances Directory
        </button>
      </div>

      {/* Global Toast Success / Error feedback */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 text-left"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold flex items-center gap-2 text-left"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Pages Content Editor View --- */}
      {activeSubTab === 'pages' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: select target section */}
          <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Target CMS Sections</h4>
            {[
              { id: 'home', name: '🏠 Home Page CMS' },
              { id: 'search', name: '🩸 Search Page CMS' },
              { id: 'requests', name: '🚑 Emergency Requests' },
              { id: 'helpdesk', name: '🚨 Helpdesk Helplines' },
              { id: 'footer', name: '🏷️ Footer Taglines' },
              { id: 'contact_info', name: '📞 Office & Support' },
              { id: 'website_settings', name: '⚙️ Website Settings' },
              { id: 'announcements', name: '📢 Live Announcements' }
            ].map(page => (
              <button
                key={page.id}
                onClick={() => handlePageSelectChange(page.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  selectedPageId === page.id 
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                    : 'bg-slate-950/20 hover:bg-slate-900 border border-transparent text-slate-300'
                }`}
              >
                <span>{page.name}</span>
                {cmsPages.find(p => p.id === page.id)?.isPublished && (
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title="Published Live"></span>
                )}
              </button>
            ))}
          </div>

          {/* Right panel: dynamic editing form */}
          <div className="lg:col-span-9 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-6">
            
            {/* CMS Actions Header bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-3">
              <div className="text-left">
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <span>Section:</span>
                  <span className="text-rose-400 uppercase font-mono">{selectedPageId}</span>
                </h3>
                <p className="text-[10px] text-slate-400">Modify both English and Bangla translations. Save drafts before publishing live.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSaveDraft}
                  disabled={loading || !selectedPageData}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Server className="w-3.5 h-3.5" /> Save Draft
                </button>
                <button
                  onClick={handlePublishPage}
                  disabled={loading || !selectedPageData}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-rose-950/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Globe className="w-3.5 h-3.5" /> Publish Live
                </button>
                <button
                  onClick={handleUnpublishPage}
                  disabled={loading || !selectedPageData}
                  className="px-3 py-2 bg-red-950/20 hover:bg-red-900/20 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl border border-red-900/30 transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Trash className="w-3.5 h-3.5" /> Unpublish
                </button>
              </div>
            </div>

            {/* Editing State Warning banner */}
            {hasChanges() && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-[10px] sm:text-xs font-semibold text-left flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>You have unsaved changes in your draft of this section. Click "Save Draft" or "Publish Live" to commit.</span>
              </div>
            )}

            {/* Render dynamic fields for selected section */}
            {loading && !selectedPageData ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-400 font-bold">Querying database configurations...</span>
              </div>
            ) : (
              <div className="space-y-6 text-left">
                {renderCmsEditorFields()}
              </div>
            )}

          </div>

        </div>
      )}

      {/* --- Media Asset Manager View --- */}
      {activeSubTab === 'media' && (
        <div className="space-y-6">
          
          {/* Upload New Asset Section */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-left">
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-rose-500" /> Seeding & Uploading Media Assets (Limit 2MB)
            </h3>
            
            <form onSubmit={handleMediaUploadSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. medical_hero_banner"
                  value={uploadFile.name}
                  onChange={(e) => setUploadFile(prev => ({ ...prev, name: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_') }))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-mono"
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Asset Category</label>
                <select
                  value={uploadFile.type}
                  onChange={(e) => setUploadFile(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-bold"
                >
                  <option value="image">Image</option>
                  <option value="icon">Icon / Logo</option>
                  <option value="banner">Banner</option>
                  <option value="blog">Blog Image</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Choose File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2 outline-none focus:border-rose-500 text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading || !uploadFile.base64}
                  className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-lg shadow-lg shadow-rose-950/40 hover:shadow-rose-600/40 transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" /> Upload
                </button>
              </div>
            </form>

            {uploadError && (
              <p className="mt-2 text-xs text-red-400 font-semibold">{uploadError}</p>
            )}
            {uploadFile.base64 && (
              <div className="mt-4 p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center gap-3">
                <img src={uploadFile.base64} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0" referrerPolicy="no-referrer" />
                <div className="text-xs min-w-0">
                  <p className="font-bold text-slate-300 truncate">{uploadFile.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{uploadFile.type} · Ready to load</p>
                </div>
              </div>
            )}
          </div>

          {/* Media Assets List Grid */}
          <div className="space-y-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Uploaded Database Assets ({mediaList.length})</h3>
            
            {mediaList.length === 0 ? (
              <div className="p-8 border border-slate-850 border-dashed rounded-3xl text-center">
                <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">No custom media assets in database yet.</p>
                <p className="text-[10px] text-slate-500 mt-1">Upload illustrations or banners above to use them.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaList.map(asset => (
                  <div key={asset.id} className="bg-slate-900/50 border border-slate-850 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700/85 transition duration-300">
                    <div className="relative group bg-slate-950/40 h-32 flex items-center justify-center overflow-hidden border-b border-slate-850">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 border border-slate-800 rounded-md text-[8px] font-bold uppercase text-rose-400 tracking-widest">
                        {asset.type}
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="min-w-0 text-left">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{asset.name}</h4>
                        <p className="text-[8px] text-slate-500 font-mono">Uploaded: {new Date(asset.uploadedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyToClipboard(asset.url)}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-extrabold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Copy URL
                        </button>
                        <button
                          onClick={() => handleMediaDelete(asset.id)}
                          className="p-1.5 bg-red-950/20 hover:bg-red-900/20 text-red-400 border border-red-950/30 rounded-lg transition cursor-pointer"
                          title="Delete asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- Ambulances Services Directory CRUD View --- */}
      {activeSubTab === 'ambulances' && (
        <div className="space-y-6">
          
          {/* Header Action Bar */}
          <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-2xl">
            <div className="text-left">
              <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">Ambulance Service Provider Index</h3>
              <p className="text-[10px] text-slate-400">Manage registered emergency transport and clinical critical care vehicles.</p>
            </div>
            {!creatingAmbulance && (
              <button
                onClick={startCreateAmbulance}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/20"
              >
                <Plus className="w-4 h-4" /> Add Ambulance Provider
              </button>
            )}
          </div>

          {/* Form to Add/Edit Ambulance */}
          {creatingAmbulance && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-slate-900/50 border border-slate-800 p-5 sm:p-6 rounded-2xl text-left"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 border-b border-slate-800 pb-2 mb-4">
                {editingAmbulance ? '📝 Edit Ambulance Service Details' : '🚑 Register New Ambulance Provider'}
              </h4>

              <form onSubmit={handleAmbulanceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Ambulance Provider Name</label>
                    <input
                      type="text"
                      required
                      value={ambulanceForm.name}
                      onChange={(e) => setAmbulanceForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                      placeholder="e.g. Dhaka Red Crescent Ambulance"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Emergency Hotlines Number</label>
                    <input
                      type="text"
                      required
                      value={ambulanceForm.contactPhone}
                      onChange={(e) => setAmbulanceForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs font-mono font-bold text-emerald-400"
                      placeholder="e.g. +88017XXXXXXXX"
                    />
                  </div>

                  <div className="md:col-span-2 bg-slate-950/20 p-4 border border-slate-850 rounded-xl">
                    <LocationSelector
                      division={ambulanceForm.division}
                      district={ambulanceForm.district}
                      upazila={ambulanceForm.upazila}
                      policeStation={ambulanceForm.policeStation}
                      onChange={(field, val) => setAmbulanceForm(prev => ({ ...prev, [field]: val }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Service Coverage Area Details</label>
                    <input
                      type="text"
                      value={ambulanceForm.serviceArea}
                      onChange={(e) => setAmbulanceForm(prev => ({ ...prev, serviceArea: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                      placeholder="e.g. Dhaka Division & Nationwide coverage"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Operating Opening Hours</label>
                    <input
                      type="text"
                      value={ambulanceForm.openingHours}
                      onChange={(e) => setAmbulanceForm(prev => ({ ...prev, openingHours: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                      placeholder="e.g. 24 Hours/7 Days Service"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 font-bold block mb-2">Available Transport Types</label>
                    <div className="flex flex-wrap gap-2">
                      {['AC Ambulance', 'Non-AC Ambulance', 'ICU Support', 'Freezer Ambulance', 'Cardiac ICU Care', 'Neonatal Care'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleAmbulanceType(type)}
                          className={`px-3 py-1.5 border rounded-xl text-[10px] font-bold transition-colors cursor-pointer ${
                            ambulanceForm.availableTypes.includes(type)
                              ? 'bg-rose-600/20 border-rose-500 text-rose-400 font-extrabold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 font-bold block mb-1">Base Hub Address</label>
                    <input
                      type="text"
                      required
                      value={ambulanceForm.address}
                      onChange={(e) => setAmbulanceForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg p-2.5 outline-none focus:border-rose-500 text-xs"
                      placeholder="Hub physical address location"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingAmbulance(false);
                      setEditingAmbulance(null);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-rose-950/30 cursor-pointer disabled:opacity-40"
                  >
                    {editingAmbulance ? 'Update Details' : 'Save Ambulance'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Ambulances List Table */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4">Ambulance Service</th>
                    <th className="p-4">Region Location</th>
                    <th className="p-4">Emergency Hotline</th>
                    <th className="p-4">Available Fleet Types</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {ambulances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                        No ambulance providers registered in system directory.
                      </td>
                    </tr>
                  ) : (
                    ambulances.map(amb => (
                      <tr key={amb.id} className="hover:bg-slate-900/20 transition">
                        <td className="p-4 font-bold text-slate-200">
                          <div>{amb.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5">{amb.address}</div>
                        </td>
                        <td className="p-4 font-semibold text-slate-300">
                          <div>{amb.upazila}, {amb.district}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{amb.division} Division</div>
                        </td>
                        <td className="p-4 text-emerald-400 font-mono font-bold">
                          {amb.contactPhone}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {amb.availableTypes?.map(type => (
                              <span key={type} className="px-2 py-0.5 bg-slate-950/40 border border-slate-800 text-slate-400 text-[9px] font-bold rounded-md">
                                {type}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => startEditAmbulance(amb)}
                              className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleAmbulanceDelete(amb.id)}
                              className="p-1.5 bg-red-950/20 hover:bg-red-900/20 text-red-400 rounded-xl border border-red-950/30 cursor-pointer"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
