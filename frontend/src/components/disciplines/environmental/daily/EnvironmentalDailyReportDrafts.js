import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Card, CardContent, CardActions, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageHeader from '../../../../components/common/PageHeader';
import { getAllDrafts, deleteDraft, cleanupInvalidLocalDrafts } from '../../../../utils/draftUtils';
import { useAuth } from '../../../../contexts/AuthContext';

export default function EnvironmentalDailyReportDrafts() {
  const { isAuthenticated, loading } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const location = useLocation();
  const reportType = 'environmental';
  const backPath = location.state?.from || '/environmental/reports';

  useEffect(() => {
    async function loadDrafts() {
      await cleanupInvalidLocalDrafts('environmental');
      try {
        const allDrafts = await getAllDrafts(reportType);
        console.log('Loaded drafts:', allDrafts);
        
        // Format drafts for display
        const formattedDrafts = allDrafts.map(draft => {
          console.log('Processing draft:', draft);
          return {
            ...draft,
            id: draft.id,
            photos: draft.photos || [],
            header: draft.data?.header || draft.header || {}
          };
        });
        
        console.log('Formatted drafts:', formattedDrafts);
        setDrafts(formattedDrafts);
      } catch (error) {
        console.error('Error loading drafts:', error);
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
    cleanupInvalidLocalDrafts('environmental').then((count) => {
      console.log(`Cleaned up ${count} invalid local environmental drafts`);
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
      console.log('Deleting draft:', draftToDelete);
      await deleteDraft(reportType, draftToDelete.id);
      
      // Remove the draft from the local state immediately
      setDrafts(prevDrafts => prevDrafts.filter(d => d.id !== draftToDelete.id));
      
      // Then refresh from storage
      const updatedDrafts = await getAllDrafts(reportType);
      console.log('Updated drafts after deletion:', updatedDrafts);
      
      // Filter out any drafts that were supposed to be deleted
      const filteredDrafts = updatedDrafts.filter(draft => draft.id !== draftToDelete.id);
      
      setDrafts(filteredDrafts);
      setSnackbar({
        open: true,
        message: 'Draft deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting draft:', error);
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
    console.log('Navigating to edit with draft:', draft);
    navigate(`/environmental/reports/daily/edit/${draft.id}`, { state: { draft: { ...draft.data, id: draft.id } } });
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
    navigate(`/environmental/reports/daily/review/${id}`);
  };

  console.log('All drafts before filtering:', drafts);

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader 
        title="Environmental Daily Report Drafts"
        backPath={backPath}
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333'
          }
        }}
      />
      {drafts
        .filter(draft => {
          const id = draft?.id || draft?.header?.id || '';
          return id && 
                 id !== 'null' && 
                 id !== undefined && 
                 (typeof id !== 'string' || (!id.startsWith('temp_') && !id.toLowerCase().includes('null')));
        })
        .map((draft, index) => {
          console.log('Rendering draft card:', draft);
          return (
            <Card key={`draft-${draft.id || index}`} sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'nowrap' }}>
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6">Project: {draft.data?.header?.project || draft.header?.project || 'N/A'}</Typography>
                <Typography>Date: {(draft.data?.header?.date || draft.header?.date) ? new Date(draft.data?.header?.date || draft.header?.date).toLocaleDateString() : 'N/A'}</Typography>
                <Typography>Inspector: {draft.data?.header?.inspector || draft.header?.inspector || 'N/A'}</Typography>
                <Typography>Spread: {draft.data?.header?.spread || draft.header?.spread || 'N/A'}</Typography>
                <Typography>Report ID: {draft.id || 'N/A'}</Typography>
              </CardContent>
              <CardActions sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <IconButton onClick={() => handleEdit(draft)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleReview(draft)} 
                  color="primary"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteClick(draft)} color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          );
        })}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Draft</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this draft? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 