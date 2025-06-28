import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardList, AlertCircle, BarChart2, FileWarning } from 'lucide-react';
import PageHeader from '../../../common/PageHeader';
import Footer from '../../../common/Footer';
import { getDraftCount } from '../../../../utils/draftUtils';
import { useAuth } from '../../../../contexts/AuthContext';

const ReportTypeCard = ({ title, icon: Icon, description, path, draftPath, draftCount }) => {
  const navigate = useNavigate();
  return (
    <Card className="h-52 w-full flex flex-col bg-gray-800/40 backdrop-blur rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-700">
      <CardContent className="flex-1 flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <Icon className="text-white w-8 h-8" />
          <span className="text-lg font-semibold text-white">{title}</span>
        </div>
        <span className="text-sm text-white/80 flex-1">{description}</span>
        <Button
          className="bg-black hover:bg-zinc-800 text-white font-medium h-10 text-sm w-full mt-auto"
          onClick={() => navigate(path)}
        >
          Create New Report
        </Button>
        {draftPath && (
          <div
            onClick={() => navigate(draftPath)}
            className="cursor-pointer text-center mt-2 w-full flex items-center justify-center"
          >
            <span className="text-blue-400 font-medium text-sm flex items-center gap-2">
              View Draft Reports
              {draftCount > 0 && (
                <span className="ml-1 bg-red-600/80 text-white px-2 py-0.5 rounded-full text-xs">
                  {draftCount}
                </span>
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EnvironmentalDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [swpppDraftCount, setSwpppDraftCount] = useState(0);
  const [dailyDraftCount, setDailyDraftCount] = useState(0);
  const [punchlistDraftCount, setPunchlistDraftCount] = useState(0);

  useEffect(() => {
    const loadDraftCounts = async () => {
      try {
        setSwpppDraftCount(await getDraftCount('swppp'));
        setDailyDraftCount(await getDraftCount('environmental'));
        setPunchlistDraftCount(await getDraftCount('punchlist'));
      } catch (error) {
        console.error('Error loading draft counts:', error);
      }
    };
    if (!loading && isAuthenticated) {
      loadDraftCounts();
    }
  }, [loading, isAuthenticated]);

  const reportTypes = [
    {
      title: "Daily Report",
      icon: FileText,
      description: "Activities and Compliance.",
      path: "/environmental/reports/daily/new",
      draftPath: "/environmental/reports/daily/drafts",
      draftCount: dailyDraftCount
    },
    {
      title: "SWPPP Report",
      icon: ClipboardList,
      description: "State SWPPP Inspection",
      path: "/environmental/swppp/new",
      draftPath: "/environmental/swppp/drafts",
      draftCount: swpppDraftCount
    },
    {
      title: "Environmental Punchlist",
      icon: AlertCircle,
      description: "Environmental Compliance Items",
      path: "/environmental/reports/punchlist/new",
      draftPath: "/environmental/reports/punchlist/drafts",
      draftCount: punchlistDraftCount
    },
    {
      title: "Progress Report",
      icon: BarChart2,
      description: "Project Progress Chart",
      path: "/new-progress-report"
    },
    {
      title: "Variance Report",
      icon: FileWarning,
      description: "Plan Deviations & Requests",
      path: "/variance/new"
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
      <div className="absolute inset-0 bg-[url('/staticfiles/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <PageHeader 
          title={<span className="text-white">Create Environmental Report</span>}
          backPath="/environmental"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#333333' }
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((type, index) => (
            <ReportTypeCard
              key={index}
              title={type.title}
              icon={type.icon}
              description={type.description}
              path={type.path}
              draftPath={type.draftPath}
              draftCount={type.draftCount}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EnvironmentalDashboard; 