import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getReports, approveReport, rejectReport } from '../../services/api';
import api from '../../services/api';
import { loadDraft } from '../../utils/draftUtils';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowLeftIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

// Import the print components for each report type
import EnvironmentalDailyReportPrint from '../disciplines/environmental/daily/EnvironmentalDailyReportPrint';
import DailyUtilityReportPrint from '../disciplines/utility/daily/DailyUtilityReportPrint';
import DailyUtilityReport2Print from '../disciplines/utility/daily/DailyUtilityReport2Print';
import PunchlistReportPrint from '../disciplines/environmental/punchlists/PunchlistReportPrint';
import SWPPPReportPrint from '../disciplines/environmental/swppp/SWPPPReportPrint';
import PayItemReportPrint from '../disciplines/utility/daily/PayItemReportPrint';

// Wrapper components that properly provide location state to print components
const EnvironmentalDailyReportWrapper = ({ reportData }) => {
  return <EnvironmentalDailyReportPrint reportData={reportData} />;
};

const DailyUtilityReportWrapper = ({ reportData }) => {
  return <DailyUtilityReportPrint reportData={reportData} />;
};

const DailyUtilityReport2Wrapper = ({ reportData }) => {
  console.log('DailyUtilityReport2Wrapper: Received reportData:', reportData);
  return <DailyUtilityReport2Print reportData={reportData} />;
};

const PunchlistReportWrapper = ({ reportData }) => {
  return <PunchlistReportPrint reportData={reportData} />;
};

const SWPPPReportWrapper = ({ reportData }) => {
  return <SWPPPReportPrint reportData={reportData} />;
};

const PayItemReportWrapper = ({ reportData }) => {
  return <PayItemReportPrint reportData={reportData} />;
};

// Simple data renderer for debugging
const SimpleDataRenderer = ({ data, reportType }) => {
  if (!data) {
    return (
      <div className="bg-white p-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {reportType.replace(/_/g, ' ').toUpperCase()} - Report Data
      </h2>
      
      <div className="space-y-6">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Data Keys:</h3>
          <div className="ml-4">
            {Object.keys(data).map(key => (
              <div key={key} className="text-gray-600">
                {key}: {typeof data[key]} {Array.isArray(data[key]) ? `(${data[key].length} items)` : ''}
              </div>
            ))}
          </div>
        </div>
        
        {/* Raw Data for Debugging */}
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-gray-600 font-semibold">
            Raw Data (for debugging)
          </summary>
          <pre className="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

// Simple report renderer that displays data in print format
const PrintFormatRenderer = ({ data, reportType }) => {
  if (!data) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  console.log('PrintFormatRenderer: Using actual print components for report type:', reportType, 'with data:', data);

  // Use the appropriate wrapper based on report type
  switch (reportType) {
    case 'environmental_daily':
    case 'environmental_daily_report':
      return <EnvironmentalDailyReportWrapper reportData={data} />;
    case 'daily_utility':
    case 'utility_daily':
      return <DailyUtilityReportWrapper reportData={data} />;
    case 'daily_utility_2':
    case 'utility_daily_2':
      return <DailyUtilityReport2Wrapper reportData={data} />;
    case 'punchlist':
      return <PunchlistReportWrapper reportData={data} />;
    case 'swppp':
      return <SWPPPReportWrapper reportData={data} />;
    case 'pay_item':
      return <PayItemReportWrapper reportData={data} />;
    default:
      console.warn('Unknown report type for print preview:', reportType);
      return <SimpleDataRenderer data={data} reportType={reportType} />;
  }
};

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
  const [parsedData, setParsedData] = useState(null);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      
      // For lead review, check for saved drafts first, then fall back to original report data
      let savedDraft = null;
      try {
        savedDraft = await loadDraft('daily_utility_2', reportId);
        console.log('ReportReview: Found saved draft for reportId:', reportId, savedDraft);
      } catch (error) {
        console.log('ReportReview: No saved draft found for reportId:', reportId, error.message);
      }
      
      // Use the detail endpoint to get the specific report
      const response = await api.get(`/reports/${reportId}/`);
      const foundReport = response.data;
      
      console.log('Found report:', {
        id: foundReport.id,
        report_type: foundReport.report_type,
        report_data_type: typeof foundReport.report_data,
        report_data_length: foundReport.report_data ? 
          (typeof foundReport.report_data === 'string' ? foundReport.report_data.length : 'object') : 0,
        report_data_preview: foundReport.report_data ? 
          (typeof foundReport.report_data === 'string' ? 
            foundReport.report_data.substring(0, 100) + '...' : 
            'Object: ' + Object.keys(foundReport.report_data).join(', ')) : null
      });
      
      // Parse the report data - prioritize saved drafts for lead review
      let parsedReportData = null;
      if (savedDraft) {
        // Use saved draft data (lead's edits) if available
        parsedReportData = savedDraft;
        console.log('=== SAVED DRAFT DETAILS ===');
        console.log('Header section:', parsedReportData.header?.section);
        console.log('Morning temp:', parsedReportData.morning_temp);
        console.log('Weather:', parsedReportData.weather);
        console.log('Last saved:', parsedReportData.lastSaved);
        console.log('Full header object:', parsedReportData.header);
        console.log('=== END SAVED DRAFT DETAILS ===');
      } else if (foundReport.report_data) {
        // Fall back to original report data if no saved draft
        try {
          if (typeof foundReport.report_data === 'object' && foundReport.report_data !== null) {
            parsedReportData = foundReport.report_data;
            console.log('Using original object data (no saved draft):', {
              header_section: parsedReportData.header?.section,
              morning_temp: parsedReportData.morning_temp,
              weather: parsedReportData.weather
            });
          } else if (typeof foundReport.report_data === 'string') {
            parsedReportData = JSON.parse(foundReport.report_data);
            console.log('Successfully parsed original JSON data (no saved draft):', {
              header_section: parsedReportData.header?.section,
              morning_temp: parsedReportData.morning_temp,
              weather: parsedReportData.weather
            });
          }
        } catch (error) {
          console.error('Error parsing original report data:', error);
        }
      }
      
      setReport(foundReport);
      setParsedData(parsedReportData);
    } catch (error) {
      console.error('Error loading report:', error);
      navigate('/leads/dashboard');
    } finally {
      setLoading(false);
    }
  }, [reportId, navigate]);

  useEffect(() => {
    loadReport();
  }, [reportId, loadReport]);

  // Add a focus listener to reload data when returning from edit page
  useEffect(() => {
    const handleFocus = () => {
      console.log('ReportReview: Window focused, reloading report data...');
      loadReport();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [reportId, loadReport]);

  const handleEdit = () => {
    if (!parsedData || !report) return;

    console.log('Navigating to lead edit page with data:', {
      reportId: report.id,
      reportType: report.report_type,
      dataKeys: Object.keys(parsedData),
      dataPreview: parsedData
    });

    // Navigate to the appropriate lead edit page based on report type
    let editPath = '';
    switch (report.report_type) {
      case 'environmental_daily':
      case 'environmental_daily_report':
        editPath = `/leads/edit/environmental/daily/${report.id}`;
        break;
      case 'daily_utility':
      case 'utility_daily':
        editPath = `/leads/edit/utility/daily/${report.id}`;
        break;
      case 'daily_utility_2':
      case 'utility_daily_2':
        editPath = `/leads/edit/utility/daily2/${report.id}`;
        break;
      case 'punchlist':
        editPath = `/leads/edit/environmental/punchlist/${report.id}`;
        break;
      case 'swppp':
        editPath = `/leads/edit/environmental/swppp/${report.id}`;
        break;
      case 'pay_item':
        editPath = `/leads/edit/utility/pay-item/${report.id}`;
        break;
      default:
        console.error('Unknown report type for editing:', report.report_type);
        return;
    }

    // Pass all data to the edit page
    navigate(editPath, {
      state: {
        draft: parsedData,
        reportData: parsedData, // Also pass as reportData for compatibility
        fromReview: true,
        reportId: report.id,
        reportType: report.report_type
      }
    });
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
    if (!report || !rejectionReason.trim()) return;
    
    setSubmitting(true);
    try {
      await rejectReport(report.id, rejectionReason, reviewNotes);
      setShowRejectModal(false);
      setRejectionReason('');
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
        return 'bg-green-900/50 text-green-300 border-green-600';
      case 'rejected':
        return 'bg-red-900/50 text-red-300 border-red-600';
      case 'submitted':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-600';
      case 'in_review':
        return 'bg-blue-900/50 text-blue-300 border-blue-600';
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderReportContent = (data, reportType) => {
    console.log('renderReportContent called with:', { reportType, dataKeys: Object.keys(data || {}), data });
    
    if (!data) {
      console.log('No data available, showing error message');
      return (
        <div className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-md border border-gray-700">
          <p className="text-sm text-gray-300">Report data could not be parsed. Please contact support.</p>
          <details className="mt-2">
            <summary className="text-sm text-gray-400 cursor-pointer">Raw Data</summary>
            <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-40">
              {JSON.stringify(report?.report_data, null, 2)}
            </pre>
          </details>
        </div>
      );
    }
    
    console.log('Creating wrapper for report type:', reportType, 'with data:', data);
    
    // Use the PrintFormatRenderer for all report types
    console.log('Using PrintFormatRenderer for:', reportType);
    return <PrintFormatRenderer data={data} reportType={reportType} />;
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-[816px] mx-auto bg-white shadow-2xl rounded-xl flex flex-col">
          <div className="w-full border-b-4 border-blue-500 bg-blue-900 text-white py-0.5 pl-1 pr-8 rounded-t-xl">
            <div className="flex items-center mt-1 mb-1">
              <div className="flex-shrink-0 flex items-center justify-start" style={{ minWidth: '9rem' }}>
                <img src="/static/PIPE-Logo.png" alt="PIPE Logo" className="h-16 w-auto" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-3xl font-bold tracking-wide text-center">Review Report</h1>
              </div>
              <div className="flex-shrink-0" style={{ minWidth: '9rem' }}></div>
            </div>
          </div>
          <div className="flex-1 px-8 py-8 flex flex-col">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-[816px] mx-auto bg-white shadow-2xl rounded-xl flex flex-col">
          <div className="w-full border-b-4 border-blue-500 bg-blue-900 text-white py-0.5 pl-1 pr-8 rounded-t-xl">
            <div className="flex items-center mt-1 mb-1">
              <div className="flex-shrink-0 flex items-center justify-start" style={{ minWidth: '9rem' }}>
                <img src="/static/PIPE-Logo.png" alt="PIPE Logo" className="h-16 w-auto" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <h1 className="text-3xl font-bold tracking-wide text-center">Report Not Found</h1>
              </div>
              <div className="flex-shrink-0" style={{ minWidth: '9rem' }}></div>
            </div>
          </div>
          <div className="flex-1 px-8 py-8 flex flex-col">
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
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Report Info Header */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {report.report_type.replace(/_/g, ' ').toUpperCase()}
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Submitted by {report.submitted_by?.first_name} {report.submitted_by?.last_name} on {formatDate(report.submitted_at)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(report.status)}`}>
                {report.status.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Report
              </button>
              <button
                onClick={() => navigate('/leads/dashboard')}
                className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Report Content - Print Preview */}
        <div className="bg-black rounded-lg shadow-2xl overflow-hidden">
          {renderReportContent(parsedData, report.report_type)}
        </div>

        {/* Review Actions */}
        {report.status === 'submitted' && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Review Actions</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Review Information</h3>
            <div className="space-y-4">
              {report.reviewed_by && (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Reviewed By</label>
                  <p className="mt-1 text-sm text-white">
                    {report.reviewed_by.first_name} {report.reviewed_by.last_name}
                  </p>
                </div>
              )}
              {report.reviewed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Reviewed At</label>
                  <p className="mt-1 text-sm text-white">{formatDate(report.reviewed_at)}</p>
                </div>
              )}
              {report.review_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Review Notes</label>
                  <p className="mt-1 text-sm text-white">{report.review_notes}</p>
                </div>
              )}
              {report.rejection_reason && (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Rejection Reason</label>
                  <p className="mt-1 text-sm text-white">{report.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800 border-gray-700">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Confirm Approval</h3>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">
                Are you sure you want to approve this report? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800 border-gray-700">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Reject Report</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Rejection Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={submitting || !rejectionReason.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? 'Rejecting...' : 'Reject'}
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