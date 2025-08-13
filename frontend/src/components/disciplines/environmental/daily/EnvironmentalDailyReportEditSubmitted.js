import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { updateSubmittedReport, submitReport, deleteSubmittedReport } from '../../../../services/api';
import ReportTemplate from '../../../templates/ReportTemplate';
import environmentalDailyReportConfig from './environmentalDailyReportConfig';
import PageHeader from '../../../common/PageHeader';
import { Button } from '@/components/ui/button';
import { prepareEnvironmentalDailyReport } from '../../../../utils/reportSubmission';

const EnvironmentalDailyReportEditSubmitted = () => {
  const { reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', severity: 'success' });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // Get report data from location state
    console.log('EditSubmitted - location.state:', location.state);
    if (location.state?.reportData) {
      console.log('EditSubmitted - Setting reportData:', location.state.reportData);
      
      // Check if the report data is complete or incomplete
      const reportData = location.state.reportData;
      if (!reportData.header && !reportData.sections && !reportData.summaries) {
        console.log('EditSubmitted - Incomplete report data detected, showing warning');
        setSnackbar({ 
          show: true, 
          message: 'Warning: This report has incomplete data. You may need to recreate it.', 
          severity: 'warning' 
        });
      }
      
      setReportData(reportData);
    } else {
      console.log('EditSubmitted - No reportData in state, redirecting');
      // If no data in state, redirect back to submitted reports
      navigate('/environmental/reports/daily/submitted');
    }
  }, [location.state, navigate]);

  // Auto-hide snackbar after 3 seconds
  useEffect(() => {
    if (snackbar.show) {
      const timer = setTimeout(() => {
        setSnackbar({ show: false, message: '', severity: 'success' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.show]);

  const handleSave = async (formData) => {
    try {
      setIsSaving(true);
      console.log('Saving submitted report:', formData);
      
      // Update the submitted report
      await updateSubmittedReport(reportId, formData);
      
      // Show success message
      setSnackbar({ show: true, message: 'Report updated successfully', severity: 'success' });
      
      // Don't navigate away - stay on the edit page
      
    } catch (error) {
      console.error('Error updating submitted report:', error);
      setSnackbar({ 
        show: true, 
        message: 'Error updating report: ' + (error.message || 'Unknown error'), 
        severity: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResubmit = async (formData) => {
    try {
      setIsSaving(true);
      console.log('Resubmitting report:', formData);
      
      // Prepare the report data for submission
      const preparedData = prepareEnvironmentalDailyReport(formData);
      
      // Update the existing submitted report with new data
      await updateSubmittedReport(reportId, preparedData.data);
      
      // Show success message
      setSnackbar({ show: true, message: 'Report resubmitted successfully', severity: 'success' });
      
      // Navigate back to submitted reports after a short delay
      setTimeout(() => {
        navigate('/environmental/reports/daily/submitted');
      }, 1500);
      
    } catch (error) {
      console.error('Error resubmitting report:', error);
      setSnackbar({ 
        show: true, 
        message: 'Error resubmitting report: ' + (error.message || 'Unknown error'), 
        severity: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/environmental/reports/daily/submitted');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this submitted report? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteSubmittedReport(reportId);
      // Show success message
      setSnackbar({ show: true, message: 'Report deleted successfully', severity: 'success' });
      // Navigate back to submitted reports after a short delay
      setTimeout(() => {
        navigate('/environmental/reports/daily/submitted');
      }, 1500);
    } catch (error) {
      console.error('Error deleting report:', error);
      setSnackbar({ 
        show: true, 
        message: 'Error deleting report: ' + (error.message || 'Unknown error'), 
        severity: 'error' 
      });
    }
  };

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading report data...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Edit Submitted Environmental Daily Report" 
        backPath="/environmental/reports/daily/submitted" 
      />
      
      <ReportTemplate 
        config={environmentalDailyReportConfig} 
        initialData={reportData}
        onSave={handleSave}
        onResubmit={handleResubmit}
        isSaving={isSaving}
        isEditingSubmitted={true}
      />
      
      {/* Cancel button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white mr-2"
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={isSaving}
        >
          Delete
        </Button>
      </div>
      
      {/* Tailwind Snackbar */}
      {snackbar.show && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-white text-center transition-all duration-300 ${snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {snackbar.message}
          <button
            onClick={() => setSnackbar({ show: false, message: '', severity: 'success' })}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default EnvironmentalDailyReportEditSubmitted;
