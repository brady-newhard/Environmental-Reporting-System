import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';
import { loadDraft, deleteDraft } from '../../../../utils/draftUtils';
import { PencilIcon, ArrowLeftOnRectangleIcon, TrashIcon, CheckIcon, PrinterIcon } from '@heroicons/react/24/outline';

const DailyUtilityReportReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  // Smart back button path
  const backPath = state?.from || '/utility/reports/daily/drafts';

  // Load draft data asynchronously
  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      try {
        // Check if data was passed directly in state (from form) - prioritize this
        if (state && (state.header || state.weather || state.rows)) {
          console.log('Using data from form state:', state);
          setDraft(state);
          setIsLoading(false);
          return;
        }
        
        // Check if draft object was passed in state
        if (state && state.draft) {
          console.log('Using draft from state:', state.draft);
          setDraft(state.draft);
          setIsLoading(false);
          return;
        }
        
        // If we have a valid ID and no state data, try to load from storage
        if (id) {
          try {
            const loadedDraft = await loadDraft('daily_utility', id);
            console.log('Using draft from storage:', loadedDraft);
            if (loadedDraft) {
              // Photos should already be base64 from storage, but check for any remaining blob URLs
              if (loadedDraft.photos && loadedDraft.photos.length > 0) {
                const hasBlobUrls = loadedDraft.photos.some(photo => 
                  (photo.preview && photo.preview.startsWith('blob:')) ||
                  (photo.url && photo.url.startsWith('blob:'))
                );
                
                if (hasBlobUrls) {
                  console.warn('Found blob URLs in storage, converting to base64');
                  try {
                    const { convertPhotosToBase64 } = await import('../../../../utils/photoUtils');
                    const convertedPhotos = await convertPhotosToBase64(loadedDraft.photos);
                    const processedDraft = { ...loadedDraft, photos: convertedPhotos };
                    console.log('Converted photos from storage:', convertedPhotos);
                    setDraft(processedDraft);
                  } catch (conversionError) {
                    console.error('Error converting photos from storage:', conversionError);
                    setDraft(loadedDraft);
                  }
                } else {
                  console.log('Photos from storage are already base64');
                  setDraft(loadedDraft);
                }
              } else {
                setDraft(loadedDraft);
              }
              setIsLoading(false);
              return;
            } else {
              console.error('Draft not found in storage with ID:', id);
            }
          } catch (error) {
            console.error('Error loading draft from storage:', error);
          }
        }
        
        // If we get here, we have no data
        setDraft(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDraftData();
  }, [state, id]);

  // Button handlers
  const handleEdit = () => {
    navigate(`/utility/reports/daily/edit/${id}`);
  };

  const handleExit = () => {
    navigate('/utility/reports');
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await deleteDraft('daily_utility', id);
      setSnackbar({ open: true, message: 'Draft deleted successfully.', severity: 'success' });
      setTimeout(() => navigate('/utility/reports'), 1000);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete draft.', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    setSubmitDialogOpen(false);
    try {
      // Here you would typically submit the report to the server
      // For now, we'll just show a success message
      setSnackbar({ open: true, message: 'Report submitted successfully.', severity: 'success' });
      setTimeout(() => navigate('/utility/reports'), 1000);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to submit report.', severity: 'error' });
    }
  };

  const handlePrint = async () => {
    // Photos are now stored as base64 from the start, so just save the draft
    setIsPrinting(true);
    try {
      const { saveDraft } = await import('../../../../utils/draftUtils');
      
      // Ensure the draft has the correct ID
      const draftToSave = { ...draft, id: id };
      
      // Save the draft (photos are already base64)
      const savedDraft = await saveDraft('daily_utility', draftToSave);
      console.log('Draft saved before print navigation:', {
        id: savedDraft.id,
        photoCount: savedDraft.photos ? savedDraft.photos.length : 0
      });
      
      navigate(`/utility/reports/daily/print/${savedDraft.id}`, {
        state: { reportData: savedDraft }
      });
    } catch (error) {
      console.error('Error saving draft before print:', error);
      // Navigate anyway with original draft
      navigate(`/utility/reports/daily/print/${id}`, {
        state: { reportData: draft }
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
            <p className="text-center text-gray-600 py-8">Loading draft...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="bg-black min-h-screen pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
            <p className="text-center text-gray-600 py-8">
              Draft not found.{' '}
              <button
                onClick={() => navigate('/utility/reports/daily/drafts')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Back to Drafts
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Extract all data from draft, with fallbacks
  const {
    header = {},
    weather = { am: {}, pm: {} },
    am = false,
    pm = false,
    rows = [],
    equipmentRows = [],
    generalSummary = '',
    landSummary = '',
    envSummary = '',
    safety = '',
    preparedBy = '',
    signature = '',
    sigDate = '',
    photos = []
  } = draft;

  console.log('Review component data:', {
    header,
    weather,
    rows: rows.length,
    equipmentRows: equipmentRows.length,
    photos: photos.length,
    generalSummary,
    landSummary,
    envSummary,
    safety,
    preparedBy,
    signature: signature ? 'Present' : 'Missing',
    sigDate
  });
  
  // Debug photos specifically
  console.log('Photos received in review:', photos);
  photos.forEach((photo, idx) => {
    console.log(`Review Photo ${idx}:`, {
      id: photo.id,
      url: photo.url,
      preview: photo.preview,
      image_url: photo.image_url,
      file: photo.file,
      location: photo.location,
      description: photo.description,
      isBlobUrl: photo.preview && photo.preview.startsWith('blob:'),
      isBase64Url: photo.preview && photo.preview.startsWith('data:'),
      isServerUrl: photo.url && (photo.url.startsWith('http') || photo.url.startsWith('/'))
    });
  });

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Daily Utility Report Review"
          backPath={backPath}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />

        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mt-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Daily Utility Report</h1>

          {/* Project Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><span className="font-medium">Project:</span> {header?.project || '-'}</div>
              <div><span className="font-medium">Spread:</span> {header?.spread || '-'}</div>
              <div><span className="font-medium">Inspector:</span> {header?.inspector || '-'}</div>
              <div><span className="font-medium">AFE Number:</span> {header?.afe || '-'}</div>
              <div><span className="font-medium">Contractor:</span> {header?.contractor || '-'}</div>
              <div><span className="font-medium">Date:</span> {header?.date ? new Date(header.date).toLocaleDateString() : '-'}</div>
              <div><span className="font-medium">Weekday:</span> {header?.weekday || '-'}</div>
              <div><span className="font-medium">Report No.:</span> {header?.reportNo || '-'}</div>
              <div><span className="font-medium">Total Footage:</span> {header?.totalFootage || '-'}</div>
              {[1, 2, 3].map(i => header && header[`sub${i}`] && (
                <div key={i}><span className="font-medium">Subcontractor {i}:</span> {header[`sub${i}`]}</div>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Weather Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['am', 'pm'].map(period => (
                <div key={period} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">{period.toUpperCase()} Weather</h3>
                  <div className="space-y-1">
                    <div><span className="font-medium">Sky Cover:</span> {weather?.[period]?.sky || '-'}</div>
                    <div><span className="font-medium">Precipitation:</span> {weather?.[period]?.precip || '-'}</div>
                    <div><span className="font-medium">Temperature:</span> {weather?.[period]?.temp ? `${weather[period].temp}°F` : '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Construction Activities */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Construction Activities</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Station</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Station</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Footage</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Complete</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crew</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows && rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {row.phase === 'Other' ? row.customPhase : row.phase}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.startSta || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.endSta || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.dailyFootage || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.cumulativeFootage || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.percentComplete || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.contractor || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.crew || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{row.hours || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Equipment */}
          {equipmentRows && equipmentRows.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Equipment</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Used</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {equipmentRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.equipment || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.qty || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.hoursUsed || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summaries */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Summaries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">General Summary</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                  {generalSummary || 'No general summary provided.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Land Summary</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                  {landSummary || 'No land summary provided.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Environmental Summary</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                  {envSummary || 'No environmental summary provided.'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Safety Concerns</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                  {safety || 'No safety concerns reported.'}
                </p>
              </div>
            </div>
          </div>

          {/* Photos */}
          {photos && photos.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Photos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {photos.map((photo, idx) => {
                  // Use the same robust photo URL extraction logic as ReportPhotoSection
                  let possibleImageUrl;
                  if (photo.image_url || photo.url) {
                    // Uploaded photo with server URL
                    possibleImageUrl = photo.image_url || photo.url;
                  } else if (photo.preview) {
                    // Local photo with blob preview URL or base64 data URL
                    possibleImageUrl = photo.preview;
                  } else if (photo.file && photo.file instanceof File) {
                    // Local photo with File object - create object URL
                    possibleImageUrl = URL.createObjectURL(photo.file);
                  } else if (photo.file && typeof photo.file === 'string' && photo.file.startsWith('data:')) {
                    // Base64 data URL
                    possibleImageUrl = photo.file;
                  } else {
                    // Fallback to any other URL property
                    possibleImageUrl = photo.file || photo.image;
                  }
                  
                  // Handle invalid blob URLs by showing a placeholder
                  const isValidUrl = possibleImageUrl && 
                    (possibleImageUrl.startsWith('http') || 
                     possibleImageUrl.startsWith('blob:') || 
                     possibleImageUrl.startsWith('data:'));
                  
                  return (
                    <div key={idx} className="flex flex-col items-center border rounded-lg p-3 bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
                      {isValidUrl ? (
                        <img
                          src={possibleImageUrl}
                          alt={photo.comment || photo.description || `Photo ${idx + 1}`}
                          className="w-full max-w-xs max-h-60 object-contain mb-3 rounded shadow"
                          onError={(e) => {
                            console.error('Failed to load image:', possibleImageUrl);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full max-w-xs max-h-60 object-contain mb-3 rounded shadow bg-gray-200 flex items-center justify-center ${isValidUrl ? 'hidden' : ''}`}
                        style={{ minHeight: '200px' }}
                      >
                        <span className="text-gray-500 text-sm">Photo not available</span>
                      </div>
                      {photo.location && (
                        <div className="text-sm text-gray-600 mb-1 w-full">
                          <span className="font-medium">Location:</span> {photo.location}
                        </div>
                      )}
                      {(photo.comment || photo.description) && (
                        <div className="text-sm text-gray-700 w-full">
                          <span className="font-medium">Comments:</span> {photo.comment || photo.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Inspector Signature</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <span className="font-medium">Prepared by:</span> {preparedBy || '-'}
              </div>
              {signature && (
                <div className="mb-3">
                  <img 
                    src={signature} 
                    alt="Signature" 
                    className="max-w-xs border border-gray-300 rounded"
                  />
                </div>
              )}
              <div>
                <span className="font-medium">Date:</span> {sigDate || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Outside container, all inline */}
        <div className="flex gap-4 justify-center mt-6">
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
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors no-print disabled:opacity-50"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">{isPrinting ? 'Saving...' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Draft</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this draft? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Submit Report</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to submit this report? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSubmitDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-white text-center transition-all duration-300 ${snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
             onClick={handleCloseSnackbar}
        >
          {snackbar.message}
        </div>
      )}
    </div>
  );
};

export default DailyUtilityReportReview; 