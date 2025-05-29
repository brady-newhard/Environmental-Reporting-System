import localforage from 'localforage';

// Configure localForage instances for different report types
const reportStores = {
  environmental: localforage.createInstance({
    name: 'EnvironmentalReports',
    storeName: 'drafts',
    description: 'Storage for environmental report drafts'
  }),
  swppp: localforage.createInstance({
    name: 'SWPPPReports',
    storeName: 'drafts',
    description: 'Storage for SWPPP report drafts'
  }),
  punchlist: localforage.createInstance({
    name: 'PunchlistReports',
    storeName: 'drafts',
    description: 'Storage for punchlist report drafts'
  })
};

// Utility functions for draft storage
export const indexedDBStorage = {
  /**
   * Get the appropriate store for a report type
   * @param {string} reportType - The type of report
   * @returns {Object} - The localforage instance for that report type
   */
  getStore(reportType) {
    return reportStores[reportType] || reportStores.environmental;
  },

  /**
   * Save a draft report
   * @param {string} reportType - The type of report
   * @param {string} draftId - Unique identifier for the draft
   * @param {Object} data - The draft data to store
   * @returns {Promise} - Promise that resolves when the data is stored
   */
  async saveDraft(reportType, draftId, data) {
    try {
      const store = this.getStore(reportType);
      await store.setItem(`draft_${draftId}`, data);
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  },

  /**
   * Load a draft report
   * @param {string} reportType - The type of report
   * @param {string} draftId - Unique identifier for the draft
   * @returns {Promise} - Promise that resolves with the draft data
   */
  async loadDraft(reportType, draftId) {
    try {
      const store = this.getStore(reportType);
      return await store.getItem(`draft_${draftId}`);
    } catch (error) {
      console.error('Error loading draft:', error);
      throw error;
    }
  },

  /**
   * Delete a draft report
   * @param {string} reportType - The type of report
   * @param {string} draftId - Unique identifier for the draft
   * @returns {Promise} - Promise that resolves when the draft is deleted
   */
  async deleteDraft(reportType, draftId) {
    try {
      const store = this.getStore(reportType);
      // Add draft_ prefix if it's not already there
      const key = draftId.startsWith('draft_') ? draftId : `draft_${draftId}`;
      await store.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  },

  /**
   * List all draft IDs for a report type
   * @param {string} reportType - The type of report
   * @returns {Promise} - Promise that resolves with an array of draft IDs
   */
  async listDrafts(reportType) {
    try {
      const store = this.getStore(reportType);
      const keys = await store.keys();
      return keys.filter(key => key.startsWith('draft_'))
                 .map(key => key.replace('draft_', ''));
    } catch (error) {
      console.error('Error listing drafts:', error);
      throw error;
    }
  },

  /**
   * Get all drafts for a report type
   * @param {string} reportType - The type of report
   * @returns {Promise} - Promise that resolves with an array of all drafts
   */
  async getAllDrafts(reportType) {
    try {
      const store = this.getStore(reportType);
      const keys = await store.keys();
      const drafts = await Promise.all(
        keys.filter(key => key.startsWith('draft_'))
            .map(key => store.getItem(key))
      );
      return drafts.filter(draft => draft !== null);
    } catch (error) {
      console.error('Error getting all drafts:', error);
      throw error;
    }
  },

  /**
   * Clear all drafts for a report type
   * @param {string} reportType - The type of report
   * @returns {Promise} - Promise that resolves when all drafts are cleared
   */
  async clearAllDrafts(reportType) {
    try {
      const store = this.getStore(reportType);
      await store.clear();
      return true;
    } catch (error) {
      console.error('Error clearing drafts:', error);
      throw error;
    }
  }
}; 