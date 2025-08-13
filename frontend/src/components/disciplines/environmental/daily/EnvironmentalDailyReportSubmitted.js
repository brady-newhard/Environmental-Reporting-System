import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmittedReports, deleteSubmittedReport } from '../../../../services/api';
import PageHeader from '../../../common/PageHeader';
import { Button } from '@/components/ui/button';
import { formatDate } from '../../../../utils/dateUtils';

const EnvironmentalDailyReportSubmitted = () => {
  const navigate = useNavigate();
  const [submittedReports, setSubmittedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSubmittedReports = async () => {
      try {
        setLoading(true);
        const reports = await getSubmittedReports({ report_type: 'environmental_daily' });
        console.log('Daily submitted reports:', reports);
        setSubmittedReports(reports);
      } catch (err) {
        console.error('Error loading submitted reports:', err);
        setError('Failed to load submitted reports');
      } finally {
        setLoading(false);
      }
    };

    loadSubmittedReports();
  }, []);

  const handleEditReport = (report) => {
    console.log('handleEditReport - report:', report);
    console.log('handleEditReport - report.report_data:', report.report_data);
    
    // Navigate to edit page with report data
    navigate(`/environmental/reports/daily/edit-submitted/${report.id}`, {
      state: { 
        reportData: report.report_data,  // This is what the print component expects
        reportId: report.id,
        isSubmitted: true
      }
    });
  };

  const handleViewReport = (report) => {
    console.log('handleViewReport - report:', report);
    console.log('handleViewReport - report.report_data:', report.report_data);
    
    // Navigate to print page to view the report
    navigate(`/environmental/reports/daily/print/${report.id}`, {
      state: { 
        reportData: report.report_data,  // This is what the print component expects
        reportId: report.id,
        isSubmitted: true
      }
    });
  };

  const handleDeleteReport = async (report) => {
    if (!window.confirm('Are you sure you want to delete this submitted report? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteSubmittedReport(report.id);
      // Remove the report from the local state
      setSubmittedReports(prevReports => prevReports.filter(r => r.id !== report.id));
      // Show success message
      alert('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading submitted reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <PageHeader 
        title="Submitted Environmental Daily Reports" 
        backPath="/environmental"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Submitted Reports ({submittedReports.length})
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              These reports have been submitted for lead review and can still be edited
            </p>
          </div>

          {submittedReports.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-lg mb-4">No submitted reports found</div>
              <Button 
                onClick={() => navigate('/environmental/reports/daily/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create New Report
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Report ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Inspector
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {submittedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {report.report_id || `Report-${report.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {report.report_data?.header?.project || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {report.report_data?.header?.inspector || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Submitted
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          onClick={() => handleViewReport(report)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => handleEditReport(report)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteReport(report)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalDailyReportSubmitted;
