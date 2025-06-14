import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Snackbar, Alert, Grid, Typography, TextField, Button, Box } from '@mui/material';
import ReportTemplate from '../../../templates/ReportTemplate';
import { saveDraft, normalizeDraft, loadDraft } from '../../../../utils/draftUtils';
import AddIcon from '@mui/icons-material/Add';
import environmentalDailyReportConfig from './environmentalDailyReportConfig';
import ReportPhotoSection from '../../../../components/common/ReportPhotoSection';

// console.log('EnvironmentalDailyReportForm loaded');

export default function EnvironmentalDailyReportForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const reportType = 'environmental';
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const initializeDraft = async () => {
      try {
        if (id) {
          // Load existing draft
          const loadedDraft = await loadDraft(reportType, id);
          if (loadedDraft) {
            setDraft(loadedDraft);
          } else {
            console.error('Failed to load draft with ID:', id);
            setSnackbar({
              open: true,
              message: 'Failed to load draft',
              severity: 'error'
            });
          }
        } else {
          // Create new draft only if we don't have an ID
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
            id: `temp_${Date.now()}`
          };
          setDraft(emptyDraft);
        }
      } catch (error) {
        console.error('Error initializing draft:', error);
        setSnackbar({
          open: true,
          message: 'Error initializing draft',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeDraft();
  }, [id, reportType]);

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
    <Box sx={{ 
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f5f5f5',
      p: { xs: 1, sm: 1.5 },
      overflow: 'auto'
    }}>
      <ReportTemplate 
        initialData={draft}
        onChange={(newData) => setDraft(newData)}
        onSave={handleSave}
        onReview={handleReview}
        onCancel={handleCloseSnackbar}
        config={environmentalDailyReportConfig}
      />
      <ReportPhotoSection
        photos={photos}
        onPhotosChange={setPhotos}
        content_type="environmental_daily"
        object_id={id}
        editable={true}
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
    </Box>
  );
} 