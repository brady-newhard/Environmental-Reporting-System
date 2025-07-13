import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const PayItemReportPrint = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Get report data from state or try to load from storage
  const reportData = state?.reportData || null;

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <p className="text-center text-gray-600 py-8">
            Report data not found.{' '}
            <button
              onClick={() => navigate('/utility/reports/pay-item/drafts')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Back to Drafts
            </button>
          </p>
        </div>
      </div>
    );
  }

  const { header, items, comments, preparedBy, signature, sigDate, photos } = reportData;

  // Filter out items with no data
  const filledItems = items.filter(item => 
    item.startSta || item.endSta || item.dailyQty || item.comments || item.unitQty
  );

  const handleBack = () => {
    navigate(`/utility/reports/pay-item/review/${id}`, {
      state: { draft: reportData, from: '/utility/reports/pay-item/drafts' }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 print:bg-white print:p-0">
      {/* Print Header - Hidden when printing */}
      <div className="max-w-4xl mx-auto mb-4 print:hidden">
        <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Review
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Print Report
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow print:shadow-none print:p-0">
        {/* Header with Logo */}
        <div className="text-center mb-8 border-b border-gray-300 pb-6">
          <div className="flex justify-center items-center mb-4">
            <img src="/static/PIPE-Logo.png" alt="PIPE Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pay Item Report</h1>
          <p className="text-gray-600">Daily Progress and Quantities</p>
        </div>

        {/* Project Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex justify-between">
              <span className="font-medium">Project:</span>
              <span>{header?.project || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{header?.date ? new Date(header.date).toLocaleDateString() : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Inspector:</span>
              <span>{header?.inspector || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Contractor:</span>
              <span>{header?.contractor || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Spread:</span>
              <span>{header?.spread || '-'}</span>
            </div>
          </div>
        </div>

        {/* Pay Items Table */}
        {filledItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Pay Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Item</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Unit</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Start Station</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">End Station</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Daily Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Unit Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Comments</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filledItems.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{item.item || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{item.description || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{item.unit || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{item.startSta || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{item.endSta || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{item.dailyQty || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{item.unitQty || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">{item.comments || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comments */}
        {comments && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Additional Comments</h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{comments}</p>
            </div>
          </div>
        )}

        {/* Photos */}
        {photos && photos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Project Photos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={photo.preview || photo.url} 
                    alt={`Project photo ${index + 1}`}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.src = '/static/placeholder-image.png';
                      e.target.alt = 'Image not available';
                    }}
                  />
                  {photo.caption && (
                    <div className="p-3 bg-gray-50">
                      <p className="text-sm text-gray-700">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature Section */}
        <div className="mt-12 border-t border-gray-300 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Inspector Signature</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-2">Prepared by:</p>
              <p className="font-medium text-gray-800">{preparedBy || '_________________'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Date:</p>
              <p className="font-medium text-gray-800">{sigDate || '_________________'}</p>
            </div>
          </div>
          {signature && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">Signature:</p>
              <img 
                src={signature} 
                alt="Inspector Signature" 
                className="max-w-xs border border-gray-300 rounded"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
          <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PayItemReportPrint; 