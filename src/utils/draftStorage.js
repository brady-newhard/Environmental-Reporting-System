import localforage from 'localforage';

// Configure localForage
localforage.config({
  name: 'EnvironmentalDrafts',
  storeName: 'drafts',
  description: 'Storage for environmental report drafts'
});

// Utility functions for draft storage
export const draftStorage = {
  /**
   * Save a draft report
   * @param {string} draftId - Unique identifier for the draft
   * @param {Object} data - The draft data to store
   * @returns {Promise} - Promise that resolves when the data is stored
   */
  async saveDraft(draftId, data) {
    try {
      await localforage.setItem(`draft_${draftId}`, data);
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  },

  /**
   * Load a draft report
   * @param {string} draftId - Unique identifier for the draft
   * @returns {Promise} - Promise that resolves with the draft data
   */
  async loadDraft(draftId) {
    try {
      return await localforage.getItem(`draft_${draftId}`);
    } catch (error) {
      console.error('Error loading draft:', error);
      throw error;
    }
  },

  /**
   * Delete a draft report
   * @param {string} draftId - Unique identifier for the draft
   * @returns {Promise} - Promise that resolves when the draft is deleted
   */
  async deleteDraft(draftId) {
    try {
      await localforage.removeItem(`draft_${draftId}`);
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  },

  /**
   * List all draft IDs
   * @returns {Promise} - Promise that resolves with an array of draft IDs
   */
  async listDrafts() {
    try {
      const keys = await localforage.keys();
      return keys.filter(key => key.startsWith('draft_'))
                 .map(key => key.replace('draft_', ''));
    } catch (error) {
      console.error('Error listing drafts:', error);
      throw error;
    }
  },

  /**
   * Migrate data from localStorage to IndexedDB
   * @returns {Promise} - Promise that resolves when migration is complete
   */
  async migrateFromLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      const draftKeys = keys.filter(key => key.startsWith('draft_'));
      
      for (const key of draftKeys) {
        const data = JSON.parse(localStorage.getItem(key));
        await localforage.setItem(key, data);
        localStorage.removeItem(key);
      }
      
      return true;
    } catch (error) {
      console.error('Error migrating drafts:', error);
      throw error;
    }
  }
}; 