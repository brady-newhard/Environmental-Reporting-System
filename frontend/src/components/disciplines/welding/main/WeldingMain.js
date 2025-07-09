import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ title, description, path }) => {
  const navigate = useNavigate();

  return (
    <div className="h-52 w-full flex flex-col bg-gray-800 rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-white text-2xl">🔧</span>
        <span className="text-lg font-semibold text-white">{title}</span>
      </div>
      <span className="text-sm text-white/80 flex-1 mb-4">{description}</span>
      <button
        className="bg-black hover:bg-zinc-800 text-white font-medium h-10 text-sm w-full mt-auto rounded"
        onClick={() => navigate(path)}
      >
        View {title}
      </button>
    </div>
  );
};

const WeldingMain = () => {
  const categories = [
    {
      title: "Reports",
      description: "Create and manage welding reports, inspections, and quality control documentation.",
      path: "/welding/reports"
    },
    {
      title: "Specifications",
      description: "Access welding specifications, standards, and technical requirements.",
      path: "/welding/specifications"
    },
    {
      title: "Procedures",
      description: "View and manage Welding Procedure Specifications (WPS) and related documents.",
      path: "/welding/procedures"
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto bg-gray-900">
      <div className="relative z-20 p-4 sm:p-6">
        <div className="mb-6 mt-8">
          <h1 className="font-semibold text-white text-2xl">Welding Management</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              description={category.description}
              path={category.path}
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

export default WeldingMain; 