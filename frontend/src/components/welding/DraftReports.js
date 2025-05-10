import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PageHeader from '../common/PageHeader';

const DraftReports = () => {
  const [drafts, setDrafts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const savedDrafts = localStorage.getItem('dailyWeldingReportDrafts');
    if (savedDrafts) {
      try {
        const draftsData = JSON.parse(savedDrafts);
        // Sort drafts by save date, newest first
        draftsData.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        setDrafts(draftsData);
      } catch (error) {
        console.error('Error loading drafts:', error);
      }
    }
  };

  const handleEdit = (draft) => {
    window.location.href = `/welding/reports/daily?draftId=${draft.draftId}`;
  };

  const handleDelete = (draft) => {
    setDraftToDelete(draft);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (draftToDelete) {
      const updatedDrafts = drafts.filter(d => d.draftId !== draftToDelete.draftId);
      localStorage.setItem('dailyWeldingReportDrafts', JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      setDeleteDialogOpen(false);
      setDraftToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader title="Draft Reports" backPath="/welding/reports" />
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Saved Drafts</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.href = '/welding/reports/daily'}
          >
            New Report
          </Button>
        </Box>
        {drafts.length === 0 ? (
          <Typography color="textSecondary">No saved drafts found.</Typography>
        ) : (
          <List>
            {drafts.map((draft) => (
              <ListItem key={draft.draftId} divider>
                <ListItemText
                  primary={`Draft saved on ${formatDate(draft.savedAt)}`}
                  secondary={`Project: ${draft.project || 'Not specified'}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleEdit(draft)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(draft)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Draft</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this draft? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DraftReports; 