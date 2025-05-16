import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SWPPPPhotoPage = () => {
  const { reportId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ file: null, location: '', description: '' });

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(`/api/environmental/swppp/reports/${reportId}/photos/`);
        setPhotos(response.data);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [reportId]);

  const handleFileChange = (e) => {
    setNewPhoto((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPhoto((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async () => {
    if (!newPhoto.file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', newPhoto.file);
    formData.append('location', newPhoto.location);
    formData.append('description', newPhoto.description);
    try {
      await axios.post(`/api/environmental/swppp/reports/${reportId}/photos/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Refresh photo list
      const response = await axios.get(`/api/environmental/swppp/reports/${reportId}/photos/`);
      setPhotos(response.data);
      setNewPhoto({ file: null, location: '', description: '' });
    } catch (error) {
      alert('Error uploading photo.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    try {
      await axios.delete(`/api/environmental/swppp/reports/${reportId}/photos/${photoId}/`);
      setPhotos(photos.filter((p) => p.id !== photoId));
    } catch (error) {
      alert('Error deleting photo.');
      console.error(error);
    }
  };

  if (loading) {
    return <Typography sx={{ mt: 4 }}>Loading photos...</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        SWPPP Report Photos
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        {/* Photo Upload Form */}
        <Typography variant="h6" gutterBottom>Upload New Photo</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Button variant="contained" component="label">
            Choose File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          <TextField label="Location" name="location" value={newPhoto.location} onChange={handleInputChange} />
          <TextField label="Description" name="description" value={newPhoto.description} onChange={handleInputChange} />
          <Button variant="contained" color="primary" onClick={handleUpload} disabled={uploading || !newPhoto.file}>
            Upload
          </Button>
        </Box>
        {/* List of Uploaded Photos */}
        <Typography variant="h6" gutterBottom>Uploaded Photos</Typography>
        <List>
          {photos.length === 0 && <ListItem><ListItemText primary="No photos uploaded." /></ListItem>}
          {photos.map((photo) => (
            <ListItem key={photo.id} secondaryAction={
              <IconButton edge="end" color="error" onClick={() => handleDelete(photo.id)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemText
                primary={`Location: ${photo.location}`}
                secondary={
                  <>
                    {photo.description && <span>Description: {photo.description}<br /></span>}
                    {photo.image && <img src={photo.image} alt="SWPPP" style={{ maxWidth: 200, maxHeight: 120 }} />}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default SWPPPPhotoPage; 