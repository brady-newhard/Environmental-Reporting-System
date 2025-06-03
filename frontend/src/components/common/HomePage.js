import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Wrench, Paintbrush, UtilityPole } from 'lucide-react';
import PageHeader from './PageHeader';
import Footer from './Footer';

const departmentIcons = {
  Environmental: Leaf,
  Welding: Wrench,
  Coating: Paintbrush,
  Utility: UtilityPole,
};

const DepartmentCard = ({ title, icon: Icon, description, path }) => {
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
          View {title} Dashboard
        </Button>
      </CardContent>
    </Card>
  );
};

const HomePage = () => {
  const departments = [
    {
      title: "Environmental",
      icon: departmentIcons.Environmental,
      description: "Manage environmental reports, SWPPP inspections, and compliance documentation.",
      path: "/environmental"
    },
    {
      title: "Welding",
      icon: departmentIcons.Welding,
      description: "Track welding procedures, qualifications, and inspection reports.",
      path: "/welding"
    },
    {
      title: "Coating",
      icon: departmentIcons.Coating,
      description: "Monitor coating applications, inspections, and quality control reports.",
      path: "/coating"
    },
    {
      title: "Utility",
      icon: departmentIcons.Utility,
      description: "Oversee utility installations, maintenance records, and service reports.",
      path: "/utility"
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
      <div className="absolute inset-0 bg-[url('/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <PageHeader 
          title={<span className="text-white">Discipline Dashboard</span>}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#333333' }
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {departments.map((dept, index) => (
            <DepartmentCard
              key={index}
              title={dept.title}
              icon={dept.icon}
              description={dept.description}
              path={dept.path}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage; 