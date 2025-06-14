// Shared config for Environmental Daily Report

const environmentalDailyReportConfig = {
  title: 'Daily Environmental Report',
  reportType: 'environmental',
  summarySectionTitle: 'Environmental Summary',
  headerFields: [],
  dynamicSections: [
    {
      name: 'Project Information',
      isStatic: true,
      fields: [
        { name: 'inspection_date', label: 'Inspection Date', type: 'date', required: true },
        { name: 'project', label: 'Project', required: true },
        { name: 'spread', label: 'Spread', required: false },
        { name: 'contractor', label: 'Contractor', required: false },
        { name: 'inspector', label: 'Inspector', required: true },
        { name: 'milepost_start', label: 'Milepost Start', required: false },
        { name: 'milepost_end', label: 'Milepost End', required: false },
        { name: 'station_start', label: 'Station Start', required: false },
        { name: 'station_end', label: 'Station End', required: false }
      ],
      defaultRow: () => ({})
    },
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
    {
      name: 'Crew Daily Summaries',
      dropdownLabel: 'Crew',
      dropdownName: 'Crew',
      dropdownOptions: [
        'Pipe Crew', 'Weld Crew', 'Coating Crew', 'Backfill Crew', 'Cleanup Crew', 'Bending Crew', 'Bore Crew', 'Boring Crew', 'Blasting Crew', 'Grading Crew', 'Lower-in Crew', 'Padding Crew', 'Restoration Crew', 'Rock Ditch Crew', 'Roustabout Crew', 'Seeding Crew', 'Stringing Crew', 'Tie-in Crew', 'Welding Crew', 'Other'
      ],
      fields: [
        { name: 'Crew', label: 'Crew', type: 'dropdown' },
        { name: 'Foreman', label: 'Foreman', type: 'text' },
        { name: 'Start Station', label: 'Start Station', type: 'text' },
        { name: 'End Station', label: 'End Station', type: 'text' },
        { name: 'Summary', label: 'Summary', type: 'multiline' }
      ],
      defaultRow: () => ({ Crew: '', Foreman: '', 'Start Station': '', 'End Station': '', Summary: '' })
    },
    {
      name: 'Daily Progress',
      dropdownLabel: 'Progress Item',
      dropdownName: 'Phase',
      dropdownOptions: [
        'No Progress to Report', 'Access Roads', 'Felling', 'Clearing', 'Grading', 'Ditch', 'Stringing', 'Bending', 'Welding', 'Coating', 'Lowering-in', 'Backfill', 'Tie-Ins', 'Cleanup', 'Stabilization', 'Re-Vegetation'
      ],
      fields: [
        { name: 'Phase', label: 'Progress Item', type: 'dropdown' },
        { name: 'Start Station', label: 'Start Station', type: 'text' },
        { name: 'End Station', label: 'End Station', type: 'text' }
      ],
      defaultRow: () => ({ Phase: '', 'Start Station': '', 'End Station': '' })
    }
  ],
  summaryFields: [
    { name: 'notes', label: 'Notes', multiline: true }
  ],
  requiresSignature: true,
  requiresPhotos: true,
  reviewPath: '/environmental/reports/daily/review'
};

export default environmentalDailyReportConfig; 