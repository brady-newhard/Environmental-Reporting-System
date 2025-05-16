import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ProgressChart = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Progress Chart
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Progress chart content will go here</Typography>
      </Paper>
    </Box>
  );
};

export default ProgressChart; 