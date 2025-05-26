import axios from './axios';

const LOCAL_PREFIX = 'draft_';

export const isOnline = () => navigator.onLine;

// Save a draft (offline or online)
export async function saveDraft(reportType, draft) {
  if (isOnline()) {
    if (draft.id) {
      await axios.put(`/api/drafts/${draft.id}/`, { report_type: reportType, data: draft });
      return draft.id;
    } else {
      const res = await axios.post('/api/drafts/', { report_type: reportType, data: draft });
      return res.data.id;
    }
  } else {
    const id = draft.id || Date.now().toString();
    localStorage.setItem(`${LOCAL_PREFIX}${reportType}_${id}`, JSON.stringify({ ...draft, id }));
    return id;
  }
}

// Get all drafts (offline and online)
export async function getAllDrafts(reportType) {
  let backendDrafts = [];
  if (isOnline()) {
    try {
      const res = await axios.get(`/api/drafts/?report_type=${reportType}`);
      backendDrafts = res.data.map(d => ({ ...d.data, id: d.id, isLocal: false }));
    } catch (e) { /* ignore if offline */ }
  }
  const localDrafts = Object.keys(localStorage)
    .filter(key => key.startsWith(`${LOCAL_PREFIX}${reportType}_`))
    .map(key => {
      const data = JSON.parse(localStorage.getItem(key));
      return { ...data, isLocal: true };
    });
  const backendIds = new Set(backendDrafts.map(d => d.id));
  const unsyncedLocalDrafts = localDrafts.filter(d => !backendIds.has(d.id));
  return [...backendDrafts, ...unsyncedLocalDrafts];
}

// Delete a draft
export async function deleteDraft(reportType, id, isLocal) {
  if (isLocal) {
    localStorage.removeItem(`${LOCAL_PREFIX}${reportType}_${id}`);
  } else if (isOnline()) {
    await axios.delete(`/api/drafts/${id}/`);
  }
}

// Sync local drafts to backend
export async function syncDrafts(reportType) {
  if (!isOnline()) return;
  const drafts = await getAllDrafts(reportType);
  for (const draft of drafts) {
    if (draft.isLocal) {
      const newId = await saveDraft(reportType, draft);
      deleteDraft(reportType, draft.id, true);
    }
  }
} 