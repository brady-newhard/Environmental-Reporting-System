import { cleanupInvalidLocalDrafts } from './draftUtils';

export const performOneTimeCleanup = async () => {
  console.log('Starting one-time draft cleanup...');
  
  const reportTypes = ['environmental', 'swppp', 'punchlist'];
  let totalCleaned = 0;
  
  for (const reportType of reportTypes) {
    try {
      const cleaned = await cleanupInvalidLocalDrafts(reportType);
      totalCleaned += cleaned;
      console.log(`Cleaned ${cleaned} drafts for ${reportType}`);
    } catch (error) {
      console.error(`Error cleaning ${reportType} drafts:`, error);
    }
  }
  
  console.log(`One-time cleanup complete. Total drafts cleaned: ${totalCleaned}`);
  return totalCleaned;
};

// Usage:
// In your browser console:
// import('./utils/cleanupDrafts').then(module => module.performOneTimeCleanup()); 