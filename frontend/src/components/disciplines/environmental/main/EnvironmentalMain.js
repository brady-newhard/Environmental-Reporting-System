import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Book, Map, Folder } from 'lucide-react';
import PageHeader from '../../../common/PageHeader';
import Footer from '../../../common/Footer';

const CategoryCard = ({ title, icon: Icon, description, path }) => {
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
          View {title}
        </Button>
      </CardContent>
    </Card>
  );
};

const EnvironmentalMain = () => {
  const categories = [
    {
      title: "Reports",
      icon: FileText,
      description: "Create and manage environmental reports including daily reports, SWPPP inspections, and more.",
      path: "/environmental/reports"
    },
    {
      title: "Permits",
      icon: Book,
      description: "Access and manage environmental permits, certifications, and regulatory documents.",
      path: "/environmental/permits"
    },
    {
      title: "Maps",
      icon: Map,
      description: "View and manage site maps, environmental overlays, and geographical data.",
      path: "/environmental/maps"
    },
    {
      title: "Documents",
      icon: Folder,
      description: "Access environmental documentation, procedures, and reference materials.",
      path: "/environmental/documents"
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-auto">
      <div className="absolute inset-0 bg-[url('/staticfiles/pipeline-bg.jpg')] bg-cover bg-center z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
      <div className="relative z-20 p-4 sm:p-6">
        <PageHeader 
          title={<span className="text-white">Environmental Management</span>}
          backPath="/"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#333333' }
          }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              icon={category.icon}
              description={category.description}
              path={category.path}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EnvironmentalMain; 