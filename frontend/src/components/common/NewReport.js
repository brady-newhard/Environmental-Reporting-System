import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const NewReport = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        New Report
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>New report form content will go here</Typography>
      </Paper>
    </Box>
  );
};

export default NewReport; 