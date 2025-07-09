import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Delete as DeleteIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import PageHeader from '../../../../components/common/PageHeader';

const DailyUtilityReportDrafts = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Get all drafts from localStorage
    const draftKeys = Object.keys(localStorage).filter(key => key.startsWith('daily_utility_draft_'));
    const draftData = draftKeys.map(key => {
      const data = JSON.parse(localStorage.getItem(key));
      return {
        id: key,
        ...data,
        date: new Date(data.header?.date || Date.now()).toLocaleDateString(),
      };
    });
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

  const handleEdit = (draft) => {
    navigate('/utility/reports/daily/new', { state: { draft } });
  };

  const handleView = (draft) => {
    navigate('/utility/reports/daily/draft/' + draft.id.split('_').pop(), { state: { draft } });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader 
          title="Daily Utility Report Drafts"
          backPath="/utility"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <Paper sx={{ p: 3, mt: 2 }}>
          {drafts.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
              No draft reports found.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Inspector</TableCell>
                    <TableCell>Contractor</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drafts.map((draft) => (
                    <TableRow key={draft.id}>
                      <TableCell>{draft.header?.project}</TableCell>
                      <TableCell>{draft.date}</TableCell>
                      <TableCell>{draft.header?.inspector}</TableCell>
                      <TableCell>{draft.header?.contractor}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleView(draft)} color="primary" size="small">
                          <ViewIcon />
                        </IconButton>
                        <IconButton onClick={() => handleEdit(draft)} color="primary" size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(draft.id)} color="error" size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
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

export default DailyUtilityReportDrafts; 