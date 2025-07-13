import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import PageHeader from '../../../../components/common/PageHeader';
import BaseDialogs from '../../../templates/base/BaseDialogs';
import BaseSnackbar from '../../../templates/base/BaseSnackbar';
import { getAllDrafts, deleteDraft } from '../../../../utils/draftUtils';

const DailyUtilityReport2Drafts = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const allDrafts = await getAllDrafts('daily_utility_2');
      const processedDrafts = allDrafts.map(draft => {
        let draftData = draft;
        if (draft.data) {
          draftData = draft.data;
        }
        const header = draftData.header || {};
        const project = header.project || draftData.project || 'No Project';
        const inspector = header.inspector || draftData.inspector || 'No Inspector';
        const date = header.date || draftData.date || new Date().toISOString().split('T')[0];
        return {
          ...draft,
          header: {
            ...header,
            project,
            inspector,
            date
          },
          date: new Date(date).toLocaleDateString(),
          lastModified: draft.lastModified || draft.updated_at || draft.created_at || null,
        };
      });
      processedDrafts.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
      setDrafts(processedDrafts);
    } catch (error) {
      setSnackbar({
        show: true,
        message: 'Error loading drafts: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleDelete = (draft) => {
    setDraftToDelete(draft);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (draftToDelete) {
        await deleteDraft('daily_utility_2', draftToDelete.id);
        setDrafts(drafts.filter(draft => draft.id !== draftToDelete.id));
        setSnackbar({
          show: true,
          message: 'Draft deleted successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      setSnackbar({
        show: true,
        message: 'Error deleting draft: ' + err.message,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setDraftToDelete(null);
    }
  };

  const handleEdit = (draft) => {
    navigate(`/utility/reports/daily2/edit/${draft.id}`);
  };

  const handleView = (draft) => {
    navigate(`/utility/reports/daily2/review/${draft.id}`, {
      state: { from: '/utility/reports/daily2/drafts', draft },
    });
  };

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Daily Utility Report 2 Drafts"
          backPath="/utility/reports"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />

        {drafts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6 mt-6">
            <p className="text-center text-gray-600 py-8">
              No draft reports found.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-semibold text-lg text-gray-800">{draft.header.project}</div>
                    <div className="text-gray-600 text-sm">Inspector: {draft.header.inspector}</div>
                    <div className="text-gray-600 text-sm">Date: {draft.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(draft)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(draft)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(draft)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <BaseDialogs
          deleteDialogOpen={deleteDialogOpen}
          exitDialogOpen={false}
          onDeleteConfirm={handleDeleteConfirm}
          onExitConfirm={() => {}}
          onCloseDeleteDialog={() => {
            setDeleteDialogOpen(false);
            setDraftToDelete(null);
          }}
          onCloseExitDialog={() => {}}
          deleteDialogTitle="Confirm Delete"
          deleteDialogMessage="Are you sure you want to delete this draft? This action cannot be undone."
        />

        {/* Snackbar for notifications */}
        <BaseSnackbar
          snackbar={snackbar}
          onClose={() => setSnackbar({ show: false, message: '', severity: 'success' })}
        />
      </div>
    </div>
  );
};

export default DailyUtilityReport2Drafts; 