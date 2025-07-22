import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getReports, getDashboardStats } from '../../services/api';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  DocumentTextIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const LeadDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [reportsData, statsData] = await Promise.all([
        getReports({ status: filter === 'all' ? '' : filter }),
        getDashboardStats()
      ]);
      setReports(reportsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    loadReports(newFilter);
  };

  const loadReports = async (statusFilter) => {
    try {
      const reportsData = await getReports({ 
        status: statusFilter === 'all' ? '' : statusFilter 
      });
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'submitted':
      case 'in_review':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-400" />;
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

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleCloseModal = () => {
    setSelectedReport(null);
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
        <div className="absolute inset-0 bg-[url('/static/pipeline-bg.jpg')] bg-cover bg-center z-0" />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 p-4 sm:p-6">
          <div className="mb-6 mt-8">
            <h1 className="font-semibold text-white text-2xl">Lead Dashboard</h1>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
      <div className="absolute inset-0 bg-[url('/static/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <div className="mb-6 mt-8">
          <h1 className="font-semibold text-white text-2xl">Lead Dashboard</h1>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-900/50 rounded-lg border border-yellow-600">
                <ClockIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Pending</p>
                <p className="text-2xl font-semibold text-white">{stats.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-900/50 rounded-lg border border-green-600">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Approved</p>
                <p className="text-2xl font-semibold text-white">{stats.approved || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-900/50 rounded-lg border border-red-600">
                <XCircleIcon className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Rejected</p>
                <p className="text-2xl font-semibold text-white">{stats.rejected || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900/50 rounded-lg border border-blue-600">
                <DocumentTextIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total</p>
                <p className="text-2xl font-semibold text-white">{stats.total || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Reports' },
                { key: 'submitted', label: 'Submitted' },
                { key: 'in_review', label: 'In Review' },
                { key: 'approved', label: 'Approved' },
                { key: 'rejected', label: 'Rejected' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleFilterChange(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">Reports</h3>
          </div>
          
          {reports.length === 0 ? (
            <div className="p-6 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-300">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">No reports match the current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Submitted By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Discipline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(report.status)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">
                              {report.report_type.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-400">
                              ID: {report.report_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-white">
                            {report.submitted_by?.first_name} {report.submitted_by?.last_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {report.discipline}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(report.submitted_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="text-blue-400 hover:text-blue-300 flex items-center"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800 border-gray-700">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  Report Details
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Report Type</label>
                  <p className="mt-1 text-sm text-white">
                    {selectedReport.report_type.replace(/_/g, ' ').toUpperCase()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Discipline</label>
                  <p className="mt-1 text-sm text-white">{selectedReport.discipline}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Submitted By</label>
                  <p className="mt-1 text-sm text-white">
                    {selectedReport.submitted_by?.first_name} {selectedReport.submitted_by?.last_name}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Status</label>
                  <p className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Submitted At</label>
                  <p className="mt-1 text-sm text-white">
                    {new Date(selectedReport.submitted_at).toLocaleString()}
                  </p>
                </div>
                
                {selectedReport.review_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Review Notes</label>
                    <p className="mt-1 text-sm text-white">{selectedReport.review_notes}</p>
                  </div>
                )}
                
                {selectedReport.rejection_reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Rejection Reason</label>
                    <p className="mt-1 text-sm text-white">{selectedReport.rejection_reason}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600"
                >
                  Close
                </button>
                {selectedReport.status === 'submitted' && (
                  <button
                    onClick={() => {
                      handleCloseModal();
                      navigate(`/leads/review/${selectedReport.id}`);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Review Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer className="w-full text-center py-4 text-white/80 text-sm relative z-20">
        &copy; {new Date().getFullYear()} WildStone Solutions, LLC
      </footer>
    </div>
  );
};

export default LeadDashboard; 