import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// User endpoints
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  sendFriendRequest: (id, data) => api.post(`/users/${id}/friend-request`, data),
  getFriendRequests: () => api.get('/users/friends/requests'),
  getFriends: () => api.get('/users/friends/list'),
  acceptFriendRequest: (id) => api.post(`/users/friend-requests/${id}/accept`),
  declineFriendRequest: (id) => api.post(`/users/friend-requests/${id}/decline`),
  removeFriend: (id) => api.delete(`/users/${id}/friend`),
  updateStatus: (data) => api.put('/users/status', data)
};

// Session endpoints
export const sessionAPI = {
  getSessions: (params) => api.get('/sessions', { params }),
  getSession: (id) => api.get(`/sessions/${id}`),
  createSession: (data) => api.post('/sessions', data),
  joinSession: (id) => api.post(`/sessions/${id}/join`),
  updateParticipant: (id, data) => api.put(`/sessions/${id}/participant`, data),
  deleteSession: (id) => api.delete(`/sessions/${id}`)
};

// Message endpoints
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getSessionMessages: (sessionId) => api.get(`/messages/session/${sessionId}`),
  markAsRead: (userId) => api.put(`/messages/read/${userId}`),
  getGeneralMessages: () => api.get('/messages/general'),
  sendGeneralMessage: (data) => api.post('/messages/general', data)
};

// Notification endpoints
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

export default api;
