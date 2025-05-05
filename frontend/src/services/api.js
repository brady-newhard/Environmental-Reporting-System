import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        const isLogoutRequest = error.config.url.includes('/logout/');
        const isLoginRequest = error.config.url.includes('/login/');
        
        // Don't redirect for logout or login requests
        if (!isLogoutRequest && !isLoginRequest) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

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

export const getContacts = async () => {
  try {
    const response = await api.get('/contacts/');
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/users/');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getProgressChart = async () => {
  try {
    const response = await api.get('/progress-chart/');
    return response.data;
  } catch (error) {
    console.error('Error fetching progress chart:', error);
    throw error;
  }
};

export default api; 