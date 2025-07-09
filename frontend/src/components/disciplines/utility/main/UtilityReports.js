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
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto bg-gray-900">
      <div className="relative z-20 p-4 sm:p-6">
        <div className="mb-6 mt-8">
          <h1 className="font-semibold text-white text-2xl">Utility Reports</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ReportCard
            title="Payload Report"
            description="Complete the daily payload report for utility work."
            path="/utility/reports/payload"
            secondaryAction={{
              text: "View Draft Reports",
              path: "/utility/reports/drafts"
            }}
            reportType="utility_payload"
          />
          <ReportCard
            title="I3 Daily Report"
            description="Complete the I3 daily report for utility work."
            path="/utility/reports/i3"
            secondaryAction={{
              text: "View Draft Reports",
              path: "/utility/reports/i3-drafts"
            }}
            reportType="utility_i3"
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