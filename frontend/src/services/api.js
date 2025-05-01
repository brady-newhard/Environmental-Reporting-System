import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchReports = async (filters) => {
  try {
    const params = {
      inspector: filters.author || undefined,
      date_after: filters.startDate || undefined,
      date_before: filters.endDate || undefined,
      location: filters.location || undefined,
    };

    const response = await api.get('/reports/', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching reports:', error);
    throw error;
  }
};

export default api; 