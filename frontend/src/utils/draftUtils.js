import api from '../services/api';

// Helper to ensure the draft has all required keys/structure
export const normalizeDraft = (data) => {
  // Default sections with proper structure
  const defaultSections = [
    {
      name: 'Crew Daily Summaries',
      rows: [{ Crew: '', CustomCrew: '', 'Start Station': '', 'End Station': '', Notes: '' }]
    },
    {
      name: 'Daily Progress',
      rows: [{ Phase: '', 'Start Station': '', 'End Station': '' }]
    }
  ];

  // If we have sections data, ensure each section has at least one row
  const sections = data.sections || defaultSections;
  const normalizedSections = sections.map(section => {
    const defaultRow = {
      'Crew Daily Summaries': { Crew: '', CustomCrew: '', 'Start Station': '', 'End Station': '', Notes: '' },
      'Daily Progress': { Phase: '', 'Start Station': '', 'End Station': '' }
    }[section.name] || {};

    return {
      ...section,
      rows: section.rows && section.rows.length > 0 ? section.rows : [defaultRow]
    };
  });

  // Ensure header has all required fields
  const defaultHeader = {
    project: '',
    spread: '',
    inspector: '',
    afe: '',
    contractor: '',
    weather_description: '',
    temperature: '',
    precipitation_type: '',
    precipitation_inches: '',
    weather_conditions: '',
    soil_conditions: '',
    rain_gauges: [],
    additional_comments: ''
  };

  return {
    header: { ...defaultHeader, ...(data.header || {}) },
    sections: normalizedSections,
    summaries: data.summaries || {},
    photos: data.photos || [],
    signature: data.signature || '',
    sigDate: data.sigDate || data.sig_date || '',
    preparedBy: data.preparedBy || '',
    id: data.id || null
  };
};

function mapReportType(reportType) {
  if (reportType === 'environmental') return 'environmental_daily';
  return reportType;
}

// Save draft to backend
export const saveDraft = async (reportType, data) => {
  try {
    console.log('saveDraft called with:', { reportType, data });
    const mappedReportType = mapReportType(reportType);
    const endpoint = 'drafts/';
    console.log('Using endpoint:', endpoint);
    console.log('API baseURL:', api.defaults.baseURL);
    console.log('Full URL will be:', `${api.defaults.baseURL}/${endpoint}`);
    console.log('Request headers:', api.defaults.headers);

    if (data.id && data.id !== null && data.id !== undefined) {
      console.log('Updating existing draft with ID:', data.id);
      const response = await api.put(`${endpoint}${data.id}/`, {
        report_type: mappedReportType,
        data: data
      });
      console.log('Update response:', response.data);
      return response.data.id;
    } else {
      console.log('Creating new draft');
      const response = await api.post(endpoint, {
        report_type: mappedReportType,
        data: data
      });
      console.log('Create response:', response.data);
      return response.data.id;
    }
  } catch (error) {
    console.error('Error saving draft:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
};

// Get all drafts for a report type
export const getAllDrafts = async (reportType) => {
  try {
    const mappedType = mapReportType(reportType);
    console.log('Getting all drafts for type:', mappedType);
    console.log('Using endpoint: drafts/');
    console.log('API baseURL:', api.defaults.baseURL);
    console.log('Full URL will be:', `${api.defaults.baseURL}/drafts/`);
    console.log('Request headers:', api.defaults.headers);
    
    const response = await api.get('drafts/', {
      params: { report_type: mappedType }
    });
    
    console.log('Drafts response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching drafts:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    throw error;
  }
};

// Get a single draft by ID
export const getDraft = async (reportType, id) => {
  try {
    const response = await api.get(`${reportType}/drafts/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching draft:', error);
    throw error;
  }
};

// Delete a draft
export const deleteDraft = async (reportType, id) => {
  try {
    await api.delete(`${reportType}/drafts/${id}/`);
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
}; 