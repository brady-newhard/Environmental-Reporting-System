import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Badge,
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

const ReportTypeCard = ({ title, icon: Icon, description, path, draftPath, draftCount, onCreate }) => {
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
      pb: 3,
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
            mb: 0.5,
          }}
        >
          {description}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={onCreate ? onCreate : () => navigate(path)}
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
            mb: 0.1,
          }}
        >
          Create New Report
        </Button>
        {draftPath && (
          <Typography
            variant="body2"
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              textAlign: 'center',
              mt: 0.5,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            onClick={() => navigate(draftPath)}
          >
            {draftCount > 0 ? (
              <Badge badgeContent={draftCount} color="error">
                <span style={{ fontWeight: 500 }}>View Draft Reports</span>
              </Badge>
            ) : (
              <span style={{ fontWeight: 500 }}>View Draft Reports</span>
            )}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const EnvironmentalReports = () => {
  const navigate = useNavigate();
  const [swpppDraftCount, setSwpppDraftCount] = useState(0);
  const [dailyDraftCount, setDailyDraftCount] = useState(0);
  const [punchlistDraftCount, setPunchlistDraftCount] = useState(0);

  useEffect(() => {
    const swpppDrafts = Object.keys(localStorage)
      .filter(key => key.startsWith('swppp_draft_'))
      .length;
    setSwpppDraftCount(swpppDrafts);

    const dailyDrafts = Object.keys(localStorage)
      .filter(key => key.startsWith('daily_draft_'))
      .length;
    setDailyDraftCount(dailyDrafts);

    const punchlistDrafts = Object.keys(localStorage)
      .filter(key => key.startsWith('punchlist_draft_'))
      .length;
    setPunchlistDraftCount(punchlistDrafts);
  }, []);

  const handleCreateNewPunchlist = () => {
    localStorage.removeItem('punchlist_current_draftId');
    navigate('/new-punchlist');
  };

  const reportTypes = [
    {
      title: "Daily Report",
      icon: ReportIcon,
      description: "Activities and Compliance.",
      path: "/new-report",
      draftPath: "/daily-drafts",
      draftCount: dailyDraftCount
    },
    {
      title: "SWPPP Report",
      icon: SWPPPIcon,
      description: "State SWPPP Inspection",
      path: "/swppp/new",
      draftPath: "/swppp-drafts",
      draftCount: swpppDraftCount
    },
    {
      title: "Environmental Punchlist",
      icon: PunchlistIcon,
      description: "Environmental Compliance Items",
      path: "/new-punchlist",
      draftPath: "/punchlist-drafts",
      draftCount: punchlistDraftCount,
      onCreate: handleCreateNewPunchlist
    },
    {
      title: "Progress Report",
      icon: ProgressIcon,
      description: "Project Progress Chart",
      path: "/new-progress-report"
    },
    {
      title: "Variance Report",
      icon: VarianceIcon,
      description: "Plan Deviations & Requests",
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
            draftPath={type.draftPath}
            draftCount={type.draftCount}
            onCreate={type.onCreate}
          />
        ))}
      </Box>
    </Box>
  );
};

export default EnvironmentalReports; 