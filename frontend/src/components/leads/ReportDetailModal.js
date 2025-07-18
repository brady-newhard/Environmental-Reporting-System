import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ReportDetailModal = ({ report, onClose }) => {
  if (!report) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      in_review: { color: 'bg-yellow-100 text-yellow-800', label: 'In Review' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Report Details - {report.report_type}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <p className="text-sm text-gray-900">{report.report_type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report ID</label>
              <p className="text-sm text-gray-900">{report.report_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
              <p className="text-sm text-gray-900">{report.discipline_display}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="mt-1">{getStatusBadge(report.status)}</div>
            </div>
          </div>

          {/* People */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
              <p className="text-sm text-gray-900">{report.submitted_by_name}</p>
            </div>
            {report.assigned_lead_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Lead</label>
                <p className="text-sm text-gray-900">{report.assigned_lead_name}</p>
              </div>
            )}
            {report.reviewed_by_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed By</label>
                <p className="text-sm text-gray-900">{report.reviewed_by_name}</p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submitted At</label>
              <p className="text-sm text-gray-900">{formatDate(report.submitted_at)}</p>
            </div>
            {report.assigned_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned At</label>
                <p className="text-sm text-gray-900">{formatDate(report.assigned_at)}</p>
              </div>
            )}
            {report.reviewed_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewed At</label>
                <p className="text-sm text-gray-900">{formatDate(report.reviewed_at)}</p>
              </div>
            )}
          </div>

          {/* Review Information */}
          {report.rejection_reason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
              <p className="text-sm text-gray-900 bg-red-50 p-3 rounded-md border border-red-200">
                {report.rejection_reason}
              </p>
            </div>
          )}

          {report.review_notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-200">
                {report.review_notes}
              </p>
            </div>
          )}

          {/* Report Data Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Data</label>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-y-auto">
              <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(report.report_data, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal; 