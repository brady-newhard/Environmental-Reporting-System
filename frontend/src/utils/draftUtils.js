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
            response = await api.put(`/drafts/${savedId}/`, {
              report_type: mapReportType(reportType),
              data: normalizedData
            });
          } else {
            // Create new draft
            response = await api.post('/drafts/', {
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
export async function getAllDrafts(reportType) {
  try {
    console.log('Getting all drafts for:', reportType);
    let backendDrafts = [];

    // Get drafts from IndexedDB
    console.log('Fetching from IndexedDB...');
    const indexedDrafts = await indexedDBStorage.getAllDrafts(reportType);
    console.log('IndexedDB drafts:', indexedDrafts);
    
    // If online and authenticated, get drafts from backend
    if (isOnline()) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('Fetching from backend...');
          const response = await api.get(`/drafts/?report_type=${mapReportType(reportType)}`);
          backendDrafts = response.data.map(d => ({
            ...d.data,
            id: String(d.id),
            isLocal: false
          }));
          console.log('Backend drafts:', backendDrafts);
        } catch (error) {
          console.error('Error fetching backend drafts:', error);
        }
      }
    }

    // Process IndexedDB drafts
    const processedIndexedDrafts = indexedDrafts.map(draft => {
      // Extract ID from the draft data or use a temporary ID
      const draftId = draft.id || draft._id || `temp_${Date.now()}`;
      return {
        ...draft,
        id: String(draftId),
        isLocal: true
      };
    });
    console.log('Processed IndexedDB drafts:', processedIndexedDrafts);

    // Combine drafts, prioritizing backend versions and removing duplicates
    const backendIds = new Set(backendDrafts.map(d => d.id));
    const unsyncedLocalDrafts = processedIndexedDrafts.filter(d => !backendIds.has(d.id));
    
    // Remove any drafts that have been deleted
    const finalDrafts = [...backendDrafts, ...unsyncedLocalDrafts].filter(draft => {
      // Keep the draft if it exists in either backend or IndexedDB
      return draft && draft.id && typeof draft.id === 'string' && !draft.id.startsWith('temp_');
    });

    console.log('Final combined drafts:', finalDrafts);
    return finalDrafts;
  } catch (error) {
    console.error('Error getting all drafts:', error);
    throw error;
  }
}

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
          await api.delete(`/drafts/${draftId}/`);
          console.log('Successfully deleted from backend');
        } catch (error) {
          console.error('Error deleting from backend:', error);
          // Continue with local deletion only
        }
      }
    }

    // Clear any cached data
    const store = indexedDBStorage.getStore(reportType);
    await store.removeItem(`draft_${draftId}`);
    
    return true;
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
          const response = await api.get(`/drafts/${draftId}/`);
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
    const response = await api.get(`/drafts/?report_type=${mapReportType(reportType)}`);
    const backendDrafts = response.data.map(d => ({ ...d.data, id: String(d.id) }));
    const backendIds = new Set(backendDrafts.map(d => d.id));

    // Find local drafts not in backend
    const unsyncedLocalDrafts = indexedDrafts.filter(draft => !backendIds.has(String(draft.id)));

    for (const draft of unsyncedLocalDrafts) {
      if (!draft.id) {
        console.warn('syncDrafts: skipping draft with null/undefined id', draft);
        continue;
      }
      try {
        // Save to backend
        const res = await api.post('/drafts/', {
          report_type: mapReportType(reportType),
          data: draft
        });
        // Remove from local after successful sync
        await indexedDBStorage.deleteDraft(reportType, draft.id);
        // Optionally, save the backend version to local for offline access
        await indexedDBStorage.saveDraft(reportType, res.data.id, draft);
      } catch (err) {
        console.error('Error syncing draft to backend:', err);
      }
    }
  } catch (error) {
    console.error('Error during syncDrafts:', error);
  }
}

// Get the count of unique drafts for a report type (backend + unsynced local)
export async function getDraftCount(reportType) {
  const allDrafts = await getAllDrafts(reportType);
  // Use a Set to ensure unique IDs
  const uniqueIds = new Set(allDrafts.map(d => d.id));
  return uniqueIds.size;
} 