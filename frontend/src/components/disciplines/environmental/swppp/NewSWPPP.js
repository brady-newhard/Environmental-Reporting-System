import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReportTemplate from '../../../templates/ReportTemplate';
import swpppReportConfig from './swpppReportConfig';
import api from '../../../../services/api';

const NewSWPPP = () => {
  const navigate = useNavigate();

  const handleSave = async (formData) => {
    try {
      const response = await api.post('/api/reports/swppp/', formData);
      navigate(`/environmental/reports/swppp/review/${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('Error creating SWPPP report:', error);
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