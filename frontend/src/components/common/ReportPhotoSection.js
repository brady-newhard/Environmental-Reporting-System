import React, { useRef, useState } from 'react';
import { Box, Button, IconButton, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Paper, Snackbar, Alert } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import heic2any from 'heic2any';

const ReportPhotoSection = ({ photos = [], onPhotosChange, editable = true }) => {
  const fileInputRef = useRef();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fullSizePhoto, setFullSizePhoto] = useState(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

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

  // Function to convert HEIC/HEIF to JPEG using heic2any
  const convertHeicToJpg = async (file) => {
    try {
      // heic2any returns a Blob or an array of Blobs
      const result = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      });
      // If result is an array, take the first element
      const jpgBlob = Array.isArray(result) ? result[0] : result;
      // Create a new File object from the converted blob
      const convertedFile = new File([jpgBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
        type: 'image/jpeg'
      });
      return convertedFile;
    } catch (error) {
      setAlert({
        open: true,
        message: 'Unable to convert HEIC file. Please convert it to JPEG/PNG before uploading.',
        severity: 'warning'
      });
      return null;
    }
  };

  // Function to process each file
  const processImage = async (file) => {
    const isHeic = file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif') ||
      file.type === 'image/heic' ||
      file.type === 'image/heif';
    if (isHeic) {
      const converted = await convertHeicToJpg(file);
      return converted;
    }
    // For non-HEIC files, just return the original file
    return file;
  };

  // Handle file input change
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const processedFiles = await Promise.all(files.map(processImage));
    // Filter out null values (failed conversions)
    const validFiles = processedFiles.filter(file => file !== null);
    if (validFiles.length === 0) {
      setAlert({
        open: true,
        message: 'No valid files to upload. Please convert HEIC files to JPEG/PNG before uploading.',
        severity: 'error'
      });
      return;
    }
    // Convert files to data URLs and add to photos
    const newPhotos = await Promise.all(validFiles.map(async file => {
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

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
          {photos.map((photo, idx) => {
            let src = '';
            if (photo.file instanceof File || photo.file instanceof Blob) {
              src = URL.createObjectURL(photo.file);
            } else if (typeof photo.file === 'string') {
              src = photo.file;
            }
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
                  width: { xs: '100%', sm: '50%' },
                  flex: { xs: '0 0 100%', sm: '0 0 50%' },
                  boxSizing: 'border-box',
                  justifyContent: 'flex-start',
                  overflow: 'hidden',
                  mb: 2,
                }}
              >
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
              </Paper>
            );
          })}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
          {photos.map((photo, idx) => {
            let src = '';
            if (photo.file instanceof File || photo.file instanceof Blob) {
              src = URL.createObjectURL(photo.file);
            } else if (typeof photo.file === 'string') {
              src = photo.file;
            }
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
                  width: { xs: '100%', sm: '50%' },
                  flex: { xs: '0 0 100%', sm: '0 0 50%' },
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
      {/* Add Snackbar for alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportPhotoSection; 