import { BloodGroup, User, BloodRequest, Hospital, BloodBank, Notification, PlatformStats, TelemetryData, Ambulance, CMSContent, MediaAsset, FeatureSetting, FeatureStatus } from '../types';

const API_BASE = '/api';

// Token management
export function setAuthTokens(accessToken: string | null, refreshToken: string | null) {
  if (typeof window !== 'undefined') {
    if (accessToken) {
      localStorage.setItem('donatelife_token', accessToken);
    } else {
      localStorage.removeItem('donatelife_token');
    }
    
    if (refreshToken) {
      localStorage.setItem('donatelife_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('donatelife_refresh_token');
    }
  }
}

export function setAuthToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('donatelife_token', token);
    } else {
      localStorage.removeItem('donatelife_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('donatelife_token');
  }
  return null;
}

export function setAdminToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('donatelife_admin_token', token);
    } else {
      localStorage.removeItem('donatelife_admin_token');
    }
  }
}

export function getAdminToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('donatelife_admin_token');
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('donatelife_refresh_token');
  }
  return null;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
}

// Request Helper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isManagementRoute = endpoint.startsWith('/admin') ||
                            endpoint.startsWith('/hospitals') ||
                            endpoint.startsWith('/blood-banks') ||
                            (endpoint.startsWith('/blogs') && options.method && options.method !== 'GET');
                            
  const token = isManagementRoute ? (getAdminToken() || getAuthToken()) : getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized by attempting to refresh the token
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/signup' && endpoint !== '/auth/refresh') {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setAuthTokens(data.token, data.refreshToken);
            onRefreshed(data.token);
            isRefreshing = false;
          } else {
            setAuthTokens(null, null);
            isRefreshing = false;
            window.dispatchEvent(new Event('auth_session_expired'));
            throw new Error('Session expired. Please log in again.');
          }
        } catch (err) {
          isRefreshing = false;
          throw err;
        }
      }

      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          const retryHeaders = new Headers(options.headers || {});
          retryHeaders.set('Authorization', `Bearer ${newToken}`);
          if (options.body && !(options.body instanceof FormData)) {
            retryHeaders.set('Content-Type', 'application/json');
          }
          fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: retryHeaders
          })
            .then(async (res) => {
              const contentType = res.headers.get('content-type');
              if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Expected JSON response from server, but received: ${contentType || 'unknown'}`);
              }
              const data = await res.json().catch(() => {
                throw new Error('Failed to parse JSON response from server');
              });
              if (!res.ok) {
                reject(new Error(data.error || `HTTP error! Status: ${res.status}`));
              } else {
                resolve(data as T);
              }
            })
            .catch(reject);
        });
      });
    }
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Expected JSON response from server, but received: ${contentType || 'unknown'}`);
  }

  const data = await response.json().catch(() => {
    throw new Error('Failed to parse JSON response from server');
  });

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! Status: ${response.status}`);
  }

  return data as T;
}

// API Service Functions
export const api = {
  // Auth Operations
  auth: {
    signup(payload: any): Promise<{ token: string; refreshToken: string; user: User }> {
      return request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
    },
    
    login(payload: any): Promise<{ token: string; refreshToken: string; user: User }> {
      return request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    },

    logout(refreshToken?: string | null): Promise<{ success: boolean }> {
      return request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) });
    },
    
    forgotPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
      return request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
    },
    
    resetPassword(payload: any): Promise<{ success: boolean; message: string }> {
      return request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) });
    },
    
    getMe(): Promise<{ user: User }> {
      return request('/auth/me');
    },
    
    updateProfile(payload: Partial<User>): Promise<{ user: User }> {
      return request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
    },

    sendOTP(payload: { email: string; phone?: string }): Promise<{ success: boolean; code?: string; message: string }> {
      return request('/auth/send-otp', { method: 'POST', body: JSON.stringify(payload) });
    },

    verifyOTP(payload: { email: string; code: string }): Promise<{ success: boolean; user: User }> {
      return request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) });
    },

    submitDonorVerification(payload: { document: string }): Promise<{ success: boolean; user: User }> {
      return request('/auth/submit-verification', { method: 'POST', body: JSON.stringify(payload) });
    }
  },

  // Donors Operations
  donors: {
    search(filters: {
      search?: string;
      q?: string;
      bloodGroup?: BloodGroup | '' | string;
      division?: string;
      district?: string;
      upazila?: string;
      fullAddress?: string;
      availableOnly?: boolean;
      verifiedOnly?: boolean;
      public?: boolean;
      page?: number;
      limit?: number;
    }, options?: { forceRefresh?: boolean }): Promise<any> {
      const params = new URLSearchParams();
      const queryVal = filters.search || filters.q || '';
      if (queryVal) params.append('q', queryVal);
      if (filters.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
      if (filters.division) params.append('division', filters.division);
      if (filters.district) params.append('district', filters.district);
      if (filters.upazila) params.append('upazila', filters.upazila);
      if (filters.fullAddress) params.append('fullAddress', filters.fullAddress);
      if (filters.availableOnly) params.append('availableOnly', 'true');
      if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
      if (filters.public) params.append('public', 'true');
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (options?.forceRefresh) params.append('_t', Date.now().toString());
      
      return request(`/donors?${params.toString()}`, {
        headers: options?.forceRefresh ? { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache' } : {}
      });
    }
  },

  // Requests Operations
  requests: {
    list(): Promise<BloodRequest[]> {
      return request('/requests');
    },
    
    create(payload: Partial<BloodRequest>): Promise<BloodRequest> {
      return request('/requests', { method: 'POST', body: JSON.stringify(payload) });
    },
    
    updateStatus(id: string, status: BloodRequest['status']): Promise<BloodRequest> {
      return request(`/requests/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    },

    approve(id: string): Promise<BloodRequest> {
      return request(`/requests/${id}/approve`, { method: 'PUT' });
    },

    reject(id: string): Promise<BloodRequest> {
      return request(`/requests/${id}/reject`, { method: 'PUT' });
    }
  },

  // Directories
  directories: {
    async hospitals(division?: string, search?: string): Promise<Hospital[]> {
      try {
        const params = new URLSearchParams();
        if (division) params.append('division', division);
        if (search) params.append('search', search);
        const res: any = await request(`/hospitals?${params.toString()}`);
        if (res && res.success && Array.isArray(res.data)) {
          return res.data;
        }
        if (Array.isArray(res)) {
          return res;
        }
        return res?.data || [];
      } catch (err) {
        console.error('[Client API] directories.hospitals error:', err);
        return [];
      }
    },
    
    async bloodBanks(division?: string, search?: string): Promise<BloodBank[]> {
      try {
        const params = new URLSearchParams();
        if (division) params.append('division', division);
        if (search) params.append('search', search);
        const res: any = await request(`/blood-banks?${params.toString()}`);
        if (res && res.success && Array.isArray(res.data)) {
          return res.data;
        }
        if (Array.isArray(res)) {
          return res;
        }
        return res?.data || [];
      } catch (err) {
        console.error('[Client API] directories.bloodBanks error:', err);
        return [];
      }
    }
  },

  // Notifications
  notifications: {
    list(): Promise<Notification[]> {
      return request('/notifications');
    },
    
    markAsRead(id: string): Promise<{ success: boolean }> {
      return request(`/notifications/${id}/read`, { method: 'POST' });
    }
  },

  // Donation History
  donations: {
    list(): Promise<any[]> {
      return request('/donations');
    },
    
    create(payload: any): Promise<any> {
      return request('/donations', { method: 'POST', body: JSON.stringify(payload) });
    }
  },

  // Public blogs listing
  blogs: {
    list(): Promise<any[]> {
      return request('/blogs');
    },
    get(slug: string): Promise<any> {
      return request(`/blogs/${slug}`);
    }
  },

  // Admin Panel
  admin: {
    login(payload: any): Promise<any> {
      return request('/admin/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    },
    
    me(): Promise<any> {
      return request('/admin/auth/me');
    },
    
    logs(): Promise<any[]> {
      return request('/admin/logs');
    },

    stats(): Promise<PlatformStats> {
      return request('/admin/stats');
    },
    
    users(): Promise<User[]> {
      return request('/admin/users');
    },
    
    updateUser(id: string, payload: any): Promise<User> {
      return request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },

    updateUserRole(id: string, isAdmin: boolean): Promise<{ success: boolean }> {
      return request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ isAdmin }) });
    },
    
    deleteUser(id: string): Promise<{ success: boolean }> {
      return request(`/admin/users/${id}`, { method: 'DELETE' });
    },
    
    updateRequest(id: string, payload: any): Promise<BloodRequest> {
      return request(`/admin/requests/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },

    deleteRequest(id: string): Promise<{ success: boolean }> {
      return request(`/admin/requests/${id}`, { method: 'DELETE' });
    },

    verifyDonor(userId: string, approve: boolean): Promise<{ success: boolean }> {
      return request(`/admin/users/${userId}/verify-donor`, { method: 'POST', body: JSON.stringify({ approve }) });
    },

    manualVerifyDonor(userId: string, isVerified: boolean, verificationNote?: string): Promise<{ success: boolean; user: User }> {
      return request(`/admin/users/${userId}/manual-verify`, { method: 'POST', body: JSON.stringify({ isVerified, verificationNote }) });
    },

    broadcastNotification(payload: any): Promise<{ success: boolean, count: number }> {
      return request('/admin/notifications/broadcast', { method: 'POST', body: JSON.stringify(payload) });
    },

    createHospital(payload: any): Promise<Hospital> {
      return request('/hospitals', { method: 'POST', body: JSON.stringify(payload) });
    },

    updateHospital(id: string, payload: any): Promise<Hospital> {
      return request(`/hospitals/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },

    deleteHospital(id: string): Promise<{ success: boolean }> {
      return request(`/hospitals/${id}`, { method: 'DELETE' });
    },

    createBloodBank(payload: any): Promise<BloodBank> {
      return request('/blood-banks', { method: 'POST', body: JSON.stringify(payload) });
    },

    updateBloodBank(id: string, payload: any): Promise<BloodBank> {
      return request(`/blood-banks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },

    deleteBloodBank(id: string): Promise<{ success: boolean }> {
      return request(`/blood-banks/${id}`, { method: 'DELETE' });
    },

    createBlog(payload: any): Promise<any> {
      return request('/blogs', { method: 'POST', body: JSON.stringify(payload) });
    },

    updateBlog(id: string, payload: any): Promise<any> {
      return request(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },

    deleteBlog(id: string): Promise<{ success: boolean }> {
      return request(`/blogs/${id}`, { method: 'DELETE' });
    },

    manualSeed(): Promise<{ success: boolean; message: string }> {
      return request('/admin/seed', { method: 'POST' });
    }
  },

  // Public Telemetry Analytics
  telemetry(): Promise<TelemetryData> {
    return request('/telemetry');
  },

  // CMS Operations
  cms: {
    async fetchAll(): Promise<Record<string, any>> {
      try {
        const res = await request('/cms');
        return res || {};
      } catch (err) {
        console.warn('API fetchAll CMS failed gracefully:', err);
        return {};
      }
    },
    async fetch(id: string, preview?: boolean): Promise<any> {
      try {
        return await request(`/cms/${id}${preview ? '?preview=true' : ''}`);
      } catch (err) {
        console.warn(`API fetch CMS section "${id}" failed gracefully:`, err);
        return null;
      }
    },
    listDrafts(): Promise<CMSContent[]> {
      return request('/admin/cms');
    },
    saveDraft(id: string, draft: any): Promise<{ success: boolean }> {
      return request(`/admin/cms/${id}`, { method: 'PUT', body: JSON.stringify({ draft }) });
    },
    publish(id: string): Promise<{ success: boolean }> {
      return request(`/admin/cms/${id}/publish`, { method: 'POST' });
    },
    unpublish(id: string): Promise<{ success: boolean }> {
      return request(`/admin/cms/${id}/unpublish`, { method: 'POST' });
    }
  },

  // Media Operations
  media: {
    list(): Promise<MediaAsset[]> {
      return request('/media');
    },
    upload(payload: { name: string; url: string; type: string }): Promise<MediaAsset> {
      return request('/admin/media', { method: 'POST', body: JSON.stringify(payload) });
    },
    delete(id: string): Promise<{ success: boolean }> {
      return request(`/admin/media/${id}`, { method: 'DELETE' });
    }
  },

  // Ambulances Operations
  ambulances: {
    async list(): Promise<Ambulance[]> {
      try {
        const res: any = await request('/ambulances');
        if (res && res.success && Array.isArray(res.data)) {
          return res.data;
        }
        if (Array.isArray(res)) {
          return res;
        }
        return res?.data || [];
      } catch (err) {
        console.error('[Client API] ambulances.list error:', err);
        return [];
      }
    },
    create(payload: any): Promise<Ambulance> {
      return request('/ambulances', { method: 'POST', body: JSON.stringify(payload) });
    },
    update(id: string, payload: any): Promise<Ambulance> {
      return request(`/ambulances/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    },
    delete(id: string): Promise<{ success: boolean }> {
      return request(`/ambulances/${id}`, { method: 'DELETE' });
    },
    toggleFavorite(id: string): Promise<{ success: boolean; favoriteAmbulances: string[] }> {
      return request(`/ambulances/${id}/favorite`, { method: 'POST' });
    },
    clickCall(id: string): Promise<{ success: boolean; totalCalls: number }> {
      return request(`/ambulances/${id}/click-call`, { method: 'POST' });
    },
    clickWa(id: string): Promise<{ success: boolean; totalWaClicks: number }> {
      return request(`/ambulances/${id}/click-wa`, { method: 'POST' });
    },
    addReview(id: string, payload: { rating: number; comment: string }): Promise<{ success: boolean; review: any; averageRating: string; totalReviews: number }> {
      return request(`/ambulances/${id}/reviews`, { method: 'POST', body: JSON.stringify(payload) });
    },
    toggleHideReview(id: string, reviewId: string): Promise<{ success: boolean; reviews: any[]; averageRating: string; totalReviews: number }> {
      return request(`/ambulances/${id}/reviews/${reviewId}/toggle-hide`, { method: 'PUT' });
    }
  },

  // Notification Queue & Logs Admin Operations
  notificationLogs: {
    getLogs(): Promise<{ logs: any[]; stats: { total: number; totalSent: number; failedCount: number; pendingCount: number } }> {
      return request('/admin/notifications/logs');
    },
    retryFailed(): Promise<{ message: string; result: { totalRetried: number; successful: number } }> {
      return request('/admin/notifications/retry', { method: 'POST' });
    }
  },

  // User Settings Operations
  settings: {
    get(): Promise<any> {
      return request('/user/settings');
    },
    update(payload: any): Promise<any> {
      return request('/user/settings', { method: 'PUT', body: JSON.stringify(payload) });
    }
  },

  // Feature Settings Operations
  featureSettings: {
    getPublic(): Promise<{ success: boolean; data: FeatureSetting[]; map: Record<string, { enabled: boolean; maintenanceMode: boolean; status: FeatureStatus }> }> {
      return request('/features');
    },
    getAdmin(): Promise<{ success: boolean; data: FeatureSetting[] }> {
      return request('/admin/features');
    },
    updateAdmin(payload: { featureKey: string; status?: FeatureStatus; enabled?: boolean; maintenanceMode?: boolean }): Promise<{ success: boolean; data: FeatureSetting; message: string }> {
      return request('/admin/features', { method: 'PATCH', body: JSON.stringify(payload) });
    }
  }
};
