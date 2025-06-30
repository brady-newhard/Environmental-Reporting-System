import React, { useState, useEffect } from 'react';
import ReportTemplate from '../../../templates/ReportTemplate';
import { useNavigate } from 'react-router-dom';
import { saveDraft, normalizeDraft } from '../../../../utils/draftUtils';
import environmentalDailyReportConfig from './environmentalDailyReportConfig';
import PageHeader from '../../../common/PageHeader';

const EnvironmentalDailyReport = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', severity: 'success' });

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
      console.log('Saving form data:', formData);
      
      // Normalize and save the draft
      const dataToSave = normalizeDraft(formData);
      const savedDraft = await saveDraft('environmental', dataToSave);
      
      // Show success message
      setSnackbar({ show: true, message: 'Draft saved successfully', severity: 'success' });
      
      // Update URL with new ID if this was a new draft
      if (!formData.id) {
        navigate(`/environmental/reports/daily/edit/${savedDraft.id}`, { 
          state: { draft: { ...savedDraft.data, id: savedDraft.id } },
          replace: false 
        });
      }
      
      return savedDraft.id;
    } catch (error) {
      console.error('Error saving report:', error);
      setSnackbar({ show: true, message: 'Error saving draft: ' + (error.message || 'Unknown error'), severity: 'error' });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={environmentalDailyReportConfig.title} backPath="/environmental/reports/daily" />
      <ReportTemplate 
        config={environmentalDailyReportConfig} 
        onSave={handleSave}
        isSaving={isSaving}
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

export default EnvironmentalDailyReport; 