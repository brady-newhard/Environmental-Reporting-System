import React from 'react';
import { Box, Card, CardContent, Typography, Button, Link } from '@mui/material';
import { Assignment as DailyReportIcon, Drafts as DraftsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import Badge from '@mui/material/Badge';

const ReportCard = ({ title, icon: Icon, description, path, secondaryAction }) => {
  const navigate = useNavigate();
  const [draftCount, setDraftCount] = React.useState(0);

  React.useEffect(() => {
    if (secondaryAction) {
      const drafts = JSON.parse(localStorage.getItem('dailyCoatingReportDrafts') || '[]');
      setDraftCount(drafts.length);
    }
  }, [secondaryAction]);

  const handleFillOut = () => {
    navigate(path);
  };

  const handleViewDrafts = () => {
    navigate(secondaryAction.path);
  };

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

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleFillOut}
            sx={{
              bgcolor: '#000',
              color: '#fff',
              '&:hover': {
                bgcolor: '#222',
              },
            }}
          >
            Fill Out
          </Button>
          {secondaryAction && (
            <Button
              variant="outlined"
              onClick={handleViewDrafts}
              sx={{
                borderColor: '#000',
                color: '#000',
                '&:hover': {
                  borderColor: '#222',
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Badge badgeContent={draftCount} color="error" sx={{ mr: 1 }}>
                {secondaryAction.text}
              </Badge>
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const CoatingReports = () => {
  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      minHeight: 'calc(100vh - 64px)', 
      overflow: 'auto' 
    }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Coating Reports" backPath="/coating" />
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)' 
          }, 
          gap: 3 
        }}>
          <ReportCard
            title="Daily Coating Report"
            icon={DailyReportIcon}
            description="Complete the daily coating report for pipelines."
            path="/coating/reports/daily"
            secondaryAction={{
              text: "View Draft Reports",
              path: "/coating/reports/drafts"
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CoatingReports; 