import axios from './axios';

export const migrateDrafts = async () => {
  try {
    // Get all keys from localStorage
    const keys = Object.keys(localStorage);
    
    // Filter for environmental draft keys
    const draftKeys = keys.filter(key => key.startsWith('environmental_draft_'));
    
    // Migrate each draft
    for (const key of draftKeys) {
      const draftData = JSON.parse(localStorage.getItem(key));
      
      // Create draft in backend
      await axios.post('/api/drafts/', {
        report_type: 'environmental',
        data: draftData
      });
      
      // Keep the draft in localStorage for now
      // We'll remove it after confirming the migration was successful
    }
    
    console.log(`Migrated ${draftKeys.length} drafts to backend`);
    return draftKeys.length;
  } catch (error) {
    console.error('Error migrating drafts:', error);
    throw error;
  }
}; 