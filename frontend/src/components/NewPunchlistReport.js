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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    fetchReport();
    fetchItems();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`/api/reports/${reportId}`);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`/api/reports/${reportId}/items`);
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      // 1. Create the item without photos
      const response = await axios.post(`/api/reports/${reportId}/items`, {
        startStation: newItem.startStation,
        endStation: newItem.endStation,
        feature: newItem.feature,
        issue: newItem.issue,
        recommendations: newItem.recommendations,
      });
      const createdItem = response.data;

      // 2. Upload each photo
      for (let i = 0; i < newItemPhotos.length; i++) {
        const formData = new FormData();
        formData.append('image', newItemPhotos[i]);
        formData.append('description', photoComments[i] || '');
        await axios.post(
          `/api/reports/${reportId}/items/${createdItem.id}/upload_photo/`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      // 3. Refresh items
      fetchItems();
      setNewItem({
        startStation: '',
        endStation: '',
        feature: '',
        issue: '',
        recommendations: '',
        photos: [],
        photoComments: [],
      });
      setNewItemPhotos([]);
      setPhotoComments([]);
    } catch (error) {
      console.error('Error adding item:', error);
    }
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
      fetchItems();
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

  const handleFinalize = async () => {
    try {
      await axios.put(`/api/reports/${reportId}/finalize`);
      fetchReport();
    } catch (error) {
      console.error('Error finalizing report:', error);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewItemPhotos(prev => [...prev, ...files]);
    setPhotoComments(prev => [...prev, ...Array(files.length).fill('')]);
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/reports/${reportId}/`, {
        spread,
        inspector_name: inspectorName,
        date: inspectionDate,
      });
      alert('Report saved successfully.');
    } catch (error) {
      alert('Failed to save report.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/reports/${reportId}/`);
        alert('Report deleted.');
        navigate('/reports');
      } catch (error) {
        alert('Failed to delete report.');
      }
    }
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Unsaved changes will be lost.')) {
      navigate('/reports');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Start Station</TableCell>
              <TableCell>End Station</TableCell>
              <TableCell>Feature</TableCell>
              <TableCell>Issue</TableCell>
              <TableCell>Recommendations</TableCell>
              <TableCell>Photos</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.startStation}</TableCell>
                <TableCell>{item.endStation}</TableCell>
                <TableCell>{item.feature}</TableCell>
                <TableCell>{item.issue}</TableCell>
                <TableCell>{item.recommendations}</TableCell>
                <TableCell>
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
                <TableCell>
                  <IconButton onClick={() => setEditingItem(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!report?.finalized && (
        <Paper sx={{ mt: 3, p: 3, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Item
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Spread"
              value={spread}
              onChange={e => setSpread(e.target.value)}
            />
            <TextField
              label="Inspector Name"
              value={inspectorName}
              onChange={e => setInspectorName(e.target.value)}
            />
            <TextField
              label="Date"
              type="date"
              value={inspectionDate}
              onChange={e => setInspectionDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Start Station"
                value={newItem.startStation}
                onChange={(e) => setNewItem({ ...newItem, startStation: e.target.value })}
                fullWidth
              />
              <TextField
                label="End Station"
                value={newItem.endStation}
                onChange={(e) => setNewItem({ ...newItem, endStation: e.target.value })}
                fullWidth
              />
              <TextField
                label="Feature"
                value={newItem.feature}
                onChange={(e) => setNewItem({ ...newItem, feature: e.target.value })}
                fullWidth
              />
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Issue"
              value={newItem.issue}
              onChange={(e) => setNewItem({ ...newItem, issue: e.target.value })}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <TextField
              label="Recommendations"
              value={newItem.recommendations}
              onChange={(e) => setNewItem({ ...newItem, recommendations: e.target.value })}
              multiline
              rows={3}
              fullWidth
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Photos
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoIcon />}
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
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {newItemPhotos.map((photo, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 1,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${idx + 1}`}
                      style={{
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

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={handleAddItem}>
              Add Item
            </Button>
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3, width: '100%' }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button
          variant="outlined"
          color="success"
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          onClick={handleExit}
        >
          Exit
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleFinalize}
          sx={{ ml: 'auto' }}
        >
          Submit
        </Button>
      </Box>

      <Dialog open={!!editingItem} onClose={() => setEditingItem(null)}>
        <DialogTitle>Edit Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
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
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {newItemPhotos.map((photo, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 1,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${idx + 1}`}
                        style={{
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingItem(null)}>Cancel</Button>
          <Button onClick={handleEditItem} variant="contained">
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
    </Box>
  );
};

export default NewPunchlistReport; 