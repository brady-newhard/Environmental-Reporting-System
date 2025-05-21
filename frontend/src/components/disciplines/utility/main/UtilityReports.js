import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import PageHeader from '../../../../components/common/PageHeader';
import Badge from '@mui/material/Badge';

const UtilityReports = () => {
  const navigate = useNavigate();
  const [payloadDraftCount, setPayloadDraftCount] = React.useState(0);
  const [i3DraftCount, setI3DraftCount] = React.useState(0);

  React.useEffect(() => {
    // Count drafts for Payload (DailyUtilityReport)
    const payloadDrafts = Object.keys(localStorage).filter(key => key.startsWith('daily_utility_draft_'));
    setPayloadDraftCount(payloadDrafts.length);
    // Count drafts for I3
    const i3Drafts = Object.keys(localStorage).filter(key => key.startsWith('i3_daily_utility_draft_'));
    setI3DraftCount(i3Drafts.length);
  }, []);

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      minHeight: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader 
          title="Utility Reports"
          backPath="/utility"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
                    New Payload Report
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
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="text"
                    onClick={() => navigate('/utility/reports/daily/drafts')}
                    sx={{
                      color: '#000',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': { textDecoration: 'underline', background: 'none' },
                    }}
                  >
                    <Badge badgeContent={payloadDraftCount} color="error" overlap="circular" sx={{ '& .MuiBadge-badge': { right: -12, top: 6 } }}>
                      View Draft Reports
                    </Badge>
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, mt: { xs: 3, md: 0 } }}>
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
                    New I3 Daily Utility Report
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#666666', flex: 1 }}>
                  Create a new I3 daily utility report for detailed construction and environmental tracking.
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/utility/reports/daily/i3')}
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
                  Create I3 Report
                </Button>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="text"
                    onClick={() => navigate('/utility/reports/daily/i3/drafts')}
                    sx={{
                      color: '#000',
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': { textDecoration: 'underline', background: 'none' },
                    }}
                  >
                    <Badge badgeContent={i3DraftCount} color="error" overlap="circular" sx={{ '& .MuiBadge-badge': { right: -12, top: 6 } }}>
                      View Draft Reports
                    </Badge>
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UtilityReports; 