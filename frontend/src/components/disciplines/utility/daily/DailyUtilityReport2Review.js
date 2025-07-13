import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';
import { loadDraft, deleteDraft } from '../../../../utils/draftUtils';
import { PencilIcon, ArrowLeftOnRectangleIcon, TrashIcon, CheckIcon, PrinterIcon } from '@heroicons/react/24/outline';

const DailyUtilityReport2Review = () => {
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
  const backPath = state?.from || '/utility/reports/daily2/drafts';

  // Load draft data asynchronously
  useEffect(() => {
    const loadDraftData = async () => {
      setIsLoading(true);
      try {
        // Check if data was passed directly in state (from form) - prioritize this
        if (state && (state.header || state.headcounts || state.progressRows)) {
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
            const loadedDraft = await loadDraft('daily_utility_2', id);
            console.log('Using draft from storage:', loadedDraft);
            if (loadedDraft) {
              setDraft(loadedDraft);
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
    }

    loadDraftData();
  }, [state, id]);

  // Button handlers
  const handleEdit = () => {
    navigate(`/utility/reports/daily2/edit/${id}`);
  };

  const handleExit = () => {
    navigate('/utility/reports');
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await deleteDraft('daily_utility_2', id);
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
    setIsPrinting(true);
    try {
      const { saveDraft } = await import('../../../../utils/draftUtils');
      
      // Ensure the draft has the correct ID
      const draftToSave = { ...draft, id: id };
      
      // Save the draft
      const savedDraft = await saveDraft('daily_utility_2', draftToSave);
      console.log('Draft saved before print navigation:', {
        id: savedDraft.id,
        photoCount: savedDraft.photos ? savedDraft.photos.length : 0
      });
      
      navigate(`/utility/reports/daily2/print/${savedDraft.id}`, {
        state: { reportData: savedDraft }
      });
    } catch (error) {
      console.error('Error saving draft before print:', error);
      // Navigate anyway with original draft
      navigate(`/utility/reports/daily2/print/${id}`, {
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
                onClick={() => navigate('/utility/reports/daily2/drafts')}
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
    headcounts = {},
    subcontractors = [],
    inspectionPersonnel = [],
    craft = '',
    environmental = '',
    survey = '',
    land = '',
    morningTemp = '',
    midTemp = '',
    wind = '',
    weather = '',
    precipitation = '',
    abnormalConditions = '',
    crewAdverse = '',
    progressRows = [],
    payItems = [],
    remarks = '',
    equipment = [],
    crews = [],
    preparedBy = '',
    signature = '',
    sigDate = '',
    photos = []
  } = draft;

  // Filter out empty progress rows (only show rows with data)
  const filledProgressRows = progressRows.filter(row => 
    row.from || row.to || row.feet || row.comments
  );

  // Filter out empty pay item rows (only show rows with data)
  const filledPayItems = payItems.filter(item => 
    item.from || item.to || item.qty || item.comments
  );

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Daily Utility Report 2 - Review"
          backPath={backPath}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />

        <div className="space-y-6">
          {/* Project Information */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Section</label>
                <p className="text-sm text-gray-900">{header.section || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Spread</label>
                <p className="text-sm text-gray-900">{header.spread || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Contractor</label>
                <p className="text-sm text-gray-900">{header.contractor || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Work Date</label>
                <p className="text-sm text-gray-900">{header.workDate || '—'}</p>
              </div>
            </div>
          </div>

          {/* Contractor Headcount */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Contractor Headcount</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(headcounts).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <p className="text-sm text-gray-900">{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subcontractors & Inspection Personnel */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Subcontractors</h2>
            {subcontractors.length > 0 && subcontractors[0]?.company && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
                  <p className="text-sm text-gray-900">{subcontractors[0].company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Headcount</label>
                  <p className="text-sm text-gray-900">{subcontractors[0].headcount}</p>
                </div>
              </div>
            )}
            
            <h2 className="text-xl font-bold text-gray-800 mb-4">Inspection Personnel</h2>
            {inspectionPersonnel.length > 0 && inspectionPersonnel[0]?.company && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
                  <p className="text-sm text-gray-900">{inspectionPersonnel[0].company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Headcount</label>
                  <p className="text-sm text-gray-900">{inspectionPersonnel[0].headcount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Other Info */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Other Info</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Craft</label>
                <p className="text-sm text-gray-900">{craft || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Environmental</label>
                <p className="text-sm text-gray-900">{environmental || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Survey</label>
                <p className="text-sm text-gray-900">{survey || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Land</label>
                <p className="text-sm text-gray-900">{land || '—'}</p>
              </div>
            </div>
          </div>

          {/* Weather & Working Conditions */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Weather & Working Conditions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Morning Temp</label>
                <p className="text-sm text-gray-900">{morningTemp || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mid Temp</label>
                <p className="text-sm text-gray-900">{midTemp || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Wind</label>
                <p className="text-sm text-gray-900">{wind || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Weather</label>
                <p className="text-sm text-gray-900">{weather || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Precipitation</label>
                <p className="text-sm text-gray-900">{precipitation || '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Did ABNORMAL working conditions exist that adversely affected progress?</label>
                <p className="text-sm text-gray-900">{abnormalConditions || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Any Crews affected by adverse weather, right-of-way or other working conditions?</label>
                <p className="text-sm text-gray-900">{crewAdverse || '—'}</p>
              </div>
            </div>
          </div>

          {/* Progress/Activity Table - Only show filled rows */}
          {filledProgressRows.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Progress / Activity</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                      <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feet Today</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filledProgressRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-2 text-sm text-gray-900">{row.activity}</td>
                        <td className="px-1 py-2 text-sm text-gray-900">{row.from || '—'}</td>
                        <td className="px-1 py-2 text-sm text-gray-900">{row.to || '—'}</td>
                        <td className="px-1 py-2 text-sm text-gray-900">{row.feet || '—'}</td>
                        <td className="px-2 py-2 text-sm text-gray-900">{row.comments || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pay Item Logs Table - Only show filled rows */}
          {filledPayItems.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pay Item Logs</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                      <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Today</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filledPayItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-2 text-sm text-gray-900">{item.item}</td>
                        <td className="px-2 py-2 text-sm text-gray-900">{item.uom}</td>
                        <td className="px-1 py-2 text-sm text-gray-900">{item.from || '—'}</td>
                        <td className="px-1 py-2 text-sm text-gray-900">{item.to || '—'}</td>
                        <td className="px-1 py-2 text-sm text-gray-900">{item.qty || '—'}</td>
                        <td className="px-2 py-2 text-sm text-gray-900">{item.comments || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Remarks */}
          {remarks && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Remarks</h2>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{remarks}</p>
            </div>
          )}

          {/* Equipment & Crews */}
          {(equipment.length > 0 && equipment[0]?.name) || (crews.length > 0 && crews[0]?.name) ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Equipment & Crews</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipment.length > 0 && equipment[0]?.name && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Equipment</label>
                      <p className="text-sm text-gray-900">{equipment[0].name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                      <p className="text-sm text-gray-900">{equipment[0].qty}</p>
                    </div>
                  </>
                )}
                {crews.length > 0 && crews[0]?.name && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Crew</label>
                      <p className="text-sm text-gray-900">{crews[0].name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                      <p className="text-sm text-gray-900">{crews[0].qty}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {/* Photos */}
          {photos && photos.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Photos</h2>
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

          {/* Signature Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Signature Section</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Prepared By</label>
                <p className="text-sm text-gray-900">{preparedBy || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Signature Date</label>
                <p className="text-sm text-gray-900">{sigDate || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Signature</label>
                {signature ? (
                  <img src={signature} alt="Signature" className="w-32 h-16 object-contain border border-gray-300 rounded" />
                ) : (
                  <p className="text-sm text-gray-500">No signature</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              {isPrinting ? 'Printing...' : 'Print'}
            </button>
            <button
              onClick={handleExit}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
              Exit
            </button>
            <button
              onClick={() => setDeleteDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this draft? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setDeleteDialogOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Snackbar */}
        {snackbar.open && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${
            snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {snackbar.message}
            <button
              onClick={handleCloseSnackbar}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyUtilityReport2Review; 