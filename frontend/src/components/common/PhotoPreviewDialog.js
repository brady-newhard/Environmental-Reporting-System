import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const PhotoPreviewDialog = ({ open, onClose, photo }) => {
  if (!photo) return null;

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
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'background.paper'
      }}>
        <Typography variant="h6" component="div">
          Photo Preview
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
      <DialogContent sx={{ p: 0, bgcolor: 'background.paper' }}>
        <Box
          component="img"
          src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
          alt="Preview"
          sx={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PhotoPreviewDialog; 