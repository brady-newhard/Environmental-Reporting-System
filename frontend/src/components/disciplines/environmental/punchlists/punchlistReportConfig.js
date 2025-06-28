// Shared config for Punchlist Report

const punchlistReportConfig = {
  title: 'Environmental Punchlist Report',
  reportType: 'punchlist',
  dynamicSections: [
    // Punchlist Items Section (unique to Punchlist)
    {
      name: 'Punchlist Items',
      fields: [
        { name: 'item_number', label: 'Item Number', type: 'number', required: true },
        { name: 'inspector', label: 'Inspector', type: 'text', required: false },
        { name: 'spread', label: 'Spread', type: 'multiselect', options: ['1', '2', '3', '4'], required: false },
        { name: 'facility', label: 'Facility', type: 'multiselect', options: [
          'CY 1', 'SY 1', 'CS 1',
          'CY 2', 'SY 2', 'CS 2',
          'CY 3', 'SY 3', 'CS 3',
          'CY 4', 'SY 4', 'CS 4',
        ], required: false },
        { name: 'start_station', label: 'Start Station', type: 'text', required: true },
        { name: 'end_station', label: 'End Station', type: 'text', required: true },
        { name: 'feature', label: 'Feature/Location', type: 'text', required: true },
        { name: 'date_observed', label: 'Date Observed', type: 'date', required: false },
        { name: 'issue', label: 'Issue', type: 'multiline', required: true },
        { name: 'recommendations', label: 'Recommendations', type: 'multiline', required: true },
        { name: 'photos', label: 'Photos', type: 'photoArray', required: false },
        { name: 'photo_comments', label: 'Photo Comments', type: 'photoComments', required: false }
      ],
      defaultRow: () => ({ photos: [], photo_comments: [] })
    }
  ],
  reviewPath: '/environmental/reports/punchlist/review'
};

export default punchlistReportConfig; 