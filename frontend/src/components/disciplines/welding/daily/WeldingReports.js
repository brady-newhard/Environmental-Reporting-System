import React from 'react';
import { Box, Card, CardContent, Typography, Button, Link } from '@mui/material';
import { Assignment as DailyReportIcon, Drafts as DraftsIcon, Build as StationReportIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../common/PageHeader';
import Badge from '@mui/material/Badge';

const ReportCard = ({ title, icon: Icon, description, path, secondaryAction, draftsKey }) => {
  const navigate = useNavigate();
  const [draftCount, setDraftCount] = React.useState(0);

  React.useEffect(() => {
    if (secondaryAction) {
      const prefix = draftsKey === 'dailyWeldingStationReportDrafts' 
        ? 'daily_welding_station_draft_'
        : 'daily_welding_draft_';
      const draftKeys = Object.keys(localStorage).filter(key => key.startsWith(prefix));
      setDraftCount(draftKeys.length);
    }
  }, [secondaryAction, draftsKey]);

  const handleFillOut = () => {
    // Clear any existing draft ID from URL
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
      pb: 2,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Icon sx={{ color: '#000000', fontSize: '2rem' }} />
          <Typography variant="h6" sx={{ color: '#000000', fontWeight: 600, fontSize: '1.25rem' }}>{title}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#666666', flex: 1 }}>{description}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleFillOut}
            sx={{
              backgroundColor: '#000000',
              '&:hover': { backgroundColor: '#333333', transform: 'scale(1.02)', transition: 'all 0.2s ease' },
              color: '#ffffff',
              fontWeight: 500,
              height: 40,
              fontSize: '0.875rem',
              textTransform: 'none',
              mt: 0
            }}
          >
            Create New Report
          </Button>
        </Box>
        {secondaryAction && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5, mb: 0 }}>
            <Badge badgeContent={draftCount} color="error" sx={{ '& .MuiBadge-badge': { right: -18, top: 8 } }}>
              <Link
                component="button"
                variant="body2"
                onClick={handleViewDrafts}
                sx={{
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: '#666666',
                  '&:hover': { color: '#000000' },
                  fontWeight: 500
                }}
              >
                {secondaryAction.text}
              </Link>
            </Badge>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const WeldingReports = () => {
  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      minHeight: 'calc(100vh - 64px)', 
      overflow: 'auto' 
    }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Welding Reports" backPath="/welding" />
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)' 
          }, 
          gap: 3 
        }}>
          <ReportCard
            title="Daily Weld Report"
            icon={DailyReportIcon}
            description="Complete the daily weld report for pipelines."
            path="/welding/reports/daily"
            secondaryAction={{
              text: "View Draft Reports",
              path: "/welding/reports/drafts"
            }}
          />
          <ReportCard
            title="Daily Weld Station Report"
            icon={StationReportIcon}
            description="Complete the daily weld station report."
            path="/welding/reports/daily-station"
            secondaryAction={{
              text: "View Draft Reports",
              path: "/welding/reports/station-drafts"
            }}
            draftsKey="dailyWeldingStationReportDrafts"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default WeldingReports; 