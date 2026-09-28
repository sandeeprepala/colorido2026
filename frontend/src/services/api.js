import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('colorido_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on verify routes
      if (!window.location.pathname.includes('/verify/')) {
        // Optional session expired handling
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const eventsAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
};

export const registrationsAPI = {
  registerForEvent: (eventId, data) => api.post(`/events/${eventId}/register`, data),
  getMyRegistrations: () => api.get('/registrations/my'),
  getRegistrationById: (id) => api.get(`/registrations/${id}`),
  verifyQrToken: (token) => api.get(`/registrations/verify/${token}`),
  getAdminRegistrations: (params) => api.get('/admin/registrations', { params }),
  updateRegistrationStatus: (id, data) => api.put(`/admin/registrations/${id}/status`, data),
  cancelRegistration: (id) => api.delete(`/registrations/${id}`),
};

export const stallsAPI = {
  getStalls: () => api.get('/stalls'),
  applyForStall: (data) => api.post('/stalls/apply', data),
  getMyApplications: () => api.get('/stalls/my'),
  getAdminApplications: () => api.get('/admin/stalls/applications'),
  reviewApplication: (id, data) => api.put(`/admin/stalls/applications/${id}/status`, data),
  updateStallAdmin: (stallId, data) => api.put(`/admin/stalls/${stallId}`, data),
};

export const leaderboardAPI = {
  getAllLeaderboards: () => api.get('/leaderboards'),
  getLeaderboardByEvent: (eventId) => api.get(`/leaderboards/${eventId}`),
  createLeaderboard: (data) => api.post('/admin/leaderboards', data),
  updateStatus: (id, data) => api.put(`/admin/leaderboards/${id}/status`, data),
  saveEntry: (id, data) => api.put(`/admin/leaderboards/${id}/entry`, data),
  adjustPoints: (id, entryId, data) => api.put(`/admin/leaderboards/${id}/teams/${entryId}/points`, data),
  deleteEntry: (id, entryId) => api.delete(`/admin/leaderboards/${id}/entry/${entryId}`),
};

export const discussionAPI = {
  getDiscussion: () => api.get('/discussion'),
  postMessage: (data) => api.post('/discussion', data),
  deleteMessage: (id) => api.delete(`/admin/discussion/${id}`),
};

export const certificatesAPI = {
  getMyCertificates: () => api.get('/certificates/my'),
  verifyCertificate: (certificateId) => api.get(`/certificates/verify/${certificateId}`),
  getAdminCertificates: () => api.get('/admin/certificates'),
  generateCertificates: (data) => api.post('/admin/certificates/generate', data),
};

export const emailAPI = {
  sendBroadcast: (data) => api.post('/admin/email/send', data),
  getEmailLogs: () => api.get('/admin/email/logs'),
  getMyInbox: () => api.get('/email/inbox/my'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
};

export default api;
