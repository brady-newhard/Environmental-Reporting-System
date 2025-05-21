import React from 'react';
import ReportTemplate from '../../../templates/ReportTemplate';

const config = {
  title: 'Daily Environmental Report',
  reportType: 'environmental',
  headerFields: [
    { name: 'project', label: 'Project', required: true },
    { name: 'date', label: 'Date', required: true },
    { name: 'author', label: 'Author', required: true },
    { name: 'report_type', label: 'Report Type', required: true },
    { name: 'weather_description', label: 'Weather Description', required: false },
    { name: 'temperature', label: 'Temperature', required: false },
    { name: 'precipitation_type', label: 'Precipitation Type', required: false },
    { name: 'precipitation_inches', label: 'Precipitation Inches', required: false },
    { name: 'route', label: 'Route', required: false },
    { name: 'spread', label: 'Spread', required: false },
    { name: 'facility', label: 'Facility', required: false },
    { name: 'state', label: 'State', required: false },
    { name: 'county', label: 'County', required: false },
    { name: 'milepost_start', label: 'Milepost Start', required: false },
    { name: 'milepost_end', label: 'Milepost End', required: false },
    { name: 'station_start', label: 'Station Start', required: false },
    { name: 'station_end', label: 'Station End', required: false },
    { name: 'activity_category', label: 'Activity Category', required: false },
    { name: 'activity_group', label: 'Activity Group', required: false },
    { name: 'activity_type', label: 'Activity Type', required: false },
    { name: 'compliance_level', label: 'Compliance Level', required: false }
  ],
  dynamicSections: [
    {
      name: 'Daily Progress',
      dropdownLabel: 'Progress Item',
      dropdownName: 'Phase',
      dropdownOptions: [
        'No Progress to Report',
        'Access Roads',
        'Felling',
        'Clearing',
        'Grading',
        'Ditch',
        'Stringing',
        'Bending',
        'Welding',
        'Coating',
        'Lowering-in',
        'Backfill',
        'Tie-Ins',
        'Cleanup',
        'Stabilization',
        'Re-Vegetation',
      ],
      fields: [
        { name: 'Phase', label: 'Progress Item', type: 'dropdown' },
        { name: 'Start Station', label: 'Start Station', type: 'text' },
        { name: 'End Station', label: 'End Station', type: 'text' }
      ],
      defaultRow: () => ({ progress_item: '', start_station: '', end_station: '' })
    }
  ],
  summaryFields: [
    { name: 'notes', label: 'Notes', multiline: true }
  ],
  requiresSignature: true,
  requiresPhotos: true,
  reviewPath: '/environmental/reports/daily/review'
};

const EnvironmentalDailyReport = () => {
  return <ReportTemplate config={config} />;
};

export default EnvironmentalDailyReport; 