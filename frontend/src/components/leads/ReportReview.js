import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getReports, approveReport, rejectReport } from '../../services/api';
import PageHeader from '../common/PageHeader';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const ReportReview = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const reports = await getReports();
      const foundReport = reports.find(r => r.id === parseInt(reportId));
      if (foundReport) {
        setReport(foundReport);
      } else {
        console.error('Report not found');
        navigate('/leads/dashboard');
      }
    } catch (error) {
      console.error('Error loading report:', error);
      navigate('/leads/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!report) return;
    
    setSubmitting(true);
    try {
      await approveReport(report.id, reviewNotes);
      setShowApproveModal(false);
      navigate('/leads/dashboard');
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Failed to approve report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!report || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setSubmitting(true);
    try {
      await rejectReport(report.id, rejectionReason, reviewNotes);
      setShowRejectModal(false);
      navigate('/leads/dashboard');
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('Failed to reject report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderReportData = () => {
    if (!report?.report_data) return null;

    const data = report.report_data;
    
    return (
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Report Type</label>
              <p className="mt-1 text-sm text-gray-900">
                {report.report_type.replace(/_/g, ' ').toUpperCase()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Discipline</label>
              <p className="mt-1 text-sm text-gray-900">{report.discipline}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Submitted By</label>
              <p className="mt-1 text-sm text-gray-900">
                {report.submitted_by?.first_name} {report.submitted_by?.last_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Submitted Date</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(report.submitted_at)}</p>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Content</h3>
          <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  </div>
                );
              } else if (typeof value === 'string' && value.length > 0) {
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{value}</p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Review Report" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Report Not Found" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Report not found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The report you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/leads/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Review Report" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {report.report_type.replace(/_/g, ' ').toUpperCase()}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Submitted by {report.submitted_by?.first_name} {report.submitted_by?.last_name} on {formatDate(report.submitted_at)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(report.status)}`}>
                {report.status.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={() => navigate('/leads/dashboard')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {renderReportData()}

        {/* Review Actions */}
        {report.status === 'submitted' && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Actions</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Add any notes about your review..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <XCircleIcon className="w-4 h-4 mr-2" />
                  Reject Report
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Approve Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Review Info */}
        {report.status !== 'submitted' && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Information</h3>
            <div className="space-y-4">
              {report.reviewed_by && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reviewed By</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {report.reviewed_by.first_name} {report.reviewed_by.last_name}
                  </p>
                </div>
              )}
              {report.reviewed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reviewed At</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(report.reviewed_at)}</p>
                </div>
              )}
              {report.review_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Review Notes</label>
                  <p className="mt-1 text-sm text-gray-900">{report.review_notes}</p>
                </div>
              )}
              {report.rejection_reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                  <p className="mt-1 text-sm text-gray-900">{report.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Approve Report</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to approve this report? This action cannot be undone.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={handleApprove}
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
                  >
                    {submitting ? 'Approving...' : 'Approve Report'}
                  </button>
                  <button
                    onClick={() => setShowApproveModal(false)}
                    disabled={submitting}
                    className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Reject Report</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 mb-4">
                    Please provide a reason for rejecting this report.
                  </p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Enter rejection reason..."
                  />
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={handleReject}
                    disabled={submitting || !rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                  >
                    {submitting ? 'Rejecting...' : 'Reject Report'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    disabled={submitting}
                    className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportReview; 