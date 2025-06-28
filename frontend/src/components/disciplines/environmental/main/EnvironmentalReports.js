import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardList, AlertCircle, BarChart2, FileWarning } from 'lucide-react';
import PageHeader from '../../../common/PageHeader';
import Footer from '../../../common/Footer';
import { getDraftCount } from '../../../utils/draftUtils';

const ReportCard = ({ title, icon: Icon, description, path, secondaryAction, reportType }) => {
  const navigate = useNavigate();
  const draftCount = getDraftCount(reportType);

  return (
    <Card className="h-52 w-full flex flex-col bg-gray-800/40 backdrop-blur rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-700">
      <CardContent className="flex-1 flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <Icon className="text-white w-8 h-8" />
          <span className="text-lg font-semibold text-white">{title}</span>
        </div>
        <span className="text-sm text-white/80 flex-1">{description}</span>
        <div className="flex gap-3 mt-auto">
          <Button
            className="bg-black hover:bg-zinc-800 text-white font-medium h-10 text-sm flex-1"
            onClick={() => navigate(path)}
          >
            Create Report
          </Button>
          {secondaryAction && (
            <Button
              variant="outline"
              className="border-white/20 hover:bg-white/10 text-white font-medium h-10 text-sm flex-1"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
              {draftCount > 0 && (
                <span className="ml-2 bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                  {draftCount}
                </span>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EnvironmentalReports = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
      <div className="absolute inset-0 bg-[url('/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <PageHeader 
          title={<span className="text-white">Environmental Reports</span>}
          backPath="/environmental"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#333333' }
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ReportCard
            title="Daily Report"
            icon={FileText}
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
            icon={ClipboardList}
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
            icon={AlertCircle}
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
            icon={BarChart2}
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
            icon={FileWarning}
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
      <Footer />
    </div>
  );
};

export default EnvironmentalReports; 