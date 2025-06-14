import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  Grid
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';

const PhotoUploadDialog = ({ open, onClose, onSave, initialPhotos = [], initialComments = [] }) => {
  const [photos, setPhotos] = useState(initialPhotos);
  const [comments, setComments] = useState(initialComments);

  console.log('PhotoUploadDialog loaded', photos);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...newFiles]);
    setComments(prev => [...prev, ...newFiles.map(() => '')]);
  };

  const handleCommentChange = (index, value) => {
    const newComments = [...comments];
    newComments[index] = value;
    setComments(newComments);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setComments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(photos, comments);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <Typography variant="h6" component="div">
          Upload Photos
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="photo-upload"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="contained"
              component="span"
              sx={{ mb: 2 }}
            >
              Add Photos
            </Button>
          </label>
        </Box>
        <Grid container spacing={2}>
          {photos.map((photo, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  position: 'relative',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1
                }}
              >
                <Box
                  component="img"
                  src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                  alt={`Preview ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mb: 1
                  }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Photo Comment"
                  value={comments[index] || ''}
                  onChange={(e) => handleCommentChange(index, e.target.value)}
                  sx={{ mb: 1 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemovePhoto(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper'
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoUploadDialog; 