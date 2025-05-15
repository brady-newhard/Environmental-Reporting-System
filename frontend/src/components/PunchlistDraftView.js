import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PunchlistDraftView = () => {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    const key = `punchlist_draft_${draftId}`;
    const data = localStorage.getItem(key);
    if (data) {
      setDraft(JSON.parse(data));
    }
  }, [draftId]);

  if (!draft) {
    return <Typography sx={{ mt: 4 }}>Draft not found.</Typography>;
  }

  return (
    <Box sx={{ mt: 4, px: { xs: 2, sm: 4, md: 6 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/punchlist-drafts')} sx={{ mb: 2 }}>
        Back to Drafts
      </Button>
      <Typography variant="h4" gutterBottom>Punchlist Draft View</Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Spread: {draft.spread || '-'} | Inspector: {draft.inspectorName || '-'} | Date: {draft.inspectionDate || '-'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Last Modified: {draft.lastModified ? new Date(draft.lastModified).toLocaleString() : '-'}
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 1200, tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell align="center">Start Station</TableCell>
                <TableCell align="center">End Station</TableCell>
                <TableCell align="center">Feature</TableCell>
                <TableCell align="center">Issue</TableCell>
                <TableCell align="center">Recommendations</TableCell>
                <TableCell align="center">Photos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {draft.items && draft.items.length > 0 ? (
                draft.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell align="center">{item.startStation}</TableCell>
                    <TableCell align="center">{item.endStation}</TableCell>
                    <TableCell align="center">{item.feature}</TableCell>
                    <TableCell align="center">{item.issue}</TableCell>
                    <TableCell align="center">{item.recommendations}</TableCell>
                    <TableCell align="center">
                      {item.photos && item.photos.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {item.photos.map((photo, photoIdx) => (
                            <Box
                              key={photoIdx}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                overflow: 'hidden',
                                bgcolor: '#eee',
                              }}
                            >
                              <img
                                src={photo instanceof File ? URL.createObjectURL(photo) : photo}
                                alt={`Preview ${photoIdx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        'No photos'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">No items in this draft.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PunchlistDraftView; 