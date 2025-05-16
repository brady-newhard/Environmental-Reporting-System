import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../common/PageHeader';
import AddIcon from '@mui/icons-material/Add';

const CoatingDailyReports = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <PageHeader 
        title="Daily Coating Reports" 
        backPath="/coating/reports"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/coating/reports/daily/new')}
            sx={{
              bgcolor: '#000000',
              '&:hover': {
                bgcolor: '#333333',
              },
            }}
          >
            New Report
          </Button>
        }
      />
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6">Daily Coating Reports</Typography>
        {/* Add your daily coating reports content here */}
      </Paper>
    </Box>
  );
};

export default CoatingDailyReports; 