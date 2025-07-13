import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import PageHeader from '../../../../components/common/PageHeader';
import BaseDialogs from '../../../templates/base/BaseDialogs';
import BaseSnackbar from '../../../templates/base/BaseSnackbar';
import { getAllDrafts, deleteDraft } from '../../../../utils/draftUtils';

const PayItemReportDrafts = () => {
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
      console.log('Loading pay item drafts...');
      const allDrafts = await getAllDrafts('pay_item');
      console.log('All drafts loaded:', allDrafts);
      
      const processedDrafts = allDrafts.map(draft => {
        // Handle different data structures from backend vs local storage
        let draftData = draft;
        
        // If draft has a 'data' property (backend structure), use that
        if (draft.data) {
          draftData = draft.data;
        }
        
        // Extract header information with fallbacks
        const header = draftData.header || {};
        const project = header.project || draftData.project || '-';
        const inspector = header.inspector || draftData.inspector || '-';
        const date = header.date || draftData.date || null;
        
        return {
          ...draft,
          header: header,
          project,
          inspector,
          date: date ? new Date(date).toLocaleDateString() : '-',
          lastModified: draft.lastModified || draft.updated_at || null,
        };
      });
      
      // Sort by lastModified desc
      processedDrafts.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
      console.log('Processed drafts:', processedDrafts);
      setDrafts(processedDrafts);
    } catch (error) {
      console.error('Error loading drafts:', error);
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
        await deleteDraft('pay_item', draftToDelete.id);
        setDrafts(drafts.filter(draft => draft.id !== draftToDelete.id));
        setSnackbar({
          show: true,
          message: 'Draft deleted successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error deleting draft:', err);
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
    navigate(`/utility/reports/pay-item/edit/${draft.id}`);
  };

  const handleView = (draft) => {
    navigate(`/utility/reports/pay-item/review/${draft.id}`, {
      state: { from: '/utility/reports/pay-item/drafts', draft },
    });
  };

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Pay Item Report Drafts"
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Project: {draft.header?.project || '-'}
                    </h3>
                    <p className="text-sm font-medium text-gray-700">
                      Inspector: {draft.header?.inspector || '-'}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      Date: {draft.header?.date ? new Date(draft.header.date).toLocaleDateString() : '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last Modified: {draft.lastModified ? new Date(draft.lastModified).toLocaleString() : '-'}
                    </p>
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

export default PayItemReportDrafts; 