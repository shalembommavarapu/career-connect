import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for global error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    if (error.response?.status === 401) {
      // If unauthorized on protected routes, token may be expired
      const isAuthRoute = window.location.pathname.startsWith('/student') ||
                          window.location.pathname.startsWith('/recruiter') ||
                          window.location.pathname.startsWith('/admin');
      if (isAuthRoute && localStorage.getItem('cc_token')) {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data)
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  uploadResume: (formData) => api.post('/profile/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteResume: () => api.delete('/profile/resume'),
  getCandidateProfile: (id) => api.get(`/profile/candidate/${id}`)
};

export const jobAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getRecruiterJobs: () => api.get('/jobs/recruiter/my-jobs'),
  getRecommendations: () => api.get('/jobs/student/recommendations')
};

export const applicationAPI = {
  apply: (data) => api.post('/applications', data),
  getMyApplications: () => api.get('/applications/my'),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  getRecruiterApplications: () => api.get('/applications/recruiter/all'),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  withdraw: (id) => api.patch(`/applications/${id}/withdraw`)
};

export const savedJobAPI = {
  getSavedJobs: () => api.get('/saved-jobs'),
  saveJob: (jobId) => api.post(`/saved-jobs/${jobId}`),
  unsaveJob: (jobId) => api.delete(`/saved-jobs/${jobId}`)
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all')
};

export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getJobs: (params) => api.get('/admin/jobs', { params }),
  updateJobStatus: (id, status) => api.patch(`/admin/jobs/${id}/status`, { status }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params })
};

export default api;
