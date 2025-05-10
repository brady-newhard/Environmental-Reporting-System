import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import {
  Assignment as ReportIcon,
  WaterDrop as SWPPPIcon,
  ListAlt as PunchlistIcon,
  Timeline as ProgressIcon,
  Report as VarianceIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';

const ReportTypeCard = ({ title, icon: Icon, description, path }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{
      height: 200,
      width: '100%',
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
          <Icon sx={{ 
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
            {title}
          </Typography>
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666666',
            flex: 1,
          }}
        >
          {description}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(path)}
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
  );
};

const EnvironmentalReports = () => {
  const navigate = useNavigate();
  const reportTypes = [
    {
      title: "Daily Environmental Report",
      icon: ReportIcon,
      description: "Create a new daily environmental inspection report for site conditions and compliance.",
      path: "/new-report"
    },
    {
      title: "SWPPP Inspection",
      icon: SWPPPIcon,
      description: "Conduct a new Storm Water Pollution Prevention Plan inspection.",
      path: "/swppp/new"
    },
    {
      title: "Environmental Punchlist",
      icon: PunchlistIcon,
      description: "Create a new punchlist for environmental compliance items.",
      path: "/new-punchlist"
    },
    {
      title: "Progress Report",
      icon: ProgressIcon,
      description: "Document project progress, milestones, and environmental achievements.",
      path: "/new-progress-report"
    },
    {
      title: "Variance Report",
      icon: VarianceIcon,
      description: "Report and track environmental variances, deviations, and corrective actions.",
      path: "/variance/new"
    }
  ];

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      bgcolor: '#f5f5f5', 
      minHeight: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <PageHeader 
        title="Create Environmental Report" 
        backPath="/environmental"
      />
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}>
        {reportTypes.map((type, index) => (
          <ReportTypeCard
            key={index}
            title={type.title}
            icon={type.icon}
            description={type.description}
            path={type.path}
          />
        ))}
      </Box>
    </Box>
  );
};

export default EnvironmentalReports; 