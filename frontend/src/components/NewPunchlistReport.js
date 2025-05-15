import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AddPhotoAlternate as AddPhotoIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

const NewPunchlistReport = ({ reportId }) => {
  const [items, setItems] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    startStation: '',
    endStation: '',
    feature: '',
    issue: '',
    recommendations: '',
  });
  const [newItemPhotos, setNewItemPhotos] = useState([]);
  const [photoComments, setPhotoComments] = useState([]);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [spread, setSpread] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getDraftId = () => reportId || localStorage.getItem('punchlist_current_draftId') || `${Date.now()}`;

  useEffect(() => {
    if (reportId) {
      fetchReport();
    } else {
      // Check for a draft in localStorage
      const draftId = localStorage.getItem('punchlist_current_draftId');
      if (draftId) {
        const draftKey = `punchlist_draft_${draftId}`;
        const draft = localStorage.getItem(draftKey);
        if (draft) {
          const parsed = JSON.parse(draft);
          setItems(parsed.items || []);
          setSpread(parsed.spread || '');
          setInspectorName(parsed.inspectorName || '');
          setInspectionDate(parsed.inspectionDate || '');
          console.log('Loaded draft items:', parsed.items);
        } else {
          setItems([]);
          setSpread('');
          setInspectorName('');
          setInspectionDate('');
        }
      } else {
        setItems([]);
        setSpread('');
        setInspectorName('');
        setInspectionDate('');
      }
    }
    setLoading(false);
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`/api/reports/${reportId}`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        ...newItem,
        spread,
        inspectorName,
        date: inspectionDate,
        photos: newItemPhotos,
        photoComments: photoComments,
      }
    ]);
    setNewItem({
      startStation: '',
      endStation: '',
      feature: '',
      issue: '',
      recommendations: '',
    });
    setNewItemPhotos([]);
    setPhotoComments([]);
  };

  const handleEditItem = async () => {
    try {
      // 1. Update the item (without photos)
      await axios.put(`/api/reports/${reportId}/items/${editingItem.id}`, {
        startStation: editingItem.startStation,
        endStation: editingItem.endStation,
        feature: editingItem.feature,
        issue: editingItem.issue,
        recommendations: editingItem.recommendations,
      });

      // 2. Upload any new photos
      for (let i = 0; i < newItemPhotos.length; i++) {
        // Only upload if it's a File (not a string URL)
        if (newItemPhotos[i] instanceof File) {
          const formData = new FormData();
          formData.append('image', newItemPhotos[i]);
          formData.append('description', photoComments[i] || '');
          await axios.post(
            `/api/reports/${reportId}/items/${editingItem.id}/upload_photo/`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        }
      }

      // 3. Refresh items
      fetchReport();
      setEditingItem(null);
      setNewItemPhotos([]);
      setPhotoComments([]);
    } catch (error) {
      console.error('Error editing item:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`/api/reports/${reportId}/items/${itemId}`);
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSave = () => {
    const draftId = getDraftId();
    localStorage.setItem('punchlist_current_draftId', draftId);
    const draftKey = `punchlist_draft_${draftId}`;
    localStorage.setItem(
      draftKey,
      JSON.stringify({
        items,
        spread,
        inspectorName,
        inspectionDate,
        lastModified: Date.now(),
      })
    );
    alert('Draft saved locally.');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      if (reportId) {
        axios.delete(`/api/reports/${reportId}/`).then(() => {
          alert('Report deleted.');
          navigate('/environmental/reports');
        }).catch(() => alert('Failed to delete report.'));
      } else {
        const draftId = getDraftId();
        localStorage.removeItem(`punchlist_draft_${draftId}`);
        localStorage.removeItem('punchlist_current_draftId');
        setItems([]);
        setSpread('');
        setInspectorName('');
        setInspectionDate('');
        alert('Draft deleted.');
        navigate('/punchlist-drafts');
      }
    }
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Unsaved changes will be lost.')) {
      navigate('/environmental/reports');
    }
  };

  const handleFinalize = async () => {
    try {
      // Submit to API (implement as needed)
      // On success, remove draft
      if (!reportId) {
        const draftId = getDraftId();
        localStorage.removeItem(`punchlist_draft_${draftId}`);
        localStorage.removeItem('punchlist_current_draftId');
      }
      alert('Report submitted for review!');
      navigate('/environmental/reports');
    } catch (error) {
      alert('Failed to submit report.');
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewItemPhotos(prev => [...prev, ...files]);
    setPhotoComments(prev => [...prev, ...Array(files.length).fill('')]);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ mt: 0.5, p: 2 }}>
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
          New Punchlist Report
        </Typography>
      </Box>
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5', '& .MuiInputBase-root': { bgcolor: 'white' } }}>
        {items.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Punchlist Items</Typography>
            <TableContainer sx={{ mb: 3, border: '1px solid #000', borderRadius: 2, overflowX: 'auto' }}>
              <Table sx={{ minWidth: 1200, tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Spread">Spread</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Inspector">Inspector</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Date">Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Start Station">Start Station</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="End Station">End Station</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', width: 175, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Feature">Feature</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', width: 360, maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderBottom: '1px solid #e0e0e0' }} title="Issue">Issue</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', width: 360, maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderBottom: '1px solid #e0e0e0' }} title="Recommendations">Recommendations</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Photos">Photos</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Actions">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                      <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'normal', wordBreak: 'break-word' }} title={item.spread || ''}>{item.spread || ''}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'normal', wordBreak: 'break-word' }} title={item.inspectorName || ''}>{item.inspectorName || ''}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.date || ''}>{item.date || ''}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.startStation}>{item.startStation}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.endStation}>{item.endStation}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', width: 240, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.feature}>{item.feature}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', width: 360, maxWidth: 360, whiteSpace: 'normal', wordBreak: 'break-word' }} title={item.issue}>{item.issue}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', width: 360, maxWidth: 360, whiteSpace: 'normal', wordBreak: 'break-word' }} title={item.recommendations}>{item.recommendations}</TableCell>
                      <TableCell align="center" sx={{ borderRight: '1px solid #e0e0e0', width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.photos && item.photos.length > 0 ? 'Photos' : 'No photos'}>
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
                                  cursor: 'pointer',
                                  '&:hover': {
                                    opacity: 0.9
                                  }
                                }}
                                onClick={() => {
                                  setSelectedPhotoIdx(photoIdx);
                                  setPhotoDialogOpen(true);
                                }}
                              >
                                <img
                                  src={photo instanceof File ? URL.createObjectURL(photo) : photo}
                                  alt={`Preview ${photoIdx + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          'No photos'
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ width: 120, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title="Actions">
                        <IconButton size="small" onClick={() => {
                          setNewItem({
                            startStation: item.startStation,
                            endStation: item.endStation,
                            feature: item.feature,
                            issue: item.issue,
                            recommendations: item.recommendations,
                          });
                          setNewItemPhotos(item.photos || []);
                          setPhotoComments(item.photoComments || []);
                          setItems(prev => prev.filter((_, i) => i !== idx));
                        }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
        {!report?.finalized && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: '#f8f8f8' }}>
            <Typography variant="h6" gutterBottom>
              Add New Item
            </Typography>
            <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 1 }}>
              <TextField
                label="Spread"
                value={spread}
                onChange={e => setSpread(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Inspector Name"
                value={inspectorName}
                onChange={e => setInspectorName(e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Date"
                type="date"
                value={inspectionDate}
                onChange={e => setInspectionDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            </Stack>
            <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 1 }}>
              <TextField
                label="Start Station"
                value={newItem.startStation}
                onChange={(e) => setNewItem({ ...newItem, startStation: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="End Station"
                value={newItem.endStation}
                onChange={(e) => setNewItem({ ...newItem, endStation: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Feature"
                value={newItem.feature}
                onChange={(e) => setNewItem({ ...newItem, feature: e.target.value })}
                fullWidth
                size="small"
              />
            </Stack>
            <Box sx={{ mb: 1 }}>
              <TextField
                label="Issue"
                value={newItem.issue}
                onChange={(e) => setNewItem({ ...newItem, issue: e.target.value })}
                multiline
                rows={3}
                fullWidth
                size="small"
              />
            </Box>
            <Box sx={{ mb: 1 }}>
              <TextField
                label="Recommendations"
                value={newItem.recommendations}
                onChange={(e) => setNewItem({ ...newItem, recommendations: e.target.value })}
                multiline
                rows={3}
                fullWidth
                size="small"
              />
            </Box>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Photos
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoIcon />}
                  fullWidth={isMobile}
                  size="small"
                >
                  Add Photos
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    hidden
                    onChange={handlePhotoUpload}
                  />
                </Button>
              </Box>
              {newItemPhotos.length > 0 && (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)'
                  },
                  gap: 1
                }}>
                  {newItemPhotos.map((photo, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: '100%',
                        paddingTop: '100%',
                        position: 'relative',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${idx + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                          },
                        }}
                        onClick={() => {
                          setNewItemPhotos(prev => prev.filter((_, i) => i !== idx));
                          setPhotoComments(prev => prev.filter((_, i) => i !== idx));
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                onClick={handleAddItem} 
                fullWidth={isMobile}
                size="small"
              >
                Add Item
              </Button>
            </Box>
          </Paper>
        )}
        <Dialog 
          open={!!editingItem} 
          onClose={() => setEditingItem(null)}
          fullScreen={isMobile}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 2 }}>
              <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
                <TextField
                  label="Start Station"
                  value={editingItem?.startStation || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, startStation: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="End Station"
                  value={editingItem?.endStation || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, endStation: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Feature"
                  value={editingItem?.feature || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, feature: e.target.value })}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Issue"
                value={editingItem?.issue || ''}
                onChange={(e) => setEditingItem({ ...editingItem, issue: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <TextField
                label="Recommendations"
                value={editingItem?.recommendations || ''}
                onChange={(e) => setEditingItem({ ...editingItem, recommendations: e.target.value })}
                multiline
                rows={3}
                fullWidth
              />
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Photos
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddPhotoIcon />}
                    fullWidth={isMobile}
                  >
                    Add Photos
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      hidden
                      onChange={handlePhotoUpload}
                    />
                  </Button>
                </Box>
                {newItemPhotos.length > 0 && (
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(3, 1fr)',
                      md: 'repeat(4, 1fr)'
                    },
                    gap: 2
                  }}>
                    {newItemPhotos.map((photo, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          width: '100%',
                          paddingTop: '100%',
                          position: 'relative',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${idx + 1}`}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.7)',
                            },
                          }}
                          onClick={() => {
                            setNewItemPhotos(prev => prev.filter((_, i) => i !== idx));
                            setPhotoComments(prev => prev.filter((_, i) => i !== idx));
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingItem(null)} fullWidth={isMobile}>
              Cancel
            </Button>
            <Button onClick={handleEditItem} variant="contained" fullWidth={isMobile}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={photoDialogOpen}
          onClose={() => {
            setPhotoDialogOpen(false);
            setSelectedPhotoIdx(null);
          }}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogContent>
            {selectedPhotoIdx !== null && newItemPhotos[selectedPhotoIdx] && (
              <Box
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={URL.createObjectURL(newItemPhotos[selectedPhotoIdx])}
                  alt="Large Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            )}
          </DialogContent>
        </Dialog>
        <Stack 
          direction={isMobile ? 'row' : { xs: 'column', sm: 'row' }} 
          spacing={isMobile ? 3 : 1} 
          justifyContent={isMobile ? 'space-between' : undefined}
          sx={{ 
            mt: 1, 
            width: '100%',
            m: 0,
            '& .MuiButton-root': {
              width: { xs: '100%', sm: 'auto' }
            }
          }}
        >
          {isMobile ? (
            <>
              <IconButton color="error" onClick={handleDelete} size="large" sx={{ flex: 1 }}>
                <DeleteIcon sx={{ fontSize: 36 }} />
              </IconButton>
              <IconButton color="success" onClick={handleSave} size="large" sx={{ flex: 1 }}>
                <SaveIcon sx={{ fontSize: 36 }} />
              </IconButton>
              <IconButton onClick={handleExit} size="large" sx={{ flex: 1 }}>
                <CloseIcon sx={{ fontSize: 36 }} />
              </IconButton>
              <IconButton color="primary" onClick={handleFinalize} size="large" sx={{ flex: 1 }}>
                <SendIcon sx={{ fontSize: 36 }} />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                size="small"
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={handleSave}
                size="small"
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={handleExit}
                size="small"
                startIcon={<CloseIcon />}
              >
                Exit
              </Button>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinalize}
                size="small"
                startIcon={<SendIcon />}
              >
                Submit
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default NewPunchlistReport; 