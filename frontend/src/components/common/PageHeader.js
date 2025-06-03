import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PageHeader = ({ title, backPath }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-center gap-4">
      {backPath && (
        <Button
          onClick={() => navigate(backPath)}
          className="!p-0 bg-white hover:bg-zinc-200 text-black rounded-full h-12 w-12 shadow border border-zinc-300 flex items-center justify-center"
          style={{}}
        >
          <ArrowLeft className="h-11 w-11 max-w-full max-h-full text-black" />
        </Button>
      )}
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  );
};

export default PageHeader; 