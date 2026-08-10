'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api, setAdminToken, getAdminToken } from '../lib/api';
import { User, BloodRequest, Hospital, BloodBank, PlatformStats, BlogPost, Ambulance, FeatureSetting, FeatureStatus } from '../types';
import { 
  Shield, Users, Activity, Trash2, Edit, Plus, Heart, LogOut, Check, X, 
  Bell, Database, BookOpen, MapPin, Building, Key, AlertTriangle, Search, 
  CheckSquare, Award, Clock, FileText, Globe, Send, UserCheck, RefreshCw,
  Facebook, ExternalLink, Phone, Download, Upload, ShieldCheck, ShieldAlert,
  CheckCircle2, XCircle, AlertCircle, Sliders, Droplet
} from 'lucide-react';
import { BANGLADESH_LOCATIONS } from '../data/bangladesh-locations';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppContext } from '../providers';
import CmsManager from '../components/CmsManager';
import LocationSelector from '../components/LocationSelector';

interface AdminViewProps {
  currentUser: User | null;
  allRequests: BloodRequest[];
  onRefreshRequests: () => void;
}

interface AdminSession {
  id: string;
  username: string;
  name: string;
  role: 'super-admin' | 'moderator';
  createdAt: string;
}

interface AdminActivityLog {
  id: string;
  timestamp: string;
  adminUsername: string;
  adminRole: 'super-admin' | 'moderator';
  action: string;
  details: string;
}

export default function AdminView({ currentUser, allRequests, onRefreshRequests }: AdminViewProps) {
  const { language, t, translateLocation, formatLocation } = useLanguage();
  
  // Auth state
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const { refreshFeatureFlags } = useAppContext();

  // Panel state
  const [activeTab, setActiveTab] = useState<'analytics' | 'donors' | 'requests' | 'verifications' | 'donor-verification' | 'hospitals' | 'blogs' | 'notifications' | 'logs' | 'cms' | 'ambulances' | 'features'>('analytics');
  
  // Feature management state
  const [featureSettings, setFeatureSettings] = useState<FeatureSetting[]>([]);
  const [updatingFeatureKey, setUpdatingFeatureKey] = useState<string | null>(null);
  
  // Manual donor verification states
  const [verifyingUser, setVerifyingUser] = useState<User | null>(null);
  const [verificationMode, setVerificationMode] = useState<'verify' | 'reject'>('verify');
  const [verificationNote, setVerificationNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [customRejectionReason, setCustomRejectionReason] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const [verifySearchQuery, setVerifySearchQuery] = useState('');
  const [verifyStatusFilter, setVerifyStatusFilter] = useState<'all' | 'verified' | 'rejected' | 'pending'>('all');
  const [verifyBloodFilter, setVerifyBloodFilter] = useState<string>('all');
  const [verifyPage, setVerifyPage] = useState(1);
  const itemsPerPage = 10;

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [donors, setDonors] = useState<User[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [blogsList, setBlogsList] = useState<BlogPost[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  
  // UI UX state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('All');
  
  // Modals / Editors state
  const [editingDonor, setEditingDonor] = useState<User | null>(null);
  const [editingRequest, setEditingRequest] = useState<BloodRequest | null>(null);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [creatingHospital, setCreatingHospital] = useState(false);
  const [editingBloodBank, setEditingBloodBank] = useState<BloodBank | null>(null);
  const [creatingBloodBank, setCreatingBloodBank] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);
  const [creatingAmbulance, setCreatingAmbulance] = useState(false);

  // Notification Queue & Logs State
  const [notifLogs, setNotifLogs] = useState<any[]>([]);
  const [notifStats, setNotifStats] = useState({ total: 0, totalSent: 0, failedCount: 0, pendingCount: 0 });
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [retryingLogs, setRetryingLogs] = useState(false);
  
  // Blog Editor State
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [creatingBlog, setCreatingBlog] = useState(false);
  const [blogFormData, setBlogFormData] = useState({
    category: 'Health & Awareness',
    tags: 'Blood Donation, Save Lives, Bangladesh',
    featuredImageIdea: 'A visual represention of hope and medical care.',
    en: {
      seoTitle: '',
      metaTitle: '',
      metaDescription: '',
      introduction: '',
      conclusion: '',
      cta: ''
    },
    bn: {
      seoTitle: '',
      metaTitle: '',
      metaDescription: '',
      introduction: '',
      conclusion: '',
      cta: ''
    }
  });

  // Notification Broadcast state
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    bloodGroup: '',
    targetUser: ''
  });
  const [broadcasting, setBroadcasting] = useState(false);

  // Bulk operations & CSV import/export states
  const [selectedAmbulanceIds, setSelectedAmbulanceIds] = useState<string[]>([]);

  // Check existing session on mount
  useEffect(() => {
    const verifySession = async () => {
      const token = getAdminToken();
      if (!token) {
        setCheckingSession(false);
        return;
      }
      try {
        const response = await api.admin.me();
        setSession(response.admin);
      } catch (err) {
        console.error('Session verification failed, clearing tokens:', err);
        setAdminToken(null);
      } finally {
        setCheckingSession(false);
      }
    };
    verifySession();
  }, []);

  // Fetch admin databases based on active tab
  const refreshDatabase = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'analytics') {
        const platformStats = await api.admin.stats();
        setStats(platformStats);
      } else if (activeTab === 'donors' || activeTab === 'verifications' || activeTab === 'donor-verification') {
        const userList = await api.admin.users();
        setDonors(userList);
      } else if (activeTab === 'hospitals') {
        const hospList = await api.directories.hospitals();
        setHospitals(hospList);
      } else if (activeTab === 'blogs') {
        const blogs = await api.blogs.list();
        setBlogsList(blogs);
      } else if (activeTab === 'logs') {
        const logs = await api.admin.logs();
        setActivityLogs(logs);
      } else if (activeTab === 'ambulances') {
        const ambList = await api.ambulances.list();
        setAmbulances(ambList || []);
      } else if (activeTab === 'features') {
        const featRes = await api.featureSettings.getAdmin();
        setFeatureSettings(featRes?.data || []);
      } else if (activeTab === 'notifications') {
        setLoadingLogs(true);
        try {
          const logData = await api.notificationLogs.getLogs();
          setNotifLogs(logData.logs || []);
          setNotifStats(logData.stats || { total: 0, totalSent: 0, failedCount: 0, pendingCount: 0 });
        } catch (lErr) {
          console.error('Failed to load notification queue logs:', lErr);
        } finally {
          setLoadingLogs(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Database error occurred. Please refresh panel.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeatureStatus = async (featureKey: string, status: FeatureStatus) => {
    if (session?.role !== 'super-admin') {
      setError('Super Admin privileges are required to modify feature visibility settings.');
      return;
    }
    setUpdatingFeatureKey(featureKey);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.featureSettings.updateAdmin({ featureKey, status });
      const updated = res.data;
      setFeatureSettings(prev => prev.map(f => f.featureKey === featureKey ? updated : f));
      await refreshFeatureFlags();
      setSuccess(`Feature '${featureKey}' status updated to ${status}.`);
    } catch (err: any) {
      setError(err.message || `Failed to update feature status for '${featureKey}'.`);
    } finally {
      setUpdatingFeatureKey(null);
    }
  };

  const handleRetryFailedLogs = async () => {
    setRetryingLogs(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.notificationLogs.retryFailed();
      setSuccess(res.message);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to retry notification queue.');
    } finally {
      setRetryingLogs(false);
    }
  };

  useEffect(() => {
    refreshDatabase();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, session]);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const response = await api.admin.login(loginCreds);
      setAdminToken(response.token);
      setSession(response.admin);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid username or password. Access Denied.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Secure Logout
  const handleAdminLogout = () => {
    setAdminToken(null);
    setSession(null);
    setSuccess(null);
    setError(null);
  };

  // RBAC permissions helper
  const isSuperAdmin = session?.role === 'super-admin';

  // Toggle Donor admin privilege
  const handleToggleAdminStatus = async (userId: string, currentVal: boolean) => {
    if (!isSuperAdmin) {
      setError('Super Admin privileges are required to change authorization privileges.');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await api.admin.updateUserRole(userId, !currentVal);
      setSuccess(`Updated security privileges for donor successfully.`);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to update administrative role.');
    }
  };

  // Approve/Reject Donor Verification Docs
  const handleVerifyDonor = async (userId: string, approve: boolean) => {
    setError(null);
    setSuccess(null);
    try {
      await api.admin.verifyDonor(userId, approve);
      setSuccess(approve ? 'Donor medical documents approved and verified.' : 'Verification documents rejected.');
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to complete verification protocol.');
    }
  };

  // Helper to determine donor status
  const getDonorStatus = (user: User): 'verified' | 'rejected' | 'pending' => {
    if (user.isVerified) return 'verified';
    if (user.verificationStatus === 'rejected' || (user.verificationNote && user.verificationNote.toLowerCase().includes('reject'))) {
      return 'rejected';
    }
    return 'pending';
  };

  // Close verification modal and reset state
  const closeVerificationModal = () => {
    setVerifyingUser(null);
    setVerificationMode('verify');
    setVerificationNote('');
    setRejectionReason('');
    setCustomRejectionReason('');
    setIsConfirming(false);
  };

  // Handle Admin Verification Approval / Rejection Submit
  const handleVerificationSubmit = async () => {
    if (!session || !verifyingUser) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const isVerified = verificationMode === 'verify';
      let noteToSave = '';

      if (isVerified) {
        noteToSave = verificationNote.trim();
      } else {
        const selectedReason = rejectionReason === 'Other' ? customRejectionReason.trim() : rejectionReason;
        const extraNote = verificationNote.trim();
        noteToSave = `Rejected: ${selectedReason}${extraNote ? ` (${extraNote})` : ''}`;
      }

      const response = await api.admin.manualVerifyDonor(verifyingUser.id, isVerified, noteToSave);

      if (response.success) {
        setDonors(prev => prev.map(u => u.id === verifyingUser.id ? {
          ...u,
          ...response.user,
          isVerified,
          verifiedAt: isVerified ? new Date().toISOString() : null,
          verifiedBy: isVerified ? session.username : null,
          verificationNote: noteToSave,
          verificationStatus: isVerified ? 'approved' : 'rejected'
        } : u));

        if (isVerified) {
          setSuccess('Donor verified successfully.');
        } else {
          setSuccess('Verification request rejected.');
        }
      }

      closeVerificationModal();
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Donor (Super Admin only)
  const handleDeleteDonor = async (userId: string) => {
    if (!isSuperAdmin) {
      setError('Super Admin authority required to expunge database records.');
      return;
    }
    if (!window.confirm('CRITICAL AUDIT NOTICE: Are you absolutely certain you want to permanently delete this donor? All data will be expunged.')) return;
    setError(null);
    setSuccess(null);
    try {
      await api.admin.deleteUser(userId);
      setSuccess('Donor record cleanly expunged from the main directory.');
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Deletion failure.');
    }
  };

  // Delete Blood Campaign (Super Admin only)
  const handleDeleteRequest = async (id: string) => {
    if (!isSuperAdmin) {
      setError('Super Admin authority required to delete requests.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this blood request campaign?')) return;
    setError(null);
    setSuccess(null);
    try {
      await api.admin.deleteRequest(id);
      setSuccess('Campaign request removed.');
      onRefreshRequests();
    } catch (err: any) {
      setError(err.message || 'Deletion failure.');
    }
  };

  // Approve / Reject a blood request campaign
  const handleSetRequestStatus = async (id: string, status: 'pending' | 'fulfilled' | 'cancelled' | 'rejected') => {
    setError(null);
    setSuccess(null);
    try {
      await api.requests.updateStatus(id, status);
      setSuccess(`Blood request campaign status updated to: ${status}.`);
      onRefreshRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to update campaign status.');
    }
  };

  // Save Donor details edits
  const handleSaveDonorEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonor) return;
    setError(null);
    setSuccess(null);
    try {
      await api.admin.updateUser(editingDonor.id, editingDonor);
      setSuccess('Donor details successfully updated.');
      setEditingDonor(null);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to update donor details.');
    }
  };

  // Save Blood request campaign details edits
  const handleSaveRequestEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    setError(null);
    setSuccess(null);
    try {
      await api.admin.updateRequest(editingRequest.id, editingRequest);
      setSuccess('Blood campaign updated.');
      setEditingRequest(null);
      onRefreshRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to update campaign details.');
    }
  };

  // Create Hospital
  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.admin.createHospital(editingHospital);
      setSuccess('Hospital listing successfully created.');
      setCreatingHospital(false);
      setEditingHospital(null);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to record hospital listing.');
    }
  };

  // Edit Hospital
  const handleSaveHospitalEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHospital) return;
    setError(null);
    setSuccess(null);
    try {
      await api.admin.updateHospital(editingHospital.id, editingHospital);
      setSuccess('Hospital listing updated successfully.');
      setEditingHospital(null);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to save hospital listing changes.');
    }
  };

  // Delete Hospital (Super Admin only)
  const handleDeleteHospital = async (id: string) => {
    if (!isSuperAdmin) {
      setError('Super Admin authority required to delete directory listings.');
      return;
    }
    if (!window.confirm('Delete hospital entry from database?')) return;
    setError(null);
    setSuccess(null);
    try {
      await api.admin.deleteHospital(id);
      setSuccess('Hospital listing deleted.');
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to delete hospital.');
    }
  };

  // Create Ambulance
  const handleCreateAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmbulance) return;
    setError(null);
    setSuccess(null);

    // Prevent duplicate phone numbers
    const normPhone = editingAmbulance.contactPhone.replace(/\D/g, '').replace(/^(88|0)/, '');
    const isDup = ambulances.some(amb => amb.contactPhone.replace(/\D/g, '').replace(/^(88|0)/, '') === normPhone);
    if (isDup) {
      setError(language === 'bn' ? 'এই ফোন নম্বরটি ইতিমধ্যে অন্য একটি অ্যাম্বুলেন্স সার্ভিসের জন্য ব্যবহার করা হয়েছে।' : 'This contact phone number is already registered for another ambulance service.');
      return;
    }

    try {
      await api.ambulances.create(editingAmbulance);
      setSuccess('Ambulance listing successfully created.');
      setCreatingAmbulance(false);
      setEditingAmbulance(null);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to record ambulance listing.');
    }
  };

  // Edit Ambulance
  const handleSaveAmbulanceEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAmbulance) return;
    setError(null);
    setSuccess(null);

    // Prevent duplicate phone numbers
    const normPhone = editingAmbulance.contactPhone.replace(/\D/g, '').replace(/^(88|0)/, '');
    const isDup = ambulances.some(amb => amb.id !== editingAmbulance.id && amb.contactPhone.replace(/\D/g, '').replace(/^(88|0)/, '') === normPhone);
    if (isDup) {
      setError(language === 'bn' ? 'এই ফোন নম্বরটি ইতিমধ্যে অন্য একটি অ্যাম্বুলেন্স সার্ভিসের জন্য ব্যবহার করা হয়েছে।' : 'This contact phone number is already registered for another ambulance service.');
      return;
    }

    try {
      await api.ambulances.update(editingAmbulance.id, editingAmbulance);
      setSuccess('Ambulance profile updated successfully.');
      setEditingAmbulance(null);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to save ambulance listing changes.');
    }
  };

  // Delete Ambulance (Super Admin only)
  const handleDeleteAmbulance = async (id: string) => {
    if (!isSuperAdmin) {
      setError('Super Admin authority required to delete directory listings.');
      return;
    }
    if (!window.confirm('Delete ambulance entry from database?')) return;
    setError(null);
    setSuccess(null);
    try {
      await api.ambulances.delete(id);
      setSuccess('Ambulance listing deleted successfully.');
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to delete ambulance.');
    }
  };

  // Division cascade for ambulance form
  const handleAmbulanceFormDivisionChange = (div: string) => {
    if (!editingAmbulance) return;
    setEditingAmbulance({
      ...editingAmbulance,
      division: div,
      district: '',
      upazila: '',
    });
  };

  // District cascade for ambulance form
  const handleAmbulanceFormDistrictChange = (dist: string) => {
    if (!editingAmbulance) return;
    setEditingAmbulance({
      ...editingAmbulance,
      district: dist,
      upazila: '',
    });
  };

  // Service Type toggling for ambulance form
  const handleTypeToggle = (type: string) => {
    if (!editingAmbulance) return;
    const currentTypes = editingAmbulance.availableTypes || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    setEditingAmbulance({
      ...editingAmbulance,
      availableTypes: updatedTypes,
    });
  };

  // Bulk operations & CSV import/export handlers for Ambulances
  const handleBulkActivate = async () => {
    if (selectedAmbulanceIds.length === 0) return;
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      await Promise.all(
        selectedAmbulanceIds.map(async (id) => {
          const amb = ambulances.find(a => a.id === id);
          if (amb) {
            await api.ambulances.update(id, { ...amb, isActive: true });
          }
        })
      );
      setSuccess(`Successfully activated ${selectedAmbulanceIds.length} ambulance(s).`);
      setSelectedAmbulanceIds([]);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to bulk activate.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedAmbulanceIds.length === 0) return;
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      await Promise.all(
        selectedAmbulanceIds.map(async (id) => {
          const amb = ambulances.find(a => a.id === id);
          if (amb) {
            await api.ambulances.update(id, { ...amb, isActive: false });
          }
        })
      );
      setSuccess(`Successfully deactivated ${selectedAmbulanceIds.length} ambulance(s).`);
      setSelectedAmbulanceIds([]);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to bulk deactivate.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAmbulanceIds.length === 0) return;
    if (!isSuperAdmin) {
      setError('Super Admin authority required to delete database listings.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedAmbulanceIds.length} selected ambulance(s)?`)) return;
    setError(null);
    setSuccess(null);
    try {
      setLoading(true);
      await Promise.all(selectedAmbulanceIds.map(id => api.ambulances.delete(id)));
      setSuccess(`Successfully deleted ${selectedAmbulanceIds.length} ambulance(s).`);
      setSelectedAmbulanceIds([]);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to bulk delete.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAmbulancesCSV = () => {
    const headers = [
      'id', 'name', 'division', 'district', 'upazila', 'address', 'contactPhone', 
      'serviceArea', 'availableTypes', 'openingHours', 'provider', 'isAvailable247', 
      'whatsapp', 'googleMapsLink', 'averageResponseTime', 'imageUrl', 'isVerified', 
      'isActive', 'driverName', 'orgLogoUrl', 'vehicleNumber', 'startingFare', 
      'paymentMethods', 'emergencyContactPerson', 'liveStatus', 'coverageRadius', 'isFeatured'
    ];

    const rows = ambulances.map(amb => [
      amb.id,
      `"${(amb.name || '').replace(/"/g, '""')}"`,
      amb.division,
      amb.district,
      amb.upazila,
      `"${(amb.address || '').replace(/"/g, '""')}"`,
      amb.contactPhone,
      `"${(amb.serviceArea || '').replace(/"/g, '""')}"`,
      `"${(amb.availableTypes || []).join(',')}"`,
      `"${(amb.openingHours || '').replace(/"/g, '""')}"`,
      amb.provider || 'Private',
      amb.isAvailable247 ? 'true' : 'false',
      amb.whatsapp || '',
      `"${(amb.googleMapsLink || '').replace(/"/g, '""')}"`,
      amb.averageResponseTime || '',
      `"${(amb.imageUrl || '').replace(/"/g, '""')}"`,
      amb.isVerified ? 'true' : 'false',
      amb.isActive !== false ? 'true' : 'false',
      `"${(amb.driverName || '').replace(/"/g, '""')}"`,
      `"${(amb.orgLogoUrl || '').replace(/"/g, '""')}"`,
      `"${(amb.vehicleNumber || '').replace(/"/g, '""')}"`,
      amb.startingFare || '',
      `"${(amb.paymentMethods || []).join(',')}"`,
      `"${(amb.emergencyContactPerson || '').replace(/"/g, '""')}"`,
      amb.liveStatus || 'Available',
      amb.coverageRadius || '',
      amb.isFeatured ? 'true' : 'false'
    ]);

    const csvString = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ambulances_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportAmbulancesCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    setSuccess(null);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target?.result as string;
        if (!csvText) return;
        
        const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length <= 1) {
          setError('CSV file is empty or missing headers.');
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const parsedAmbulances: any[] = [];
        
        // Build set of existing normalized phone numbers for duplicate checking
        const existingPhones = new Set(
          ambulances.map(amb => amb.contactPhone.replace(/\D/g, '').replace(/^(88|0)/, ''))
        );
        const seenInCsv = new Set<string>();
        let skippedDuplicatesCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const row: string[] = [];
          let insideQuote = false;
          let entry = '';
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              insideQuote = !insideQuote;
            } else if (char === ',' && !insideQuote) {
              row.push(entry.trim().replace(/^["']|["']$/g, ''));
              entry = '';
            } else {
              entry += char;
            }
          }
          row.push(entry.trim().replace(/^["']|["']$/g, ''));
          
          if (row.length < 5) continue;
          
          const item: any = {};
          headers.forEach((header, index) => {
            if (index < row.length) {
              item[header] = row[index];
            }
          });
          
          if (!item.name || !item.division || !item.district || !item.upazila || !item.address || !item.contactPhone) {
            continue;
          }

          // Check for phone number duplication
          const normPhone = item.contactPhone.replace(/\D/g, '').replace(/^(88|0)/, '');
          if (existingPhones.has(normPhone) || seenInCsv.has(normPhone)) {
            skippedDuplicatesCount++;
            continue;
          }
          seenInCsv.add(normPhone);
          
          const formattedItem: any = {
            id: item.id || `amb-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            division: item.division,
            district: item.district,
            upazila: item.upazila,
            address: item.address,
            contactPhone: item.contactPhone,
            serviceArea: item.serviceArea || null,
            availableTypes: item.availableTypes ? item.availableTypes.split(',') : ['AC Ambulance'],
            openingHours: item.openingHours || '24 Hours',
            provider: item.provider || 'Private',
            isAvailable247: item.isAvailable247 === 'true' || item.isAvailable247 === '1' || item.isAvailable247 === '',
            whatsapp: item.whatsapp || null,
            googleMapsLink: item.googleMapsLink || null,
            averageResponseTime: item.averageResponseTime || '30 mins',
            imageUrl: item.imageUrl || null,
            isVerified: item.isVerified === 'true' || item.isVerified === '1',
            isActive: item.isActive !== 'false' && item.isActive !== '0',
            driverName: item.driverName || null,
            orgLogoUrl: item.orgLogoUrl || null,
            vehicleNumber: item.vehicleNumber || null,
            startingFare: parseInt(item.startingFare, 10) || 1500,
            paymentMethods: item.paymentMethods ? item.paymentMethods.split(',') : ['Cash'],
            emergencyContactPerson: item.emergencyContactPerson || null,
            liveStatus: item.liveStatus || 'Available',
            coverageRadius: parseInt(item.coverageRadius, 10) || 25,
            isFeatured: item.isFeatured === 'true' || item.isFeatured === '1'
          };
          
          parsedAmbulances.push(formattedItem);
        }
        
        if (parsedAmbulances.length === 0) {
          if (skippedDuplicatesCount > 0) {
            setError(`No records imported. All parsed records (${skippedDuplicatesCount}) were skipped as duplicate phone numbers.`);
          } else {
            setError('No valid ambulance records could be parsed. Check your headers & required fields.');
          }
          return;
        }
        
        setLoading(true);
        setSuccess(`Importing ${parsedAmbulances.length} ambulance records...`);
        
        let importedCount = 0;
        for (const amb of parsedAmbulances) {
          await api.ambulances.create(amb);
          importedCount++;
        }
        
        if (skippedDuplicatesCount > 0) {
          setSuccess(`Successfully imported ${importedCount} ambulance records. Skipped ${skippedDuplicatesCount} duplicates.`);
        } else {
          setSuccess(`Successfully imported ${importedCount} ambulance records.`);
        }
        refreshDatabase();
      } catch (err: any) {
        console.error(err);
        setError('An error occurred during parsing or database insertion: ' + err.message);
      } finally {
        setLoading(false);
        e.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  // Save Blog Create/Edit
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...blogFormData,
        tags: blogFormData.tags.split(',').map(t => t.trim()),
      };
      
      if (creatingBlog) {
        await api.admin.createBlog(payload);
        setSuccess('New health article successfully published.');
      } else if (editingBlog) {
        await api.admin.updateBlog(editingBlog.id, payload);
        setSuccess('Health article updated successfully.');
      }
      
      setCreatingBlog(false);
      setEditingBlog(null);
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to save blog post.');
    }
  };

  // Delete Blog Post
  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this health article?')) return;
    setError(null);
    setSuccess(null);
    try {
      await api.admin.deleteBlog(id);
      setSuccess('Article deleted.');
      refreshDatabase();
    } catch (err: any) {
      setError(err.message || 'Failed to delete article.');
    }
  };

  // Populate blog form data for edit
  const openEditBlog = (post: BlogPost) => {
    setEditingBlog(post);
    setCreatingBlog(false);
    setBlogFormData({
      category: post.category,
      tags: post.tags.join(', '),
      featuredImageIdea: post.featuredImageIdea || '',
      en: { ...post.en },
      bn: { ...post.bn }
    });
  };

  // Open blog create empty form
  const openCreateBlog = () => {
    setCreatingBlog(true);
    setEditingBlog(null);
    setBlogFormData({
      category: 'Health & Awareness',
      tags: 'Blood Donation, Health, Save Lives',
      featuredImageIdea: 'A visual illustration.',
      en: {
        seoTitle: '',
        metaTitle: '',
        metaDescription: '',
        introduction: '',
        conclusion: '',
        cta: ''
      },
      bn: {
        seoTitle: '',
        metaTitle: '',
        metaDescription: '',
        introduction: '',
        conclusion: '',
        cta: ''
      }
    });
  };

  // Handle custom broadasting
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastData.title || !broadcastData.message) {
      setError('Broadcast title and message details are required.');
      return;
    }
    setBroadcasting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.admin.broadcastNotification(broadcastData);
      setSuccess(`Dispatched system broadcast to ${response.count} users successfully.`);
      setBroadcastData({ title: '', message: '', bloodGroup: '', targetUser: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to send broadcast.');
    } finally {
      setBroadcasting(false);
    }
  };

  // Filters calculation
  const filteredDonors = donors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.phone.includes(searchQuery);
    const matchesBlood = bloodGroupFilter === 'All' || d.bloodGroup === bloodGroupFilter;
    return matchesSearch && matchesBlood;
  });

  const filteredRequests = allRequests.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlood = bloodGroupFilter === 'All' || r.bloodGroup === bloodGroupFilter;
    return matchesSearch && matchesBlood;
  });

  // Loading Splash
  if (checkingSession) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-mono">
        <div className="space-y-4 text-center">
          <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
          <p className="text-xs text-rose-300/80 uppercase tracking-widest font-black">
            Verifying Security Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Admin Login Screen
  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600"></div>
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-rose-600/10 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <Shield className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">DonateLife BD</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Secure Administrative Gateway</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Username</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={loginCreds.username}
                  onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                  placeholder="superadmin / moderator"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  value={loginCreds.password}
                  onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-xs text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating Gateway...' : 'Secure Authorization'}
            </button>
          </form>

          <p className="text-[10px] text-slate-500 text-center mt-6 uppercase tracking-wider">
            All attempts are logged with IP & timestamp.
          </p>
        </motion.div>
      </div>
    );
  }

  // Donor Manual Verification Filtering & Pagination
  const filteredVerifyDonors = donors.filter(u => {
    // Search filter
    const matchesSearch = !verifySearchQuery || 
      (u.name && u.name.toLowerCase().includes(verifySearchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(verifySearchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(verifySearchQuery));

    // Status filter (pending, verified, rejected)
    const status = getDonorStatus(u);
    const matchesStatus = verifyStatusFilter === 'all' || verifyStatusFilter === status;

    // Blood group filter
    const matchesBlood = verifyBloodFilter === 'all' || u.bloodGroup === verifyBloodFilter;

    return matchesSearch && matchesStatus && matchesBlood;
  });

  const totalVerifyItems = filteredVerifyDonors.length;
  const totalVerifyPages = Math.ceil(totalVerifyItems / itemsPerPage) || 1;
  const paginatedVerifyDonors = filteredVerifyDonors.slice((verifyPage - 1) * itemsPerPage, verifyPage * itemsPerPage);

  // Dashboard Header Controls
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Admin Title Info Header */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-full filter blur-2xl -z-10"></div>
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-rose-600/10 flex items-center justify-center border border-rose-500/20 shrink-0">
            <Shield className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-100">DonateLife BD Admin Panel</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isSuperAdmin ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {session.role === 'super-admin' ? 'Super Admin' : 'Moderator'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Authorized Session: <strong className="text-slate-200">{session.name}</strong> • Logs enabled</p>
          </div>
        </div>

        <button
          onClick={handleAdminLogout}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold text-rose-400 hover:text-rose-300 rounded-xl transition-all cursor-pointer shadow-md"
        >
          <LogOut className="w-4 h-4" />
          Secure Logout
        </button>
      </div>

      {/* Global Notice Prompts */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-xs text-rose-400">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold uppercase tracking-wider block mb-0.5">Authorization Exception</strong>
            <span>{error}</span>
          </div>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-xs text-emerald-400">
          <Check className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold uppercase tracking-wider block mb-0.5">Protocol Executed</strong>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Responsive Tab Panel Links */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'analytics', label: 'Dashboard Stats', icon: Activity },
          { id: 'donors', label: 'Manage Donors', icon: Users },
          { id: 'donor-verification', label: 'Donor Verification', icon: UserCheck },
          { id: 'requests', label: 'Blood Requests', icon: Heart },
          { id: 'verifications', label: 'Medical Verification', icon: Award },
          { id: 'hospitals', label: 'Hospitals & Directory', icon: Building },
          { id: 'ambulances', label: 'Ambulance Management', icon: Phone },
          { id: 'features', label: 'Feature Management', icon: Sliders },
          { id: 'blogs', label: 'Manage Blogs', icon: BookOpen },
          { id: 'notifications', label: 'Broadcasts', icon: Bell },
          { id: 'logs', label: 'Activity Logs', icon: FileText },
          { id: 'cms', label: 'Content Management (CMS)', icon: Globe }
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setError(null);
                setSuccess(null);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-xl transition-all border shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-rose-600/15 border-rose-500 text-rose-400 font-extrabold shadow-lg shadow-rose-950/20'
                  : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800/80 text-slate-400 hover:text-slate-100'
              }`}
            >
              <IconComp className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Stage content */}
      <div className="min-h-[50vh] relative">
        <AnimatePresence mode="wait">
          {loading && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-40">
              <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Tab Content: Analytics */}
          {activeTab === 'analytics' && stats && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Stats Numerical Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Registered Donors', value: stats.totalDonors, icon: Users, desc: 'Registered on DonateLife BD' },
                  { label: 'Blood Request Campaigns', value: stats.totalRequests, icon: Heart, desc: 'Total emergencies logged' },
                  { label: 'Verified Hospitals Listed', value: stats.totalHospitals, icon: Building, desc: 'Medical service clinics' },
                  { label: 'Successful Matches', value: stats.successfulDonations, icon: CheckSquare, desc: 'Lives directly saved' }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 text-left relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                          <Icon className="w-4.5 h-4.5 text-rose-500" />
                        </div>
                      </div>
                      <p className="text-3xl font-black text-white mt-4">{stat.value}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{stat.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Progress Distribution Breakout Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Blood Group breakout */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">Donor Blood Group Distribution</h3>
                  <div className="space-y-4">
                    {Object.entries(stats.bloodGroupDistribution || {}).map(([group, count]) => {
                      const total = stats.totalDonors || 1;
                      const pct = Math.round(((count as number) / total) * 100);
                      return (
                        <div key={group} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-rose-400">{group} Group</span>
                            <span className="text-slate-400">{count} donors ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                            <div className="h-full bg-gradient-to-r from-rose-600 to-red-500 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Request Status breakout */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">Emergency Campaigns Status Breakout</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'pending', label: 'Active Matching', color: 'bg-amber-500' },
                      { key: 'pending_approval', label: 'Pending Admin Approval', color: 'bg-rose-500' },
                      { key: 'fulfilled', label: 'Fulfilled / Completed', color: 'bg-emerald-500' },
                      { key: 'cancelled', label: 'Cancelled by User', color: 'bg-slate-600' }
                    ].map((status) => {
                      const count = (stats.requestStatusDistribution as any)[status.key] || 0;
                      const total = stats.totalRequests || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={status.key} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-300">{status.label}</span>
                            <span className="text-slate-400">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                            <div className={`h-full ${status.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Tab Content: Donors List */}
          {activeTab === 'donors' && (
            <motion.div 
              key="donors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Search filter panel */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by donor name, email or phone..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
                <select
                  value={bloodGroupFilter}
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none shrink-0"
                >
                  <option value="All">All Blood Groups</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Donors Interactive Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-left">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <th className="px-6 py-4">Donor Profile</th>
                        <th className="px-6 py-4">Blood Info</th>
                        <th className="px-6 py-4">Location (Division)</th>
                        <th className="px-6 py-4">Status & Access</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs">
                      {filteredDonors.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                            No donor database records matched search parameters.
                          </td>
                        </tr>
                      ) : (
                        filteredDonors.map((donor) => (
                          <tr key={donor.id} className="hover:bg-slate-850/40">
                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-200">{donor.name}</p>
                                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                  {donor.donorId || 'DBD-UNKNOWN'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{donor.email} • {donor.phone}</p>
                            </td>
                            <td className="px-6 py-4.5">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-950/20 text-rose-400 font-black border border-rose-500/20">
                                {donor.bloodGroup}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 text-slate-300">
                              <p className="font-semibold text-xs">{formatLocation(donor)}</p>
                            </td>
                            <td className="px-6 py-4.5">
                              <div className="flex flex-wrap gap-1.5">
                                {(donor.isVerified || donor.isDonorVerified) && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <Award className="w-3 h-3" /> Verified
                                  </span>
                                )}
                                {donor.isAdmin && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    <Shield className="w-3 h-3" /> Website Admin
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                  donor.isAvailable ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                                }`}>
                                  {donor.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4.5 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingDonor(donor)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white cursor-pointer"
                                  title="Edit Donor Profile"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                
                                {isSuperAdmin && (
                                  <>
                                    <button
                                      onClick={() => handleToggleAdminStatus(donor.id, donor.isAdmin)}
                                      className={`p-1.5 rounded-lg border cursor-pointer ${
                                        donor.isAdmin 
                                          ? 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-500/30 text-amber-400' 
                                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
                                      }`}
                                      title={donor.isAdmin ? "Revoke Website Admin" : "Grant Website Admin"}
                                    >
                                      <Shield className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDonor(donor.id)}
                                      className="p-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:text-rose-300 cursor-pointer"
                                      title="Delete Donor Account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab Content: Blood Requests */}
          {activeTab === 'requests' && (
            <motion.div 
              key="requests"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Search and filtering */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by patient name or hospital..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
                <select
                  value={bloodGroupFilter}
                  onChange={(e) => setBloodGroupFilter(e.target.value)}
                  className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none shrink-0"
                >
                  <option value="All">All Blood Groups</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Requests Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-left">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <th className="px-6 py-4">Patient details</th>
                        <th className="px-6 py-4">Required Blood</th>
                        <th className="px-6 py-4">Hospital Venue & Date</th>
                        <th className="px-6 py-4">Audit Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs">
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                            No active blood requests matched filters.
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-slate-850/40">
                            <td className="px-6 py-4.5">
                              <p className="font-bold text-slate-200">{request.patientName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Contact: {request.contactPhone} • Units: {request.unitsNeeded}</p>
                            </td>
                            <td className="px-6 py-4.5">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-950/20 text-rose-400 font-black border border-rose-500/20">
                                {request.bloodGroup}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 text-slate-300">
                              <p className="font-semibold">{request.hospitalName}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{request.requiredDate} • {request.unitsNeeded > 2 ? 'URGENT' : 'Standard'}</p>
                            </td>
                            <td className="px-6 py-4.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                                request.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                request.status === 'pending_approval' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' :
                                request.status === 'fulfilled' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                'bg-slate-800 text-slate-500 border-slate-700/50'
                              }`}>
                                {request.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4.5 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingRequest(request)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                                  title="Edit Campaign Details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {request.status === 'pending_approval' && (
                                  <>
                                    <button
                                      onClick={() => handleSetRequestStatus(request.id, 'pending')}
                                      className="p-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                      title="Approve / Publish Campaign"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleSetRequestStatus(request.id, 'rejected')}
                                      className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 cursor-pointer"
                                      title="Reject Campaign"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                {request.status === 'pending' && (
                                  <button
                                    onClick={() => handleSetRequestStatus(request.id, 'fulfilled')}
                                    className="p-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                    title="Mark Campaign as Fulfilled"
                                  >
                                    <CheckSquare className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {isSuperAdmin && (
                                  <button
                                    onClick={() => handleDeleteRequest(request.id)}
                                    className="p-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:text-rose-300 cursor-pointer"
                                    title="Delete Campaign Listing"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab Content: Medical Verification Queue */}
          {activeTab === 'verifications' && (
            <motion.div 
              key="verifications"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 text-left"
            >
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 mb-2">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-rose-500" />
                  Medical Donor Badge Verification Desk
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Review submitted blood donation certificate cards or diagnostic reports. Approving grants the user the prestigious <strong>Medical Verification Badge</strong>, appearing next to their search result and increasing life-saving match priority.
                </p>
              </div>

              {/* Grid of Pending verifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donors.filter(u => u.verificationStatus === 'pending' || u.verificationDocument).length === 0 ? (
                  <div className="col-span-2 bg-slate-900 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
                    Verification desk is clear! No donor verification files are currently pending review.
                  </div>
                ) : (
                  donors.filter(u => u.verificationStatus === 'pending' || u.verificationDocument).map((user) => (
                    <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-slate-200">{user.name}</h4>
                            <p className="text-[10px] text-slate-400">{user.email} • {user.phone}</p>
                          </div>
                          <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 font-black text-xs">
                            {user.bloodGroup}
                          </span>
                        </div>
                        <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" /> Attached Document
                          </p>
                          <div className="p-2 border border-dashed border-slate-800 rounded bg-slate-900/40">
                            <p className="text-[11px] text-slate-300 font-semibold italic truncate">
                              {user.verificationDocument || "Standard Blood Donor ID Card Attachment"}
                            </p>
                            <span className="text-[9px] text-slate-500 mt-1 block">Uploaded: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-800/40 pt-4 flex items-center justify-between gap-3">
                        <div className="text-[10px] font-bold text-slate-400">
                          Status: <span className={`uppercase ${user.verificationStatus === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>{user.verificationStatus || 'pending'}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerifyDonor(user.id, false)}
                            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Reject & Notice
                          </button>
                          <button
                            onClick={() => handleVerifyDonor(user.id, true)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Approve & Badge
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Tab Content: Manual Donor Verification */}
          {activeTab === 'donor-verification' && (
            <motion.div
              key="donor-verification"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left animate-fade-in"
              id="donor-verification-panel"
            >
              {/* Header section */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5" id="verify-hdr">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <UserCheck className="w-5 h-5 text-emerald-500" />
                      Manual Donor Verification Desk
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Manually verify or unverify blood donors to grant them a green <strong>"Verified" Badge</strong>. This increases trust and ensures high reliability for emergency blood seekers.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3 shrink-0">
                    <div className="text-center px-3 border-r border-slate-800">
                      <span className="block text-lg font-black text-slate-200">{donors.length}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Donors</span>
                    </div>
                    <div className="text-center px-3 border-r border-slate-800">
                      <span className="block text-lg font-black text-amber-400">{donors.filter(u => getDonorStatus(u) === 'pending').length}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Pending</span>
                    </div>
                    <div className="text-center px-3 border-r border-slate-800">
                      <span className="block text-lg font-black text-emerald-400">{donors.filter(u => getDonorStatus(u) === 'verified').length}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Verified</span>
                    </div>
                    <div className="text-center px-2">
                      <span className="block text-lg font-black text-rose-400">{donors.filter(u => getDonorStatus(u) === 'rejected').length}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Rejected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between" id="verify-filters-panel">
                {/* Search */}
                <div className="relative w-full md:w-96" id="verify-search-container">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={verifySearchQuery}
                    onChange={(e) => {
                      setVerifySearchQuery(e.target.value);
                      setVerifyPage(1);
                    }}
                    placeholder="Search by Name, Email, or Phone..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                    id="verify-search-input"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end" id="verify-filters-row">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5" id="verify-status-container">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                    <select
                      value={verifyStatusFilter}
                      onChange={(e) => {
                        setVerifyStatusFilter(e.target.value as any);
                        setVerifyPage(1);
                      }}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 focus:outline-hidden focus:border-rose-500 cursor-pointer font-mono"
                      id="verify-status-select"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending (Yellow)</option>
                      <option value="verified">Verified (Green)</option>
                      <option value="rejected">Rejected (Red)</option>
                    </select>
                  </div>

                  {/* Blood Group Dropdown */}
                  <div className="flex items-center gap-1.5" id="verify-blood-container">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood:</span>
                    <select
                      value={verifyBloodFilter}
                      onChange={(e) => {
                        setVerifyBloodFilter(e.target.value);
                        setVerifyPage(1);
                      }}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 focus:outline-hidden focus:border-rose-500 cursor-pointer font-mono"
                      id="verify-blood-select"
                    >
                      <option value="all">All Blood Groups</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* List / Grid of Donors */}
              <div className="bg-slate-900 border border-slate-800/85 rounded-2xl overflow-hidden" id="verify-results-table">
                {paginatedVerifyDonors.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 font-mono text-xs" id="verify-no-results">
                    No matching donors found in the registry. Try adjusting your filters.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/70" id="verify-items-list">
                    {paginatedVerifyDonors.map((user) => (
                      <div key={user.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-850/30 transition-all" id={`verify-row-${user.id}`}>
                        {/* Donor profile card */}
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-rose-500 text-sm shrink-0">
                            {user.bloodGroup}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-200 text-sm">{user.name}</h4>
                              {(() => {
                                const status = getDonorStatus(user);
                                if (status === 'verified') {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                                      <CheckCircle2 className="w-3 h-3 shrink-0" /> Verified
                                    </span>
                                  );
                                } else if (status === 'rejected') {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-[9px] font-black uppercase text-rose-400 tracking-wider">
                                      <XCircle className="w-3 h-3 shrink-0" /> Rejected
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[9px] font-black uppercase text-amber-400 tracking-wider">
                                      <Clock className="w-3 h-3 shrink-0" /> Pending
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {user.email} • {user.phone}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500">
                              <span>District: <strong>{user.district}</strong></span>
                              <span>•</span>
                              <span>Upazila: <strong>{user.upazila}</strong></span>
                              {user.lastDonationDate && (
                                <>
                                  <span>•</span>
                                  <span>Last Donation: <strong className="font-mono">{new Date(user.lastDonationDate).toLocaleDateString()}</strong></span>
                                </>
                              )}
                            </div>

                            {/* Verification logs/details */}
                            {user.verificationNote && (
                              <div className="mt-2 p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1 text-[10px] max-w-xl">
                                {user.verifiedBy && (
                                  <div className="text-slate-400">
                                    Processed by <strong className="text-rose-400">{user.verifiedBy}</strong> on <strong className="text-slate-300 font-mono">{user.verifiedAt ? new Date(user.verifiedAt).toLocaleString() : 'N/A'}</strong>
                                  </div>
                                )}
                                <div className="text-slate-400 italic">
                                  " {user.verificationNote} "
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => {
                              setVerifyingUser(user);
                              setVerificationMode(getDonorStatus(user) === 'verified' ? 'verify' : 'verify');
                              setVerificationNote(user.verificationNote || '');
                              setRejectionReason('');
                              setCustomRejectionReason('');
                              setIsConfirming(false);
                            }}
                            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                            id={`open-verify-modal-btn-${user.id}`}
                          >
                            <UserCheck className="w-4 h-4 text-emerald-400" />
                            <span>Manage Verification</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalVerifyPages > 1 && (
                  <div className="p-4 border-t border-slate-800/70 flex items-center justify-between gap-4" id="verify-pagination">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Showing {(verifyPage - 1) * itemsPerPage + 1} - {Math.min(verifyPage * itemsPerPage, totalVerifyItems)} of {totalVerifyItems} donors
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setVerifyPage(p => Math.max(1, p - 1))}
                        disabled={verifyPage === 1}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 text-xs font-bold rounded-lg text-slate-300 transition-all cursor-pointer"
                        id="verify-prev-page"
                      >
                        Prev
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalVerifyPages }, (_, idx) => idx + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setVerifyPage(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center border cursor-pointer ${
                              verifyPage === p
                                ? 'bg-rose-600/15 border-rose-500 text-rose-400 font-extrabold'
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            }`}
                            id={`verify-page-${p}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setVerifyPage(p => Math.min(totalVerifyPages, p + 1))}
                        disabled={verifyPage === totalVerifyPages}
                        className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-950 text-xs font-bold rounded-lg text-slate-300 transition-all cursor-pointer"
                        id="verify-next-page"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab Content: Hospitals */}
          {activeTab === 'hospitals' && (
            <motion.div 
              key="hospitals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              {/* Directory actions header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400">
                  Manage hospital registry directories and medical centers across Bangladesh.
                </p>
                <button
                  onClick={() => {
                    setCreatingHospital(true);
                    setEditingHospital({
                      id: '',
                      name: '',
                      division: 'Dhaka',
                      district: 'Dhaka',
                      upazila: 'Dhanmondi',
                      address: '',
                      contactPhone: '',
                      services: [],
                      type: 'private'
                    });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Medical Center
                </button>
              </div>

              {/* Grid list of hospitals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospitals.length === 0 ? (
                  <div className="col-span-2 bg-slate-900 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
                    No hospital entries found. Try adding a new listing!
                  </div>
                ) : (
                  hospitals.map((hosp) => (
                    <div key={hosp.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-bold text-slate-400 uppercase tracking-widest">{hosp.type || 'General'}</span>
                            <h4 className="font-extrabold text-slate-200 text-sm mt-1.5">{hosp.name}</h4>
                          </div>
                          <span className="p-1.5 rounded-lg bg-rose-600/10 border border-rose-500/20 shrink-0">
                            <Building className="w-4.5 h-4.5 text-rose-400" />
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs text-slate-400">
                          <p className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                            <span>{hosp.address}, {formatLocation(hosp)}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>Phone Contact: {hosp.contactPhone || 'N/A'}</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {hosp.services?.map((svc, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-[10px] font-semibold text-slate-400">{svc}</span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-800/40 mt-4 pt-3 flex justify-end gap-2">
                        <button
                          onClick={() => setEditingHospital(hosp)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 rounded-lg transition-all cursor-pointer"
                        >
                          Modify details
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleDeleteHospital(hosp.id)}
                            className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-xs font-semibold text-rose-400 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Tab Content: Manage Blogs */}
          {activeTab === 'blogs' && (
            <motion.div 
              key="blogs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              {/* Blog actions header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400">
                  Complete CRUD management of health awareness publications and articles on DonateLife BD.
                </p>
                <button
                  onClick={openCreateBlog}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Create New Article
                </button>
              </div>

              {/* Grid of publications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogsList.length === 0 ? (
                  <div className="col-span-2 bg-slate-900 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
                    No articles found in the system database. Let's draft a new post!
                  </div>
                ) : (
                  blogsList.map((post) => (
                    <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="px-2 py-0.5 bg-rose-600/10 border border-rose-500/20 rounded text-[9px] font-black uppercase tracking-wider text-rose-400">{post.category}</span>
                            <h4 className="font-extrabold text-slate-100 text-sm mt-2">{post.en.seoTitle}</h4>
                          </div>
                          <span className="p-1.5 rounded-lg bg-rose-600/10 border border-rose-500/20 shrink-0">
                            <BookOpen className="w-4.5 h-4.5 text-rose-400" />
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                          {post.en.introduction}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/40">
                          {post.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-950 border border-slate-850 text-[10px] font-semibold text-slate-500 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-800/40 mt-4 pt-3 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-semibold text-slate-500">Slug: {post.slug}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditBlog(post)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-300 rounded-lg transition-all cursor-pointer"
                          >
                            Edit draft
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(post.id)}
                            className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-[11px] font-semibold text-rose-400 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Tab Content: Broadcast Custom Notifications & Notification Logs */}
          {activeTab === 'notifications' && (
            <motion.div 
              key="notifications"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 text-left"
            >
              {/* Notification Center Stats Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Emails Sent</span>
                  <p className="text-2xl font-black text-emerald-400 mt-2">{notifStats.totalSent}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Failed Emails</span>
                  <p className="text-2xl font-black text-rose-500 mt-2">{notifStats.failedCount}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pending Queue</span>
                  <p className="text-2xl font-black text-amber-400 mt-2">{notifStats.pendingCount}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-center">
                  <button
                    onClick={handleRetryFailedLogs}
                    disabled={retryingLogs || notifStats.failedCount === 0}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${retryingLogs ? 'animate-spin' : ''}`} />
                    {retryingLogs ? 'Retrying Failed Queue...' : 'Retry Failed Emails'}
                  </button>
                </div>
              </div>

              {/* Notification Queue & Audit Logs Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Bell className="w-4 h-4 text-rose-500" />
                      Email & Match Notification Dispatch Logs
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Audit log of all emergency match email dispatches, deduplication status, and delivery error messages.</p>
                  </div>
                  <button
                    onClick={refreshDatabase}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-lg transition"
                  >
                    Refresh Logs
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <th className="px-4 py-3.5">Sent Time</th>
                        <th className="px-4 py-3.5">Donor ID / User</th>
                        <th className="px-4 py-3.5">Recipient Email</th>
                        <th className="px-4 py-3.5">Request ID</th>
                        <th className="px-4 py-3.5">Type</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Details / Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300 font-mono">
                      {notifLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-sans text-xs">
                            No email notification logs found in queue history.
                          </td>
                        </tr>
                      ) : (
                        notifLogs.map((l) => (
                          <tr key={l.id} className="hover:bg-slate-850/40">
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[10px]">
                              {new Date(l.sentAt || l.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-bold text-rose-400 whitespace-nowrap">
                              {l.donorId}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-300">
                              {l.recipientEmail}
                            </td>
                            <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                              {l.requestId}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold uppercase text-slate-400">
                                {l.type}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  l.status === 'sent'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : l.status === 'failed'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {l.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-[10px] max-w-xs truncate">
                              {l.errorMessage || 'Delivered successfully.'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Broadcast Form Container */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Bell className="w-5.5 h-5.5 text-rose-500" />
                    Broadcasting Communication Hub
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Trigger custom administrative system alerts directly into specified user notification drawers in real-time. Broadcaster accepts targeting parameters.
                  </p>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Target Specific Blood Group (Optional)</label>
                      <select
                        value={broadcastData.bloodGroup}
                        onChange={(e) => setBroadcastData({ ...broadcastData, bloodGroup: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="">Broadcast to All Users</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg} Donors Only</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Specific User Email / ID (Optional)</label>
                      <input 
                        type="text" 
                        value={broadcastData.targetUser}
                        onChange={(e) => setBroadcastData({ ...broadcastData, targetUser: e.target.value })}
                        placeholder="ariffff995@gmail.com"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Notification Title (English)</label>
                    <input 
                      type="text" 
                      value={broadcastData.title}
                      onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                      placeholder="⚠️ High Blood Shortage in Dhaka District!"
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Full Broadcast Message Details</label>
                    <textarea
                      rows={5}
                      value={broadcastData.message}
                      onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                      placeholder="Type details here. For example: A massive emergency requires A+ blood donors at Dhaka Medical College Hospital. Please respond instantly if available."
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4.5 h-4.5" />
                    {broadcasting ? 'Transmitting Broadcast Alert...' : 'Broadcast Alert Protocol'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Tab Content: Platform Activity Logs */}
          {activeTab === 'logs' && (
            <motion.div 
              key="logs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 text-left"
            >
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-5 h-5 text-rose-500" />
                  Gateway Administrative Action Audit Logs
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Immutable, real-time audit logs documenting all administrative interactions, role modification switches, profile deletions, verification grants, and broadcasting events.
                </p>
              </div>

              {/* Action Log List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Administrator</th>
                        <th className="px-6 py-4">Action Type</th>
                        <th className="px-6 py-4">Activity Log Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300 font-mono">
                      {activityLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                            Action logs database is currently empty.
                          </td>
                        </tr>
                      ) : (
                        activityLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-850/40">
                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-[10px]">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-extrabold text-rose-400">@{log.adminUsername}</span>
                              <span className="block text-[8px] text-slate-500 mt-0.5 uppercase tracking-wider">({log.adminRole})</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[9px] font-bold uppercase tracking-wider text-slate-300">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 leading-relaxed text-[11px]">
                              {log.details}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'cms' && (
            <motion.div
              key="cms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CmsManager />
            </motion.div>
          )}

          {/* Tab Content: Ambulances */}
          {activeTab === 'ambulances' && (
            <motion.div 
              key="ambulances"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 text-left"
            >
              {/* Header section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">Ambulance Directory Management</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage CMS-driven Ambulance listings, live availability, bulk updates, and track performance analytics.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {/* CSV Import */}
                  <input 
                    type="file" 
                    id="csv-import-file-selector" 
                    accept=".csv" 
                    onChange={handleImportAmbulancesCSV} 
                    className="hidden" 
                  />
                  <label 
                    htmlFor="csv-import-file-selector" 
                    className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 hover:text-white transition shadow-sm"
                    title="Upload CSV formatted ambulance records"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Import CSV
                  </label>

                  {/* CSV Export */}
                  <button 
                    onClick={handleExportAmbulancesCSV} 
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 hover:text-white transition shadow-sm"
                    title="Export all database ambulances to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>

                  {/* Add ambulance */}
                  <button
                    onClick={() => {
                      setCreatingAmbulance(true);
                      setEditingAmbulance({
                        id: '',
                        name: '',
                        division: 'Dhaka',
                        district: 'Dhaka',
                        upazila: 'Dhanmondi',
                        address: '',
                        contactPhone: '',
                        whatsapp: '',
                        provider: 'Private',
                        isAvailable247: true,
                        serviceArea: '',
                        availableTypes: ['General Ambulance'],
                        openingHours: '24/7',
                        googleMapsLink: '',
                        averageResponseTime: '20-30 mins',
                        imageUrl: '',
                        isVerified: false,
                        isActive: true,
                        updatedAt: new Date().toISOString(),
                        liveStatus: 'Available',
                        startingFare: 2000,
                        driverName: '',
                        vehicleNumber: '',
                        orgLogoUrl: '',
                        emergencyContactPerson: '',
                        coverageRadius: 25,
                        isFeatured: false
                      });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Provider
                  </button>
                </div>
              </div>

              {/* Admin analytics summary widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Registered</span>
                  <div className="text-xl font-black text-rose-500 mt-1">{ambulances.length}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Calls Tracked</span>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    {ambulances.reduce((sum, a) => sum + (a.totalCalls || 0), 0)}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">WhatsApp Inquiries</span>
                  <div className="text-xl font-black text-teal-400 mt-1">
                    {ambulances.reduce((sum, a) => sum + (a.totalWaClicks || 0), 0)}
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Estimated Total Views</span>
                  <div className="text-xl font-black text-indigo-400 mt-1">
                    {ambulances.reduce((sum, a) => sum + Math.max((a.totalCalls || 0) * 3 + (a.totalWaClicks || 0) * 2 + 15, 20), 0)}
                  </div>
                </div>
              </div>

              {/* Bulk Actions Floating Bar if items are selected */}
              {selectedAmbulanceIds.length > 0 && (
                <div className="bg-rose-950/20 border border-rose-500/25 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4" />
                    {selectedAmbulanceIds.length} Ambulance profile(s) selected
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
                    <button
                      onClick={handleBulkActivate}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg transition"
                    >
                      Activate Selected
                    </button>
                    <button
                      onClick={handleBulkDeactivate}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold rounded-lg transition"
                    >
                      Suspend Selected
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-lg transition"
                    >
                      Delete Selected
                    </button>
                    <button
                      onClick={() => setSelectedAmbulanceIds([])}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              )}

              {/* Search box specifically for admin list */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ambulance provider name, region, phone..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Ambulances list view */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden text-left">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <th className="px-4 py-4 w-10 text-center">
                          <input 
                            type="checkbox"
                            checked={ambulances.length > 0 && selectedAmbulanceIds.length === ambulances.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAmbulanceIds(ambulances.map(a => a.id));
                              } else {
                                setSelectedAmbulanceIds([]);
                              }
                            }}
                            className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-rose-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-6 py-4">Ambulance Name</th>
                        <th className="px-6 py-4">Phone & WA</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Verification & Status</th>
                        <th className="px-6 py-4">Analytics Metrics</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs">
                      {ambulances.filter(amb => 
                        amb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        amb.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        amb.contactPhone.includes(searchQuery)
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-mono">
                            No ambulance database records found. Try adding a new provider!
                          </td>
                        </tr>
                      ) : (
                        ambulances.filter(amb => 
                          amb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          amb.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          amb.contactPhone.includes(searchQuery)
                        ).map((amb) => (
                          <tr key={amb.id} className="hover:bg-slate-850/40">
                            <td className="px-4 py-4.5 text-center">
                              <input 
                                type="checkbox"
                                checked={selectedAmbulanceIds.includes(amb.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAmbulanceIds(prev => [...prev, amb.id]);
                                  } else {
                                    setSelectedAmbulanceIds(prev => prev.filter(id => id !== amb.id));
                                  }
                                }}
                                className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-rose-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4.5 flex items-center gap-3">
                              <div className="relative">
                                <img 
                                  src={amb.imageUrl || 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=100&q=80'} 
                                  alt={amb.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                />
                                {amb.orgLogoUrl && (
                                  <img 
                                    src={amb.orgLogoUrl} 
                                    alt="Logo" 
                                    className="w-5 h-5 object-cover rounded-full border border-slate-800 absolute -bottom-1 -right-1 bg-slate-900"
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                                  {amb.name}
                                  {amb.isFeatured && (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black uppercase">Featured</span>
                                  )}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-950 text-slate-400 border border-slate-850">{amb.provider}</span>
                                  {amb.isAvailable247 && <span className="px-1.5 py-0.5 rounded text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20">24/7</span>}
                                  {amb.startingFare && <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">৳{amb.startingFare} up</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4.5">
                              <p className="font-bold text-slate-200">{amb.contactPhone}</p>
                              {amb.whatsapp && <p className="text-[10px] text-emerald-400 font-semibold">WA: {amb.whatsapp}</p>}
                            </td>
                            <td className="px-6 py-4.5 text-slate-300">
                              <p className="font-semibold text-xs">{formatLocation(amb)}</p>
                            </td>
                            <td className="px-6 py-4.5">
                              <div className="flex flex-wrap gap-1.5">
                                {amb.liveStatus === 'Available' || !amb.liveStatus ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    ● Available
                                  </span>
                                ) : amb.liveStatus === 'Busy' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    ● Busy
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                    ● Offline
                                  </span>
                                )}
                                {amb.isVerified ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <Check className="w-3 h-3" /> Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-850 text-slate-500 border border-slate-800">
                                    Unverified
                                  </span>
                                )}
                                {amb.isActive !== false ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    Suspended
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4.5">
                              <div className="space-y-1 font-mono text-[10px]">
                                <p className="text-rose-400">Calls: <strong className="font-bold">{amb.totalCalls || 0}</strong></p>
                                <p className="text-emerald-400">WhatsApp: <strong className="font-bold">{amb.totalWaClicks || 0}</strong></p>
                                <p className="text-indigo-400">Est. Views: <strong className="font-bold">{Math.max((amb.totalCalls || 0) * 3 + (amb.totalWaClicks || 0) * 2 + 15, 20)}</strong></p>
                              </div>
                            </td>
                            <td className="px-6 py-4.5 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingAmbulance({
                                      ...amb,
                                      availableTypes: amb.availableTypes || []
                                    });
                                    setCreatingAmbulance(false);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white cursor-pointer"
                                  title="Edit Ambulance Profile"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {isSuperAdmin && (
                                  <button
                                    onClick={() => handleDeleteAmbulance(amb.id)}
                                    className="p-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:text-rose-300 cursor-pointer"
                                    title="Delete Ambulance listing"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 12: FEATURE VISIBILITY MANAGEMENT CONTROL PANEL                     */}
          {/* ========================================================================= */}
          {activeTab === 'features' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 text-left"
            >
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>System Governance</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-100 tracking-tight">Feature Visibility & Maintenance Control</h2>
                  <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
                    Manage live public visibility, emergency hidden states, and maintenance overlays for directory modules. Route guarding, navigation, search indexes, and SEO sitemaps update dynamically in real time.
                  </p>
                </div>
                <button
                  onClick={refreshDatabase}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync Settings
                </button>
              </div>

              {/* Section: Public Directory Modules */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  Public Directory Modules
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { key: 'hospitals', name: 'Hospitals & Clinics', desc: 'Specialized healthcare facilities, ICU availability, and clinical center directory.', icon: Building },
                    { key: 'blood-banks', name: 'Blood Banks & Storage', desc: 'Official blood repos, component stock telemetry, and lab contacts directory.', icon: Droplet },
                    { key: 'ambulances', name: 'Ambulance Directory', desc: '24/7 emergency ICU, AC, non-AC, and freezer ambulance dispatch roster.', icon: Phone }
                  ].map((mod) => {
                    const setting = featureSettings.find(f => f.featureKey === mod.key);
                    const currentStatus: FeatureStatus = setting
                      ? setting.enabled
                        ? setting.maintenanceMode ? 'Maintenance' : 'Public'
                        : 'Hidden'
                      : 'Hidden';
                    const isUpdating = updatingFeatureKey === mod.key;
                    const ModIcon = mod.icon;

                    return (
                      <div
                        key={mod.key}
                        className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                          currentStatus === 'Public'
                            ? 'bg-slate-900/90 border-emerald-500/30 shadow-lg shadow-emerald-950/10'
                            : currentStatus === 'Maintenance'
                            ? 'bg-slate-900/90 border-amber-500/30 shadow-lg shadow-amber-950/10'
                            : 'bg-slate-950/80 border-slate-850 opacity-85'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-rose-400">
                                <ModIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-slate-100">{mod.name}</h4>
                                <p className="text-[10px] font-mono text-slate-500">{mod.key}</p>
                              </div>
                            </div>

                            {currentStatus === 'Public' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                Public
                              </span>
                            )}
                            {currentStatus === 'Maintenance' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                Maintenance
                              </span>
                            )}
                            {currentStatus === 'Hidden' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                Hidden
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">{mod.desc}</p>
                        </div>

                        {/* Action Pill Controls */}
                        <div className="pt-3 border-t border-slate-800/80 space-y-2">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
                            Select Visibility Mode
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                            {(['Public', 'Hidden', 'Maintenance'] as FeatureStatus[]).map((st) => (
                              <button
                                key={st}
                                disabled={isUpdating || !isSuperAdmin}
                                onClick={() => handleUpdateFeatureStatus(mod.key, st)}
                                className={`py-2 px-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center ${
                                  currentStatus === st
                                    ? st === 'Public'
                                      ? 'bg-emerald-600 text-white shadow'
                                      : st === 'Maintenance'
                                      ? 'bg-amber-600 text-white shadow'
                                      : 'bg-slate-700 text-slate-100 shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                          {setting?.updatedAt && (
                            <p className="text-[9px] text-slate-500 font-mono pt-1">
                              Updated: {new Date(setting.updatedAt).toLocaleString()} {setting.updatedBy ? `by ${setting.updatedBy}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section: Future Expansion Modules */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-500" />
                  Future Ecosystem Modules
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featureSettings
                    .filter(f => !['hospitals', 'blood-banks', 'ambulances'].includes(f.featureKey))
                    .map((setting) => {
                      const currentStatus: FeatureStatus = setting.enabled
                        ? setting.maintenanceMode ? 'Maintenance' : 'Public'
                        : 'Hidden';
                      const isUpdating = updatingFeatureKey === setting.featureKey;

                      return (
                        <div
                          key={setting.featureKey}
                          className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-200">{setting.name || setting.featureKey}</h4>
                              <p className="text-[9px] font-mono text-slate-500">{setting.featureKey}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              currentStatus === 'Public'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : currentStatus === 'Maintenance'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {currentStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                            {(['Public', 'Hidden', 'Maintenance'] as FeatureStatus[]).map((st) => (
                              <button
                                key={st}
                                disabled={isUpdating || !isSuperAdmin}
                                onClick={() => handleUpdateFeatureStatus(setting.featureKey, st)}
                                className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded transition-all cursor-pointer text-center ${
                                  currentStatus === st
                                    ? st === 'Public'
                                      ? 'bg-emerald-600 text-white'
                                      : st === 'Maintenance'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-slate-700 text-slate-100'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL / SLIDE DRAWERS OVERLAYS */}
      <AnimatePresence>
        
        {/* Donor Editor Modal */}
        {editingDonor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-rose-500" /> Modify Donor Details
                </h3>
                <button onClick={() => setEditingDonor(null)} className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSaveDonorEdits} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={editingDonor.name}
                      onChange={(e) => setEditingDonor({ ...editingDonor, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      value={editingDonor.phone}
                      onChange={(e) => setEditingDonor({ ...editingDonor, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Blood Group</label>
                    <select
                      value={editingDonor.bloodGroup}
                      onChange={(e) => setEditingDonor({ ...editingDonor, bloodGroup: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Division</label>
                    <input 
                      type="text" 
                      value={editingDonor.division}
                      onChange={(e) => setEditingDonor({ ...editingDonor, division: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">District</label>
                    <input 
                      type="text" 
                      value={editingDonor.district}
                      onChange={(e) => setEditingDonor({ ...editingDonor, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Upazila</label>
                    <input 
                      type="text" 
                      value={editingDonor.upazila}
                      onChange={(e) => setEditingDonor({ ...editingDonor, upazila: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Facebook Profile URL / Username</label>
                    <input 
                      type="text" 
                      value={editingDonor.facebookUrl || ''}
                      onChange={(e) => setEditingDonor({ ...editingDonor, facebookUrl: e.target.value })}
                      placeholder="e.g. facebook.com/username"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-xs"
                    />
                  </div>
                  <div className="flex items-end pb-3 pl-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={editingDonor.showFacebook !== false}
                        onChange={(e) => setEditingDonor({ ...editingDonor, showFacebook: e.target.checked })}
                        className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-rose-500"
                      />
                      <span className="text-[10px] font-bold text-slate-300 uppercase">Show Facebook on Directory</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40">
                  <input 
                    type="checkbox" 
                    id="isAvail" 
                    checked={editingDonor.isAvailable}
                    onChange={(e) => setEditingDonor({ ...editingDonor, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-rose-500"
                  />
                  <label htmlFor="isAvail" className="text-[11px] font-bold text-slate-300 uppercase select-none">Available for instant matching alerts</label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800/40">
                  <button type="button" onClick={() => setEditingDonor(null)} className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg font-bold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-bold rounded-lg cursor-pointer">Save Donor Details</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Redesigned Donor Verification Approval Workflow Modal */}
        {verifyingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-left" id="verify-modal-overlay">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col"
              id="verify-modal"
            >
              {/* Top Glowing Ambient Border */}
              <div className={`h-1.5 w-full transition-colors duration-300 ${
                verificationMode === 'verify' 
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-rose-500 via-red-600 to-rose-600'
              }`} />

              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
                <div>
                  <h3 className="text-base font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    {verificationMode === 'verify' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    )}
                    Donor Verification Approval Workflow
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Review and manage donor verification status for emergency directory
                  </p>
                </div>
                <button 
                  onClick={closeVerificationModal}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                  id="close-verify-modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                
                {/* Donor Summary Info Card */}
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-rose-500 text-sm shrink-0">
                        {verifyingUser.bloodGroup}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-100 text-sm">{verifyingUser.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">{verifyingUser.email} • {verifyingUser.phone}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {(() => {
                      const status = getDonorStatus(verifyingUser);
                      if (status === 'verified') {
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-black uppercase text-emerald-400 tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        );
                      } else if (status === 'rejected') {
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs font-black uppercase text-rose-400 tracking-wider">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-black uppercase text-amber-400 tracking-wider">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        );
                      }
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-t border-slate-850 pt-2 font-mono">
                    <div>District: <strong className="text-slate-200">{verifyingUser.district || 'N/A'}</strong></div>
                    <div>Upazila: <strong className="text-slate-200">{verifyingUser.upazila || 'N/A'}</strong></div>
                  </div>

                  {verifyingUser.verificationNote && (
                    <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800/60 italic">
                      Existing Note: "{verifyingUser.verificationNote}"
                    </div>
                  )}
                </div>

                {/* Primary Actions Selector Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationMode('verify');
                      setIsConfirming(false);
                    }}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      verificationMode === 'verify'
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                    id="verify-tab-btn"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Verify Donor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationMode('reject');
                      setIsConfirming(false);
                    }}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      verificationMode === 'reject'
                        ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm font-extrabold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }`}
                    id="reject-tab-btn"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Reject Verification
                  </button>
                </div>

                {/* VERIFICATION WORKFLOW MODE */}
                {verificationMode === 'verify' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-200/90 leading-relaxed">
                        Verifying this donor will attach a green <strong className="text-emerald-400">"Verified" Badge</strong> to their profile across search results and emergency matching.
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Admin Note (Optional)
                      </label>
                      <textarea
                        value={verificationNote}
                        onChange={(e) => setVerificationNote(e.target.value)}
                        placeholder="e.g. Verified donor after reviewing National ID and medical certificate."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[90px]"
                        id="verify-admin-note-input"
                      />
                    </div>
                  </div>
                )}

                {/* REJECTION WORKFLOW MODE */}
                {verificationMode === 'reject' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-rose-200/90 leading-relaxed">
                        Rejecting verification requires choosing a clear rejection reason.
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Select Quick Rejection Reason <span className="text-rose-400">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="rejection-reasons-grid">
                        {[
                          'Invalid Information',
                          'ID Verification Failed',
                          'Duplicate Account',
                          'Medical Ineligible',
                          'Other'
                        ].map((reason) => {
                          const isSelected = rejectionReason === reason;
                          return (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => {
                                setRejectionReason(reason);
                                setIsConfirming(false);
                                if (reason !== 'Other') {
                                  setCustomRejectionReason('');
                                }
                              }}
                              className={`p-3 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-extrabold shadow-sm'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                              }`}
                            >
                              <span>• {reason}</span>
                              {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Reason Input when 'Other' selected */}
                    {rejectionReason === 'Other' && (
                      <div className="animate-fade-in space-y-1.5">
                        <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider">
                          Custom Rejection Reason <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                          value={customRejectionReason}
                          onChange={(e) => {
                            setCustomRejectionReason(e.target.value);
                            setIsConfirming(false);
                          }}
                          placeholder="Please enter custom specific reason for rejection..."
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-rose-500/50 rounded-xl text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 min-h-[80px]"
                          required
                          id="custom-rejection-reason-input"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Additional Admin Note (Optional)
                      </label>
                      <textarea
                        value={verificationNote}
                        onChange={(e) => setVerificationNote(e.target.value)}
                        placeholder="e.g. Additional internal admin notes regarding the rejection..."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 min-h-[70px]"
                        id="reject-admin-note-input"
                      />
                    </div>
                  </div>
                )}

                {/* Confirmation Prompt Step Box */}
                {isConfirming && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border font-bold text-xs space-y-1.5 ${
                      verificationMode === 'verify'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                    id="confirm-step-banner"
                  >
                    <div className="flex items-center gap-2 text-sm font-extrabold">
                      <AlertTriangle className={`w-4 h-4 ${verificationMode === 'verify' ? 'text-emerald-400' : 'text-rose-400'}`} />
                      <span>Confirmation Required</span>
                    </div>
                    <p className="text-slate-200">
                      {verificationMode === 'verify'
                        ? 'Are you sure you want to verify this donor?'
                        : 'Are you sure you want to reject this donor?'}
                    </p>
                  </motion.div>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeVerificationModal}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  id="cancel-verify-modal-btn"
                >
                  Cancel
                </button>

                {verificationMode === 'verify' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isConfirming) {
                        setIsConfirming(true);
                      } else {
                        handleVerificationSubmit();
                      }
                    }}
                    disabled={loading}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    id="confirm-verify-modal-btn"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : isConfirming ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Verification</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✅ Verify Donor</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isConfirming) {
                        setIsConfirming(true);
                      } else {
                        handleVerificationSubmit();
                      }
                    }}
                    disabled={
                      loading ||
                      !rejectionReason ||
                      (rejectionReason === 'Other' && !customRejectionReason.trim())
                    }
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-rose-950/30 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    id="confirm-reject-modal-btn"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : isConfirming ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Confirm Rejection</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>❌ Reject Verification</span>
                      </>
                    )}
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}

        {/* Campaign Request Editor Modal */}
        {editingRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-rose-500" /> Modify Blood Campaign
                </h3>
                <button onClick={() => setEditingRequest(null)} className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSaveRequestEdits} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Patient Name</label>
                    <input 
                      type="text" 
                      value={editingRequest.patientName}
                      onChange={(e) => setEditingRequest({ ...editingRequest, patientName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      value={editingRequest.contactPhone}
                      onChange={(e) => setEditingRequest({ ...editingRequest, contactPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Required Blood Group</label>
                    <select
                      value={editingRequest.bloodGroup}
                      onChange={(e) => setEditingRequest({ ...editingRequest, bloodGroup: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Units Required (Bags)</label>
                    <input 
                      type="number" 
                      value={editingRequest.unitsNeeded}
                      onChange={(e) => setEditingRequest({ ...editingRequest, unitsNeeded: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Hospital Venue</label>
                  <input 
                    type="text" 
                    value={editingRequest.hospitalName}
                    onChange={(e) => setEditingRequest({ ...editingRequest, hospitalName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Date</label>
                    <input 
                      type="date" 
                      value={editingRequest.requiredDate}
                      onChange={(e) => setEditingRequest({ ...editingRequest, requiredDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Reason / Notes</label>
                    <input 
                      type="text" 
                      value={editingRequest.reason}
                      onChange={(e) => setEditingRequest({ ...editingRequest, reason: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800/40">
                  <button type="button" onClick={() => setEditingRequest(null)} className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg font-bold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-bold rounded-lg cursor-pointer">Save Campaign details</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Hospital Create/Edit Modal */}
        {editingHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-rose-500" /> {creatingHospital ? 'Create Hospital Listing' : 'Modify Hospital Listing'}
                </h3>
                <button onClick={() => { setEditingHospital(null); setCreatingHospital(false); }} className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={creatingHospital ? handleCreateHospital : handleSaveHospitalEdits} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Hospital Name</label>
                    <input 
                      type="text" 
                      value={editingHospital.name}
                      onChange={(e) => setEditingHospital({ ...editingHospital, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Registry Type</label>
                    <select
                      value={editingHospital.type}
                      onChange={(e) => setEditingHospital({ ...editingHospital, type: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                    >
                      <option value="public">Government / Public</option>
                      <option value="private">Private Medical Center</option>
                      <option value="blood-bank">Specific Blood Center</option>
                    </select>
                  </div>
                </div>

                <LocationSelector
                  division={editingHospital.division}
                  district={editingHospital.district}
                  upazila={editingHospital.upazila}
                  policeStation={editingHospital.policeStation || ''}
                  onChange={(field, value) => setEditingHospital(prev => prev ? { ...prev, [field]: value } : prev)}
                />

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Contact Phone</label>
                  <input 
                    type="text" 
                    value={editingHospital.contactPhone}
                    onChange={(e) => setEditingHospital({ ...editingHospital, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Full Address Location</label>
                  <input 
                    type="text" 
                    value={editingHospital.address}
                    onChange={(e) => setEditingHospital({ ...editingHospital, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800/40">
                  <button type="button" onClick={() => { setEditingHospital(null); setCreatingHospital(false); }} className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg font-bold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-bold rounded-lg cursor-pointer">Save Listing</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Blog Post Editor Modal (CRUD) */}
        {(creatingBlog || editingBlog) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-left overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 my-8 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-rose-500" /> {creatingBlog ? 'Publish Health Awareness Article' : 'Modify Awareness Article'}
                </h3>
                <button onClick={() => { setCreatingBlog(false); setEditingBlog(null); }} className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSaveBlog} className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
                {/* Meta details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Category Category</label>
                    <input 
                      type="text" 
                      value={blogFormData.category}
                      onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                      placeholder="Health & Awareness"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Comma-separated tags</label>
                    <input 
                      type="text" 
                      value={blogFormData.tags}
                      onChange={(e) => setBlogFormData({ ...blogFormData, tags: e.target.value })}
                      placeholder="Blood, Health, Tips"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cover Image Idea</label>
                    <input 
                      type="text" 
                      value={blogFormData.featuredImageIdea}
                      onChange={(e) => setBlogFormData({ ...blogFormData, featuredImageIdea: e.target.value })}
                      placeholder="vector graphics layout"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800/40">
                  {/* English Section */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Globe className="w-3.5 h-3.5" /> English localization Content
                    </h4>
                    
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">SEO / Article Title</label>
                      <input 
                        type="text" 
                        value={blogFormData.en.seoTitle}
                        onChange={(e) => setBlogFormData({ ...blogFormData, en: { ...blogFormData.en, seoTitle: e.target.value } })}
                        placeholder="Why Should You Donate Blood?"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Meta Description</label>
                      <input 
                        type="text" 
                        value={blogFormData.en.metaDescription}
                        onChange={(e) => setBlogFormData({ ...blogFormData, en: { ...blogFormData.en, metaDescription: e.target.value } })}
                        placeholder="Learn the medical benefits of blood donations..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Introduction paragraph</label>
                      <textarea
                        rows={3}
                        value={blogFormData.en.introduction}
                        onChange={(e) => setBlogFormData({ ...blogFormData, en: { ...blogFormData.en, introduction: e.target.value } })}
                        placeholder="Every second is critical..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none resize-none"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Conclusion Paragraph</label>
                      <textarea
                        rows={2}
                        value={blogFormData.en.conclusion}
                        onChange={(e) => setBlogFormData({ ...blogFormData, en: { ...blogFormData.en, conclusion: e.target.value } })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">CTA text</label>
                      <input 
                        type="text" 
                        value={blogFormData.en.cta}
                        onChange={(e) => setBlogFormData({ ...blogFormData, en: { ...blogFormData.en, cta: e.target.value } })}
                        placeholder="Register on DonateLife BD now..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bengali Section */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Globe className="w-3.5 h-3.5" /> Bengali localization Content (বাংলা)
                    </h4>
                    
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">SEO / Article Title (Bangla)</label>
                      <input 
                        type="text" 
                        value={blogFormData.bn.seoTitle}
                        onChange={(e) => setBlogFormData({ ...blogFormData, bn: { ...blogFormData.bn, seoTitle: e.target.value } })}
                        placeholder="কেন রক্তদান করবেন?"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Meta Description (Bangla)</label>
                      <input 
                        type="text" 
                        value={blogFormData.bn.metaDescription}
                        onChange={(e) => setBlogFormData({ ...blogFormData, bn: { ...blogFormData.bn, metaDescription: e.target.value } })}
                        placeholder="রক্তদানের অবিশ্বাস্য স্বাস্থ্য উপকারিতাগুলো জানুন..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Introduction paragraph (Bangla)</label>
                      <textarea
                        rows={3}
                        value={blogFormData.bn.introduction}
                        onChange={(e) => setBlogFormData({ ...blogFormData, bn: { ...blogFormData.bn, introduction: e.target.value } })}
                        placeholder="প্রতি সেকেন্ডে মানুষের রক্তের প্রয়োজন..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none resize-none"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Conclusion Paragraph (Bangla)</label>
                      <textarea
                        rows={2}
                        value={blogFormData.bn.conclusion}
                        onChange={(e) => setBlogFormData({ ...blogFormData, bn: { ...blogFormData.bn, conclusion: e.target.value } })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">CTA text (Bangla)</label>
                      <input 
                        type="text" 
                        value={blogFormData.bn.cta}
                        onChange={(e) => setBlogFormData({ ...blogFormData, bn: { ...blogFormData.bn, cta: e.target.value } })}
                        placeholder="ডোনেটলাইফ বিডিতে আজই নিবন্ধন করুন..."
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800/40">
                  <button type="button" onClick={() => { setCreatingBlog(false); setEditingBlog(null); }} className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg font-bold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-bold rounded-lg cursor-pointer">Publish Awareness Article</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Ambulance Creator / Editor Modal */}
        {editingAmbulance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-left overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 my-8 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-rose-500" /> {creatingAmbulance ? 'Create Ambulance Listing' : 'Modify Ambulance Listing'}
                </h3>
                <button onClick={() => { setEditingAmbulance(null); setCreatingAmbulance(false); }} className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={creatingAmbulance ? handleCreateAmbulance : handleSaveAmbulanceEdits} className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ambulance Service Name</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.name}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, name: e.target.value })}
                      placeholder="e.g. Al-Madina Ambulance Service"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Provider Type</label>
                    <select
                      value={editingAmbulance.provider}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, provider: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    >
                      <option value="Private">Private Provider</option>
                      <option value="Government">Government / Public</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.contactPhone}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, contactPhone: e.target.value })}
                      placeholder="e.g. +8801700000000"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.whatsapp || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, whatsapp: e.target.value })}
                      placeholder="e.g. +8801700000000"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                </div>

                {/* Division, District, Upazila Cascade */}
                <LocationSelector
                  division={editingAmbulance.division}
                  district={editingAmbulance.district}
                  upazila={editingAmbulance.upazila}
                  policeStation={editingAmbulance.policeStation || ''}
                  onChange={(field, value) => setEditingAmbulance(prev => prev ? { ...prev, [field]: value } : prev)}
                />

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Full Address</label>
                  <input 
                    type="text" 
                    value={editingAmbulance.address}
                    onChange={(e) => setEditingAmbulance({ ...editingAmbulance, address: e.target.value })}
                    placeholder="e.g. 12/A Dhanmondi, Dhaka"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Service Coverage Area</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.serviceArea || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, serviceArea: e.target.value })}
                      placeholder="e.g. Whole Dhaka Division, Nationwide"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Average Response Time</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.averageResponseTime || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, averageResponseTime: e.target.value })}
                      placeholder="e.g. 15-25 mins"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ambulance Image URL</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.imageUrl || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, imageUrl: e.target.value })}
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Google Maps Link</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.googleMapsLink || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, googleMapsLink: e.target.value })}
                      placeholder="e.g. https://goo.gl/maps/..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Opening Hours</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.openingHours || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, openingHours: e.target.value })}
                      placeholder="e.g. 24/7 or 8 AM - 10 PM"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Live Status</label>
                    <select
                      value={editingAmbulance.liveStatus || 'Available'}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, liveStatus: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100 font-semibold"
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Starting Fare (BDT)</label>
                    <input 
                      type="number" 
                      value={editingAmbulance.startingFare || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, startingFare: parseInt(e.target.value, 10) || 0 })}
                      placeholder="e.g. 1500"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Coverage Radius (KM)</label>
                    <input 
                      type="number" 
                      value={editingAmbulance.coverageRadius || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, coverageRadius: parseInt(e.target.value, 10) || 0 })}
                      placeholder="e.g. 25"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Driver Name (Optional)</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.driverName || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, driverName: e.target.value })}
                      placeholder="e.g. Md. Karim"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Vehicle Number</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.vehicleNumber || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, vehicleNumber: e.target.value })}
                      placeholder="e.g. Dhaka Metro-Chha-11-2345"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Org Logo URL</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.orgLogoUrl || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, orgLogoUrl: e.target.value })}
                      placeholder="e.g. https://example.com/logo.png"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Emergency Contact Person</label>
                    <input 
                      type="text" 
                      value={editingAmbulance.emergencyContactPerson || ''}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, emergencyContactPerson: e.target.value })}
                      placeholder="e.g. Office Manager"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none text-slate-100"
                    />
                  </div>
                </div>

                {/* Service Types checklist */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Available Ambulance Service Types</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
                    {[
                      'ICU Support',
                      'AC Ambulance',
                      'Non-AC Ambulance',
                      'Freezer Ambulance',
                      'Neonatal Support'
                    ].map(type => {
                      const isChecked = editingAmbulance.availableTypes?.includes(type);
                      return (
                        <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => handleTypeToggle(type)}
                            className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-rose-500"
                          />
                          <span className="text-[11px] font-semibold text-slate-300">{type}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Switches / Toggles */}
                <div className="flex flex-wrap gap-6 p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={editingAmbulance.isAvailable247}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, isAvailable247: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-rose-500"
                    />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">24/7 Service Available</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={editingAmbulance.isVerified}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, isVerified: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-rose-500"
                    />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Verified Provider</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={editingAmbulance.isFeatured === true}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-rose-500"
                    />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Featured Listing</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={editingAmbulance.isActive !== false}
                      onChange={(e) => setEditingAmbulance({ ...editingAmbulance, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 bg-slate-950 border-slate-800 focus:ring-rose-500"
                    />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Active Directory Status</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800/40">
                  <button type="button" onClick={() => { setEditingAmbulance(null); setCreatingAmbulance(false); }} className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg font-bold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-bold rounded-lg cursor-pointer">Save Listing</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
