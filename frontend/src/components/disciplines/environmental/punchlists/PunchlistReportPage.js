import React, { useState } from 'react';
import { TextField, Box, Typography } from '@mui/material';
import { PhotoPreviewDialog } from '../../../common/PhotoPreviewDialog';

const PunchlistReportPage = () => {
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [previewPhotoIdx, setPreviewPhotoIdx] = useState(null);
  const [previewPhotoComments, setPreviewPhotoComments] = useState([]);
  const [previewItemIdx, setPreviewItemIdx] = useState(null);

  const handlePreviewClick = (idx) => {
    setPreviewPhotoIdx(idx);
    setPreviewItemIdx(null);
  };

  const handleItemClick = (idx) => {
    setPreviewItemIdx(idx);
  };

  return (
    <div>
      {/* Render your table and other components here */}

      {previewPhotoIdx !== null && (
        <div>
          <img src={previewPhotos[previewPhotoIdx]} alt="Large Preview" style={{ width: '100%', maxWidth: 400, maxHeight: '60vh', objectFit: 'contain' }} />
          {previewItemIdx === null ? (
            <TextField
              label="Comments"
              value={previewPhotoComments[previewPhotoIdx] || ''}
              onChange={(e) => {
                const newComments = [...previewPhotoComments];
                newComments[previewPhotoIdx] = e.target.value;
                setPreviewPhotoComments(newComments);
              }}
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 2 }}
            />
          ) : (
            previewPhotoComments[previewPhotoIdx] && (
              <Box sx={{ mt: 2, width: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Comments:</Typography>
                <Typography variant="body2">{previewPhotoComments[previewPhotoIdx]}</Typography>
              </Box>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default PunchlistReportPage; 