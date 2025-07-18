import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import ReportDetailModal from './ReportDetailModal';
import ApproveRejectModal from './ApproveRejectModal';

const PendingReports = ({ onStatusChange }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('submitted');

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    try {
      const response = await api.get(`/api/reports/?status=${statusFilter}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleApprove = (report) => {
    setSelectedReport(report);
    setActionType('approve');
    setShowActionModal(true);
  };

  const handleReject = (report) => {
    setSelectedReport(report);
    setActionType('reject');
    setShowActionModal(true);
  };

  const handleActionComplete = () => {
    setShowActionModal(false);
    setShowDetailModal(false);
    setSelectedReport(null);
    setActionType(null);
    fetchReports();
    if (onStatusChange) {
      onStatusChange();
    }
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.report_type?.toLowerCase().includes(searchLower) ||
      report.report_id?.toLowerCase().includes(searchLower) ||
      report.submitted_by_name?.toLowerCase().includes(searchLower) ||
      report.discipline_display?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      in_review: { color: 'bg-yellow-100 text-yellow-800', label: 'In Review' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Reports</h2>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No pending reports found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discipline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {report.report_type}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {report.report_id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {report.submitted_by_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {report.discipline_display}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Report"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(report)}
                        className="text-green-600 hover:text-green-900"
                        title="Approve Report"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(report)}
                        className="text-red-600 hover:text-red-900"
                        title="Reject Report"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showActionModal && selectedReport && (
        <ApproveRejectModal
          report={selectedReport}
          actionType={actionType}
          onClose={() => setShowActionModal(false)}
          onComplete={handleActionComplete}
        />
      )}
    </div>
  );
};

export default PendingReports; 