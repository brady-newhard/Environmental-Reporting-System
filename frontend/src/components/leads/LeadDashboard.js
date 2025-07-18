import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import PageHeader from '../common/PageHeader';
import LeadSidebar from './LeadSidebar';
import PendingReports from './PendingReports';
import ApprovedReports from './ApprovedReports';
import RejectedReports from './RejectedReports';

const LeadDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/api/reports/dashboard_stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return <PendingReports onStatusChange={fetchDashboardStats} />;
      case 'approved':
        return <ApprovedReports />;
      case 'rejected':
        return <RejectedReports />;
      default:
        return <PendingReports onStatusChange={fetchDashboardStats} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
            <p className="text-center text-gray-600 py-8">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Lead Dashboard"
          backPath="/"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />

        <div className="flex gap-6 mt-6">
          {/* Sidebar */}
          <LeadSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            stats={stats}
          />

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDashboard; 