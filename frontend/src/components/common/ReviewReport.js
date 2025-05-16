import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReviewReport = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Review Report
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Report review content will go here</Typography>
      </Paper>
    </Box>
  );
};

export default ReviewReport; 