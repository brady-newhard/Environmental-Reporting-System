import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';
import { loadDraft } from '../../../../utils/draftUtils';

const PayItemReportReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

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

  const { header, items, comments, preparedBy, signature, sigDate } = draft;

  // Filter out items with no data
  const filledItems = items.filter(item => 
    item.startSta || item.endSta || item.dailyQty || item.comments || item.unitQty
  );

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
      </div>
    </div>
  );
};

export default PayItemReportReview; 