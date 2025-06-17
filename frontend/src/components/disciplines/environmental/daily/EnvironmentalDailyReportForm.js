import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import ReportTemplate from '../../../templates/ReportTemplate';
import { saveDraft, normalizeDraft, loadDraft } from '../../../../utils/draftUtils';
import environmentalDailyReportConfig from './environmentalDailyReportConfig';
import ReportPhotoSection from '../../../../components/common/ReportPhotoSection';
import PageHeader from '../../../common/PageHeader';
import api from '../../../../services/api';

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
        if (location.state && location.state.draft) {
          setDraft(normalizeDraft(location.state.draft));
        } else if (id) {
          // Load existing draft
          const loadedDraft = await loadDraft(reportType, id);
          if (loadedDraft) {
            setDraft(normalizeDraft(loadedDraft));
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
          setDraft(normalizeDraft(emptyDraft));
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

  const handleDelete = async () => {
    if (!draft?.id) return;
    if (!window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) return;
    try {
      await api.delete(`/drafts/${draft.id}/`);
      setSnackbar({ open: true, message: 'Draft deleted successfully', severity: 'success' });
      setTimeout(() => {
        navigate('/environmental/reports/daily');
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

  if (isLoading || !draft) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] overflow-auto p-4 sm:p-6">
      <PageHeader 
        title={<span className="text-white">Edit Daily Environmental Report</span>}
        backPath="/environmental/reports/daily"
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': { backgroundColor: '#333333' }
        }}
      />
      <ReportTemplate 
        initialData={draft}
        onChange={setDraft}
        onSave={handleSave}
        onReview={handleReview}
        onCancel={handleCloseSnackbar}
        config={environmentalDailyReportConfig}
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