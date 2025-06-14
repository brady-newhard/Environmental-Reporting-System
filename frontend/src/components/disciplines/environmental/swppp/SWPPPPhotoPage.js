import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ReportPhotoSection from '../../../common/ReportPhotoSection';
import { useParams } from 'react-router-dom';

const SWPPPPhotoPage = () => {
  const { reportId } = useParams();
  const [photos, setPhotos] = useState([]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        SWPPP Report Photos
      </Typography>
      <ReportPhotoSection
        photos={photos}
        onPhotosChange={setPhotos}
        content_type="swppp"
        object_id={reportId}
        editable={true}
      />
    </Box>
  );
};

export default SWPPPPhotoPage; 