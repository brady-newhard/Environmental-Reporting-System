import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== ''
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:8000/api';

console.log('API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Disable sending cookies since we're using token auth
});

// Track failed requests to prevent infinite logout loops
let consecutiveAuthFailures = 0;
const MAX_AUTH_FAILURES = 3;

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
  (response) => {
    // Reset auth failure counter on successful request
    consecutiveAuthFailures = 0;
    
    // Check if response is HTML instead of JSON
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
      console.error('Received HTML instead of JSON response:', response.data);
      return Promise.reject(new Error('Invalid response format: received HTML instead of JSON'));
    }
    return response;
  },
  (error) => {
    console.error('Response interceptor - error:', error);
    
    if (error.response) {
      // Handle 401 Unauthorized errors more carefully
      if (error.response.status === 401) {
        const isLogoutRequest = error.config.url.includes('/logout/');
        const isLoginRequest = error.config.url.includes('/login/');
        const isOnLoginPage = window.location.pathname === '/login';
        const isTokenValidationRequest = error.config.url.includes('/users/me/');
        
        // Don't redirect for logout, login, or token validation requests, or if already on login page
        if (!isLogoutRequest && !isLoginRequest && !isOnLoginPage && !isTokenValidationRequest) {
          consecutiveAuthFailures++;
          
          // Only logout after multiple consecutive failures to prevent false positives
          if (consecutiveAuthFailures >= MAX_AUTH_FAILURES) {
            console.log(`Multiple auth failures (${consecutiveAuthFailures}), logging out user`);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            consecutiveAuthFailures = 0; // Reset counter
            window.location.href = '/login';
          } else {
            console.log(`Auth failure ${consecutiveAuthFailures}/${MAX_AUTH_FAILURES}, not logging out yet`);
          }
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

    const response = await api.get('/core/reports/', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching reports:', error);
    throw error;
  }
};

export const getContacts = async () => {
  try {
    const response = await api.get('/users/contacts/');
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
    const response = await api.get('/environmental/progress-charts/');
    return response.data;
  } catch (error) {
    console.error('Error fetching progress chart:', error);
    throw error;
  }
};

// Submit report for lead review
export const submitReport = async (reportData) => {
  try {
    const response = await api.post('/reports/', {
      report_type: reportData.report_type,
      report_id: reportData.report_id || `${reportData.report_type}_${Date.now()}`,
      discipline: reportData.discipline,
      report_data: reportData.data,
      status: 'submitted'
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

// Get reports for current user (filtered by role)
export const getReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/reports/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

// Get available leads for assignment
export const getAvailableLeads = async () => {
  try {
    const response = await api.get('/reports/available_leads/');
    return response.data;
  } catch (error) {
    console.error('Error fetching available leads:', error);
    throw error;
  }
};

// Assign lead to report
export const assignLead = async (reportId, leadId) => {
  try {
    const response = await api.post(`/reports/${reportId}/assign_lead/`, {
      lead_id: leadId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning lead:', error);
    throw error;
  }
};

// Approve report
export const approveReport = async (reportId, reviewNotes = '') => {
  try {
    const response = await api.post(`/reports/${reportId}/approve/`, {
      review_notes: reviewNotes
    });
    return response.data;
  } catch (error) {
    console.error('Error approving report:', error);
    throw error;
  }
};

// Reject report
export const rejectReport = async (reportId, rejectionReason, reviewNotes = '') => {
  try {
    const response = await api.post(`/reports/${reportId}/reject/`, {
      rejection_reason: rejectionReason,
      review_notes: reviewNotes
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting report:', error);
    throw error;
  }
};

// Get dashboard stats for leads
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/reports/dashboard_stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get submitted reports count for current user
export const getSubmittedReportsCount = async (reportType = null) => {
  try {
    const params = new URLSearchParams();
    params.append('status', 'submitted');
    if (reportType) {
      params.append('report_type', reportType);
    }
    
    console.log(`Getting submitted reports count for type: ${reportType}`);
    console.log(`API URL params: ${params.toString()}`);
    
    const response = await api.get(`/reports/?${params.toString()}`);
    console.log(`API response for ${reportType}:`, response.data);
    
    // If backend filtering isn't working, filter on frontend
    let filteredReports = response.data;
    if (reportType && response.data.length > 0) {
      filteredReports = response.data.filter(report => report.report_type === reportType);
      console.log(`Frontend filtered reports for ${reportType}:`, filteredReports);
    }
    
    return filteredReports.length;
  } catch (error) {
    console.error('Error fetching submitted reports count:', error);
    return 0;
  }
};

// Get submitted reports for current user
export const getSubmittedReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('status', 'submitted');
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    console.log('Getting submitted reports with filters:', filters);
    console.log('API URL params:', params.toString());
    
    const response = await api.get(`/reports/?${params.toString()}`);
    console.log('API response for submitted reports:', response.data);
    
    // If backend filtering isn't working, filter on frontend
    let filteredReports = response.data;
    if (filters.report_type && response.data.length > 0) {
      filteredReports = response.data.filter(report => report.report_type === filters.report_type);
      console.log(`Frontend filtered reports for ${filters.report_type}:`, filteredReports);
    }
    
    return filteredReports;
  } catch (error) {
    console.error('Error fetching submitted reports:', error);
    throw error;
  }
};

// Update submitted report
export const updateSubmittedReport = async (reportId, reportData) => {
  try {
    console.log('updateSubmittedReport - reportId:', reportId);
    console.log('updateSubmittedReport - reportData:', reportData);
    console.log('updateSubmittedReport - reportData type:', typeof reportData);
    console.log('updateSubmittedReport - reportData keys:', Object.keys(reportData || {}));
    
    // Validate reportData
    if (!reportData || typeof reportData !== 'object') {
      throw new Error('Invalid reportData: must be an object');
    }
    
    // Ensure reportData is serializable
    try {
      JSON.stringify(reportData);
    } catch (e) {
      throw new Error('Invalid reportData: not JSON serializable');
    }
    
    const requestData = {
      report_data: reportData
    };
    console.log('updateSubmittedReport - requestData:', requestData);
    
    // Only send the report_data field for updates, don't change other fields
    const response = await api.put(`/reports/${reportId}/`, requestData);
    console.log('updateSubmittedReport - response:', response);
    return response.data;
  } catch (error) {
    console.error('Error updating submitted report:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    throw error;
  }
};

// Delete submitted report
export const deleteSubmittedReport = async (reportId) => {
  try {
    console.log('deleteSubmittedReport - reportId:', reportId);
    
    const response = await api.delete(`/reports/${reportId}/`);
    console.log('deleteSubmittedReport - response:', response);
    return response.data;
  } catch (error) {
    console.error('Error deleting submitted report:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export default api; 