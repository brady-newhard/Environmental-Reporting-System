import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardList } from 'lucide-react';
import PageHeader from '../../../common/PageHeader';
import Footer from '../../../common/Footer';
import { getDraftCount } from '../../../../utils/draftUtils';
import { useAuth } from '../../../../contexts/AuthContext';

const ReportCard = ({ title, icon: Icon, description, path, secondaryAction, reportType }) => {
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
    <Card className="h-52 w-full flex flex-col bg-gray-800/40 backdrop-blur rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-700">
      <CardContent className="flex-1 flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <Icon className="text-white w-8 h-8" />
          <span className="text-lg font-semibold text-white">{title}</span>
        </div>
        <span className="text-sm text-white/80 flex-1">{description}</span>
        <div className="flex flex-col gap-2">
          <Button
            className="bg-black hover:bg-zinc-800 text-white font-medium h-10 text-sm w-full"
            onClick={handleFillOut}
          >
            Fill Out Report
          </Button>
          {secondaryAction && (
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 h-8 text-sm w-full"
              onClick={handleViewDrafts}
            >
              {secondaryAction.text}
              {draftCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
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

const UtilityReports = () => {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
      <div className="absolute inset-0 bg-[url('/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <PageHeader 
          title={<span className="text-white">Utility Reports</span>}
          backPath="/utility"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#333333' }
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ReportCard
            title="Payload Report"
            icon={FileText}
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
            icon={ClipboardList}
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
      <Footer />
    </div>
  );
};

export default UtilityReports; 