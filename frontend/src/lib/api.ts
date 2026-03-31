const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

// Simple in-memory cache for GET requests (avoids redundant fetches)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds
const pendingRequests = new Map<string, Promise<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data as T;
  if (entry) cache.delete(key);
  return null;
}

export function clearApiCache() {
  cache.clear();
}

export async function api<T = unknown>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;
  const method = (rest.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Cache GET requests (deduplicate concurrent identical requests)
  const isGet = method === 'GET';
  const cacheKey = isGet ? `${endpoint}|${token || ''}` : '';

  if (isGet) {
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;

    // Deduplicate: if same request is already in flight, return that promise
    if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers, ...rest });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || 'API Error');
    }

    const data = await res.json();

    // Cache successful GET responses
    if (isGet) {
      cache.set(cacheKey, { data, timestamp: Date.now() });
    } else {
      // Invalidate cache on mutations
      cache.clear();
    }

    return data;
  })();

  if (isGet) {
    pendingRequests.set(cacheKey, fetchPromise);
    fetchPromise.finally(() => pendingRequests.delete(cacheKey));
  }

  return fetchPromise;
}

// Auth helpers
export const authApi = {
  register: (data: Record<string, unknown>) => api('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: Record<string, unknown>) => api('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  profile: (token: string) => api('/auth/profile', { token }),
};

// Properties
export const propertiesApi = {
  list: (params?: string) => api(`/properties${params ? '?' + params : ''}`),
  get: (id: string) => api(`/properties/${id}`),
  create: (data: Record<string, unknown>, token: string) => api('/properties', { method: 'POST', body: JSON.stringify(data), token }),
  update: (id: string, data: Record<string, unknown>, token: string) => api(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  delete: (id: string, token: string) => api(`/properties/${id}`, { method: 'DELETE', token }),
  apply: (id: string, data: Record<string, unknown>, token: string) => api(`/properties/${id}/apply`, { method: 'POST', body: JSON.stringify(data), token }),
  myListings: (token: string) => api('/properties/my/listings', { token }),
  myApplications: (token: string) => api('/properties/my/applications', { token }),
  getApplications: (propertyId: string, token: string) => api(`/properties/${propertyId}/applications`, { token }),
  updateApplicationStatus: (appId: string, status: string, token: string) => api(`/properties/applications/${appId}/status`, { method: 'PUT', body: JSON.stringify({ status }), token }),
};

// Marketplace
export const marketplaceApi = {
  list: (params?: string) => api(`/marketplace${params ? '?' + params : ''}`),
  get: (id: string) => api(`/marketplace/${id}`),
  create: (data: Record<string, unknown>, token: string) => api('/marketplace', { method: 'POST', body: JSON.stringify(data), token }),
  update: (id: string, data: Record<string, unknown>, token: string) => api(`/marketplace/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  delete: (id: string, token: string) => api(`/marketplace/${id}`, { method: 'DELETE', token }),
  myItems: (token: string) => api('/marketplace/my/items', { token }),
};

// Messages
export const messagesApi = {
  send: (data: Record<string, unknown>, token: string) => api('/messages', { method: 'POST', body: JSON.stringify(data), token }),
  conversations: (token: string) => api('/messages/conversations', { token }),
  thread: (partnerId: string, token: string) => api(`/messages/thread/${partnerId}`, { token }),
  unread: (token: string) => api('/messages/unread', { token }),
};

// Payments
export const paymentsApi = {
  create: (data: Record<string, unknown>, token: string) => api('/payments', { method: 'POST', body: JSON.stringify(data), token }),
  complete: (id: string, token: string) => api(`/payments/${id}/complete`, { method: 'PUT', token }),
  list: (token: string) => api('/payments', { token }),
  get: (id: string, token: string) => api(`/payments/${id}`, { token }),
  invoice: (id: string, token: string) => api(`/payments/${id}/invoice`, { token }),
};

// Reviews
export const reviewsApi = {
  create: (data: Record<string, unknown>, token: string) => api('/reviews', { method: 'POST', body: JSON.stringify(data), token }),
  byProperty: (id: string) => api(`/reviews/property/${id}`),
  byUser: (id: string) => api(`/reviews/user/${id}`),
  avgRating: (id: string) => api(`/reviews/user/${id}/average`),
};

// Reports
export const reportsApi = {
  create: (data: Record<string, unknown>, token: string) => api('/reports', { method: 'POST', body: JSON.stringify(data), token }),
  myReports: (token: string) => api('/reports/my', { token }),
};

// Upload (multipart/form-data — bypasses JSON api helper)
export const uploadApi = {
  upload: async (files: File[], token: string): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || 'Upload failed');
    }

    const data = await res.json();
    // Convert relative paths to full URLs
    const backendUrl = API_URL.replace('/api', '');
    return (data.urls as string[]).map((u) => `${backendUrl}${u}`);
  },
};

// Admin
export const adminApi = {
  stats: (token: string) => api('/admin/stats', { token }),
  users: (token: string) => api('/admin/users', { token }),
  toggleUser: (id: string, token: string) => api(`/admin/users/${id}/toggle`, { method: 'PUT', token }),
  deleteUser: (id: string, token: string) => api(`/admin/users/${id}`, { method: 'DELETE', token }),
  properties: (token: string) => api('/admin/properties', { token }),
  deleteProperty: (id: string, token: string) => api(`/admin/properties/${id}`, { method: 'DELETE', token }),
  applications: (token: string) => api('/admin/applications', { token }),
  marketplace: (token: string) => api('/admin/marketplace', { token }),
  deleteMarketplaceItem: (id: string, token: string) => api(`/admin/marketplace/${id}`, { method: 'DELETE', token }),
  payments: (token: string) => api('/admin/payments', { token }),
  reports: (token: string) => api('/admin/reports', { token }),
  updateReport: (id: string, data: Record<string, unknown>, token: string) => api(`/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  reviews: (token: string) => api('/admin/reviews', { token }),
  deleteReview: (id: string, token: string) => api(`/admin/reviews/${id}`, { method: 'DELETE', token }),
};
