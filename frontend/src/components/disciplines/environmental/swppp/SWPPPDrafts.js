import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getAllDrafts, deleteDraft, cleanupInvalidLocalDrafts } from '../../../../utils/draftUtils';
import { useAuth } from '../../../../contexts/AuthContext';

const SWPPPDrafts = () => {
  const { isAuthenticated, loading } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDrafts() {
      await cleanupInvalidLocalDrafts('swppp');
      const drafts = await getAllDrafts('swppp');
      setDrafts(drafts.sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0)));
    }
    if (!loading && isAuthenticated) {
      loadDrafts();
    }
  }, [loading, isAuthenticated]);

  const handleResume = (draftId) => {
    navigate(`/swppp/new?draftId=${draftId}`);
  };

  const handleDelete = async (draftId) => {
    if (window.confirm('Delete this draft?')) {
      await deleteDraft('swppp', draftId);
      setDrafts(drafts.filter(d => d.id !== draftId));
    }
  };

  return (
    <Box sx={{ mt: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          onClick={() => navigate('/environmental/reports')}
          sx={{ 
            minWidth: '40px',
            width: '40px',
            height: '40px',
            backgroundColor: 'black',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
            borderRadius: '50%',
            p: 0
          }}
        >
          <ArrowBackIcon />
        </Button>
        <Typography variant="h4">SWPPP Drafts</Typography>
      </Box>
      {drafts.length === 0 ? (
        <Typography>No drafts found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Inspector</TableCell>
                <TableCell>Date Last Modified</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drafts.map(draft => (
                <TableRow key={draft.id}>
                  <TableCell>{draft.header?.project || '-'}</TableCell>
                  <TableCell>{draft.header?.inspector || '-'}</TableCell>
                  <TableCell>{new Date(draft.lastModified).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="contained" size="small" onClick={() => handleResume(draft.id)} sx={{ mr: 1 }}>
                      Resume
                    </Button>
                    <IconButton color="error" onClick={() => handleDelete(draft.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SWPPPDrafts; 