import React, { useState } from 'react';
import ReportTemplate from '../../../templates/ReportTemplate';
import { useNavigate } from 'react-router-dom';
import { saveDraft, normalizeDraft } from '../../../../utils/draftUtils';
import { useSnackbar } from 'notistack';
import environmentalDailyReportConfig from './environmentalDailyReportConfig';
import PageHeader from '../../../common/PageHeader';

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
      const savedDraft = await saveDraft('environmental', dataToSave);
      
      // Show success message
      enqueueSnackbar('Draft saved successfully', { variant: 'success' });
      
      // Update URL with new ID if this was a new draft
      if (!formData.id) {
        navigate(`/environmental/reports/daily/edit/${savedDraft.id}`, { 
          state: { formData: { ...savedDraft.data, id: savedDraft.id } },
          replace: false 
        });
      }
      
      return savedDraft.id;
    } catch (error) {
      console.error('Error saving report:', error);
      enqueueSnackbar('Error saving draft: ' + (error.message || 'Unknown error'), { variant: 'error' });
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
    </>
  );
};

export default EnvironmentalDailyReport; 