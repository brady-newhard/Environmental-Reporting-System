import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import PageHeader from '../../../common/PageHeader';

const NewProgressReport = () => {
  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title="New Progress Report" />
      <Paper sx={{ p: 3 }}>
        <Typography>New progress report form content will go here</Typography>
      </Paper>
    </Box>
  );
};

export default NewProgressReport; 