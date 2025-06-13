import api from '../services/api';
import { indexedDBStorage } from './indexedDBConfig';

// Utility function to safely extract drafts from API response
function extractDraftResults(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  console.warn('Unexpected draft response format:', data);
  return [];
}

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

  // Guard: Don't save drafts with id: null, 'null', undefined, or missing
  if (!savedId || savedId === 'null' || savedId === null || savedId === undefined) {
    console.warn('Attempted to save draft with invalid id:', savedId, normalizedData);
    return;
  }

  try {
    // Use a temp ID for new drafts
    const tempId = savedId && savedId !== 'null' && savedId !== null && savedId !== undefined ? savedId : `temp_${Date.now()}`;
    // Always use the raw reportType for local storage
    await indexedDBStorage.saveDraft(reportType, tempId, normalizedData);
    console.log('Successfully saved to IndexedDB');

    if (isOnline()) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          let response;
          const isValidId = savedId && savedId !== 'null' && savedId !== null && savedId !== undefined;
          if (isValidId) {
            // Update existing draft
            response = await api.put(`/api/drafts/${savedId}/`, {
              report_type: mapReportType(reportType), // mapped for backend
              data: normalizedData
            });
          } else {
            // Create new draft
            response = await api.post('/api/drafts/', {
              report_type: mapReportType(reportType), // mapped for backend
              data: normalizedData
            });
            savedId = response.data.id;
            // Update local draft with backend ID
            await indexedDBStorage.deleteDraft(reportType, tempId);
            await indexedDBStorage.saveDraft(reportType, savedId, normalizedData);
          }
          console.log('Successfully saved to backend:', savedId);
        } catch (error) {
          console.error('Error saving to backend:', error);
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
    console.log('Getting all drafts for:', reportType);
    // First try to get drafts from IndexedDB (raw type)
    const indexedDBDrafts = await indexedDBStorage.getAllDrafts(reportType);
    console.log('Fetching from IndexedDB...');
    console.log('IndexedDB drafts:', indexedDBDrafts);
    
    // Then fetch from backend (mapped type)
    console.log('Fetching from backend...');
    const response = await api.get(`/api/drafts/?report_type=${mapReportType(reportType)}`);
    console.log('API response for', reportType, ':', response.data);
    const backendDrafts = extractDraftResults(response.data);
    console.log('backendDrafts:', backendDrafts);
    
    // Process IndexedDB drafts
    const processedIndexedDBDrafts = Array.isArray(indexedDBDrafts) ? indexedDBDrafts.map(draft => ({
      ...draft,
      source: 'indexeddb'
    })) : [];
    console.log('Processed IndexedDB drafts:', processedIndexedDBDrafts);
    
    // Process backend drafts
    const processedBackendDrafts = Array.isArray(backendDrafts) ? backendDrafts.map(draft => ({
      ...draft,
      source: 'backend'
    })) : [];
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
    
    // Filter out drafts with invalid IDs
    const filteredDrafts = mergedDrafts.filter(d => d.id && d.id !== 'null' && d.id !== undefined);
    console.log('Final filtered drafts:', filteredDrafts);
    return filteredDrafts;
  } catch (error) {
    console.error('Error in getAllDrafts:', error);
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    // If backend fetch fails, return IndexedDB drafts (filtered)
    return Array.isArray(indexedDBDrafts) ? indexedDBDrafts.filter(d => d.id && d.id !== 'null' && d.id !== undefined).map(draft => ({
      ...draft,
      source: 'indexeddb'
    })) : [];
  }
};

// Delete a draft
export async function deleteDraft(reportType, draftId) {
  try {
    console.log('Deleting draft:', { reportType, draftId });
    
    // Delete from IndexedDB (raw type)
    await indexedDBStorage.deleteDraft(reportType, draftId);
    console.log('Successfully deleted from IndexedDB');

    // If online, authenticated, and not a temporary or null/undefined ID, delete from backend (mapped type)
    if (isOnline() && draftId && draftId !== 'null' && draftId !== undefined && !draftId.startsWith('temp_')) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await api.delete(`/api/drafts/${draftId}/`);
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
    // Try to get from IndexedDB first (raw type)
    const localDraft = await indexedDBStorage.loadDraft(reportType, draftId);
    
    // If online, authenticated, and not found locally, try backend (mapped type)
    if (!localDraft && isOnline()) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get(`/api/drafts/${draftId}/`);
          const backendDraft = response.data;
          
          // Save to IndexedDB for offline access (raw type)
          await indexedDBStorage.saveDraft(reportType, draftId, backendDraft.data);
          
          return {
            ...backendDraft.data,
            id: draftId
          };
        } catch (error) {
          console.error('Error loading draft from backend:', error);
        }
      }
    }
    if (localDraft) {
      return {
        ...localDraft,
        id: draftId
      };
    }
    return null;
  } catch (error) {
    console.error('Error loading draft:', error);
    throw error;
  }
}

// Sync drafts between backend and IndexedDB
export async function syncDrafts(reportType) {
  try {
    console.log('Starting draft sync for:', reportType);
    // Get drafts from backend
    const response = await api.get(`/api/drafts/?report_type=${reportType}`);
    console.log('API response for', reportType, 'in syncDrafts:', response.data);
    const backendDrafts = extractDraftResults(response.data);
    console.log('backendDrafts in syncDrafts:', backendDrafts);
    
    // Get local drafts
    const localDrafts = await indexedDBStorage.getAllDrafts(reportType);
    console.log('Local drafts:', localDrafts);
    
    // ... rest of syncDrafts function ...
  } catch (error) {
    console.error('Error syncing drafts:', error);
    throw error;
  }
}

// Get the count of unique drafts for a report type (backend + unsynced local)
export async function getDraftCount(reportType) {
  const allDrafts = await getAllDrafts(reportType);
  // Use a Set to ensure unique IDs
  const uniqueIds = Array.isArray(allDrafts) ? new Set(allDrafts.map(d => d.id)) : new Set();
  return uniqueIds.size;
}

// Utility: Cleanup all local drafts with id null or undefined for a report type
export const cleanupInvalidLocalDrafts = async (reportType) => {
  try {
    const store = indexedDBStorage.getStore(reportType);
    const keys = await store.keys();
    let deletedCount = 0;

    for (const key of keys) {
      const draft = await store.getItem(key);
      
      // Check for invalid drafts
      const isInvalid = !draft || 
                       !draft.id || 
                       draft.id === 'null' || 
                       draft.id === null || 
                       draft.id === undefined ||
                       (typeof draft.id === 'string' && draft.id.toLowerCase().includes('null')) ||
                       (typeof draft.id === 'string' && draft.id.startsWith('temp_') && Date.now() - parseInt(draft.id.split('_')[1]) > 24 * 60 * 60 * 1000); // Delete temp drafts older than 24 hours

      if (isInvalid) {
        console.log('Cleaning up invalid draft:', draft);
        await store.removeItem(key);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} invalid drafts for ${reportType}`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up invalid drafts:', error);
    return 0;
  }
}; 