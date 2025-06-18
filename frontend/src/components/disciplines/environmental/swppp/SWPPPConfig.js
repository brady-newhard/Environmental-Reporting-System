// Shared config for SWPPP Report

const swpppReportConfig = {
  title: 'SWPPP Inspection Report',
  reportType: 'swppp',
  summarySectionTitle: 'SWPPP Summary',
  headerFields: [
    // === Inspection Information ===
    { name: 'inspection_type', label: 'Inspection Type', type: 'dropdown', options: [
      { value: 'Routine Weekly Inspection', label: 'Routine Weekly Inspection' },
      { value: 'Precipitation Event > 0.25"', label: 'Precipitation Event > 0.25"' }
    ], required: true },
    { name: 'inspection_date', label: 'Inspection Date', type: 'date', required: true },
    
    // === Project Information ===
    { name: 'project', label: 'Project', required: true },
    { name: 'spread', label: 'Spread', required: false },
    { name: 'facility', label: 'Facility', required: false },
    { name: 'contractor', label: 'Contractor', required: false },
    { name: 'inspector', label: 'Inspector', required: true },
  ],
  dynamicSections: [
    // Weather Information Section
    {
      name: 'Weather Information',
      isStatic: true,
      fields: [
        { name: 'weather_conditions', label: 'Sky Cover', type: 'dropdown', options: [
          { value: 'Sunny', label: 'Sunny' },
          { value: 'Mostly Sunny', label: 'Mostly Sunny' },
          { value: 'Partly Sunny', label: 'Partly Sunny' },
          { value: 'Cloudy', label: 'Cloudy' },
          { value: 'Overcast', label: 'Overcast' }
        ], required: false },
        { name: 'temperature', label: 'Temperature (°F)', type: 'number', required: false },
        { name: 'precipitation_type', label: 'Precipitation Type', type: 'dropdown', options: [
          { value: 'none', label: 'none' },
          { value: 'drizzle', label: 'drizzle' },
          { value: 'rain', label: 'rain' },
          { value: 'snow', label: 'snow' },
          { value: 'sleet', label: 'sleet' },
          { value: 'hail', label: 'hail' }
        ], required: false },
        { name: 'soil_conditions', label: 'Soil Conditions', type: 'dropdown', options: [
          { value: 'Dry', label: 'Dry' },
          { value: 'Wet', label: 'Wet' },
          { value: 'Saturated', label: 'Saturated' },
          { value: 'Frozen', label: 'Frozen' }
        ], required: false },
        {
          name: 'rain_gauges',
          label: 'Rain Gauges',
          type: 'dynamicArray',
          subfields: [
            { name: 'location', label: 'Rain Gauge Location', type: 'text' },
            { name: 'rain', label: 'Rain (in)', type: 'number' },
            { name: 'snow', label: 'Snow (in)', type: 'number' }
          ]
        }
      ],
      defaultRow: () => ({})
    },
    {
      name: 'SWPPP Inspection Items',
      fields: [
        // Row 1
        { name: 'station_start', label: 'Station Start', type: 'text', required: true },
        { name: 'station_end', label: 'Station End', type: 'text', required: true },
        { name: 'feature_details', label: 'Feature Details', type: 'text', required: true },
        
        // Row 2
        { name: 'inspector_id', label: 'Inspector ID', type: 'text', required: true },
        { name: 'inspection_time', label: 'Inspection Time', type: 'time', required: true },
        
        // Row 3
        { name: 'ecd_functional', label: 'ECD Functional?', type: 'dropdown', options: ['Yes', 'No'], required: true },
        { name: 'ecd_maintenance', label: 'ECD Needs Maintenance?', type: 'dropdown', options: ['Yes', 'No'], required: true },
        { name: 'soil_disturbed', label: 'Soil Disturbed?', type: 'dropdown', options: ['Yes', 'No'], required: true },
        
        // Row 4
        { name: 'comments', label: 'Comments', type: 'multiline', required: false }
      ],
      defaultRow: () => ({
        station_start: '',
        station_end: '',
        feature_details: '',
        inspector_id: '',
        inspection_time: '',
        ecd_functional: '',
        ecd_maintenance: '',
        soil_disturbed: '',
        comments: ''
      })
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