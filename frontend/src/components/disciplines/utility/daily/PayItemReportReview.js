import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PrinterIcon } from '@heroicons/react/24/outline';
import PageHeader from '../../../../components/common/PageHeader';
import { loadDraft, saveDraft } from '../../../../utils/draftUtils';

const PayItemReportReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isPrinting, setIsPrinting] = useState(false);

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

          {/* Print Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              {isPrinting ? 'Preparing...' : 'Print Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayItemReportReview; 