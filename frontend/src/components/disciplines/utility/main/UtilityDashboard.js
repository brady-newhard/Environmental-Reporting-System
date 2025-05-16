import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import PageHeader from '../../../../components/common/PageHeader';

const UtilityDashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      minHeight: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader 
          title="Utility Dashboard"
          backPath="/"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#fff',
              borderRadius: '8px',
              '&:hover': {
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease',
              },
            }}>
              <CardContent sx={{ 
                flex: 1,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                '&:last-child': { pb: 2 }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 2,
                }}>
                  <AddIcon sx={{ 
                    color: '#000000',
                    fontSize: '2rem',
                  }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#000000', 
                      fontWeight: 600,
                      fontSize: '1.25rem',
                    }}
                  >
                    New Utility Report
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666666',
                    flex: 1,
                  }}
                >
                  Create a new daily utility report to document equipment status, maintenance activities, and any issues encountered.
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/utility/reports/daily/new')}
                  sx={{
                    backgroundColor: '#000000',
                    '&:hover': { 
                      backgroundColor: '#333333',
                      transform: 'scale(1.02)',
                      transition: 'all 0.2s ease',
                    },
                    color: '#ffffff',
                    fontWeight: 500,
                    height: 40,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                  }}
                >
                  Create New Report
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default UtilityDashboard; 