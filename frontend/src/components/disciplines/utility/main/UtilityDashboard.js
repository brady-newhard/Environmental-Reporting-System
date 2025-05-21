import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Description as DescriptionIcon } from '@mui/icons-material';
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
          backPath="/disciplines"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <Card sx={{ 
          mt: 2,
          bgcolor: '#fff',
          borderRadius: '8px',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        }}>
          <CardContent sx={{ 
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2,
            }}>
              <DescriptionIcon sx={{ 
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
                Reports
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666666',
              }}
            >
              Access and manage all utility reports including Payload and I3 Daily Utility Reports.
            </Typography>

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/utility/reports')}
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
              View Reports
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default UtilityDashboard; 