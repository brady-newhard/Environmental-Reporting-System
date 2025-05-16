import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PunchlistDrafts = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    // Load all punchlist drafts from localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('punchlist_draft_'));
    const loadedDrafts = keys.map(key => {
      const data = JSON.parse(localStorage.getItem(key));
      return {
        key,
        ...data,
      };
    });
    // Sort by lastModified desc
    loadedDrafts.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
    setDrafts(loadedDrafts);
  }, []);

  const handleResume = (key) => {
    // Set current draft id and navigate to new punchlist
    localStorage.setItem('punchlist_current_draftId', key.replace('punchlist_draft_', ''));
    navigate('/new-punchlist');
  };

  const handleDelete = (key) => {
    if (window.confirm('Delete this draft?')) {
      localStorage.removeItem(key);
      setDrafts(drafts.filter(d => d.key !== key));
    }
  };

  return (
    <Box sx={{ mt: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton
          onClick={() => navigate('/environmental/reports')}
          sx={{
            bgcolor: '#000',
            color: '#fff',
            width: 44,
            height: 44,
            '&:hover': { bgcolor: '#333' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 28 }} />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Punchlist Drafts
        </Typography>
      </Box>
      {drafts.length === 0 ? (
        <Typography>No drafts found.</Typography>
      ) : (
        <Stack spacing={2}>
          {drafts.map(draft => (
            <Paper key={draft.key} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Spread: {draft.spread || '-'}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Inspector: {draft.inspectorName || '-'}
                </Typography>
                <Typography variant="subtitle1" fontWeight={600}>
                  Date: {draft.inspectionDate || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Modified: {draft.lastModified ? new Date(draft.lastModified).toLocaleDateString() : '-'}
                </Typography>
              </Box>
              <Box>
                <IconButton color="primary" onClick={() => handleResume(draft.key)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="info" onClick={() => navigate(`/punchlist-draft/${draft.key.replace('punchlist_draft_', '')}`)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(draft.key)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default PunchlistDrafts; 