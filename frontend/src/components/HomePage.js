import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Architecture as ArchitectureIcon,
  FormatListBulleted as ListIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

const DashboardCard = ({ title, icon: Icon, items = [] }) => (
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
        <IconButton size="small" sx={{ color: '#666666' }}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ p: 0 }}>
        {items.map((item, index) => (
          <ListItem 
            key={index}
            sx={{ 
              px: 1, 
              py: 0.5,
              '&:hover': {
                bgcolor: '#f5f5f5',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Icon sx={{ color: '#666666', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary={item.title}
              secondary={item.date}
              primaryTypographyProps={{
                sx: { 
                  color: '#000000',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }
              }}
              secondaryTypographyProps={{
                sx: { 
                  color: '#666666',
                  fontSize: '0.8rem'
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
);

const HomePage = () => {
  // Sample data - replace with actual data from your backend
  const draftReports = [
    { title: 'Site Inspection Report - Area A', date: '2024-04-30' },
    { title: 'Environmental Assessment - Zone B', date: '2024-04-29' },
    { title: 'Weekly Progress Report', date: '2024-04-28' },
  ];

  const projectPermits = [
    { title: 'Environmental Protection Permit', date: 'Expires: 2025-01-15' },
    { title: 'Construction Activity Permit', date: 'Expires: 2024-12-31' },
    { title: 'Water Management License', date: 'Expires: 2024-09-30' },
  ];

  const projectDrawings = [
    { title: 'Site Layout Plan - Rev 3', date: 'Updated: 2024-04-25' },
    { title: 'Drainage System Design', date: 'Updated: 2024-04-20' },
    { title: 'Environmental Control Measures', date: 'Updated: 2024-04-15' },
  ];

  const punchLists = [
    { title: 'Environmental Controls Review', date: '15 items pending' },
    { title: 'Site Safety Inspection', date: '8 items pending' },
    { title: 'Compliance Checklist', date: '12 items pending' },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          color: '#000000',
          fontWeight: 600
        }}
      >
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Draft Reports"
            icon={DescriptionIcon}
            items={draftReports}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Project Permits"
            icon={AssignmentIcon}
            items={projectPermits}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Project Drawings"
            icon={ArchitectureIcon}
            items={projectDrawings}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <DashboardCard
            title="Punch Lists"
            icon={ListIcon}
            items={punchLists}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage; 