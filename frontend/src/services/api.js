import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data)
};

// Users
export const usersAPI = {
  getProfile: (id) => api.get(`/users/profile/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getHistory: () => api.get('/users/history'),
  deleteAccount: () => api.delete('/users/account')
};

// Videos
export const videosAPI = {
  getAll: (params) => api.get('/videos', { params }),
  getById: (id) => api.get(`/videos/${id}`),
  getTrending: () => api.get('/videos/trending'),
  upload: (formData, onUploadProgress) =>
    api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    }),
  update: (id, data) => api.put(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`)
};

// Comments
export const commentsAPI = {
  getByVideo: (videoId, params) => api.get(`/comments/video/${videoId}`, { params }),
  create: (videoId, data) => api.post(`/comments/video/${videoId}`, data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  flag: (id, reason) => api.post(`/comments/${id}/flag`, { reason })
};

// Playlists
export const playlistsAPI = {
  getUserPlaylists: (userId) => api.get(`/playlists/user/${userId || ''}`),
  getById: (id) => api.get(`/playlists/${id}`),
  create: (data) => api.post('/playlists', data),
  addVideo: (playlistId, videoId) => api.post(`/playlists/${playlistId}/videos`, { videoId }),
  removeVideo: (playlistId, videoId) => api.delete(`/playlists/${playlistId}/videos/${videoId}`),
  delete: (id) => api.delete(`/playlists/${id}`)
};

// Countries
export const countriesAPI = {
  getAll: () => api.get('/countries'),
  detect: () => api.get('/countries/detect')
};

export default api;
