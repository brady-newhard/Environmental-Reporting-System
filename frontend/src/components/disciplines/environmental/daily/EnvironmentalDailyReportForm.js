import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Grid, Typography, TextField, Button, Box } from '@mui/material';
import ReportTemplate from '../../../templates/ReportTemplate';
import { saveDraft, normalizeDraft, getAllDrafts } from '../../../../utils/draftUtils';
import AddIcon from '@mui/icons-material/Add';
import environmentalDailyReportConfig from './environmentalDailyReportConfig';

console.log('EnvironmentalDailyReportForm loaded');

export default function EnvironmentalDailyReportForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(() => {
    // Initialize with empty draft immediately
    const emptyDraft = {
      header: {},
      sections: [
        {
          name: 'Crew Daily Summaries',
          rows: [{ Crew: '', CustomCrew: '', 'Start Station': '', 'End Station': '', Notes: '' }]
        },
        {
          name: 'Daily Progress',
          rows: [{ Phase: '', 'Start Station': '', 'End Station': '' }]
        }
      ],
      summaries: {},
      photos: [],
      signature: '',
      sigDate: '',
      preparedBy: '',
      id: id || null
    };
    console.log('Initial draft state:', emptyDraft);
    return emptyDraft;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const reportType = 'environmental';

  useEffect(() => {
    const loadDraft = async () => {
      setIsLoading(true);
      try {
        let draftData = null;
        
        // First try to get from location state
        if (location.state?.formData) {
          console.log('Loading draft from location state formData:', location.state.formData);
          draftData = location.state.formData;
        } else if (location.state?.draft) {
          console.log('Loading draft from location state draft:', location.state.draft);
          draftData = {
            ...location.state.draft,
            id: location.state.draft.id || id // Use ID from draft or URL param
          };
        }
        // Then try to get from localStorage
        else if (id) {
          const localKey = `${reportType}_draft_${id}`;
          const localData = localStorage.getItem(localKey);
          if (localData) {
            console.log('Loading draft from localStorage:', localData);
            draftData = JSON.parse(localData);
          }
        }

        if (draftData) {
          // Normalize and set the draft data
          const normalizedDraft = normalizeDraft(draftData);
          console.log('Normalized draft:', normalizedDraft);
          setDraft(normalizedDraft);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        setSnackbar({
          open: true,
          message: 'Error loading draft',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [id, location.state]);

  const handleSave = async (formData) => {
    console.log('EnvironmentalDailyReportForm handleSave called with:', formData);
    try {
      console.log('handleSave formData:', formData);
      const dataToSave = normalizeDraft(formData);
      console.log('handleSave dataToSave:', dataToSave);
      console.log('Calling saveDraft with:', { reportType, dataToSave });
      
      // Save to backend first
      const savedDraft = await saveDraft(reportType, dataToSave);
      console.log('Draft saved with ID:', savedDraft.id);
      
      // Try to save to localStorage, but don't fail if it doesn't work
      try {
        // Clear old drafts to make space
        const allDrafts = await getAllDrafts(reportType);
        if (allDrafts.length > 0) {
          // Keep only the most recent 5 drafts
          const recentDrafts = allDrafts.slice(-5);
          localStorage.setItem(`${reportType}_drafts`, JSON.stringify(recentDrafts));
        }
        
        // Save the current draft
        localStorage.setItem(`${reportType}_draft_${savedDraft.id}`, JSON.stringify(dataToSave));
      } catch (storageError) {
        console.warn('Could not save to localStorage:', storageError);
        // Continue execution - the draft is still saved in the backend
      }
      
      // Update the URL if this was a new draft
      if (!dataToSave.id) {
        navigate(`/environmental/reports/daily/edit/${savedDraft.id}`, {
          state: { draft: { ...dataToSave, id: savedDraft.id } }
        });
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Draft saved successfully',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error saving report:', error);
      setSnackbar({
        open: true,
        message: 'Error saving draft: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleReview = () => {
    console.log('Navigating to review with draft:', draft);
    const reviewData = {
      ...draft,
      id: draft.id,
      photos: draft.photos || [],
      header: draft.header || {},
      sections: draft.sections || [],
      summaries: draft.summaries || {},
      signature: draft.signature || '',
      sigDate: draft.sigDate || '',
      preparedBy: draft.preparedBy || ''
    };
    console.log('Review data being passed:', reviewData);
    navigate(`/environmental/reports/daily/review/${draft.id}`, {
      state: { draft: reviewData }
    });
  };

  return (
    <>
      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <ReportTemplate 
          initialData={draft}
          onChange={(newData) => setDraft(newData)}
        onSave={handleSave}
          onReview={handleReview}
          onCancel={handleCloseSnackbar}
          config={environmentalDailyReportConfig}
      />
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
} 