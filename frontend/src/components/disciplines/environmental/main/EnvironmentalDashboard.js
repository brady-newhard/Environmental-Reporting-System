import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { getDraftCount } from '../../../../utils/draftUtils';
import { getSubmittedReportsCount } from '../../../../services/api';

const ReportTypeCard = ({ title, description, path, draftPath, draftCount, submittedPath, submittedCount }) => {
  const navigate = useNavigate();
  return (
    <div className="h-52 w-full flex flex-col bg-gray-800 rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-white text-2xl">📋</span>
        <span className="text-lg font-semibold text-white">{title}</span>
      </div>
      <span className="text-sm text-white/80 flex-1 mb-4">{description}</span>
      <button
        className="bg-black hover:bg-zinc-800 text-white font-medium h-10 text-sm w-full mt-auto rounded"
        onClick={() => navigate(path)}
      >
        Create New Report
      </button>
      <div className="flex justify-between mt-2">
        {draftPath && (
          <div
            onClick={() => navigate(draftPath)}
            className="cursor-pointer text-center flex-1 flex items-center justify-center"
          >
            <span className="text-blue-400 font-medium text-sm flex items-center gap-2">
              Drafts
              {draftCount > 0 && (
                <span className="ml-1 bg-red-600/80 text-white px-2 py-0.5 rounded-full text-xs">
                  {draftCount}
                </span>
              )}
            </span>
          </div>
        )}
        {submittedPath && (
          <div
            onClick={() => navigate(submittedPath)}
            className="cursor-pointer text-center flex-1 flex items-center justify-center"
          >
            <span className="text-green-400 font-medium text-sm flex items-center gap-2">
              Submitted
              {submittedCount > 0 && (
                <span className="ml-1 bg-green-600/80 text-white px-2 py-0.5 rounded-full text-xs">
                  {submittedCount}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const EnvironmentalDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [swpppDraftCount, setSwpppDraftCount] = useState(0);
  const [dailyDraftCount, setDailyDraftCount] = useState(0);
  const [punchlistDraftCount, setPunchlistDraftCount] = useState(0);
  const [submittedSwpppCount, setSubmittedSwpppCount] = useState(0);
  const [submittedDailyCount, setSubmittedDailyCount] = useState(0);
  const [submittedPunchlistCount, setSubmittedPunchlistCount] = useState(0);

  useEffect(() => {
    const loadDraftCounts = async () => {
      try {
        const [swpppCount, dailyCount, punchlistCount] = await Promise.all([
          getDraftCount('swppp'),
          getDraftCount('environmental_daily'),
          getDraftCount('punchlist')
        ]);
        setSwpppDraftCount(swpppCount);
        setDailyDraftCount(dailyCount);
        setPunchlistDraftCount(punchlistCount);
      } catch (error) {
        console.error('Error loading draft counts:', error);
      }
    };

    const loadSubmittedCounts = async () => {
      try {
        const [submittedSwppp, submittedDaily, submittedPunchlist] = await Promise.all([
          getSubmittedReportsCount('swppp'),
          getSubmittedReportsCount('environmental_daily'),
          getSubmittedReportsCount('punchlist')
        ]);
        
        console.log('Submitted counts:', {
          swppp: submittedSwppp,
          daily: submittedDaily,
          punchlist: submittedPunchlist
        });
        
        setSubmittedSwpppCount(submittedSwppp);
        setSubmittedDailyCount(submittedDaily);
        setSubmittedPunchlistCount(submittedPunchlist);
      } catch (error) {
        console.error('Error loading submitted counts:', error);
      }
    };

    if (!loading && isAuthenticated) {
      loadDraftCounts();
      loadSubmittedCounts();
    }
  }, [loading, isAuthenticated]);

  const reportTypes = [
    {
      title: "Daily Report",
      description: "Activities and Compliance.",
      path: "/environmental/reports/daily/new",
      draftPath: "/environmental/reports/daily/drafts",
      draftCount: dailyDraftCount,
      submittedPath: "/environmental/reports/daily/submitted",
      submittedCount: submittedDailyCount
    },
    {
      title: "SWPPP Report",
      description: "State SWPPP Inspection",
      path: "/environmental/swppp/new",
      draftPath: "/environmental/swppp/drafts",
      draftCount: swpppDraftCount,
      submittedPath: "/environmental/swppp/submitted",
      submittedCount: submittedSwpppCount
    },
    {
      title: "Environmental Punchlist",
      description: "Environmental Compliance Items",
      path: "/environmental/reports/punchlist/new",
      draftPath: "/environmental/reports/punchlist/drafts",
      draftCount: punchlistDraftCount,
      submittedPath: "/environmental/reports/punchlist/submitted",
      submittedCount: submittedPunchlistCount
    },
    {
      title: "Progress Report",
      description: "Project Progress Chart",
      path: "/new-progress-report"
    },
    {
      title: "Variance Report",
      description: "Plan Deviations & Requests",
      path: "/variance/new"
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
              <div className="absolute inset-0 bg-[url('/static/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <div className="mb-6 mt-8">
          <h1 className="font-semibold text-white text-2xl">Create Environmental Report</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((type, index) => (
            <ReportTypeCard
              key={index}
              title={type.title}
              description={type.description}
              path={type.path}
              draftPath={type.draftPath}
              draftCount={type.draftCount}
              submittedPath={type.submittedPath}
              submittedCount={type.submittedCount}
            />
          ))}
        </div>
      </div>
      <footer className="w-full text-center py-4 text-white/80 text-sm relative z-20">
        &copy; {new Date().getFullYear()} WildStone Solutions, LLC
      </footer>
    </div>
  );
};

export default EnvironmentalDashboard; 