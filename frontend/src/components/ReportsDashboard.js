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

  return (
    <Card sx={{ 
      height: '100%', 
      bgcolor: '#fff',
      borderRadius: '2px',
      '&:hover': {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ color: '#000000', mr: 1 }} />
          <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600, flex: 1 }}>
            {title}
          </Typography>
          <IconButton 
            size="small" 
            sx={{ color: '#666666' }}
            onClick={() => navigate(path)}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
          {description}
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(path)}
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
      </CardContent>
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
      description: 'Create a daily site inspection report with weather conditions and observations.',
      path: '/new-report',
    },
    {
      title: 'Progress Report',
      icon: ProgressIcon,
      description: 'Document project progress, milestones, and upcoming tasks.',
      path: '/new-report',
    },
    {
      title: 'Punch List',
      icon: ListIcon,
      description: 'Track and manage items that need attention or completion.',
      path: '/new-punchlist',
    },
    {
      title: 'Variance Report',
      icon: VarianceIcon,
      description: 'Report and document any deviations from the project plan.',
      path: '/new-report',
    },
    {
      title: 'SWPPP Report',
      icon: SWPPPIcon,
      description: 'Storm Water Pollution Prevention Plan compliance documentation.',
      path: '/new-report',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reports Dashboard
        </Typography>
        
        {/* Draft Reports Section */}
        {draftReports.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                color: '#000000',
                fontWeight: 600
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
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Punchlist Report for {selectedReport.report_type || 'Daily Report'}
            </Typography>
            <PunchlistReport reportId={selectedReport.id} />
          </Paper>
        )}

        {/* Create New Report Section */}
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            color: '#000000',
            fontWeight: 600
          }}
        >
          Create New Report
        </Typography>
        <Grid container spacing={3}>
          {reportTypes.map((reportType) => (
            <Grid item xs={12} sm={6} md={4} key={reportType.title}>
              <ReportTypeCard {...reportType} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default ReportsDashboard; 