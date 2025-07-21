import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PrinterIcon, CheckIcon, TrashIcon, ArrowLeftOnRectangleIcon, PencilIcon } from '@heroicons/react/24/outline';
import PageHeader from '../../../../components/common/PageHeader';
import { loadDraft, saveDraft, deleteDraft } from '../../../../utils/draftUtils';

const PayItemReportReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isPrinting, setIsPrinting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Smart back button path
  const backPath = state?.from || '/utility/reports/pay-item/drafts';

  // Try to get draft from state, else from localStorage
  const draft = useMemo(() => {
    if (state && state.draft) return state.draft;
    if (id) {
      // Try to load from draft storage
      try {
        return loadDraft('pay_item', id);
      } catch (error) {
        console.error('Error loading draft:', error);
        return null;
      }
    }
    return null;
  }, [state, id]);

  if (!draft) {
    return (
      <div className="bg-black min-h-screen pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
            <p className="text-center text-gray-600 py-8">
              Draft not found.{' '}
              <button
                onClick={() => navigate('/utility/reports/pay-item/drafts')}
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

  const { header, items, comments, preparedBy, signature, sigDate, photos } = draft;

  // Filter out items with no data
  const filledItems = items.filter(item => 
    item.startSta || item.endSta || item.dailyQty || item.comments || item.unitQty
  );

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Save the draft before navigation
      await saveDraft('pay_item', draft);
      console.log('Draft saved before print navigation');
      
      navigate(`/utility/reports/pay-item/print/${id}`, {
        state: { reportData: draft }
      });
    } catch (error) {
      console.error('Error saving draft before print:', error);
      // Navigate anyway with original draft
      navigate(`/utility/reports/pay-item/print/${id}`, {
        state: { reportData: draft }
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/utility/reports/pay-item/edit/${id}`);
  };

  const handleExit = () => {
    navigate('/utility/reports');
  };

  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      await deleteDraft('pay_item', id);
      setSnackbar({ open: true, message: 'Draft deleted successfully.', severity: 'success' });
      setTimeout(() => navigate('/utility/reports'), 1000);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete draft.', severity: 'error' });
    }
  };

  const handleSubmit = async () => {
    setSubmitDialogOpen(false);
    try {
      // Import the submit functionality
      const { submitReportForReview, preparePayItemReport } = await import('../../../../utils/reportSubmission');
      
      // Prepare the report data for submission
      const reportData = preparePayItemReport(draft);
      
      // Submit the report for lead review
      await submitReportForReview(reportData);
      
      // Delete the draft after successful submission
      await deleteDraft('pay_item', id);
      
      setSnackbar({ open: true, message: 'Report submitted for lead review successfully.', severity: 'success' });
      setTimeout(() => navigate('/utility/reports/pay-item/drafts'), 1000);
    } catch (err) {
      console.error('Error submitting report:', err);
      setSnackbar({ open: true, message: 'Failed to submit report: ' + (err.message || 'Unknown error'), severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Pay Item Report Review"
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
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Pay Item Report</h1>

          {/* Project Information */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><span className="font-medium">Project:</span> {header?.project || '-'}</div>
              <div><span className="font-medium">Date:</span> {header?.date ? new Date(header.date).toLocaleDateString() : '-'}</div>
              <div><span className="font-medium">Inspector:</span> {header?.inspector || '-'}</div>
              <div><span className="font-medium">Contractor:</span> {header?.contractor || '-'}</div>
              <div><span className="font-medium">Spread:</span> {header?.spread || '-'}</div>
            </div>
          </div>

          {/* Pay Items Table */}
          {filledItems.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Pay Items</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Station</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Station</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Qty</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Qty</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filledItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.item || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.description || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.unit || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.startSta || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.endSta || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.dailyQty || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.unitQty || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.comments || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Comments */}
          {comments && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Additional Comments</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">{comments}</p>
              </div>
            </div>
          )}

          {/* Photos */}
          {photos && photos.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Project Photos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <img 
                      src={photo.preview || photo.url} 
                      alt={`Project photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/static/placeholder-image.png';
                        e.target.alt = 'Image not available';
                      }}
                    />
                    {photo.caption && (
                      <p className="text-sm text-gray-600 mt-2">{photo.caption}</p>
                    )}
                  </div>
                ))}
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

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
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
              onClick={() => setSubmitDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Submit
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

        {/* Submit Confirmation Dialog */}
        {submitDialogOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Submit Report</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to submit this report for lead review? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setSubmitDialogOpen(false)}
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

export default PayItemReportReview; 