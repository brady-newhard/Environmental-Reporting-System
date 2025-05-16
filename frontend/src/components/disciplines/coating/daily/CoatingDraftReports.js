import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CoatingDraftReports = () => {
  const [drafts, setDrafts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem('dailyCoatingReportDrafts') || '[]');
    setDrafts(savedDrafts);
  }, []);

  const handleContinueDraft = (draftId) => {
    navigate(`/coating/reports/daily?draftId=${draftId}`);
  };

  const handleDeleteDraft = (draftId) => {
    const updatedDrafts = drafts.filter(draft => draft.draftId !== draftId);
    localStorage.setItem('dailyCoatingReportDrafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          onClick={() => navigate('/coating/reports')}
          sx={{
            minWidth: 0,
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: '#000',
            color: '#fff',
            mr: 2,
            '&:hover': { bgcolor: '#222' },
            boxShadow: 1
          }}
        >
          <ArrowBackIcon />
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Draft Coating Reports
        </Typography>
      </Box>
      <TableContainer component={Paper} sx={{ width: '100%' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <TableHead component="thead">
            <TableRow>
              <TableCell sx={{ width: { xs: '22%', sm: '25%' }, fontWeight: 600, fontSize: { xs: '0.85rem', sm: '1rem' }, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>Project</TableCell>
              <TableCell sx={{ width: { xs: '22%', sm: '25%' }, fontWeight: 600, fontSize: { xs: '0.85rem', sm: '1rem' }, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>Work Date</TableCell>
              <TableCell sx={{ width: { xs: '32%', sm: '25%' }, fontWeight: 600, fontSize: { xs: '0.85rem', sm: '1rem' }, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>Saved At</TableCell>
              <TableCell sx={{ width: { xs: '24%', sm: '25%' }, fontWeight: 600, fontSize: { xs: '0.85rem', sm: '1rem' }, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <tbody>
            {drafts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>No draft reports found.</TableCell>
              </TableRow>
            ) : (
              drafts.map((draft, idx) => (
                <React.Fragment key={draft.draftId}>
                  <TableRow>
                    <TableCell sx={{ width: { xs: '22%', sm: '25%' }, fontSize: { xs: '0.9rem', sm: '1rem' }, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>{draft.project}</TableCell>
                    <TableCell sx={{ width: { xs: '22%', sm: '25%' }, fontSize: { xs: '0.9rem', sm: '1rem' }, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>{draft.workDate}</TableCell>
                    <TableCell sx={{ width: { xs: '32%', sm: '25%' }, fontSize: { xs: '0.9rem', sm: '1rem' }, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>{new Date(draft.savedAt).toLocaleString()}</TableCell>
                    <TableCell sx={{ width: { xs: '24%', sm: '25%' }, fontSize: { xs: '0.9rem', sm: '1rem' }, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 1 },
                        alignItems: { xs: 'stretch', sm: 'center' }
                      }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleContinueDraft(draft.draftId)}
                          sx={{ mr: { xs: 0, sm: 1 }, mb: { xs: 1, sm: 0 }, fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 1, sm: 2 }, py: { xs: 0.5, sm: 1 } }}
                        >
                          Continue
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => handleDeleteDraft(draft.draftId)}
                          sx={{
                            fontSize: { xs: '0.8rem', sm: '1rem' },
                            px: { xs: 1, sm: 2 },
                            py: { xs: 0.5, sm: 1 },
                            bgcolor: '#ff1744',
                            color: '#fff',
                            '&:hover': { bgcolor: '#b2102f' }
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {idx < drafts.length - 1 && (
                    <tr>
                      <td colSpan={4} style={{ padding: 0 }}>
                        <Box sx={{ my: 1 }} />
                        <Divider />
                        <Box sx={{ my: 1 }} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </Box>
      </TableContainer>
    </Box>
  );
};

export default CoatingDraftReports; 