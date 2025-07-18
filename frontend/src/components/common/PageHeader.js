import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

const PageHeader = ({ title, backPath }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 mt-8 flex items-center gap-4 bg-transparent print:hidden page-header">
      {backPath && (
        <Button
          onClick={() => navigate(backPath)}
          className="!p-0 bg-white hover:bg-zinc-200 text-black rounded-full h-10 w-10 flex items-center justify-center border-none shadow-none"
          style={{}}
        >
          <ArrowLeftOnRectangleIcon className="h-8 w-8 max-w-full max-h-full text-black" />
        </Button>
      )}
      <h1 className="font-semibold text-white truncate text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl max-w-full whitespace-nowrap">
        {title}
      </h1>
    </div>
  );
};

export default PageHeader; 