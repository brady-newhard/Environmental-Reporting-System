import React from 'react';
import { 
  HomeIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const LeadSidebar = ({ activeTab, setActiveTab, stats }) => {
  const menuItems = [
    {
      id: 'pending',
      label: 'Pending Reports',
      icon: ClockIcon,
      count: stats.pending,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      id: 'approved',
      label: 'Approved',
      icon: CheckCircleIcon,
      count: stats.approved,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'rejected',
      label: 'Rejected',
      icon: XCircleIcon,
      count: stats.rejected,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Lead Dashboard</h2>
          <div className="text-sm text-gray-600">
            Total Reports: {stats.total}
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive 
                    ? `${item.bgColor} ${item.borderColor} border ${item.color}` 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                    isActive ? 'bg-white' : item.bgColor
                  } ${item.color}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-yellow-600">{stats.pending}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Approved:</span>
              <span className="font-medium text-green-600">{stats.approved}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rejected:</span>
              <span className="font-medium text-red-600">{stats.rejected}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadSidebar; 