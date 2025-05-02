import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PhotosPage = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [openCamera, setOpenCamera] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [location, setLocation] = useState('');
  const [comments, setComments] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      location: '',
      comments: ''
    }));
    setPhotos([...photos, ...newPhotos]);
  };

  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setOpenCamera(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        const newPhoto = {
          id: Date.now(),
          file: blob,
          preview: URL.createObjectURL(blob),
          location: '',
          comments: ''
        };
        setPhotos([...photos, newPhoto]);
        setOpenCamera(false);
      }, 'image/jpeg');
    }
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setLocation(photo.location || '');
    setComments(photo.comments || '');
  };

  const handleSaveDetails = () => {
    if (selectedPhoto) {
      const updatedPhotos = photos.map(photo => 
        photo.id === selectedPhoto.id 
          ? { ...photo, location, comments }
          : photo
      );
      setPhotos(updatedPhotos);
      setSelectedPhoto(null);
      setLocation('');
      setComments('');
    }
  };

  const handleDeletePhoto = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };

  const handleReviewClick = () => {
    // Store photos in localStorage
    localStorage.setItem('reportPhotos', JSON.stringify(photos));
    navigate('/review-report');
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate('/new-report')}
          sx={{
            mr: 2,
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#333333' },
            color: '#ffffff'
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ color: '#000000', fontWeight: 600 }}>
          Add Photos
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddPhotoIcon />}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#333333' },
            color: '#ffffff'
          }}
        >
          Add Photos
        </Button>
        <Button
          variant="contained"
          startIcon={<CameraIcon />}
          onClick={handleCameraClick}
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#333333' },
            color: '#ffffff'
          }}
        >
          Take Photo
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          multiple
          onChange={handleFileUpload}
        />
      </Box>

      {/* Photo Grid */}
      <Grid container spacing={3}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo.id}>
            <Paper
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { boxShadow: 3 }
              }}
              onClick={() => handlePhotoClick(photo)}
            >
              <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                <img
                  src={photo.preview}
                  alt="Uploaded"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo.id);
                  }}
                >
                  <DeleteIcon sx={{ color: '#ffffff' }} />
                </IconButton>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" />
                  {photo.location || 'No location set'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {photo.comments || 'No comments'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Camera Dialog */}
      <Dialog open={openCamera} onClose={() => setOpenCamera(false)} maxWidth="md">
        <DialogTitle>Take Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', width: '100%', paddingTop: '75%' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCamera(false)}>Cancel</Button>
          <Button onClick={capturePhoto} variant="contained">Capture</Button>
        </DialogActions>
      </Dialog>

      {/* Photo Details Dialog */}
      <Dialog 
        open={!!selectedPhoto} 
        onClose={() => setSelectedPhoto(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Photo Details</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ 
              width: '100%', 
              height: '400px', 
              position: 'relative',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <img
                src={selectedPhoto?.preview}
                alt="Selected"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
              <TextField
                fullWidth
                label="Comments"
                multiline
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPhoto(null)}>Cancel</Button>
          <Button onClick={handleSaveDetails} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/report-form')}
          sx={{
            backgroundColor: '#666666',
            '&:hover': { backgroundColor: '#444444' },
            color: '#ffffff'
          }}
        >
          Back to Form
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={handleReviewClick}
            sx={{
              backgroundColor: '#000000',
              '&:hover': { backgroundColor: '#333333' },
              color: '#ffffff'
            }}
          >
            Review Report
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PhotosPage; 