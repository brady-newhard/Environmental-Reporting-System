import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import DailyUtilityReportForm from '../templates/disciplines/utility/DailyUtilityReportForm';
import { saveDraft, normalizeDraft, loadDraft } from '../../utils/draftUtils';
import ReportPhotoSection from '../common/ReportPhotoSection';
import PageHeader from '../common/PageHeader';
import api from '../../services/api';

export default function LeadEditUtilityDaily() {
  const { reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const reportType = 'daily_utility';
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const initializeDraft = async () => {
      try {
        // Load data from location.state (passed from lead review page)
        if (location.state && (location.state.draft || location.state.reportData)) {
          const reportData = location.state.draft || location.state.reportData;
          setDraft(normalizeDraft(reportData));
        } else if (reportId) {
          // Try to load from storage as fallback
          const loadedDraft = await loadDraft(reportType, reportId);
          if (loadedDraft) {
            setDraft(normalizeDraft(loadedDraft));
          } else {
            console.error('Failed to load draft with ID:', reportId);
            setSnackbar({
              open: true,
              message: 'Failed to load report data',
              severity: 'error'
            });
          }
        } else {
          setSnackbar({
            open: true,
            message: 'No report data provided for editing',
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Error initializing draft:', error);
        setSnackbar({
          open: true,
          message: 'Error loading report data',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeDraft();
  }, [reportId, reportType, location.state]);

  const handleSave = async (formData) => {
    try {
      const dataToSave = {
        ...normalizeDraft(formData),
        id: reportId, // Set the ID to the report ID so it saves with the correct key
        reportType: 'daily_utility',
        lastSaved: new Date().toISOString(),
      };
      
      // Save draft using the new storage system
      const savedDraft = await saveDraft(reportType, dataToSave);
      console.log('Lead edits saved with ID:', savedDraft.id);
      
      setSnackbar({
        open: true,
        message: 'Lead edits saved successfully',
        severity: 'success'
      });
      
      return savedDraft;
    } catch (error) {
      console.error('Error saving lead edits:', error);
      setSnackbar({
        open: true,
        message: 'Error saving lead edits: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
      throw error;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCancel = () => {
    navigate(`/leads/review/${reportId}`);
  };

  const handleExit = () => {
    navigate('/leads/dashboard');
  };

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
            <p className="text-center text-gray-600 py-8">Loading report data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="bg-black min-h-screen pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
            <p className="text-center text-gray-600 py-8">
              No report data found.{' '}
              <button
                onClick={() => navigate('/leads/dashboard')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Back to Dashboard
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <PageHeader
          title="Lead Edit - Utility Daily Report"
          subtitle="Edit report for lead review"
        />

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleExit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Exit
          </button>
        </div>

        {/* Daily Utility Report Form */}
        <DailyUtilityReportForm />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
} 