import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PageHeader from '../../../common/PageHeader';

const NewVarianceReport = () => {
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="New Variance Report" />
      <Paper sx={{ p: 3 }}>
        <Typography>New variance report form content will go here</Typography>
      </Paper>
    </Box>
  );
};

export default NewVarianceReport; 