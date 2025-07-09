import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../../common/PageHeader';
import swpppReportConfig from './SWPPPConfig';
import { loadDraft } from '../../../../utils/draftUtils';
import { PencilIcon, ArrowLeftOnRectangleIcon, TrashIcon, CheckIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { formatPhotoUrl } from '../../../../utils/photoUtils';

const SWPPPReportReview = () => {
  const { id: draftId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      try {
        if (location.state && location.state.reportData) {
          console.log('Using data from navigation state:', location.state.reportData);
          setFormData(location.state.reportData);
          setIsLoading(false);
          return;
        }

        if (draftId) {
          console.log('Loading draft from storage with ID:', draftId);
          const draft = await loadDraft('swppp', draftId);
          setFormData(draft);
        } else {
          setError('Invalid draft ID');
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        setError('Error loading draft');
      } finally {
        setIsLoading(false);
      }
    };

    loadDraftData();
  }, [draftId, location.state]);

  const handleBack = () => {
    navigate('/environmental/swppp/drafts');
  };

  const handleEdit = () => {
    // Ensure the draft has a real ID for editing
    const draftForEdit = {
      ...formData,
      id: draftId // Use the real draft ID from the URL params
    };
    
    navigate(`/environmental/swppp/edit/${draftId}`, { 
      state: { 
        draft: draftForEdit
      } 
    });
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await import('../../../../utils/draftUtils').then(utils => utils.deleteDraft('swppp', draftId));
      navigate('/environmental/swppp/drafts');
    } catch (err) {
      console.error('Error deleting draft:', err);
      setSnackbar({ open: true, message: 'Error deleting draft', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    setSubmitDialogOpen(false);
    setSnackbar({ open: true, message: 'Draft submitted successfully', severity: 'success' });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const formatDate = (value) => {
    if (!value) return '—';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
    }
    const d = new Date(value);
    if (isNaN(d)) return value;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const renderPhotos = (photos) => {
    if (!photos || photos.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Photos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {photos.map((photo, index) => {
            // Use the same robust photo URL extraction logic as ReportPhotoSection
            let possibleImageUrl;
            if (photo.image_url || photo.url) {
              // Uploaded photo with server URL
              possibleImageUrl = photo.image_url || photo.url;
            } else if (photo.preview) {
              // Local photo with blob preview URL
              possibleImageUrl = photo.preview;
            } else if (photo.file && photo.file instanceof File) {
              // Local photo with File object - create object URL
              possibleImageUrl = URL.createObjectURL(photo.file);
            } else {
              // Fallback to any other URL property
              possibleImageUrl = photo.file || photo.image;
            }
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src={possibleImageUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
                  />
                </div>
                <div className="p-4 space-y-2">
                  {photo.location && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Location:</span> {photo.location}
                    </div>
                  )}
                  {(photo.comment || photo.description) && (
                    <div className="text-sm text-gray-700 w-full">
                      <span className="font-medium">Comments:</span> {photo.comment || photo.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title={`${swpppReportConfig.title} Review`}
          backPath={handleBack}
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
          title={`${swpppReportConfig.title} Review`}
          backPath={handleBack}
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

  if (!formData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title={`${swpppReportConfig.title} Review`}
          backPath={handleBack}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">No report data provided.</h2>
        </div>
      </div>
    );
  }

  const projectInfo = {
    project: formData.header?.project || '—',
    spread: formData.header?.spread || '—',
    inspector: formData.header?.inspector || '—',
    contractor: formData.header?.contractor || '—',
    facility: formData.header?.facility || '—',
    date: formatDate(formData.header?.date),
    milepost_start: formData.header?.milepost_start || '—',
    milepost_end: formData.header?.milepost_end || '—',
    station_start: formData.header?.station_start || '—',
    station_end: formData.header?.station_end || '—',
    inspection_type: formData.header?.inspection_type || '—',
    inspection_date: formatDate(formData.header?.inspection_date),
  };

  // Extract inspection information separately
  const inspectionInfo = {
    inspection_type: formData.header?.inspection_type || '—',
    inspection_date: formatDate(formData.header?.inspection_date),
  };

  const sections = Array.isArray(formData.sections) ? formData.sections : [];
  const summaries = typeof formData.summaries === 'object' && formData.summaries !== null ? formData.summaries : {};
  const signature = formData.signature || '';
  const sigDate = formatDate(formData.sigDate);
  const photos = Array.isArray(formData.photos) ? formData.photos : [];
  
  console.log('SWPPP formData:', formData);
  console.log('SWPPP photos extracted:', photos);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title={`${swpppReportConfig.title} Review`}
        backPath={handleBack}
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Inspection Information Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Inspection Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <div><span className="font-semibold">Inspection Type:</span> {inspectionInfo.inspection_type}</div>
              <div><span className="font-semibold">Inspection Date:</span> {inspectionInfo.inspection_date}</div>
            </div>
          </div>
        </div>

        {/* Project Information Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <div><span className="font-semibold">Inspector:</span> {projectInfo.inspector}</div>
              <div><span className="font-semibold">Project:</span> {projectInfo.project}</div>
              <div><span className="font-semibold">Spread:</span> {projectInfo.spread}</div>
              <div><span className="font-semibold">Facility:</span> {projectInfo.facility}</div>
              <div><span className="font-semibold">Contractor:</span> {projectInfo.contractor}</div>
            </div>
            <div className="flex flex-col gap-3">
              <div><span className="font-semibold">Milepost Start:</span> {projectInfo.milepost_start}</div>
              <div><span className="font-semibold">Milepost End:</span> {projectInfo.milepost_end}</div>
              <div><span className="font-semibold">Station Start:</span> {projectInfo.station_start}</div>
              <div><span className="font-semibold">Station End:</span> {projectInfo.station_end}</div>
            </div>
          </div>
        </div>

        {/* Weather Information Section */}
        {sections.map((section, idx) => {
          const lowerName = section.name ? section.name.toLowerCase() : '';
          if (lowerName.includes('weather information')) {
            const weatherRow = section.rows && section.rows.length > 0 ? section.rows[0] : {};
            const weatherInfo = {
              weather_conditions: weatherRow.weather_conditions || '—',
              temperature: weatherRow.temperature || '—',
              precipitation_type: weatherRow.precipitation_type || '—',
              soil_conditions: weatherRow.soil_conditions || '—',
              rain_gauges: Array.isArray(weatherRow.rain_gauges) ? weatherRow.rain_gauges : [],
            };
            
            return (
              <div key={idx} className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Weather Information</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weather Conditions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precipitation Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soil Conditions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{weatherInfo.weather_conditions}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{weatherInfo.temperature}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{weatherInfo.precipitation_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{weatherInfo.soil_conditions}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <span className="font-semibold">Rain Gauges:</span> {renderRainGaugesTable(weatherInfo.rain_gauges)}
                </div>
              </div>
            );
          }
          return null;
        })}

        {sections.map((section, idx) => {
          const lowerName = section.name ? section.name.toLowerCase() : '';
          if (lowerName.includes('project information') || lowerName.includes('inspection information') || lowerName.includes('weather information')) {
            return null;
          }
          
          // Special handling for SWPPP Inspection Items to ensure all fields are shown
          if (lowerName.includes('swppp inspection items')) {
            return (
              <div key={idx} className="mb-6">
                <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
                {section.rows && section.rows.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station Start</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station End</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ECD Functional?</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ECD Needs Maintenance?</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soil Disturbed?</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{minWidth: '400px', width: '50%', maxWidth: '600px', whiteSpace: 'pre-line',  fontWeight: 'normal', fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em',}}>Comments</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {section.rows.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.station_start || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.station_end || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.facility || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.feature_details || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.inspector_id || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.inspection_time || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.ecd_functional || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.ecd_needs_maintenance || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.soil_disturbed || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900" style={{minWidth: '400px', width: '50%', maxWidth: '600px', whiteSpace: 'pre-line'}}>
                              {row.comments || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
            </div>
          );
        })}

        {Object.keys(summaries).length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">SWPPP Inspection Summary</h2>
            {Object.entries(summaries).map(([key, value]) => (
              <p key={key} className="mb-2">
                <span className="font-semibold">{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:</span>{' '}
                {value || '—'}
              </p>
            ))}
          </div>
        )}

        {photos.length > 0 && renderPhotos(photos)}

        {signature && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Inspector Signature</h2>
            <p className="mb-2">
              <span className="font-semibold">Prepared by:</span> {formData.preparedBy || projectInfo.inspector}
            </p>
            <div className="my-4">
              <img 
                src={signature} 
                alt="Signature" 
                className="max-w-[300px] border border-gray-300 rounded p-1 bg-white" 
              />
            </div>
            <p>
              <span className="font-semibold">Date:</span> {sigDate}
            </p>
          </div>
        )}
      </div>

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

      {snackbar.open && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <p className={snackbar.severity === 'error' ? 'text-red-600' : 'text-green-600'}>
            {snackbar.message}
          </p>
        </div>
      )}

      <div className="flex gap-4 justify-end mt-6 flex-wrap">
        <button
          onClick={handleEdit}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          onClick={handleBack}
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
        <button
          onClick={() => navigate(`/environmental/reports/swppp/print/${draftId}`, { state: { reportData: formData } })}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors no-print"
        >
          <PrinterIcon className="h-5 w-5 mr-2" />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
};

export default SWPPPReportReview;