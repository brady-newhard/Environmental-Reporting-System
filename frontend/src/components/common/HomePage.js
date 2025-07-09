import React from 'react';
import { useNavigate } from 'react-router-dom';

const DepartmentCard = ({ title, description, path }) => {
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
        View {title} Dashboard
      </button>
    </div>
  );
};

const HomePage = () => {
  const departments = [
    {
      title: "Environmental",
      description: "Manage environmental reports, SWPPP inspections, and compliance documentation.",
      path: "/environmental"
    },
    {
      title: "Welding",
      description: "Track welding procedures, qualifications, and inspection reports.",
      path: "/welding"
    },
    {
      title: "Coating",
      description: "Monitor coating applications, inspections, and quality control reports.",
      path: "/coating"
    },
    {
      title: "Utility",
      description: "Oversee utility installations, maintenance records, and service reports.",
      path: "/utility"
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
      <div className="absolute inset-0 bg-[url('/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <div className="mb-6 mt-8">
          <h1 className="font-semibold text-white text-2xl">Discipline Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {departments.map((dept, index) => (
            <DepartmentCard
              key={index}
              title={dept.title}
              description={dept.description}
              path={dept.path}
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

export default HomePage; 