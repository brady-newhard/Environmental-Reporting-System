import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Card, CardContent, CardActions, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageHeader from '../../../../components/common/PageHeader';
import { getAllDrafts, deleteDraft, cleanupInvalidLocalDrafts } from '../../../../utils/draftUtils';
import { useAuth } from '../../../../contexts/AuthContext';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function SWPPPDrafts() {
  const { isAuthenticated, loading } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const location = useLocation();
  const reportType = 'swppp';
  const backPath = location.state?.from || '/environmental/swppp';

  useEffect(() => {
    async function loadDrafts() {
      await cleanupInvalidLocalDrafts('swppp');
      try {
        const allDrafts = await getAllDrafts(reportType);
        console.log('Loaded SWPPP drafts:', allDrafts);
        
        // Format drafts for display
        const formattedDrafts = allDrafts.map(draft => {
          console.log('Processing SWPPP draft:', draft);
          return {
            ...draft,
            id: draft.id,
            photos: draft.photos || [],
            header: draft.data?.header || draft.header || {}
          };
        });
        
        console.log('Formatted SWPPP drafts:', formattedDrafts);
        setDrafts(formattedDrafts);
      } catch (error) {
        console.error('Error loading SWPPP drafts:', error);
        setSnackbar({
          open: true,
          message: 'Error loading drafts',
          severity: 'error'
        });
      }
    }

    if (!loading && isAuthenticated) {
      loadDrafts();
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    cleanupInvalidLocalDrafts('swppp').then((count) => {
      console.log(`Cleaned up ${count} invalid local SWPPP drafts`);
    });
  }, []);

  const handleDeleteClick = (draft) => {
    if (!draft || !draft.id) {
      setSnackbar({
        open: true,
        message: 'Cannot delete draft: Invalid draft ID',
        severity: 'error'
      });
      return;
    }
    setDraftToDelete(draft);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      console.log('Deleting SWPPP draft:', draftToDelete);
      await deleteDraft(reportType, draftToDelete.id);
      
      // Remove the draft from the local state immediately
      setDrafts(prevDrafts => prevDrafts.filter(d => d.id !== draftToDelete.id));
      
      // Then refresh from storage
      const updatedDrafts = await getAllDrafts(reportType);
      console.log('Updated SWPPP drafts after deletion:', updatedDrafts);
      
      // Filter out any drafts that were supposed to be deleted
      const filteredDrafts = updatedDrafts.filter(draft => draft.id !== draftToDelete.id);
      
      setDrafts(filteredDrafts);
      setSnackbar({
        open: true,
        message: 'Draft deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting SWPPP draft:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete draft. Please try again.',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setDraftToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDraftToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEdit = (draft) => {
    console.log('Navigating to edit SWPPP draft:', draft);
    navigate(`/environmental/swppp/edit/${draft.id}`, { state: { draft: { ...draft.data, id: draft.id } } });
  };

  const handleReview = (draft) => {
    const id = draft?.id || draft?.header?.id || '';
    if (!id || 
        id === 'null' || 
        id === undefined || 
        (typeof id === 'string' && (id.startsWith('temp_') || id.toLowerCase().includes('null')))) {
      // Optionally show a warning/snackbar
      return;
    }
    navigate(`/environmental/swppp/review/${id}`);
  };

  console.log('All SWPPP drafts before filtering:', drafts);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <PageHeader 
        title="SWPPP Inspection Report Drafts"
        backPath={backPath}
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': { backgroundColor: '#333333' }
        }}
        className="flex flex-wrap min-w-0"
      />
      {drafts
        .filter(draft => {
          const id = draft?.id || draft?.header?.id || '';
          return id && 
                 id !== 'null' && 
                 id !== undefined && 
                 (typeof id !== 'string' || (!id.startsWith('temp_') && !id.toLowerCase().includes('null')));
        })
        .map((draft, index) => (
          <div key={`draft-${draft.id || index}`} className="rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between mb-4 bg-white w-full">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg mb-1 truncate">Project: {draft.data?.header?.project || draft.header?.project || 'N/A'}</div>
              <div className="text-gray-700">Date: {(draft.data?.header?.date || draft.header?.date) ? new Date(draft.data?.header?.date || draft.header?.date).toLocaleDateString() : 'N/A'}</div>
              <div className="text-gray-700">Inspector: {draft.data?.header?.inspector || draft.header?.inspector || 'N/A'}</div>
              <div className="text-gray-700">Spread: {draft.data?.header?.spread || draft.header?.spread || 'N/A'}</div>
              <div className="text-gray-700">Inspection Type: {draft.data?.header?.inspection_type || draft.header?.inspection_type || 'N/A'}</div>
              <div className="text-gray-500 text-xs mt-1">Report ID: {draft.id || 'N/A'}</div>
            </div>
            <div className="flex gap-2 ml-0 md:ml-4 mt-4 md:mt-0 shrink-0">
              {/* Edit Button */}
              <Button
                onClick={() => handleEdit(draft)}
                variant="secondary"
                size="icon"
                className="md:size-auto md:px-4 md:py-2 flex items-center gap-2 !bg-blue-500 !hover:bg-blue-600 !text-white font-semibold border-none"
                title="Edit"
              >
                <PencilIcon className="h-5 w-5" />
                <span className="hidden md:inline">Edit</span>
              </Button>
              {/* Review Button */}
              <Button
                onClick={() => handleReview(draft)}
                variant="default"
                size="icon"
                className="md:size-auto md:px-4 md:py-2 flex items-center gap-2 !bg-yellow-400 !hover:bg-yellow-500 !text-black font-semibold border-none"
                title="Review"
              >
                <EyeIcon className="h-5 w-5" />
                <span className="hidden md:inline">Review</span>
              </Button>
              {/* Delete Button */}
              <Button
                onClick={() => handleDeleteClick(draft)}
                variant="destructive"
                size="icon"
                className="md:size-auto md:px-4 md:py-2 flex items-center gap-2 !bg-red-500 !hover:bg-red-600 !text-white font-semibold border-none"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
                <span className="hidden md:inline">Delete</span>
              </Button>
            </div>
          </div>
        ))}

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="text-lg font-semibold mb-2">Delete Draft</div>
            <div className="mb-4">Are you sure you want to delete this draft? This action cannot be undone.</div>
            <div className="flex justify-end gap-2">
              <button onClick={handleDeleteCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar/Alert */}
      {snackbar.open && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded shadow-lg text-white text-center transition-all duration-300 ${snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
             onClick={handleCloseSnackbar}
        >
          {snackbar.message}
        </div>
      )}
    </div>
  );
} 