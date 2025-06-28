import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllDrafts } from '../../../../utils/draftUtils';
import PageHeader from '../../../../components/common/PageHeader';
import { PencilIcon, EyeIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function PunchlistDrafts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportType = 'punchlist';

  // Get the back path from location state or default to reports
  const backPath = location.state?.from || '/environmental/reports/punchlist';

  useEffect(() => {
    const loadDraftData = async () => {
      try {
        const loadedDrafts = await getAllDrafts(reportType);
        setDrafts(loadedDrafts);
      } catch (err) {
        console.error('Error loading drafts:', err);
        setError('Error loading drafts: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDraftData();
  }, [reportType]);

  const handleCreateNew = () => {
    navigate('/environmental/reports/punchlist/new');
  };

  const handleEdit = (draftId) => {
    navigate(`/environmental/reports/punchlist/edit/${draftId}`);
  };

  const handleReview = (draftId) => {
    navigate(`/environmental/reports/punchlist/review/${draftId}`);
  };

  const handleDelete = async (draftId) => {
    if (window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      try {
        await import('../../../../utils/draftUtils').then(utils => utils.deleteDraft(reportType, draftId));
        setDrafts(prev => prev.filter(draft => draft.id !== draftId));
      } catch (err) {
        console.error('Error deleting draft:', err);
        alert('Error deleting draft: ' + err.message);
      }
    }
  };

  // Helper to format date as MM/DD/YYYY
  const formatDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (isNaN(d)) return value;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <PageHeader 
          title="Punchlist Report Drafts"
          backPath={backPath}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#333333' }
          }}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Loading drafts...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <PageHeader 
          title="Punchlist Report Drafts"
          backPath={backPath}
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#333333' }
          }}
        />
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <PageHeader 
        title="Punchlist Report Drafts"
        backPath={backPath}
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': { backgroundColor: '#333333' }
        }}
        className="flex flex-wrap min-w-0"
      />
      
      {/* Create New Button */}
      <div className="mb-6">
        <button
          onClick={handleCreateNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create New Punchlist Report
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-600">No Drafts Found</h2>
          <p className="text-gray-500 mb-4">You don't have any punchlist report drafts yet.</p>
          <button
            onClick={handleCreateNew}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mx-auto"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Your First Draft
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts
            .filter(draft => {
              const id = draft?.id || draft?.header?.id || '';
              return id && 
                     id !== 'null' && 
                     id !== undefined && 
                     (typeof id !== 'string' || (!id.startsWith('temp_') && !id.toLowerCase().includes('null')));
            })
            .map((draft, index) => (
              <div key={`draft-${draft.id || index}`} className="rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-white w-full">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg mb-1 truncate">
                    Project: {draft.data?.header?.project || draft.header?.project || 'N/A'}
                  </div>
                  <div className="text-gray-700">
                    Date: {formatDate(draft.data?.header?.date || draft.header?.date)}
                  </div>
                  <div className="text-gray-700">
                    Inspector: {draft.data?.header?.inspector || draft.header?.inspector || 'N/A'}
                  </div>
                  <div className="text-gray-700">
                    Spread: {draft.data?.header?.spread || draft.header?.spread || 'N/A'}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    Report ID: {draft.id || 'N/A'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => handleReview(draft.id)}
                    className="flex items-center px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                  >
                    <EyeIcon className="w-3 h-3 mr-1" />
                    Review
                  </button>
                  <button
                    onClick={() => handleEdit(draft.id)}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    <PencilIcon className="w-3 h-3 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    <TrashIcon className="w-3 h-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
} 