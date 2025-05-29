import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Grid, Typography, TextField, Button, Box } from '@mui/material';
import ReportTemplate from '../../../templates/ReportTemplate';
import { saveDraft, normalizeDraft, loadDraft } from '../../../../utils/draftUtils';
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
    const loadDraftData = async () => {
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
            id: location.state.draft.id || id
          };
        }
        // Then try to load from IndexedDB/backend
        else if (id) {
          console.log('Loading draft from storage with ID:', id);
          draftData = await loadDraft(reportType, id);
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

    loadDraftData();
  }, [id, location.state]);

  const handleSave = async (formData) => {
    console.log('EnvironmentalDailyReportForm handleSave called with:', formData);
    try {
      console.log('handleSave formData:', formData);
      const dataToSave = normalizeDraft(formData);
      console.log('handleSave dataToSave:', dataToSave);
      console.log('Calling saveDraft with:', { reportType, dataToSave });
      
      // Save draft using the new storage system
      const savedDraft = await saveDraft(reportType, dataToSave);
      console.log('Draft saved with ID:', savedDraft.id);
      
      // Update the URL if this was a new draft
      if (!dataToSave.id) {
        navigate(`/environmental/reports/daily/edit/${savedDraft.id}`, {
          state: { draft: { ...savedDraft.data, id: savedDraft.id } }
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
    console.log('Navigating to review with draft ID:', draft.id);
    navigate(`/environmental/reports/daily/review/${draft.id}`);
  };

  return (
    <>
      <ReportTemplate 
        initialData={draft}
        onChange={(newData) => setDraft(newData)}
        onSave={handleSave}
        onReview={handleReview}
        onCancel={handleCloseSnackbar}
        config={environmentalDailyReportConfig}
      />
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