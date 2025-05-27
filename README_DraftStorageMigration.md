# Environmental Reporting System: Draft Storage Migration Plan

## Background

Currently, draft reports (including photos and large data) are stored in `localStorage` for offline use. However, `localStorage` has a strict size limit (~5MB), which is easily exceeded with images and large reports, resulting in `QuotaExceededError` and data loss risk.

## Goal

Migrate draft storage from `localStorage` to **IndexedDB** using the [localForage](https://github.com/localForage/localForage) library. This will:
- Support much larger offline storage (hundreds of MBs or more)
- Allow robust offline/online workflows
- Be easy to debug and maintain
- Minimize risk and complexity

## Why localForage?
- **Simple API** (very similar to localStorage, but async)
- **Well-maintained** and widely used
- **Handles blobs, files, and large objects**
- **Easy to debug** (data visible in browser dev tools under IndexedDB)
- **Low risk**: Easy to revert if needed

## Migration Plan

### 1. Install localForage
```
npm install localforage
```

### 2. Create a Storage Utility
- Create a utility (e.g., `draftStorage.js`) that wraps localForage for get/set/remove operations.

### 3. Replace localStorage Calls
- Update all code that uses `localStorage` for drafts to use the new utility.
- Example:
  - `localStorage.setItem('draft_123', data)` → `localforage.setItem('draft_123', data)`
  - `localStorage.getItem('draft_123')` → `localforage.getItem('draft_123')`

### 4. Test Thoroughly
- Save, load, and delete drafts (with and without images) both online and offline.
- Confirm data persists after browser refresh and when offline.

### 5. (Optional) Migrate Existing Data
- On first run, copy any existing drafts from localStorage to IndexedDB, then clear localStorage.

### 6. Document and Deploy
- Update documentation for the team.
- Deploy after confirming stability.

## Rollback Plan
- If issues arise, revert to the previous `localStorage`-based utility (API is similar, so this is straightforward).
- No changes to UI or API logic are required for rollback.

## Testing Checklist
- [ ] Can save a new draft (with and without images)
- [ ] Can load a draft after refresh and offline
- [ ] Can delete a draft
- [ ] No `QuotaExceededError` occurs
- [ ] Data is visible in browser dev tools (IndexedDB > EnvironmentalDrafts)
- [ ] (If migrating) Old drafts are available after migration

## References
- [localForage Documentation](https://localforage.github.io/localForage/)
- [IndexedDB API Overview (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

---

**When ready, follow this plan to ensure a smooth migration and robust offline support for your field users.** 