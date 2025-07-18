import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const ApproveRejectModal = ({ report, actionType, onClose, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = async () => {
    if (actionType === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      const endpoint = actionType === 'approve' ? 'approve' : 'reject';
      const data = {
        review_notes: reviewNotes.trim()
      };

      if (actionType === 'reject') {
        data.rejection_reason = rejectionReason.trim();
      }

      await api.post(`/api/reports/${report.id}/${endpoint}/`, data);
      onComplete();
    } catch (error) {
      console.error(`Error ${actionType}ing report:`, error);
      alert(`Failed to ${actionType} report. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const isApprove = actionType === 'approve';
  const title = isApprove ? 'Approve Report' : 'Reject Report';
  const icon = isApprove ? CheckCircleIcon : XCircleIcon;
  const iconColor = isApprove ? 'text-green-600' : 'text-red-600';
  const buttonColor = isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <icon className={`h-6 w-6 mr-2 ${iconColor}`} />
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            {isApprove 
              ? 'Are you sure you want to approve this report?'
              : 'Are you sure you want to reject this report?'
            }
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Details
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              <div><strong>Type:</strong> {report.report_type}</div>
              <div><strong>ID:</strong> {report.report_id}</div>
              <div><strong>Inspector:</strong> {report.submitted_by_name}</div>
              <div><strong>Discipline:</strong> {report.discipline_display}</div>
            </div>
          </div>

          {!isApprove && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="3"
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Notes (Optional)
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Additional notes or comments..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColor} disabled:opacity-50`}
          >
            {loading ? 'Processing...' : (isApprove ? 'Approve' : 'Reject')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveRejectModal; 