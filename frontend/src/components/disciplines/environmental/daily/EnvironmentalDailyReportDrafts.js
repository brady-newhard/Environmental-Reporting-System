import React, { useEffect, useState } from 'react';
import { getAllDrafts, deleteDraft } from '../../../../utils/draftUtils';
import { Box, Card, CardContent, CardActions, Button, Typography, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';

export default function EnvironmentalDailyReportDrafts() {
  const [drafts, setDrafts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const location = useLocation();
  const reportType = 'environmental';

  // Get the back path from location state or default to environmental reports
  const backPath = location.state?.from || '/environmental/reports';

  useEffect(() => {
    const loadDrafts = async () => {
      try {
        const loadedDrafts = await getAllDrafts(reportType);
        console.log('Loaded drafts:', loadedDrafts);
        // The API returns an array of objects with id and data properties
        const formattedDrafts = loadedDrafts.map(draft => ({
          ...draft.data,
          id: draft.id, // Ensure the ID is preserved in the root object
          photos: draft.data.photos || [] // Ensure photos array exists
        }));
        console.log('Formatted drafts:', formattedDrafts);
        setDrafts(formattedDrafts);
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    };
    loadDrafts();
  }, []);

  const handleDeleteClick = (draft) => {
    setDraftToDelete(draft);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDraft(reportType, draftToDelete.id);
      const updatedDrafts = await getAllDrafts(reportType);
      const formattedDrafts = updatedDrafts.map(draft => ({
        ...draft.data,
        id: draft.id,
        photos: draft.data.photos || []
      }));
      setDrafts(formattedDrafts);
      setSnackbar({
        open: true,
        message: 'Draft deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting draft:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete draft',
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
    navigate(`/environmental/reports/daily/edit/${draft.id}`, {
      state: { draft }
    });
  };

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
      {drafts.map((draft, index) => (
        <Card key={`draft-${draft.id || index}`} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Project: {draft.header?.project || 'N/A'}</Typography>
            <Typography>Date: {draft.header?.date ? new Date(draft.header.date).toLocaleDateString() : 'N/A'}</Typography>
            <Typography>Inspector: {draft.header?.inspector || 'N/A'}</Typography>
            <Typography>Spread: {draft.header?.spread || 'N/A'}</Typography>
          </CardContent>
          <CardActions>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleEdit(draft)}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
            <IconButton 
              onClick={() => {
                console.log('Navigating to review with draft:', draft);
                navigate(`/environmental/reports/daily/review/${draft.id}`, {
                  state: { 
                    draft: {
                      ...draft,
                      id: draft.id,
                      photos: draft.photos || []
                    },
                    from: '/environmental/reports/daily/drafts'
                  }
                });
              }} 
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton onClick={() => handleDeleteClick(draft)} color="error"><DeleteIcon /></IconButton>
          </CardActions>
        </Card>
      ))}

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