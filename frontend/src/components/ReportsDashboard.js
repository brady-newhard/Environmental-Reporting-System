import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Container,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  FormatListBulleted as ListIcon,
  TrendingUp as ProgressIcon,
  Warning as VarianceIcon,
  Water as SWPPPIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PunchlistReport from './PunchlistReport';
import { ProgressChartTable } from './ProgressChart';

const DraftReportItem = ({ report, onDelete, onSelect, isSelected }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ListItem 
      button 
      onClick={() => onSelect(report)}
      selected={isSelected}
      sx={{
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        py: isMobile ? 2 : 1,
      }}
    >
      <ListItemText
        primary={report.report_type || 'Daily Report'}
        secondary={`Created: ${new Date(report.date).toLocaleDateString()}`}
        sx={{
          mb: isMobile ? 1 : 0,
          '& .MuiTypography-root': {
            fontSize: isMobile ? '0.9rem' : '1rem',
          }
        }}
      />
      <ListItemSecondaryAction sx={{
        position: isMobile ? 'relative' : 'absolute',
        right: isMobile ? 0 : 16,
        top: isMobile ? 'auto' : '50%',
        transform: isMobile ? 'none' : 'translateY(-50%)',
        display: 'flex',
        gap: 1,
      }}>
        <IconButton
          edge="end"
          onClick={() => navigate(`/new-report/${report.id}`)}
          size={isMobile ? "small" : "medium"}
        >
          <EditIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
        <IconButton
          edge="end"
          onClick={() => onDelete(report.id)}
          size={isMobile ? "small" : "medium"}
        >
          <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const ReportTypeCard = ({ title, icon: IconComponent, description, path }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isProgress = title === 'Progress Report';
  const progressPath = '/new-progress-report';

  return (
    <Card sx={{
      height: isMobile ? 180 : 200,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#fff',
      borderRadius: '2px',
      '&:hover': {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    }}>
      <CardContent sx={{ 
        flex: 1,
        p: isMobile ? 1.5 : 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        '&:last-child': { pb: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          gap: 1,
          minHeight: isMobile ? 60 : 80
        }}>
          <IconComponent sx={{ 
            color: '#000000',
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            mt: 0.5,
            flexShrink: 0
          }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#000000', 
                fontWeight: 600,
                fontSize: isMobile ? '1rem' : '1.1rem',
                wordBreak: 'break-word',
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666666',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {description}
            </Typography>
          </Box>
          <IconButton
            size="small"
            sx={{ 
              color: '#666666',
              mt: 0.5,
              flexShrink: 0,
              p: isMobile ? 0.5 : 1
            }}
            onClick={() => navigate(isProgress ? progressPath : path)}
          >
            <ChevronRightIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </Box>
      </CardContent>
      <Box sx={{ p: isMobile ? 1.5 : 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(isProgress ? progressPath : path)}
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#333333' },
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 500,
            height: isMobile ? 32 : 36,
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}
        >
          Create {title}
        </Button>
      </Box>
    </Card>
  );
};

const ReportsDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [draftReports, setDraftReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchDraftReports = async () => {
      try {
        const response = await api.get('/reports/');
        setDraftReports(response.data);
      } catch (error) {
        console.error('Error fetching draft reports:', error);
      }
    };

    fetchDraftReports();
  }, []);

  const handleDeleteDraft = async (reportId) => {
    try {
      await api.delete(`/reports/${reportId}/`);
      setDraftReports(draftReports.filter(report => report.id !== reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error deleting draft report:', error);
      alert('Error deleting draft report. Please try again.');
    }
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
  };

  const reportTypes = [
    {
      title: 'Daily Report',
      icon: DescriptionIcon,
      description: 'Create a daily inspection report.',
      path: '/new-report',
    },
    {
      title: 'Progress Report',
      icon: ProgressIcon,
      description: 'Document project progress.',
      path: '/new-progress-report',
    },
    {
      title: 'Punch List',
      icon: ListIcon,
      description: 'Track punch list items.',
      path: '/new-punchlist',
    },
    {
      title: 'Variance Report',
      icon: VarianceIcon,
      description: 'Report project variances.',
      path: '/new-report',
    },
    {
      title: 'SWPPP Report',
      icon: SWPPPIcon,
      description: 'SWPPP compliance report.',
      path: '/swppp/new',
    },
    {
      title: 'FERC Weekly Report',
      icon: AssignmentIcon,
      description: 'Submit FERC weekly report.',
      path: '/ferc-weekly-report',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ 
      px: { xs: 1, sm: 2, md: 3 },
      py: { xs: 1, sm: 2 },
      height: '100%',
      overflow: 'auto'
    }}>
      <Box sx={{ 
        mt: { xs: 1, sm: 2, md: 3 },
        mb: { xs: 2, sm: 3, md: 4 }
      }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
            fontWeight: 600,
            color: '#000000'
          }}
        >
          Reports Dashboard
        </Typography>
        
        {/* Draft Reports Section */}
        {draftReports.length > 0 && (
          <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1, 
                color: '#000000',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Draft Reports
            </Typography>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <List>
                  {draftReports.map((report) => (
                    <React.Fragment key={report.id}>
                      <DraftReportItem 
                        report={report} 
                        onDelete={handleDeleteDraft}
                        onSelect={handleSelectReport}
                        isSelected={selectedReport?.id === report.id}
                      />
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Punchlist Container */}
        {selectedReport && (
          <Paper sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            mb: { xs: 2, sm: 3, md: 4 },
            borderRadius: 1
          }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 600,
                color: '#000000'
              }}
            >
              Punchlist Report for {selectedReport.report_type || 'Daily Report'}
            </Typography>
            <PunchlistReport reportId={selectedReport.id} />
          </Paper>
        )}

        {/* Create New Report Section */}
        <Typography 
          variant="h5" 
          sx={{ 
            mb: { xs: 1.5, sm: 2 }, 
            color: '#000000',
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Create New Report
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: { xs: 1.5, sm: 2 },
          width: '100%'
        }}>
          {reportTypes.map((type, index) => (
            <Box key={index}>
              <ReportTypeCard {...type} />
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default ReportsDashboard; 