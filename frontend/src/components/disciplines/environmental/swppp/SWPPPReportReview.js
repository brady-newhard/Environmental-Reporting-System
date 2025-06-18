import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReportTemplateReview from '../../../templates/ReportTemplateReview';
import swpppReportConfig from './SWPPPConfig';
import { loadDraft } from '../../../../utils/draftUtils';

const SWPPPReportReview = () => {
  const { draftId } = useParams();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    async function fetchDraft() {
      if (draftId) {
        const draft = await loadDraft('swppp', draftId);
        setFormData(draft);
      }
    }
    fetchDraft();
  }, [draftId]);

  if (!formData) {
    return <div>Loading...</div>;
  }

  return <ReportTemplateReview config={swpppReportConfig} formData={formData} />;
};

export default SWPPPReportReview; 