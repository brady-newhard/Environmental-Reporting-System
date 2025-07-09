import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import PageHeader from '../../../../components/common/PageHeader';

const DailyWeldingReportDrafts = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Get all drafts from localStorage with the correct prefix
    const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('daily_welding_draft_'));
    const draftData = draftKeys.map(key => {
      const data = JSON.parse(localStorage.getItem(key));
      return {
        id: key,
        ...data,
        date: data.workDate ? new Date(data.workDate).toLocaleDateString() : '-',
        lastModified: data.savedAt || null,
      };
    });
    // Sort by lastModified desc if available
    draftData.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
    setDrafts(draftData);
  }, []);

  const handleDelete = (id) => {
    const draft = drafts.find(d => d.id === id);
    if (!draft) {
      setSnackbar({
        open: true,
        message: 'Cannot delete draft: Draft not found',
        severity: 'error'
      });
      return;
    }
    setDraftToDelete(draft);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    try {
      localStorage.removeItem(draftToDelete.id);
      setDrafts(drafts.filter(draft => draft.id !== draftToDelete.id));
      setSnackbar({
        open: true,
        message: 'Draft deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting draft:', err);
      setSnackbar({
        open: true,
        message: 'Error deleting draft: ' + err.message,
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
    navigate('/welding/reports/daily', { state: { draft } });
  };

  const handleView = (draft) => {
    const draftId = draft.id.replace('daily_welding_draft_', '');
    navigate(`/welding/reports/daily/review/${draftId}`, {
      state: { from: '/welding/reports/drafts', draft },
    });
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader 
          title="Daily Weld Report Drafts"
          backPath="/welding/reports"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        {drafts.length === 0 ? (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              No draft reports found.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {drafts.map((draft) => (
              <Paper key={draft.id} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Project: {draft.project || '-'}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Inspector: {draft.inspector || '-'}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Date: {draft.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Modified: {draft.lastModified ? new Date(draft.lastModified).toLocaleString() : '-'}
                  </Typography>
                </Box>
                <Box>
                  <IconButton color="primary" onClick={() => handleView(draft)} size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleEdit(draft)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(draft.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this draft? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DailyWeldingReportDrafts; 