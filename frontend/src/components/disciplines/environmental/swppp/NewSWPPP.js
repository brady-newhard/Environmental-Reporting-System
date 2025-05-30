import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReportTemplate from '../../../templates/ReportTemplate';
import swpppReportConfig from './swpppReportConfig';
import { saveDraft } from '../../../../utils/draftUtils';

const NewSWPPP = () => {
  const navigate = useNavigate();

  const handleSave = async (formData) => {
    try {
      // Save as a draft using the same utility as environmental daily
      const draftId = await saveDraft('swppp', formData);
      navigate(`/swppp/review/${draftId}`);
      return draftId;
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

export default NewSWPPP; 