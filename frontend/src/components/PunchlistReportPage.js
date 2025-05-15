import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import NewPunchlistReport from './NewPunchlistReport';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PunchlistReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton
          onClick={() => navigate('/project-documents')}
          sx={{
            bgcolor: 'black',
            color: 'white',
            mr: 2,
            '&:hover': { bgcolor: '#333' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom>
          Create New Punchlist
        </Typography>
      </Box>
      <Paper sx={{ p: 3 }}>
        <NewPunchlistReport reportId={id} />
      </Paper>
    </Box>
  );
};

export default PunchlistReportPage; 