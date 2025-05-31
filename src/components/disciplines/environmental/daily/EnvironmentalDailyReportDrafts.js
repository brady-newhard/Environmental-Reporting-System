import { useAuth } from '../../../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Card, CardContent, CardActions, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PageHeader from '../../../../components/common/PageHeader';
import { getAllDrafts, deleteDraft } from '../../../../utils/draftUtils';

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
    const loadDrafts = async () => {
      try {
        const allDrafts = await getAllDrafts(reportType);
        console.log('Loaded drafts:', allDrafts);
        
        // Format drafts for display
        const formattedDrafts = allDrafts.map(draft => ({
          ...draft,
          id: draft.id,
          photos: draft.photos || []
        }));
        
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
    };

    if (!loading && isAuthenticated) {
      loadDrafts();
    }
  }, [loading, isAuthenticated]);

  return (
    // Rest of the component code
  );
} 