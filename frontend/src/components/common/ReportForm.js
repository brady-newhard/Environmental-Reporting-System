import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReportForm = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Report Form
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Report form content will go here</Typography>
      </Paper>
    </Box>
  );
};

export default ReportForm; 