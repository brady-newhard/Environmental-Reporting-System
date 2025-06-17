import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { loadDraft } from '../../../../utils/draftUtils';
import PageHeader from '../../../../components/common/PageHeader';
import { PencilIcon, ArrowLeftOnRectangleIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

const config = {
  headerFields: [
    { name: 'project', label: 'Project' },
    { name: 'spread', label: 'Spread' },
    { name: 'contractor', label: 'Contractor' },
    { name: 'inspector', label: 'Inspector' },
    { name: 'milepost_start', label: 'Milepost Start' },
    { name: 'milepost_end', label: 'Milepost End' },
    { name: 'station_start', label: 'Station Start' },
    { name: 'station_end', label: 'Station End' },
    { name: 'date', label: 'Date', type: 'date' }
  ],
  weatherFields: [
    { name: 'weather_conditions', label: 'Sky Cover' },
    { name: 'temperature', label: 'Temperature (°F)' },
    { name: 'precipitation_type', label: 'Precipitation Type' },
    { name: 'soil_conditions', label: 'Soil Conditions' },
  ],
  rainGaugeFields: [
    { name: 'location', label: 'Rain Gauge Location' },
    { name: 'rain', label: 'Rain (in)' },
    { name: 'snow', label: 'Snow (in)' }
  ],
  dynamicSections: [
    {
      name: 'Crew Daily Summaries',
      label: 'Crew Daily Summaries',
      fields: [
        { name: 'Crew', label: 'Crew' },
        { name: 'Foreman', label: 'Foreman' },
        { name: 'Start Station', label: 'Start Station' },
        { name: 'End Station', label: 'End Station' },
        { name: 'Summary', label: 'Summary' }
      ]
    },
    {
      name: 'Daily Progress',
      label: 'Daily Progress',
      fields: [
        { name: 'Phase', label: 'Progress Item' },
        { name: 'Start Station', label: 'Start Station' },
        { name: 'End Station', label: 'End Station' }
      ]
    }
  ],
  summaryFields: [
    { name: 'notes', label: 'Environmental Summary' }
  ]
};

export default function EnvironmentalDailyReportReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportType = 'environmental';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Helper to format date as MM/DD/YYYY
  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d)) return value;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  // Get the back path from location state or default to drafts
  const backPath = location.state?.from || '/environmental/reports/daily/drafts';

  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      try {
        // First check if data was passed through location state
        if (location.state?.reportData) {
          console.log('Using data from location state:', location.state.reportData);
          // Ensure the data has the correct structure
          const formattedData = {
            ...location.state.reportData,
            rain_gauges: Array.isArray(location.state.reportData.rain_gauges)
              ? location.state.reportData.rain_gauges
              : Array.isArray(location.state.reportData.weather?.rain_gauge_readings)
                ? location.state.reportData.weather.rain_gauge_readings
                : []
          };
          setDraft(formattedData);
          setIsLoading(false);
          return;
        }

        // If no state data, load from storage
        const loadedDraft = await loadDraft('environmental', id);
        console.log('Loaded draft from storage:', loadedDraft);
        
        if (loadedDraft) {
          // Ensure the loaded data has the correct structure
          const formattedData = {
            ...loadedDraft,
            rain_gauges: Array.isArray(loadedDraft.rain_gauges)
              ? loadedDraft.rain_gauges
              : Array.isArray(loadedDraft.weather?.rain_gauge_readings)
                ? loadedDraft.weather.rain_gauge_readings
                : []
          };
          setDraft(formattedData);
        } else {
          console.log('Draft not found with ID:', id);
          setError('Draft not found');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        setError('Error loading draft');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && id !== 'null' && id !== undefined && !id.toLowerCase().includes('null')) {
      loadDraftData();
    } else {
      setError('Invalid draft ID');
      setIsLoading(false);
    }
  }, [id, location.state]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader 
          title="Environmental Daily Report Review"
          backPath={backPath}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Loading draft...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader 
          title="Environmental Daily Report Review"
          backPath={backPath}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{error}</h2>
        </div>
      </div>
    );
  }

  // Map project info from draft.header (remove prepared_by)
  const projectInfo = {
    project: draft?.header?.project || '—',
    spread: draft?.header?.spread || '—',
    inspector: draft?.header?.inspector || '—',
    contractor: draft?.header?.contractor || '—',
    date: formatDate(draft?.header?.date),
    facility: draft?.header?.facility || '—',
    milepost_start: draft?.header?.milepost_start || '—',
    milepost_end: draft?.header?.milepost_end || '—',
    station_start: draft?.header?.station_start || '—',
    station_end: draft?.header?.station_end || '—',
  };

  // Combine weather info from draft.header and 'Weather Information' section
  let weatherSection = null;
  if (Array.isArray(draft?.sections)) {
    weatherSection = draft.sections.find(s => s.name && s.name.toLowerCase().includes('weather'));
  }
  const weatherRow = weatherSection && Array.isArray(weatherSection.rows) && weatherSection.rows.length > 0 ? weatherSection.rows[0] : {};

  const weatherInfo = {
    weather_conditions: weatherRow.weather_conditions || draft?.header?.weather_conditions || '—',
    temperature: weatherRow.temperature || draft?.header?.temperature || '—',
    precipitation_type: weatherRow.precipitation_type || draft?.header?.precipitation_type || '—',
    soil_conditions: weatherRow.soil_conditions || draft?.header?.soil_conditions || '—',
    rain_gauges: Array.isArray(weatherRow.rain_gauges) ? weatherRow.rain_gauges : (Array.isArray(draft?.header?.rain_gauges) ? draft.header.rain_gauges : []),
  };

  const sections = Array.isArray(draft?.sections) ? draft.sections : [];
  const summaries = typeof draft?.summaries === 'object' && draft?.summaries !== null ? draft.summaries : {};
  const signature = draft?.signature || '';
  const sigDate = formatDate(draft?.sigDate);
  const photos = Array.isArray(draft?.photos) ? draft.photos : [];
  console.log('Photos passed to review:', photos);

  // Button handlers
  const handleEdit = () => {
    navigate(`/environmental/reports/daily/edit/${id}`);
  };

  const handleExit = () => {
    navigate('/environmental/reports');
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await import('../../../../utils/draftUtils').then(utils => utils.deleteDraft('environmental', id));
      setSnackbar({ open: true, message: 'Draft deleted successfully.', severity: 'success' });
      setTimeout(() => navigate('/environmental/reports'), 1000);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete draft.', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    setSubmitDialogOpen(false);
    try {
      // Placeholder: Replace with actual submit API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setSnackbar({ open: true, message: 'Draft submitted successfully.', severity: 'success' });
      setTimeout(() => navigate('/environmental/reports/daily/drafts'), 1000);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to submit draft.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Helper to render photos with comments
  const renderPhotos = (photos) => {
    if (!Array.isArray(photos) || photos.length === 0) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {photos.map((photo, idx) => (
          <div key={idx} className="flex flex-col items-center border rounded-lg p-2 bg-gray-50">
            {photo.url && (
              <img
                src={photo.url}
                alt={photo.comment || `Photo ${idx + 1}`}
                className="w-full max-w-xs max-h-60 object-contain mb-2 rounded shadow"
              />
            )}
            {photo.location && (
              <div className="text-xs text-gray-500 mb-1">Location: {photo.location}</div>
            )}
            {photo.comment && (
              <div className="text-sm text-gray-700 italic">{photo.comment}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Helper to render rain gauges as a table
  const renderRainGaugesTable = (rainGauges) => {
    if (!Array.isArray(rainGauges) || rainGauges.length === 0) return '—';
    return (
      <table className="min-w-full divide-y divide-gray-200 mt-2">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rain (in)</th>
            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Snow (in)</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rainGauges.map((g, i) => (
            <tr key={i}>
              <td className="px-2 py-1 text-sm text-gray-900">{g.location || '—'}</td>
              <td className="px-2 py-1 text-sm text-gray-900">{g.rain || '—'}</td>
              <td className="px-2 py-1 text-sm text-gray-900">{g.snow || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader 
        title="Environmental Daily Report Review"
        backPath="/environmental/reports"
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Project Information */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-xl font-semibold">Project Information</h2>
            <div className="mt-2 md:mt-0 md:text-right">
              <span className="font-semibold">Date:</span> {projectInfo.date}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1 */}
            <div className="flex flex-col gap-3">
              <div><span className="font-semibold">Inspector:</span> {projectInfo.inspector}</div>
              <div><span className="font-semibold">Project:</span> {projectInfo.project}</div>
              <div><span className="font-semibold">Spread:</span> {projectInfo.spread}</div>
              <div><span className="font-semibold">Facility:</span> {projectInfo.facility}</div>
              <div><span className="font-semibold">Contractor:</span> {projectInfo.contractor}</div>
            </div>
            {/* Column 2 */}
            <div className="flex flex-col gap-3">
              <div><span className="font-semibold">Milepost Start:</span> {projectInfo.milepost_start}</div>
              <div><span className="font-semibold">Milepost End:</span> {projectInfo.milepost_end}</div>
              <div><span className="font-semibold">Station Start:</span> {projectInfo.station_start}</div>
              <div><span className="font-semibold">Station End:</span> {projectInfo.station_end}</div>
            </div>
          </div>
        </div>

        {/* Weather Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Weather Information</h2>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-8 gap-2">
            <div className="min-w-[180px]"><span className="font-semibold">Weather Conditions:</span> {weatherInfo.weather_conditions}</div>
            <div className="min-w-[180px]"><span className="font-semibold">Temperature:</span> {weatherInfo.temperature}</div>
            <div className="min-w-[180px]"><span className="font-semibold">Precipitation Type:</span> {weatherInfo.precipitation_type}</div>
            <div className="min-w-[180px]"><span className="font-semibold">Soil Conditions:</span> {weatherInfo.soil_conditions}</div>
          </div>
          <div className="min-w-[180px] col-span-3 mt-2">
            <span className="font-semibold">Rain Gauges:</span> {renderRainGaugesTable(weatherInfo.rain_gauges)}
          </div>
        </div>

        {/* Dynamic Sections */}
        {sections.map((section, idx) => {
          // Skip redundant Project Information and Weather Information sections
          const lowerName = section.name ? section.name.toLowerCase() : '';
          if (lowerName.includes('project information') || lowerName.includes('weather information')) {
            return null;
          }
          // Special handling for Crew Daily Summaries
          if (lowerName.includes('crew daily summaries')) {
            return (
              <div key={idx} className="mb-6">
                <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
                {section.rows && section.rows.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crew</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foreman</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Station</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Station</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {section.rows.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Crew || row.crew || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Foreman || row.foreman || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row['Start Station'] || row.start_station || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row['End Station'] || row.end_station || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Summary || row.summary || row.Notes || row.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {section.photos && section.photos.length > 0 && renderPhotos(section.photos)}
              </div>
            );
          }
          return (
            <div key={idx} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
              {section.rows && section.rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(section.rows[0]).map(field => (
                          <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {section.rows.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {Object.values(row).map((value, fieldIdx) => {
                            // Only render primitive values, stringify arrays/objects
                            let displayValue = value;
                            if (typeof value === 'object' && value !== null) {
                              if (Array.isArray(value)) {
                                displayValue = value.join(', ');
                              } else {
                                displayValue = Object.values(value).join(', ');
                              }
                            }
                            if (displayValue === '' || displayValue === undefined || displayValue === null) displayValue = '—';
                            return (
                              <td key={fieldIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {displayValue}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.photos && section.photos.length > 0 && renderPhotos(section.photos)}
            </div>
          );
        })}

        {/* Summaries */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Environmental Inspection Summary</h2>
          {Object.entries(summaries).map(([key, value]) => (
            <p key={key} className="mb-2">
              <span className="font-semibold">{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:</span>{' '}
              {value || '—'}
            </p>
          ))}
        </div>

        {/* Photos */}
        {photos.length > 0 && renderPhotos(photos)}

        {/* Signature */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Inspector Signature</h2>
          <p className="mb-2">
            <span className="font-semibold">Prepared by:</span> {projectInfo.inspector}
          </p>
          {signature && (
            <div className="my-4">
              <img 
                src={signature} 
                alt="Signature" 
                className="max-w-[300px] border border-gray-300 rounded p-1 bg-white" 
              />
            </div>
          )}
          <p>
            <span className="font-semibold">Date:</span> {sigDate}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end mt-6 flex-wrap">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={handleExit}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Exit</span>
          </button>
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </button>
          <button
            onClick={() => setSubmitDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <CheckIcon className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Draft?</h3>
            <p className="mb-6">Are you sure you want to delete this draft? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      {submitDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Submit Draft?</h3>
            <p className="mb-6">Are you sure you want to submit this draft as a final report?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setSubmitDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <p className={snackbar.severity === 'error' ? 'text-red-600' : 'text-green-600'}>
            {snackbar.message}
          </p>
        </div>
      )}
    </div>
  );
} 