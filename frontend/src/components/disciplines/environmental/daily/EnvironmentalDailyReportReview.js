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
    { name: 'soil_conditions', label: 'Soil Conditions' }
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

  // Get the back path from location state or default to drafts
  const backPath = location.state?.from || '/environmental/reports/daily/drafts';

  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      try {
        // First check if data was passed through location state
        if (location.state) {
          console.log('Using data from location state:', location.state);
          setDraft(location.state);
          setIsLoading(false);
          return;
        }

        // If no state data, load from storage
        const loadedDraft = await loadDraft('environmental', id);
        console.log('Loaded draft from storage:', loadedDraft);
        
        if (loadedDraft) {
          setDraft(loadedDraft);
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

  const header = draft.header || {};
  const sections = draft.sections || [];
  const summaries = draft.summaries || {};
  const photos = draft.photos || [];
  const signature = draft.signature || '';
  const sigDate = draft.sigDate || draft.sig_date || '';
  const preparedBy = header.prepared_by || '';

  // Helper to format date as MM/DD/YYYY
  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d)) return value;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

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
          <h2 className="text-xl font-semibold mb-4">Project Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {config.headerFields.map(field => {
              let value = header[field.name] || '';
              if (field.type === 'date') value = formatDate(value);
              if (!value) value = '—';
              return (
                <div key={field.name} className="min-w-[180px]">
                  <span className="font-semibold">{field.label}:</span>{' '}
                  {value}
                </div>
              );
            })}
          </div>
        </div>

        {/* Weather Information */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Weather Data</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {config.weatherFields.map(field => {
              let value = header[field.name] || '';
              if (!value) value = '—';
              return (
                <div key={field.name} className="min-w-[180px]">
                  <span className="font-semibold">{field.label}:</span>{' '}
                  {value}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rain Gauges */}
        {header?.rain_gauges && header.rain_gauges.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Rain Gauge Data</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {config.rainGaugeFields.map(field => (
                      <th key={field.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {header.rain_gauges.map((gauge, idx) => (
                    <tr key={idx}>
                      {config.rainGaugeFields.map(field => (
                        <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {gauge[field.name] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Dynamic Sections */}
        {config.dynamicSections.map(sectionConfig => {
          const section = sections.find(s => s.name === sectionConfig.name) || { rows: [] };
          const sectionData = section.rows || [];
          return (
            <div key={sectionConfig.name} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{sectionConfig.label}</h2>
              {Array.isArray(sectionData) && sectionData.length > 0 ? (
                <div className="space-y-4">
                  {sectionData.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      {sectionConfig.fields.map(field => (
                        <div key={field.name}>
                          <span className="font-semibold">{field.label}:</span>{' '}
                          {row[field.name] || '—'}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No entries</p>
              )}
            </div>
          );
        })}

        {/* Summary Fields */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          {config.summaryFields.map(field => (
            <div key={field.name} className="p-4 bg-gray-50 rounded-lg">
              {summaries[field.name] || '—'}
            </div>
          ))}
        </div>

        {/* Photos Section */}
        {Array.isArray(photos) && photos.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, idx) => {
                let photoUrl;
                if (typeof photo === 'string') {
                  photoUrl = photo;
                } else if (photo.url) {
                  photoUrl = photo.url;
                } else if (photo.file) {
                  photoUrl = photo.file;
                } else if (photo instanceof Blob) {
                  photoUrl = URL.createObjectURL(photo);
                } else if (photo.preview) {
                  photoUrl = photo.preview;
                } else if (photo.image_url) {
                  photoUrl = photo.image_url;
                }

                const location = photo.location || '';
                const comments = photo.comments || photo.comment || '';

                return (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg overflow-hidden bg-white flex flex-col"
                  >
                    <div className="relative pt-[75%] bg-gray-50">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={`Photo ${idx + 1}`}
                          className="absolute top-0 left-0 w-full h-full object-contain"
                          onError={e => {
                            console.error('Error loading photo:', e);
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500">
                          Image not available
                        </div>
                      )}
                    </div>
                    {(location || comments) && (
                      <div className="p-3 bg-gray-50">
                        {location && (
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Location: {location}
                          </p>
                        )}
                        {comments && (
                          <p className="text-sm text-gray-600">
                            {comments}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Signature Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Signatures</h2>
          <div className="space-y-4">
            <p>
              <span className="font-semibold">Prepared By:</span> {preparedBy || '—'}
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
              <span className="font-semibold">Date:</span> {formatDate(sigDate)}
            </p>
          </div>
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