import React, { useRef, useState } from 'react';
import { Box, Button, IconButton, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Paper } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';

const ReportPhotoSection = ({ photos = [], onPhotosChange, editable = true }) => {
  const fileInputRef = useRef();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fullSizePhoto, setFullSizePhoto] = useState(null);
  const [promptOpen, setPromptOpen] = useState(false);

  // Handle add photo prompt
  const handleAddPhotoClick = () => {
    setPromptOpen(true);
  };

  const handlePromptClose = () => setPromptOpen(false);

  const handlePromptSelect = (mode) => {
    setPromptOpen(false);
    if (mode === 'camera') {
      fileInputRef.current.setAttribute('capture', 'environment');
    } else {
      fileInputRef.current.removeAttribute('capture');
    }
    fileInputRef.current.click();
  };

  // Utility to convert File to data URL
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file input
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    // Convert all files to data URLs
    const newPhotos = await Promise.all(files.map(async file => {
      const dataUrl = await fileToDataUrl(file);
      return { file: dataUrl, location: '', comment: '' };
    }));
    onPhotosChange([...photos, ...newPhotos]);
    e.target.value = '';
  };

  // Handle location/comment change
  const handleMetaChange = (idx, field, value) => {
    const updated = photos.map((p, i) => i === idx ? { ...p, [field]: value } : p);
    onPhotosChange(updated);
  };

  // Remove photo
  const handleRemove = (idx) => {
    const updated = photos.filter((_, i) => i !== idx);
    onPhotosChange(updated);
  };

  // Open full-size modal
  const handleThumbnailClick = (photo) => setFullSizePhoto(photo);
  const handleModalClose = () => setFullSizePhoto(null);

  return (
    <Box>
      {editable && (
        <>
          <Button
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={handleAddPhotoClick}
            sx={{ mb: 2 }}
          >
            Add Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            multiple
            onChange={handleFileChange}
          />
          <Dialog open={promptOpen} onClose={handlePromptClose}>
            <DialogTitle>Add Photo</DialogTitle>
            <DialogContent>
              <Button fullWidth onClick={() => handlePromptSelect('camera')} sx={{ mb: 1 }}>Take Photo</Button>
              <Button fullWidth onClick={() => handlePromptSelect('file')}>Upload from Device</Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={handlePromptClose}>Cancel</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      {/* Photo grid: flexbox for review mode, Grid for editable mode */}
      {editable ? (
        <Grid container spacing={2}>
          {photos.map((photo, idx) => {
            let src = '';
            if (photo.file instanceof File || photo.file instanceof Blob) {
              src = URL.createObjectURL(photo.file);
            } else if (typeof photo.file === 'string') {
              src = photo.file;
            }
            console.log('Photo object:', photo, 'Resolved src:', src);
            const isValidSrc = typeof src === 'string' && src.length > 0 && (src.startsWith('data:image/') || src.startsWith('http'));
            return (
              <Grid item xs={12} sm={6} key={idx}>
                <Paper sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  width: '100%',
                  maxWidth: 320,
                  minHeight: 320,
                  height: 320,
                  boxSizing: 'border-box',
                  justifyContent: 'flex-start',
                  overflow: 'hidden',
                }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 1,
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid #ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#fafafa'
                    }}
                    onClick={() => handleThumbnailClick(photo)}
                  >
                    {isValidSrc ? (
                      <img
                        src={src}
                        alt={`Photo ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography variant="caption" color="error">No image</Typography>
                    )}
                  </Box>
                  {editable ? (
                    <>
                      <TextField
                        label="Location"
                        value={photo.location}
                        onChange={e => handleMetaChange(idx, 'location', e.target.value)}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Comment"
                        value={photo.comment}
                        onChange={e => handleMetaChange(idx, 'comment', e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                      />
                      <IconButton onClick={() => handleRemove(idx)} color="error" sx={{ alignSelf: 'flex-end' }}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ width: '100%', wordBreak: 'break-word', whiteSpace: 'pre-line', mb: 1 }}><b>Location:</b> {photo.location}</Typography>
                      <Typography variant="body2" sx={{ width: '100%', wordBreak: 'break-word', whiteSpace: 'pre-line' }}><b>Comment:</b> {photo.comment}</Typography>
                    </>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          width: '100%',
        }}>
          {photos.map((photo, idx) => {
            let src = '';
            if (photo.file instanceof File || photo.file instanceof Blob) {
              src = URL.createObjectURL(photo.file);
            } else if (typeof photo.file === 'string') {
              src = photo.file;
            }
            console.log('Photo object:', photo, 'Resolved src:', src);
            const isValidSrc = typeof src === 'string' && src.length > 0 && (src.startsWith('data:image/') || src.startsWith('http'));
            return (
              <Paper
                key={idx}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  boxSizing: 'border-box',
                  justifyContent: 'flex-start',
                  overflow: 'hidden',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: 180,
                    mb: 1,
                    borderRadius: 1,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#fafafa'
                  }}
                  onClick={() => handleThumbnailClick(photo)}
                >
                  {isValidSrc ? (
                    <img
                      src={src}
                      alt={`Photo ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Typography variant="caption" color="error">No image</Typography>
                  )}
                </Box>
                <Typography variant="body2" sx={{ width: '100%', wordBreak: 'break-word', whiteSpace: 'pre-line', mb: 1 }}><b>Location:</b> {photo.location}</Typography>
                <Typography variant="body2" sx={{ width: '100%', wordBreak: 'break-word', whiteSpace: 'pre-line' }}><b>Comment:</b> {photo.comment}</Typography>
              </Paper>
            );
          })}
        </Box>
      )}
      {/* Full-size modal */}
      <Dialog open={!!fullSizePhoto} onClose={handleModalClose} maxWidth="md">
        {fullSizePhoto && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={fullSizePhoto.file instanceof File ? URL.createObjectURL(fullSizePhoto.file) : fullSizePhoto.file}
              alt="Full Size"
              style={{ maxWidth: '90vw', maxHeight: '70vh', borderRadius: 8 }}
            />
            {/* Always show location and comment */}
            <Typography variant="body2" sx={{ mt: 2 }}><b>Location:</b> {fullSizePhoto.location}</Typography>
            <Typography variant="body2"><b>Comment:</b> {fullSizePhoto.comment}</Typography>
            {/* Trashcan in modal if editable */}
            {editable && (
              <IconButton
                color="error"
                sx={{ mt: 2 }}
                onClick={() => {
                  const idx = photos.findIndex(p => p.file === fullSizePhoto.file);
                  handleRemove(idx);
                  handleModalClose();
                }}
                aria-label="Delete Photo"
              >
                <DeleteIcon />
              </IconButton>
            )}
            <Button onClick={handleModalClose} sx={{ mt: 2 }}>Close</Button>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default ReportPhotoSection; 