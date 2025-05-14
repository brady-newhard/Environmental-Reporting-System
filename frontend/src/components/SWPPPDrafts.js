import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SWPPPDrafts = () => {
  const [drafts, setDrafts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedDrafts = Object.keys(localStorage)
      .filter(key => key.startsWith('swppp_draft_'))
      .map(key => JSON.parse(localStorage.getItem(key)))
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    setDrafts(savedDrafts);
  }, []);

  const handleResume = (draftId) => {
    navigate(`/swppp/new?draftId=${draftId}`);
  };

  const handleDelete = (draftId) => {
    if (window.confirm('Delete this draft?')) {
      localStorage.removeItem(`swppp_draft_${draftId}`);
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