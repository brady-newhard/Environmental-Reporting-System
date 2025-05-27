import React, { useState } from 'react';
import ReportTemplate from '../../../templates/ReportTemplate';
import ReportPhotoSection from '../../../common/ReportPhotoSection';
import { useNavigate } from 'react-router-dom';
import { saveDraft, normalizeDraft } from '../../../../utils/draftUtils';
import { useSnackbar } from 'notistack';
import environmentalDailyReportConfig from './environmentalDailyReportConfig';

const EnvironmentalDailyReport = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (formData) => {
    try {
      setIsSaving(true);
      console.log('Saving form data:', formData);
      
      // Normalize and save the draft
      const dataToSave = normalizeDraft(formData);
      const savedId = await saveDraft('environmental', dataToSave);
      
      // Save to localStorage as backup
      const localKey = `environmental_draft_${savedId}`;
      localStorage.setItem(localKey, JSON.stringify(dataToSave));
      
      // Show success message
      enqueueSnackbar('Draft saved successfully', { variant: 'success' });
      
      // Update URL with new ID if this was a new draft
      if (!formData.id) {
        // Use replace: false to allow back navigation
        navigate(`/environmental/reports/daily/edit/${savedId}`, { 
          state: { formData: { ...dataToSave, id: savedId } },
          replace: false 
        });
      }
      
      return savedId;  // Return the saved ID
    } catch (error) {
      console.error('Error saving report:', error);
      enqueueSnackbar('Error saving draft: ' + (error.message || 'Unknown error'), { variant: 'error' });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ReportTemplate 
      config={environmentalDailyReportConfig} 
      onSave={handleSave}
      isSaving={isSaving}
    />
  );
};

export default EnvironmentalDailyReport; 