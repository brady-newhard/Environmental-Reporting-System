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

  return (
    <ListItem 
      button 
      onClick={() => onSelect(report)}
      selected={isSelected}
    >
      <ListItemText
        primary={report.report_type || 'Daily Report'}
        secondary={`Created: ${new Date(report.date).toLocaleDateString()}`}
      />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          onClick={() => navigate(`/new-report/${report.id}`)}
          sx={{ mr: 1 }}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          edge="end"
          onClick={() => onDelete(report.id)}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const ReportTypeCard = ({ title, icon: Icon, description, path }) => {
  const navigate = useNavigate();
  const isProgress = title === 'Progress Report';
  const progressPath = '/new-progress-report';

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      bgcolor: '#fff',
      borderRadius: '2px',
      '&:hover': {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ color: '#000000', mr: 1 }} />
          <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600, flex: 1 }}>
            {title}
          </Typography>
          <IconButton
            size="small"
            sx={{ color: '#666666' }}
            onClick={() => navigate(isProgress ? progressPath : path)}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ color: '#666666', mb: 2, minHeight: 32, maxHeight: 32, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {description}
        </Typography>
      </CardContent>
      <Box sx={{ px: 2, pb: 2 }}>
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
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
          Reports Dashboard
        </Typography>
        
        {/* Draft Reports Section */}
        {draftReports.length > 0 && (
          <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
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
          <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3, md: 4 } }}>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Punchlist Report for {selectedReport.report_type || 'Daily Report'}
            </Typography>
            <PunchlistReport reportId={selectedReport.id} />
          </Paper>
        )}

        {/* Create New Report Section */}
        <Typography 
          variant="h5" 
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            color: '#000000',
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Create New Report
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: { xs: 2, sm: 3 },
            width: '100%',
          }}
        >
          {reportTypes.map((reportType) => (
            <Box
              key={reportType.title}
              sx={{
                height: { xs: 220, sm: 240, md: 260 },
                display: 'flex',
                alignItems: 'stretch',
              }}
            >
              <ReportTypeCard {...reportType} />
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default ReportsDashboard; 