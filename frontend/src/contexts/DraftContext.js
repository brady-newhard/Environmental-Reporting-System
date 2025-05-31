import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getAllDrafts, saveDraft, deleteDraft } from '../utils/draftStorage';
import { useAuth } from './AuthContext';

const DraftContext = createContext();

export const useDrafts = () => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error('useDrafts must be used within a DraftProvider');
  }
  return context;
};

export const DraftProvider = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(false);

  const loadDrafts = useCallback(async (reportType) => {
    if (loadingRef.current) return;
    if (loading || !isAuthenticated) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      // Map report type to match backend format
      const backendReportType = reportType === 'environmental_daily' ? 'environmental' : reportType;
      const loadedDrafts = await getAllDrafts(backendReportType);
      
      // Format drafts based on their source (backend or local)
      const formattedDrafts = loadedDrafts.map(draft => {
        // For backend drafts
        if (draft.data) {
          return {
            ...draft.data,
            id: draft.id,
            photos: draft.data.photos || [],
            created_at: draft.created_at,
            reportType: reportType // Add the frontend report type
          };
        }
        // For local drafts
        return {
          ...draft,
          id: draft.id,
          photos: draft.photos || [],
          created_at: draft.created_at || new Date().toISOString(),
          reportType: reportType // Add the frontend report type
        };
      });
      
      // Sort drafts by creation date, newest first
      formattedDrafts.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });
      
      console.log('Formatted drafts:', formattedDrafts);
      setDrafts(formattedDrafts);
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [loading, isAuthenticated]);

  const saveDraftAndUpdate = useCallback(async (reportType, draft) => {
    try {
      // Map report type to match backend format
      const backendReportType = reportType === 'environmental_daily' ? 'environmental' : reportType;
      const savedId = await saveDraft(backendReportType, draft);
      await loadDrafts(reportType);
      return savedId;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }, [loadDrafts]);

  const deleteDraftAndUpdate = useCallback(async (reportType, id, isLocal) => {
    try {
      // Map report type to match backend format
      const backendReportType = reportType === 'environmental_daily' ? 'environmental' : reportType;
      await deleteDraft(backendReportType, id, isLocal);
      await loadDrafts(reportType);
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  }, [loadDrafts]);

  return (
    <DraftContext.Provider value={{
      drafts,
      isLoading,
      loadDrafts,
      saveDraftAndUpdate,
      deleteDraftAndUpdate
    }}>
      {children}
    </DraftContext.Provider>
  );
}; 