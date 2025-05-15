import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

const PunchlistDraftView = () => {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(null);
  const [selectedPhotoArr, setSelectedPhotoArr] = useState([]);
  const [selectedPhotoComments, setSelectedPhotoComments] = useState([]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton
          onClick={() => navigate('/punchlist-drafts')}
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
          Punchlist Draft View
        </Typography>
      </Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Spread: {draft.spread || '-'}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            Inspector: {draft.inspectorName || '-'}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            Date: {draft.inspectionDate || '-'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Last Modified: {draft.lastModified ? new Date(draft.lastModified).toLocaleDateString() : '-'}
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
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                setSelectedPhotoArr(item.photos);
                                setSelectedPhotoComments(item.photoComments || []);
                                setSelectedPhotoIdx(photoIdx);
                                setPhotoDialogOpen(true);
                              }}
                            >
                              <img
                                src={photo}
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
      <Dialog
        open={photoDialogOpen}
        onClose={() => {
          setPhotoDialogOpen(false);
          setSelectedPhotoIdx(null);
          setSelectedPhotoArr([]);
          setSelectedPhotoComments([]);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
          Photo Preview
          <IconButton onClick={() => {
            setPhotoDialogOpen(false);
            setSelectedPhotoIdx(null);
            setSelectedPhotoArr([]);
            setSelectedPhotoComments([]);
          }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {selectedPhotoIdx !== null && selectedPhotoArr[selectedPhotoIdx] && (
            <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>{`Photo ${selectedPhotoIdx + 1}`}</Typography>
              <img src={selectedPhotoArr[selectedPhotoIdx]} alt="Large Preview" style={{ width: '100%', maxWidth: 400, maxHeight: '60vh', objectFit: 'contain' }} />
              {selectedPhotoComments[selectedPhotoIdx] && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Comments:</Typography>
                  <Typography variant="body2">{selectedPhotoComments[selectedPhotoIdx]}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PunchlistDraftView; 