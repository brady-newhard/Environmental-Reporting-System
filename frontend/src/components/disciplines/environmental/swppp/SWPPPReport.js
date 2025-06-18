import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReportTemplate from '../../../templates/ReportTemplate';
import swpppReportConfig from './SWPPPConfig';
import { saveDraft, normalizeDraft } from '../../../../utils/draftUtils';

const SWPPPReport = () => {
  const navigate = useNavigate();

  const handleSave = async (formData) => {
    try {
      // Normalize and save the draft
      const dataToSave = normalizeDraft(formData);
      const savedDraft = await saveDraft('swppp', dataToSave);
      
      // Update URL with new ID if this was a new draft
      if (!formData.id) {
        navigate(`/environmental/swppp/edit/${savedDraft.id}`, { 
          state: { formData: { ...savedDraft.data, id: savedDraft.id } },
          replace: false 
        });
      }
      
      return savedDraft.id;
    } catch (error) {
      console.error('Error saving SWPPP draft:', error);
      throw error;
    }
  };

  return (
    <ReportTemplate
      config={swpppReportConfig}
      onSave={handleSave}
    />
  );
};

export default SWPPPReport; 