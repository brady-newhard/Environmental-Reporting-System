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

const WeldingStationDraftReports = () => {
  const [drafts, setDrafts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedDrafts = JSON.parse(localStorage.getItem('dailyWeldingStationReportDrafts') || '[]');
    setDrafts(savedDrafts);
  }, []);

  const handleContinueDraft = (draftId) => {
    navigate(`/welding/reports/daily-station?draftId=${draftId}`);
  };

  const handleDeleteDraft = (draftId) => {
    const updatedDrafts = drafts.filter(draft => draft.draftId !== draftId);
    localStorage.setItem('dailyWeldingStationReportDrafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          onClick={() => navigate('/welding/reports')}
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
          Daily Weld Station Report Drafts
        </Typography>
      </Box>
      <TableContainer component={Paper} sx={{ width: '100%' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <TableHead component="thead">
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Work Date</TableCell>
              <TableCell>Saved At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <tbody>
            {drafts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No draft reports found.</TableCell>
              </TableRow>
            ) : (
              drafts.map((draft, idx) => (
                <React.Fragment key={draft.draftId}>
                  <TableRow>
                    <TableCell>{draft.project}</TableCell>
                    <TableCell>{draft.workDate}</TableCell>
                    <TableCell>{new Date(draft.savedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleContinueDraft(draft.draftId)}
                        >
                          Continue
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => handleDeleteDraft(draft.draftId)}
                          sx={{ bgcolor: '#ff1744', color: '#fff', '&:hover': { bgcolor: '#b2102f' } }}
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

export default WeldingStationDraftReports; 