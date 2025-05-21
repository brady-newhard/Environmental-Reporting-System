import React from 'react';
import ReportTemplateReview from '../../templates/ReportTemplateReview';

// Use the same config as the main report
const config = {
  title: 'Example Report',
  reportType: 'example',
  headerFields: [
    { name: 'project', label: 'Project', required: true },
    { name: 'spread', label: 'Spread', required: false },
    { name: 'inspector', label: 'Inspector', required: true },
    { name: 'afe', label: 'AFE Number', required: false },
    { name: 'contractor', label: 'Contractor', required: true }
  ],
  dynamicSections: [
    {
      name: 'Work Items',
      defaultRow: () => ({
        description: '',
        quantity: '',
        unit: '',
        location: '',
        notes: ''
      })
    },
    {
      name: 'Equipment',
      defaultRow: () => ({
        type: '',
        quantity: '',
        hours: '',
        operator: ''
      })
    }
  ],
  summaryFields: [
    { name: 'generalSummary', label: 'General Summary', multiline: true },
    { name: 'safety', label: 'Safety Concerns', multiline: true },
    { name: 'notes', label: 'Additional Notes', multiline: true }
  ],
  requiresSignature: true,
  requiresPhotos: true
};

const ExampleReportReview = () => {
  return <ReportTemplateReview config={config} />;
};

export default ExampleReportReview; 