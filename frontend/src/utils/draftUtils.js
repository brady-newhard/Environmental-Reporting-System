import api from '../services/api';
import { indexedDBStorage } from './indexedDBConfig';

// Constants
const LOCAL_PREFIX = 'draft_';
const MAX_LOCAL_DRAFTS = 5;

// Check if we're online
const isOnline = () => navigator.onLine;

// Map report types to their API endpoints
function mapReportType(reportType) {
  const typeMap = {
    'environmental': 'environmental_daily',
    'environmental_daily': 'environmental_daily',
    'swppp': 'swppp',
    'punchlist': 'punchlist',
    'utility': 'utility',
    'i3_utility': 'i3_utility',
    'welding': 'welding'
  };
  return typeMap[reportType] || reportType;
}

// Normalize draft data to ensure consistent structure
export function normalizeDraft(data) {
  return {
    header: data.header || {},
    sections: data.sections || [],
    summaries: data.summaries || {},
    photos: data.photos || [],
    signature: data.signature || '',
    sigDate: data.sigDate || '',
    preparedBy: data.preparedBy || '',
    ...data
  };
}

// Save a draft (both online and offline)
export async function saveDraft(reportType, data) {
  const normalizedData = normalizeDraft(data);
  let savedId = data.id;

  try {
    console.log('Saving to IndexedDB:', { reportType, savedId, data: normalizedData });
    // Always save to IndexedDB first for offline support
    await indexedDBStorage.saveDraft(reportType, savedId || 'temp', normalizedData);
    console.log('Successfully saved to IndexedDB');

    // If online and authenticated, save to backend
    if (isOnline()) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Attempting to save to backend...');
          let response;
          
          if (savedId) {
            // Update existing draft
            response = await api.put(`/core/drafts/${savedId}/`, {
              report_type: mapReportType(reportType),
              data: normalizedData
            });
          } else {
            // Create new draft
            response = await api.post('/core/drafts/', {
              report_type: mapReportType(reportType),
              data: normalizedData
            });
            savedId = response.data.id;
          }
          
          // Always update IndexedDB with the backend's ID and data
          await indexedDBStorage.deleteDraft(reportType, data.id || 'temp');
          await indexedDBStorage.saveDraft(reportType, savedId, normalizedData);
          
          console.log('Successfully saved to backend:', savedId);
        } catch (error) {
          console.error('Error saving to backend:', error);
          // Continue with local storage only
        }
      }
    }

    return { id: savedId, data: normalizedData };
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
}

// Get all drafts (both online and offline)
export const getAllDrafts = async (reportType) => {
  try {
    // First try to get drafts from IndexedDB
    const indexedDBDrafts = await indexedDBStorage.getDrafts(reportType);
    console.log('IndexedDB drafts:', indexedDBDrafts);
    
    // Then fetch from backend
    console.log('Fetching from backend...');
    const response = await api.get(`/core/drafts/?report_type=${reportType}`);
    console.log('Raw API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      keys: response.data ? Object.keys(response.data) : null
    });
    
    // Get the drafts array from the paginated response
    let backendDrafts = [];
    if (response.data) {
      if (Array.isArray(response.data)) {
        backendDrafts = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        backendDrafts = response.data.results;
      } else {
        console.warn('Unexpected response format:', response.data);
      }
    }
    console.log('Backend drafts:', backendDrafts);
    
    // Process IndexedDB drafts
    const processedIndexedDBDrafts = indexedDBDrafts.map(draft => ({
      ...draft,
      source: 'indexeddb'
    }));
    console.log('Processed IndexedDB drafts:', processedIndexedDBDrafts);
    
    // Process backend drafts
    const processedBackendDrafts = backendDrafts.map(draft => ({
      ...draft,
      source: 'backend'
    }));
    console.log('Processed backend drafts:', processedBackendDrafts);
    
    // Merge drafts, preferring backend versions
    const mergedDrafts = [...processedIndexedDBDrafts];
    processedBackendDrafts.forEach(backendDraft => {
      const existingIndex = mergedDrafts.findIndex(d => d.id === backendDraft.id);
      if (existingIndex >= 0) {
        mergedDrafts[existingIndex] = backendDraft;
      } else {
        mergedDrafts.push(backendDraft);
      }
    });
    
    console.log('Final merged drafts:', mergedDrafts);
    return mergedDrafts;
  } catch (error) {
    console.error('Error in getAllDrafts:', error);
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    // If backend fetch fails, return IndexedDB drafts
    return indexedDBDrafts.map(draft => ({
      ...draft,
      source: 'indexeddb'
    }));
  }
};

// Delete a draft
export async function deleteDraft(reportType, draftId) {
  try {
    console.log('Deleting draft:', { reportType, draftId });
    
    // Delete from IndexedDB
    await indexedDBStorage.deleteDraft(reportType, draftId);
    console.log('Successfully deleted from IndexedDB');

    // If online, authenticated, and not a temporary ID, delete from backend
    if (isOnline() && !draftId.startsWith('temp_')) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await api.delete(`/core/drafts/${draftId}/`);
          console.log('Successfully deleted from backend');
        } catch (error) {
          console.error('Error deleting from backend:', error);
          // Continue with local deletion only
        }
      }
    }
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
}

// Load a specific draft
export async function loadDraft(reportType, draftId) {
  try {
    // Try to get from IndexedDB first
    const localDraft = await indexedDBStorage.loadDraft(reportType, draftId);
    
    // If online, authenticated, and not found locally, try backend
    if (!localDraft && isOnline()) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get(`/core/drafts/${draftId}/`);
          const backendDraft = response.data;
          
          // Save to IndexedDB for offline access
          await indexedDBStorage.saveDraft(reportType, draftId, backendDraft.data);
          
          return {
            ...backendDraft.data,
            id: backendDraft.id,
            isLocal: false
          };
        } catch (error) {
          console.error('Error loading from backend:', error);
        }
      }
    }

    return localDraft ? {
      ...localDraft,
      id: draftId,
      isLocal: true
    } : null;
  } catch (error) {
    console.error('Error loading draft:', error);
    throw error;
  }
}

// Sync local drafts to backend
export async function syncDrafts(reportType) {
  try {
    if (!isOnline()) return;
    const token = localStorage.getItem('token');
    if (!token) return; // Exit early if not authenticated

    // Get all drafts (local and backend)
    const indexedDrafts = await indexedDBStorage.getAllDrafts(reportType);
    console.log('Indexed drafts for sync:', indexedDrafts);
    
    console.log('Fetching from backend for sync...');
    const response = await api.get(`/core/drafts/?report_type=${mapReportType(reportType)}`);
    console.log('Sync API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      keys: response.data ? Object.keys(response.data) : null
    });
    
    // Get the drafts array from the paginated response
    let backendDrafts = [];
   if (response.data) {
     if (Array.isArray(response.data)) {
       backendDrafts = response.data;
     } else if (response.data.results && Array.isArray(response.data.results)) {
       backendDrafts = response.data.results;
     } else {
       console.warn('Unexpected response format:', response.data);
     }
   }
    console.log('Backend drafts for sync:', backendDrafts);
    
    const backendIds = new Set(backendDrafts.map(d => String(d.id)));
    console.log('Backend IDs:', Array.from(backendIds));

    // Find local drafts not in backend
    const unsyncedLocalDrafts = indexedDrafts.filter(draft => {
      const draftId = String(draft.id);
      return draftId && !backendIds.has(draftId);
    });
    console.log('Unsynced local drafts:', unsyncedLocalDrafts);

    for (const draft of unsyncedLocalDrafts) {
      try {
        console.log('Syncing draft:', draft);
        const res = await api.post('/core/drafts/', {
          report_type: mapReportType(reportType),
          data: draft
        });
        console.log('Sync response:', res.data);
        
        if (res.data && res.data.id) {
          await indexedDBStorage.saveDraft(reportType, res.data.id, draft);
          console.log('Saved synced draft to IndexedDB');
        }
      } catch (err) {
        console.error('Error syncing draft to backend:', err);
      }
    }
  } catch (error) {
    console.error('Error during syncDrafts:', error);
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
  }
}

// Get the count of unique drafts for a report type (backend + unsynced local)
export async function getDraftCount(reportType) {
  const allDrafts = await getAllDrafts(reportType);
  // Use a Set to ensure unique IDs
  const uniqueIds = new Set(allDrafts.map(d => d.id));
  return uniqueIds.size;
} 