import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Button,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  Architecture as ArchitectureIcon,
  FormatListBulleted as ListIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DashboardCard = ({ title, icon: Icon, items = [], path }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{
      height: 200,
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
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        '&:last-child': { pb: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          gap: 1,
          minHeight: 60
        }}>
          <Icon sx={{ 
            color: '#000000',
            fontSize: '1.25rem',
            mt: 0.5,
            flexShrink: 0
          }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#000000', 
                fontWeight: 600,
                fontSize: '1rem',
                wordBreak: 'break-word',
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            <List sx={{ p: 0 }}>
              {items.slice(0, 2).map((item, index) => (
                <ListItem 
                  key={index}
                  sx={{ 
                    px: 0, 
                    py: 0.25,
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                    }
                  }}
                >
                  <ListItemText 
                    primary={item.title}
                    secondary={item.date}
                    primaryTypographyProps={{
                      sx: { 
                        color: '#000000',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        wordBreak: 'break-word',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }
                    }}
                    secondaryTypographyProps={{
                      sx: { 
                        color: '#666666',
                        fontSize: '0.75rem'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          <IconButton
            size="small"
            sx={{ 
              color: '#666666',
              mt: 0.5,
              flexShrink: 0,
              p: 0.5
            }}
            onClick={() => navigate(path)}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
      <Box sx={{ p: 1.5, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(path)}
          sx={{
            backgroundColor: '#000000',
            '&:hover': { backgroundColor: '#333333' },
            color: '#ffffff',
            fontWeight: 500,
            height: 32,
            fontSize: '0.875rem'
          }}
        >
          View {title}
        </Button>
      </Box>
    </Card>
  );
};

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
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      bgcolor: '#f5f5f5', 
      minHeight: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: { xs: 2, sm: 3 }, 
          color: '#000000',
          fontWeight: 600,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        Dashboard
      </Typography>
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        '& > *': {
          width: {
            xs: '100%',
            sm: 'calc(50% - 8px)',
            md: 'calc(33.333% - 16px)'
          }
        }
      }}>
        <DashboardCard
          title="Draft Reports"
          icon={DescriptionIcon}
          items={draftReports}
          path="/reports-dashboard"
        />
        <DashboardCard
          title="Project Permits"
          icon={AssignmentIcon}
          items={projectPermits}
          path="/permits"
        />
        <DashboardCard
          title="Project Drawings"
          icon={ArchitectureIcon}
          items={projectDrawings}
          path="/drawings"
        />
        <DashboardCard
          title="Punch Lists"
          icon={ListIcon}
          items={punchLists}
          path="/punchlists"
        />
      </Box>
    </Box>
  );
};

export default HomePage; 