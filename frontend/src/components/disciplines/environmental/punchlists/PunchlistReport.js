import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ReportTemplate from '../../../templates/ReportTemplate';
import { saveDraft, normalizeDraft, loadDraft } from '../../../../utils/draftUtils';
import punchlistReportConfig from './punchlistReportConfig';
import ReportPhotoSection from '../../../../components/common/ReportPhotoSection';
import PageHeader from '../../../common/PageHeader';
import api from '../../../../services/api';

const PunchlistReport = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', severity: 'success' });
  const reportType = 'punchlist';
  const [photos, setPhotos] = useState([]);

  // Auto-hide snackbar after 3 seconds
  useEffect(() => {
    if (snackbar.show) {
      const timer = setTimeout(() => {
        setSnackbar({ show: false, message: '', severity: 'success' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.show]);

  useEffect(() => {
    const loadExistingDraft = async () => {
      if (id) {
        try {
          const loadedDraft = await loadDraft(reportType, id);
          if (loadedDraft) {
            setDraft(loadedDraft);
            setPhotos(loadedDraft.photos || []);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          setSnackbar({
            show: true,
            message: 'Error loading draft: ' + error.message,
            severity: 'error'
          });
        }
      }
      setIsLoading(false);
    };

    loadExistingDraft();
  }, [id, reportType]);

  const handleSave = async (formData) => {
    try {
      console.log('Saving punchlist form data:', formData);
      
      // Normalize and save the draft
      const dataToSave = normalizeDraft(formData);
      const savedDraft = await saveDraft(reportType, dataToSave);
      
      // Show success message
      setSnackbar({
        show: true,
        message: 'Draft saved successfully',
        severity: 'success'
      });
      
      // Update URL with new ID if this was a new draft
      if (!formData.id) {
        navigate(`/environmental/reports/punchlist/edit/${savedDraft.id}`, { 
          state: { draft: { ...savedDraft.data, id: savedDraft.id } },
          replace: false 
        });
      }
      
      return savedDraft.id;
    } catch (error) {
      console.error('Error saving punchlist report:', error);
      setSnackbar({
        show: true,
        message: 'Error saving draft: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (id) {
      try {
        await import('../../../../utils/draftUtils').then(utils => utils.deleteDraft(reportType, id));
        setSnackbar({
          show: true,
          message: 'Draft deleted successfully',
          severity: 'success'
        });
        navigate('/environmental/reports/punchlist/drafts');
      } catch (error) {
        console.error('Error deleting draft:', error);
        setSnackbar({
          show: true,
          message: 'Error deleting draft: ' + error.message,
          severity: 'error'
        });
      }
    } else {
      navigate('/environmental/reports/punchlist/drafts');
    }
  };

  const handleReview = (formData) => {
    navigate(`/environmental/reports/punchlist/review/${formData.id}`, {
      state: { reportData: formData }
    });
  };

  const handleExit = () => {
    navigate('/environmental/reports/punchlist/drafts');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title={punchlistReportConfig.title}
          backPath="/environmental/reports/punchlist"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Loading draft...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title={punchlistReportConfig.title} 
        backPath="/environmental/reports/punchlist"
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }}
      />
      <ReportTemplate 
        config={punchlistReportConfig} 
        initialData={draft}
        onSave={handleSave}
        onDelete={handleDelete}
        onReview={handleReview}
        onExit={handleExit}
      />
      
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

export default PunchlistReport; 