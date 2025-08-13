import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { updateSubmittedReport, submitReport, deleteSubmittedReport } from '../../../../services/api';
import SWPPPReportForm from './SWPPPReportForm';
import PageHeader from '../../../common/PageHeader';
import { Button } from '@/components/ui/button';
import { prepareSWPPPReport } from '../../../../utils/reportSubmission';

const SWPPPReportEditSubmitted = () => {
  const { reportId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', severity: 'success' });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    // Get report data from location state
    if (location.state?.reportData) {
      setReportData(location.state.reportData);
    } else {
      // If no data in state, redirect back to submitted reports
      navigate('/environmental/swppp/submitted');
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
      console.log('Saving submitted SWPPP report:', formData);
      
      // Update the submitted report
      await updateSubmittedReport(reportId, formData);
      
      // Show success message
      setSnackbar({ show: true, message: 'SWPPP report updated successfully', severity: 'success' });
      
      // Don't navigate away - stay on the edit page
      
    } catch (error) {
      console.error('Error updating submitted SWPPP report:', error);
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
      console.log('Resubmitting SWPPP report:', formData);
      
      // Prepare the report data for submission
      const preparedData = prepareSWPPPReport(formData);
      
      // Update the existing submitted report with new data
      await updateSubmittedReport(reportId, preparedData.data);
      
      // Show success message
      setSnackbar({ show: true, message: 'SWPPP report resubmitted successfully', severity: 'success' });
      
      // Navigate back to submitted reports after a short delay
      setTimeout(() => {
        navigate('/environmental/swppp/submitted');
      }, 1500);
      
    } catch (error) {
      console.error('Error resubmitting SWPPP report:', error);
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
    navigate('/environmental/swppp/submitted');
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
        navigate('/environmental/swppp/submitted');
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
        title="Edit Submitted SWPPP Report" 
        backPath="/environmental/swppp/submitted" 
      />
      
      <SWPPPReportForm 
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

export default SWPPPReportEditSubmitted;
