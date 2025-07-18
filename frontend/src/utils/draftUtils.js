import api from '../services/api';
import { indexedDBStorage } from './indexedDBConfig';
import { convertPhotosToBase64 } from './photoUtils';

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
export async function normalizeDraft(data) {
  // Ensure data exists and has the expected structure
  if (!data) {
    console.warn('normalizeDraft called with undefined data');
    return {
      header: {},
      sections: [],
      summaries: {},
      photos: [],
      signature: '',
      sigDate: '',
      preparedBy: ''
    };
  }

  console.log('normalizeDraft called with data:', {
    hasHeader: !!data.header,
    hasSections: !!data.sections,
    hasPhotos: !!data.photos,
    photoCount: data.photos ? data.photos.length : 0
  });

  // Convert blob URLs to base64 for persistent storage
  const convertedPhotos = await convertPhotosToBase64(data.photos || []);
  
  console.log('normalizeDraft: Photos converted:', {
    originalCount: data.photos ? data.photos.length : 0,
    convertedCount: convertedPhotos.length,
    convertedPhotos: convertedPhotos.map((photo, idx) => ({
      idx,
      id: photo.id,
      preview: photo.preview ? photo.preview.substring(0, 50) + '...' : 'none',
      url: photo.url ? photo.url.substring(0, 50) + '...' : 'none'
    }))
  });
  
  return {
    header: data.header || {},
    sections: data.sections || [],
    summaries: data.summaries || {},
    signature: data.signature || '',
    sigDate: data.sigDate || '',
    preparedBy: data.preparedBy || '',
    photos: convertedPhotos, // Ensure photos are overwritten with converted versions
    ...data
  };
}

// Save a draft (both online and offline)
export async function saveDraft(reportType, data) {
  try {
    const normalizedData = await normalizeDraft(data);
    const savedId = data.id;
    const isValidId = savedId && savedId !== 'null' && savedId !== undefined && !(typeof savedId === 'string' && savedId.startsWith('temp_'));
    
    console.log('saveDraft called with:', {
      reportType,
      hasId: !!savedId,
      isValidId,
      photoCount: normalizedData.photos ? normalizedData.photos.length : 0
    });
    
    // Save to IndexedDB first (raw type) - this should always work
    await indexedDBStorage.saveDraft(reportType, savedId, normalizedData);
    console.log('Successfully saved to IndexedDB');

    // If online and authenticated, try to save to backend (mapped type)
    if (isOnline()) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          let response;
          if (isValidId) {
            // Update existing draft
            console.log('Updating existing draft with ID:', savedId);
            response = await api.put(`/drafts/${savedId}/`, {
              report_type: mapReportType(reportType),
              data: normalizedData
            });
            console.log('Update response:', response.data);
          } else {
            // Create new draft
            console.log('Creating new draft');
            response = await api.post('/drafts/', {
              report_type: mapReportType(reportType),
              data: normalizedData
            });
            console.log('Draft creation response:', response.data);
            // Update the normalized data with the new draft ID
            normalizedData.id = response.data.id;
            // Also save the updated data to IndexedDB
            await indexedDBStorage.saveDraft(reportType, response.data.id, normalizedData);
          }
          
          // Return consistent structure
          const result = {
            id: response.data.id,
            ...normalizedData
          };
          console.log('Returning draft result:', { id: result.id, photoCount: result.photos ? result.photos.length : 0 });
          return result;
        } catch (backendError) {
          console.error('Backend save failed, but local save succeeded:', backendError);
          // Return the local save result even if backend fails
          const result = {
            id: savedId,
            ...normalizedData
          };
          console.log('Returning local draft result:', { id: result.id, photoCount: result.photos ? result.photos.length : 0 });
          return result;
        }
      }
    }
    
    // Return local save result
    const result = {
      id: savedId,
      ...normalizedData
    };
    console.log('Returning local-only draft result:', { id: result.id, photoCount: result.photos ? result.photos.length : 0 });
    return result;
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
    const response = await api.get(`/drafts/?report_type=${mapReportType(reportType)}`);
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
    const processedBackendDrafts = Array.isArray(backendDrafts) ? backendDrafts.map(draft => {
      // Backend drafts have the actual data in a 'data' property
      const processedDraft = {
        ...draft,
        source: 'backend'
      };
      
      // If the draft has a data property, merge it with the top level
      if (draft.data) {
        Object.assign(processedDraft, draft.data);
      }
      
      console.log('Processed backend draft:', {
        id: processedDraft.id,
        hasData: !!draft.data,
        dataKeys: draft.data ? Object.keys(draft.data) : [],
        headerKeys: processedDraft.header ? Object.keys(processedDraft.header) : []
      });
      
      return processedDraft;
    }) : [];
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
    const filteredDrafts = mergedDrafts.filter(d => {
      const id = d.id;
      return id && id !== 'null' && id !== undefined && 
             (typeof id !== 'string' || !id.toLowerCase().includes('null'));
    });
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
    try {
      const localDrafts = await indexedDBStorage.getAllDrafts(reportType);
      const filteredLocalDrafts = Array.isArray(localDrafts) ? localDrafts.filter(d => {
        const id = d.id;
        return id && id !== 'null' && id !== undefined && 
               (typeof id !== 'string' || !id.toLowerCase().includes('null'));
      }).map(draft => ({
        ...draft,
        source: 'indexeddb'
      })) : [];
      console.log('Returning local drafts as fallback:', filteredLocalDrafts);
      return filteredLocalDrafts;
    } catch (localError) {
      console.error('Error getting local drafts:', localError);
      return [];
    }
  }
};

// Delete a draft
export const deleteDraft = async (reportType, draftId) => {
  console.log('Deleting draft:', { reportType, draftId });
  
  try {
    // Convert draftId to string for consistent handling
    const draftIdStr = String(draftId);
    
    // Delete from IndexedDB
    await indexedDBStorage.deleteDraft(reportType, draftIdStr);
    console.log('Successfully deleted from IndexedDB');

    // Delete from backend if online
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token available:', true);
      try {
        console.log('Attempting to delete from backend with token:', token.substring(0, 10) + '...');
        const response = await api.delete(`/drafts/${draftIdStr}/`);
        console.log('Backend delete response:', response);
        console.log('Successfully deleted from backend');
      } catch (error) {
        console.error('Error deleting from backend:', error);
        // Don't throw here - we still want to return success if local delete worked
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

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
          const response = await api.get(`/drafts/${draftId}/`);
          const backendDraft = response.data;
          console.log('Backend draft response:', backendDraft);
          
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
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping draft sync');
      return [];
    }

    // Get drafts from backend
    const response = await api.get(`/drafts/?report_type=${mapReportType(reportType)}`);
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

// Get the count of unique drafts for a report type (both local and backend)
export async function getDraftCount(reportType) {
  try {
    // Get local drafts first
    const localDrafts = await indexedDBStorage.getAllDrafts(reportType);
    const localDraftIds = new Set(
      Array.isArray(localDrafts) 
        ? localDrafts
            .filter(d => {
              const id = d?.id;
              return id && 
                     id !== 'null' && 
                     id !== null && 
                     id !== undefined && 
                     (typeof id !== 'string' || !id.startsWith('temp_'));
            })
            .map(d => d.id)
        : []
    );

    // If online and authenticated, get backend drafts
    const token = localStorage.getItem('token');
    if (token && isOnline()) {
      try {
        const response = await api.get(`/drafts/?report_type=${mapReportType(reportType)}`);
        const backendDrafts = extractDraftResults(response.data);
        if (Array.isArray(backendDrafts)) {
          // Add backend draft IDs to the set (automatically handles duplicates)
          backendDrafts.forEach(draft => {
            if (draft?.id) {
              localDraftIds.add(draft.id);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching backend drafts:', error);
        // Continue with local count if backend fetch fails
      }
    }

    return localDraftIds.size;
  } catch (error) {
    console.error('Error getting draft count:', error);
    return 0;
  }
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

// Clear IndexedDB drafts that don't belong to the current user
export const clearOtherUserDrafts = async () => {
  try {
    console.log('=== CLEARING OTHER USER DRAFTS ===');
    
    // Get current user info
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping clear');
      return 0;
    }
    
    let currentUser = null;
    try {
      const response = await api.get('/users/profile/');
      currentUser = response.data;
      console.log('Current user for clearing:', currentUser);
    } catch (error) {
      console.log('Could not get current user, skipping clear');
      return 0;
    }
    
    // Get all report types
    const reportTypes = ['environmental_daily', 'swppp', 'punchlist', 'daily_utility', 'pay_item', 'welding', 'coating'];
    let clearedCount = 0;
    
    for (const reportType of reportTypes) {
      try {
        console.log(`Checking ${reportType} store...`);
        const store = indexedDBStorage.getStore(reportType);
        const keys = await store.keys();
        console.log(`Found ${keys.length} keys in ${reportType} store:`, keys);
        
        for (const key of keys) {
          const draft = await store.getItem(key);
          console.log(`Draft ${key}:`, draft);
          if (draft) {
            const draftUser = draft.user || draft.user_id || draft.username;
            console.log(`Draft ${key} user: ${draftUser}, current user: ${currentUser.username}`);
            if (draftUser && draftUser !== currentUser.username) {
              console.log(`CLEARING draft ${key} - belongs to user ${draftUser}, not ${currentUser.username}`);
              await store.removeItem(key);
              clearedCount++;
            } else {
              console.log(`KEEPING draft ${key} - belongs to current user`);
            }
          }
        }
      } catch (error) {
        console.error(`Error clearing drafts for ${reportType}:`, error);
      }
    }
    
    console.log(`=== CLEARED ${clearedCount} DRAFTS FROM OTHER USERS ===`);
    return clearedCount;
  } catch (error) {
    console.error('Error clearing other user drafts:', error);
    return 0;
  }
};

// Migrate drafts from localStorage to IndexedDB
export const migrateLocalStorageDrafts = async () => {
  try {
    console.log('=== STARTING LOCALSTORAGE MIGRATION ===');
    
    // Get current user info from token
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping migration');
      return 0;
    }
    
    // Get current user info
    let currentUser = null;
    try {
      const response = await api.get('/users/profile/');
      currentUser = response.data;
      console.log('Current user for migration:', currentUser);
    } catch (error) {
      console.log('Could not get current user, skipping migration');
      return 0;
    }
    
    // Get all localStorage keys that look like draft keys
    const allKeys = Object.keys(localStorage);
    console.log('All localStorage keys:', allKeys);
    const draftKeys = allKeys.filter(key => 
      key.includes('draft_') || 
      key.includes('_draft_') ||
      key.includes('utility') ||
      key.includes('environmental') ||
      key.includes('swppp') ||
      key.includes('punchlist')
    );
    
    console.log('Found potential draft keys:', draftKeys);
    
    let migratedCount = 0;
    
    for (const key of draftKeys) {
      try {
        console.log(`Processing localStorage key: ${key}`);
        const draftData = localStorage.getItem(key);
        if (!draftData) {
          console.log(`No data found for key: ${key}`);
          continue;
        }
        
        const parsedData = JSON.parse(draftData);
        if (!parsedData || typeof parsedData !== 'object') {
          console.log(`Invalid data for key: ${key}`);
          continue;
        }
        
        console.log(`Parsed data for ${key}:`, parsedData);
        
        // Check if this draft belongs to the current user
        // Look for user information in the draft data
        const draftUser = parsedData.user || parsedData.user_id || parsedData.username;
        console.log(`Draft user: ${draftUser}, Current user: ${currentUser.username}`);
        
        if (draftUser && draftUser !== currentUser.username) {
          console.log(`SKIPPING draft ${key} - belongs to user ${draftUser}, not ${currentUser.username}`);
          continue;
        }
        
        // If no user info in draft, skip it to be safe
        if (!draftUser) {
          console.log(`SKIPPING draft ${key} - no user information found`);
          continue;
        }
        
        console.log(`PROCESSING draft ${key} - belongs to current user`);
        
        // Determine report type from key
        let reportType = 'generic';
        if (key.includes('daily_utility') || key.includes('i3_utility')) {
          reportType = 'daily_utility';
        } else if (key.includes('pay_item') || key.includes('utility_payload')) {
          reportType = 'pay_item';
        } else if (key.includes('environmental_daily')) {
          reportType = 'environmental_daily';
        } else if (key.includes('swppp')) {
          reportType = 'swppp';
        } else if (key.includes('punchlist')) {
          reportType = 'punchlist';
        } else if (key.includes('welding')) {
          reportType = 'welding';
        } else if (key.includes('coating')) {
          reportType = 'coating';
        }
        
        // Extract draft ID from key
        let draftId = key;
        if (key.includes('draft_')) {
          draftId = key.split('draft_')[1];
        } else if (key.includes('_draft_')) {
          draftId = key.split('_draft_')[1];
        }
        
        // Ensure we have a valid ID
        if (!draftId || draftId === 'null' || draftId === 'undefined') {
          console.log('Skipping invalid draft ID:', draftId);
          continue;
        }
        
        console.log(`Saving draft ${draftId} to ${reportType} store`);
        
        // Save to IndexedDB
        await indexedDBStorage.saveDraft(reportType, draftId, parsedData);
        console.log(`MIGRATED draft ${draftId} to ${reportType} store for user ${currentUser.username}`);
        migratedCount++;
        
        // Remove from localStorage
        localStorage.removeItem(key);
        console.log(`Removed ${key} from localStorage`);
        
      } catch (error) {
        console.error(`Error migrating draft ${key}:`, error);
      }
    }
    
    console.log(`=== MIGRATION COMPLETE. Migrated ${migratedCount} drafts for user ${currentUser.username}. ===`);
    return migratedCount;
    
  } catch (error) {
    console.error('Error during migration:', error);
    return 0;
  }
}; 