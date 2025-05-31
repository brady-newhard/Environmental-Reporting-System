import localforage from 'localforage';
import axios from './axios';

const LOCAL_PREFIX = 'draft_';

// Configure localForage
localforage.config({
  name: 'EnvironmentalDrafts',
  storeName: 'drafts',
  description: 'Storage for environmental report drafts'
});

export const isOnline = () => navigator.onLine;

// Save a draft (offline or online)
export async function saveDraft(reportType, draft) {
  const draftId = draft.id || Date.now().toString();
  if (isOnline()) {
    if (draft.id) {
      await axios.put(`/api/drafts/${draft.id}/`, { report_type: reportType, data: draft });
      // Save to IndexedDB for offline access
      await localforage.setItem(`${LOCAL_PREFIX}${reportType}_${draftId}`, draft);
      return draft.id;
    } else {
      const res = await axios.post('/api/drafts/', { report_type: reportType, data: draft });
      await localforage.setItem(`${LOCAL_PREFIX}${reportType}_${res.data.id}`, { ...draft, id: res.data.id });
      return res.data.id;
    }
  } else {
    await localforage.setItem(`${LOCAL_PREFIX}${reportType}_${draftId}`, { ...draft, id: draftId });
    return draftId;
  }
}

// Load a draft
export async function loadDraft(reportType, draftId) {
  return await localforage.getItem(`${LOCAL_PREFIX}${reportType}_${draftId}`);
}

// Delete a draft (offline or online)
export async function deleteDraft(reportType, draftId, isLocal) {
  await localforage.removeItem(`${LOCAL_PREFIX}${reportType}_${draftId}`);
  if (isOnline() && !isLocal) {
    await axios.delete(`/api/drafts/${draftId}/`);
  }
}

// List all draft IDs (local only)
export async function listDrafts(reportType) {
  const keys = await localforage.keys();
  return keys.filter(key => key.startsWith(`${LOCAL_PREFIX}${reportType}_`))
             .map(key => key.replace(`${LOCAL_PREFIX}${reportType}_`, ''));
}

// Get all drafts (merged local + backend, deduped)
export async function getAllDrafts(reportType) {
  let backendDrafts = [];
  if (isOnline()) {
    try {
      const res = await axios.get(`/api/drafts/?report_type=${reportType}`);
      backendDrafts = res.data.map(d => ({ ...d.data, id: d.id, isLocal: false }));
    } catch (e) { /* ignore if offline */ }
  }
  const keys = await localforage.keys();
  const localDrafts = (await Promise.all(
    keys.filter(key => key.startsWith(`${LOCAL_PREFIX}${reportType}_`))
        .map(key => localforage.getItem(key))
  )).map(d => ({ ...d, isLocal: true }));
  const backendIds = new Set(backendDrafts.map(d => d.id));
  const unsyncedLocalDrafts = localDrafts.filter(d => !backendIds.has(d.id));
  return [...backendDrafts, ...unsyncedLocalDrafts];
}

// Sync local drafts to backend
export async function syncDrafts(reportType) {
  if (!isOnline()) return;
  const drafts = await getAllDrafts(reportType);
  for (const draft of drafts) {
    if (draft.isLocal) {
      const newId = await saveDraft(reportType, draft);
      await deleteDraft(reportType, draft.id, true);
    }
  }
}

// Migrate from localStorage to IndexedDB
export async function migrateFromLocalStorage(reportType) {
  const keys = Object.keys(localStorage);
  const draftKeys = keys.filter(key => key.startsWith(`${LOCAL_PREFIX}${reportType}_`));
  for (const key of draftKeys) {
    const data = JSON.parse(localStorage.getItem(key));
    await localforage.setItem(key, data);
    localStorage.removeItem(key);
  }
} 