import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { loadDraft } from '../../../../utils/draftUtils';
import PageHeader from '../../../../components/common/PageHeader';
import { PencilIcon, ArrowLeftOnRectangleIcon, TrashIcon, CheckIcon, PrinterIcon } from '@heroicons/react/24/outline';
import punchlistReportConfig from './punchlistReportConfig';

export default function PunchlistReportReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportType = 'punchlist';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Helper to format date as MM/DD/YYYY, but handle YYYY-MM-DD strings without timezone shift
  const formatDate = (value) => {
    if (!value) return '—';
    // If value is already in YYYY-MM-DD, format as MM/DD/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
    }
    // Otherwise, try to parse as Date
    const d = new Date(value);
    if (isNaN(d)) return value;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  // Get the back path from location state or default to drafts
  const backPath = location.state?.from || '/environmental/reports/punchlist/drafts';

  useEffect(() => {
    const loadDraftData = async () => {
      if (!id) {
        setError('No draft ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const loadedDraft = await loadDraft(reportType, id);
        if (loadedDraft) {
          setDraft(loadedDraft);
        } else {
          setError('Draft not found');
        }
      } catch (err) {
        console.error('Error loading draft:', err);
        setError('Error loading draft: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDraftData();
  }, [id, reportType]);

  const handleBack = () => {
    navigate(backPath);
  };

  const handleEdit = () => {
    navigate(`/environmental/reports/punchlist/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await import('../../../../utils/draftUtils').then(utils => utils.deleteDraft(reportType, id));
      setSnackbar({
        open: true,
        message: 'Draft deleted successfully',
        severity: 'success'
      });
      navigate('/environmental/reports/punchlist/drafts');
    } catch (err) {
      console.error('Error deleting draft:', err);
      setSnackbar({
        open: true,
        message: 'Error deleting draft: ' + err.message,
        severity: 'error'
      });
    }
  };

  const handlePrint = () => {
    navigate(`/environmental/reports/punchlist/print/${id}`);
  };

  const handleSubmit = async () => {
    try {
      // Submit to API
      await api.post('/api/environmental/punchlists/reports/', {
        ...draft,
        finalized: true
      });
      
      // Delete draft after successful submission
      await import('../../../../utils/draftUtils').then(utils => utils.deleteDraft(reportType, id));
      
      setSnackbar({
        open: true,
        message: 'Report submitted successfully',
        severity: 'success'
      });
      
      navigate('/environmental/reports/punchlist');
    } catch (err) {
      console.error('Error submitting report:', err);
      setSnackbar({
        open: true,
        message: 'Error submitting report: ' + err.message,
        severity: 'error'
      });
    }
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
          title={`${punchlistReportConfig.title} Review`}
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
          title={`${punchlistReportConfig.title} Review`}
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

  if (!draft) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <PageHeader
          title={`${punchlistReportConfig.title} Review`}
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
    project: draft?.header?.project || '—',
    spread: draft?.header?.spread || '—',
    inspector: draft?.header?.inspector || '—',
    contractor: draft?.header?.contractor || '—',
    facility: draft?.header?.facility || '—',
    date: formatDate(draft?.header?.date),
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
    rain_gauges: weatherRow.rain_gauges || draft?.header?.rain_gauges || [],
  };

  const sections = Array.isArray(draft?.sections) ? draft.sections : [];
  const summaries = typeof draft?.summaries === 'object' && draft.summaries !== null ? draft.summaries : {};
  const signature = draft?.signature || '';
  const sigDate = formatDate(draft?.sigDate);
  const photos = Array.isArray(draft?.photos) ? draft.photos : [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <PageHeader
        title={`${punchlistReportConfig.title} Review`}
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
              <div><span className="font-semibold">Date:</span> {projectInfo.date}</div>
            </div>
          </div>
        </div>

        {/* Weather Information Section */}
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
          
          // Special handling for Punchlist Items to ensure all fields are shown
          if (lowerName.includes('punchlist items')) {
            return (
              <div key={idx} className="mb-6">
                <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
                {section.rows && section.rows.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Station</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Station</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendations</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signoff</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {section.rows.map((row, rowIdx) => (
                          <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.item_number || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.start_station || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.end_station || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.feature || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{row.issue || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">{row.recommendations || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.completed || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.inspector_signoff || '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(row.completed_date) || '—'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {row.photos && Array.isArray(row.photos) && row.photos.length > 0 ? (
                                <div className="flex gap-1">
                                  {row.photos.slice(0, 3).map((photo, photoIdx) => (
                                    <div key={photoIdx} className="w-8 h-8 rounded overflow-hidden border">
                                      <img
                                        src={photo.url || photo.file || photo.preview || photo.image_url}
                                        alt={`Photo ${photoIdx + 1}`}
                                        className="w-full h-full object-cover"
                                        title={`Photo ${photoIdx + 1}: ${photo.location || ''} - ${photo.description || photo.comment || ''}`}
                                      />
                                    </div>
                                  ))}
                                  {row.photos.length > 3 && (
                                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600">
                                      +{row.photos.length - 3}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                'No photos'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Display photos for each item in a separate section */}
                {section.rows && section.rows.length > 0 && section.rows.some(row => row.photos && row.photos.length > 0) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Item Photos</h3>
                    {section.rows.map((row, rowIdx) => (
                      row.photos && Array.isArray(row.photos) && row.photos.length > 0 && (
                        <div key={rowIdx} className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-3">
                            Item #{row.item_number} - {row.feature}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {row.photos.map((photo, photoIdx) => (
                              <div key={photoIdx} className="relative">
                                <img
                                  src={photo.url || photo.file || photo.preview || photo.image_url}
                                  alt={`Item ${row.item_number} Photo ${photoIdx + 1}`}
                                  className="w-full h-32 object-cover rounded-lg shadow-md"
                                />
                                {(photo.location || photo.description || photo.comment) && (
                                  <div className="mt-2 text-xs">
                                    {photo.location && (
                                      <div className="font-semibold text-gray-700">Location: {photo.location}</div>
                                    )}
                                    {(photo.description || photo.comment) && (
                                      <div className="text-gray-500 mt-1">{photo.description || photo.comment}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Default rendering for other sections
          return (
            <div key={idx} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
              {section.rows && section.rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(section.rows[0]).map((field, i) => (
                          <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {field}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {section.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          {Object.values(row).map((value, fieldIdx) => (
                            <td key={fieldIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {typeof value === 'object' && value !== null ? JSON.stringify(value) : value || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {/* Summary Section */}
        {Object.keys(summaries).length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{punchlistReportConfig.summarySectionTitle}</h2>
            <div className="space-y-4">
              {Object.entries(summaries).map(([key, value]) => (
                <div key={key}>
                  <h3 className="font-semibold text-gray-700 mb-2">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photos Section */}
        {photos.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg border">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature Section */}
        {signature && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Signature</h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <img src={signature} alt="Signature" className="max-w-xs h-16 object-contain" />
              </div>
              <div className="text-sm text-gray-600">
                <div>Date: {sigDate}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t">
          <button
            onClick={handleEdit}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setSubmitDialogOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            Submit Report
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Draft</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this draft? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  handleDelete();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      {submitDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Submit Report</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to submit this report? This will finalize the report and remove the draft.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSubmitDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSubmitDialogOpen(false);
                  handleSubmit();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
          <div className={`text-sm ${snackbar.severity === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {snackbar.message}
          </div>
        </div>
      )}
    </div>
  );
} 