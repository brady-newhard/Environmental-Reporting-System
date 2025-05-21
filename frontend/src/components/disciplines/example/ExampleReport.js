import React from 'react';
import ReportTemplate from '../../templates/ReportTemplate';

// Configuration for the example report
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

const ExampleReport = () => {
  return <ReportTemplate config={config} />;
};

export default ExampleReport; 