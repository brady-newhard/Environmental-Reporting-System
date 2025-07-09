import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import ReportTemplate from '../../../templates/ReportTemplate';
import { saveDraft, normalizeDraft, loadDraft } from '../../../../utils/draftUtils';
import swpppReportConfig from './SWPPPConfig';
import ReportPhotoSection from '../../../../components/common/ReportPhotoSection';
import PageHeader from '../../../common/PageHeader';
import api from '../../../../services/api';

export default function SWPPPReportForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const reportType = 'swppp';
  const [photos, setPhotos] = useState([]);

  // Memoize the setDraft function to prevent unnecessary re-renders
  const handleDraftChange = useCallback((newDraft) => {
    setDraft(newDraft);
  }, []);

  useEffect(() => {
    const initializeDraft = async () => {
      try {
        if (location.state && location.state.draft) {
          const normalizedDraft = await normalizeDraft(location.state.draft);
          setDraft(normalizedDraft);
        } else if (id) {
          // Load existing draft
          const loadedDraft = await loadDraft(reportType, id);
          if (loadedDraft) {
            const normalizedDraft = await normalizeDraft(loadedDraft);
            setDraft(normalizedDraft);
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
                name: 'Inspection Information',
                rows: [{
                  inspection_type: '',
                  inspection_date: ''
                }]
              },
              {
                name: 'Project Information',
                rows: [{
                  project: '',
                  spread: '',
                  facility: '',
                  contractor: '',
                  inspector: '',
                  milepost_start: '',
                  milepost_end: '',
                  station_start: '',
                  station_end: ''
                }]
              },
              {
                name: 'Weather Information',
                rows: [{
                  weather_conditions: '',
                  temperature: '',
                  precipitation_type: '',
                  soil_conditions: '',
                  rain_gauges: []
                }]
              },
              {
                name: 'SWPPP Inspection Items',
                rows: [{
                  station_start: '',
                  station_end: '',
                  feature_details: '',
                  inspector_id: '',
                  inspection_time: '',
                  ecd_functional: '',
                  ecd_needs_maintenance: '',
                  soil_disturbed: '',
                  comments: ''
                }]
              }
            ],
            summaries: {},
            photos: [],
            signature: '',
            sigDate: '',
            preparedBy: '',
            id: `temp_${Date.now()}`
          };
          const normalizedDraft = await normalizeDraft(emptyDraft);
          setDraft(normalizedDraft);
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
  }, [id, reportType, location.state]);

  const handleSave = async (formData) => {
    try {
      const dataToSave = await normalizeDraft(formData);
      const prevId = draft?.id;
      const savedDraft = await saveDraft(reportType, dataToSave);

      // Update the draft state with the new ID
      const updatedDraft = { ...savedDraft.data, id: savedDraft.id };
      setDraft(updatedDraft);

      // If the saved draft has a real ID, update the URL and state
      if (savedDraft.id && !String(savedDraft.id).startsWith('temp_')) {
        // If the previous draft had a temp ID, delete it
        if (prevId && String(prevId).startsWith('temp_') && prevId !== savedDraft.id) {
          const { deleteDraft } = await import('../../../../utils/draftUtils');
          await deleteDraft(reportType, prevId);
        }
        if (id !== savedDraft.id) {
          navigate(`/environmental/swppp/edit/${savedDraft.id}`, {
            state: { draft: { ...savedDraft.data, id: savedDraft.id } }
          });
        }
      }

      setSnackbar({
        open: true,
        message: 'Draft saved successfully',
        severity: 'success'
      });

      // Return the saved draft data for the ReportTemplate
      return savedDraft;
    } catch (error) {
      console.error('Error saving report:', error);
      setSnackbar({
        open: true,
        message: 'Error saving draft: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
      throw error;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDelete = async () => {
    if (!draft?.id) return;
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) return;
    try {
      await api.delete(`/drafts/${draft.id}/`);
      setSnackbar({ open: true, message: 'Draft deleted successfully', severity: 'success' });
      setTimeout(() => {
        navigate('/environmental/swppp/drafts');
      }, 500);
    } catch (error) {
      console.error('Error deleting draft:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'Error deleting draft', 
        severity: 'error' 
      });
    }
  };

  const handleReview = () => {
    if (!draft?.id) return;
    navigate(`/environmental/swppp/review/${draft.id}`, {
      state: { reportData: draft }
    });
  };

  if (isLoading || !draft) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-auto p-4 sm:p-6">
      <PageHeader 
        title={<span className="text-white">{id ? 'Edit SWPPP Report' : 'SWPPP Report'}</span>}
        backPath={id ? "/environmental/swppp/drafts" : "/environmental/reports"}
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': { backgroundColor: '#333333' }
        }}
      />
      <ReportTemplate 
        initialData={draft}
        onChange={handleDraftChange}
        onSave={handleSave}
        onDelete={id ? handleDelete : undefined}
        onReview={draft?.id ? handleReview : undefined}
        onCancel={handleCloseSnackbar}
        config={swpppReportConfig}
      />
      {/* Tailwind notification */}
      {snackbar.open && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-white text-center transition-all duration-300 ${snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
             onClick={handleCloseSnackbar}
        >
          {snackbar.message}
        </div>
      )}
    </div>
  );
} 
