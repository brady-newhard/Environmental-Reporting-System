import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReportCard = ({ title, description, path, secondaryAction, reportType }) => {
  const navigate = useNavigate();

  return (
    <div className="h-52 w-full flex flex-col bg-gray-800 rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-white text-2xl">📋</span>
        <span className="text-lg font-semibold text-white">{title}</span>
      </div>
      <span className="text-sm text-white/80 flex-1 mb-4">{description}</span>
      <div className="flex gap-3 mt-auto">
        <button
          className="bg-black hover:bg-zinc-800 text-white font-medium h-10 text-sm flex-1 rounded"
          onClick={() => navigate(path)}
        >
          Create Report
        </button>
        {secondaryAction && (
          <button
            className="border border-white/20 hover:bg-white/10 text-white font-medium h-10 text-sm flex-1 rounded"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
};

const EnvironmentalReports = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
              <div className="absolute inset-0 bg-[url('/static/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <div className="mb-6 mt-8">
          <h1 className="font-semibold text-white text-2xl">Environmental Reports</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ReportCard
            title="Daily Report"
            description="Create and submit daily environmental reports including weather conditions, activities, and observations."
            path="/environmental/reports/daily"
            reportType="environmental_daily"
            secondaryAction={{
              label: "View Drafts",
              onClick: () => navigate("/environmental/reports/daily/drafts")
            }}
          />
          <ReportCard
            title="SWPPP Report"
            description="Submit Stormwater Pollution Prevention Plan (SWPPP) inspection reports and compliance documentation."
            path="/environmental/reports/swppp"
            reportType="environmental_swppp"
            secondaryAction={{
              label: "View Drafts",
              onClick: () => navigate("/environmental/reports/swppp/drafts")
            }}
          />
          <ReportCard
            title="Environmental Punchlist"
            description="Track and report environmental compliance issues, corrective actions, and follow-up measures."
            path="/environmental/reports/punchlist/new"
            reportType="environmental_punchlist"
            secondaryAction={{
              label: "View Drafts",
              onClick: () => navigate("/environmental/reports/punchlist/drafts")
            }}
          />
          <ReportCard
            title="Progress Report"
            description="Generate environmental progress reports with metrics, achievements, and compliance status."
            path="/environmental/reports/progress"
            reportType="environmental_progress"
            secondaryAction={{
              label: "View Drafts",
              onClick: () => navigate("/environmental/reports/progress/drafts")
            }}
          />
          <ReportCard
            title="Variance Report"
            description="Document and report environmental variances, non-compliances, and mitigation measures."
            path="/environmental/reports/variance"
            reportType="environmental_variance"
            secondaryAction={{
              label: "View Drafts",
              onClick: () => navigate("/environmental/reports/variance/drafts")
            }}
          />
        </div>
      </div>
      <footer className="w-full text-center py-4 text-white/80 text-sm relative z-20">
        &copy; {new Date().getFullYear()} WildStone Solutions, LLC
      </footer>
    </div>
  );
};

export default EnvironmentalReports; 