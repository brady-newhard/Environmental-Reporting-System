import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { getDraftCount } from '../../../../utils/draftUtils';

const ReportCard = ({ title, description, path, secondaryAction, reportType }) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [draftCount, setDraftCount] = React.useState(0);

  React.useEffect(() => {
    if (secondaryAction && reportType && !loading && isAuthenticated) {
      getDraftCount(reportType).then(setDraftCount);
    }
  }, [secondaryAction, reportType, loading, isAuthenticated]);

  const handleFillOut = () => {
    navigate(path);
  };

  const handleViewDrafts = () => {
    navigate(secondaryAction.path);
  };

  return (
    <div className="h-52 w-full flex flex-col bg-gray-800 rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-white text-2xl">📋</span>
        <span className="text-lg font-semibold text-white">{title}</span>
      </div>
      <span className="text-sm text-white/80 flex-1 mb-4">{description}</span>
      <div className="flex flex-col gap-2">
        <button
          className="bg-black hover:bg-zinc-800 text-white font-medium h-10 text-sm w-full rounded"
          onClick={handleFillOut}
        >
          Fill Out Report
        </button>
        {secondaryAction && (
          <button
            className="text-white/80 hover:text-white hover:bg-white/10 h-8 text-sm w-full rounded"
            onClick={handleViewDrafts}
          >
            {secondaryAction.text}
            {draftCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {draftCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const UtilityReports = () => {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
              <div className="absolute inset-0 bg-[url('/static/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <div className="mb-6 mt-8">
          <h1 className="font-semibold text-white text-2xl">Utility Reports</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ReportCard
            title="Daily Utility Report"
            description="Complete the daily utility report with construction activities, weather, and equipment."
            path="/utility/reports/daily/new"
            secondaryAction={{
              text: "View Draft Reports",
              path: "/utility/reports/daily/drafts"
            }}
            reportType="daily_utility"
          />
          <ReportCard
            title="Pay Item Report"
            description="Complete the pay item report for tracking detailed work items and quantities."
            path="/utility/reports/pay-item/new"
            secondaryAction={{
              text: "View Draft Reports",
              path: "/utility/reports/pay-item/drafts"
            }}
            reportType="pay_item"
          />
        </div>
      </div>
      <footer className="w-full text-center py-4 text-white/80 text-sm relative z-20">
        &copy; {new Date().getFullYear()} WildStone Solutions, LLC
      </footer>
    </div>
  );
};

export default UtilityReports; 