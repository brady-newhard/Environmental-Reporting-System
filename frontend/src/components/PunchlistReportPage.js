import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import PunchlistReport from './PunchlistReport';

const PunchlistReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4 }}>
      <Button variant="outlined" onClick={() => navigate('/reports-dashboard')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Punchlist Report
        </Typography>
        <PunchlistReport reportId={id} />
      </Paper>
    </Box>
  );
};

export default PunchlistReportPage; 