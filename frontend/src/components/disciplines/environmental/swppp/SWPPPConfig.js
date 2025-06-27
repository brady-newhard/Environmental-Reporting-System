// Shared config for SWPPP Report

const swpppReportConfig = {
  title: 'SWPPP Inspection Report',
  reportType: 'swppp',
  summarySectionTitle: 'SWPPP Summary',
  headerFields: [],
  dynamicSections: [
    // Inspection Information Section
    {
      name: 'Inspection Information',
      isStatic: true,
      fields: [
        { name: 'inspection_type', label: 'Inspection Type', type: 'dropdown', options: ['Routine Weekly Inspection', 'Precipitation Event > 0.25"'], required: true },
        { name: 'inspection_date', label: 'Inspection Date', type: 'date', required: true }
      ],
      defaultRow: () => ({})
    },
    // Project Information Section
    {
      name: 'Project Information',
      isStatic: true,
      fields: [
        { name: 'project', label: 'Project', required: true },
        { name: 'spread', label: 'Spread', type: 'dropdown', options: [] },
        { name: 'facility', label: 'Facility', type: 'dropdown', options: [] },
        { name: 'contractor', label: 'Contractor', required: false },
        { name: 'inspector', label: 'Inspector', required: true },
        { name: 'milepost_start', label: 'Milepost Start', required: false },
        { name: 'milepost_end', label: 'Milepost End', required: false },
        { name: 'station_start', label: 'Station Start', required: false },
        { name: 'station_end', label: 'Station End', required: false }
      ],
      defaultRow: () => ({})
    },
    // Weather Information Section (matches Environmental)
    {
      name: 'Weather Information',
      isStatic: true,
      fields: [
        { name: 'weather_conditions', label: 'Sky Cover', type: 'dropdown', options: ['Sunny', 'Mostly Sunny', 'Partly Sunny', 'Cloudy', 'Overcast'], required: false },
        { name: 'temperature', label: 'Temperature (°F)', type: 'number', required: false },
        { name: 'precipitation_type', label: 'Precipitation Type', type: 'dropdown', options: ['none', 'drizzle', 'rain', 'snow', 'sleet', 'hail'], required: false },
        { name: 'soil_conditions', label: 'Soil Conditions', type: 'dropdown', options: ['Dry', 'Wet', 'Saturated', 'Frozen'], required: false },
        {
          name: 'rain_gauges',
          label: 'Rain Gauges',
          type: 'dynamicArray',
          subFields: [
            { name: 'location', label: 'Rain Gauge Location', type: 'text' },
            { name: 'rain', label: 'Rain (in)', type: 'number' },
            { name: 'snow', label: 'Snow (in)', type: 'number' }
          ]
        }
      ],
      defaultRow: () => ({})
    },
    // SWPPP Inspection Items Section (unique to SWPPP)
    {
      name: 'SWPPP Inspection Items',
      fields: [
        { name: 'station_start', label: 'Station Start', type: 'text', required: true },
        { name: 'station_end', label: 'Station End', type: 'text', required: true },
        { name: 'feature_details', label: 'Feature Details', type: 'text', required: true },
        { name: 'inspector_id', label: 'Inspector ID', type: 'text', required: true },
        { name: 'inspection_time', label: 'Inspection Time', type: 'time', required: true },
        { name: 'ecd_functional', label: 'ECD Functional?', type: 'dropdown', options: ['Yes', 'No'], required: true },
        { name: 'ecd_needs_maintenance', label: 'ECD Needs Maintenance?', type: 'dropdown', options: ['Yes', 'No'], required: true },
        { name: 'soil_disturbed', label: 'Soil Disturbed?', type: 'dropdown', options: ['Yes', 'No'], required: true },
        { name: 'comments', label: 'Comments', type: 'multiline', required: false }
      ],
      defaultRow: () => ({})
    }
  ],
  summaryFields: [
    { name: 'general_summary', label: 'General Summary', multiline: true, required: true },
    { name: 'corrective_actions', label: 'Corrective Actions Required', multiline: true, required: true },
    { name: 'follow_up_actions', label: 'Follow-up Actions', multiline: true, required: true }
  ],
  requiresSignature: true,
  requiresPhotos: true,
  reviewPath: '/environmental/reports/swppp/review'
};

export default swpppReportConfig; 