import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import {
  Nature as EnvironmentalIcon,
  Engineering as WeldingIcon,
  Brush as CoatingIcon,
  Build as UtilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from './PageHeader';

const DepartmentCard = ({ title, icon: Icon, description, path }) => {
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
          View {title} Dashboard
        </Button>
    </CardContent>
  </Card>
);
};

const HomePage = () => {
  const navigate = useNavigate();
  const departments = [
    {
      title: "Environmental",
      icon: EnvironmentalIcon,
      description: "Manage environmental reports, SWPPP inspections, and compliance documentation.",
      path: "/environmental"
    },
    {
      title: "Welding",
      icon: WeldingIcon,
      description: "Track welding procedures, qualifications, and inspection reports.",
      path: "/welding"
    },
    {
      title: "Coating",
      icon: CoatingIcon,
      description: "Monitor coating applications, inspections, and quality control reports.",
      path: "/coating"
    },
    {
      title: "Utility",
      icon: UtilityIcon,
      description: "Oversee utility installations, maintenance records, and service reports.",
      path: "/utility"
    }
  ];

  return (
    <Box sx={{ 
      bgcolor: '#f5f5f5', 
      minHeight: 'calc(100vh - 64px)',
      overflow: 'auto'
    }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader 
          title="Discipline Dashboard"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
        }}>
          {departments.map((dept, index) => (
            <DepartmentCard
              key={index}
              title={dept.title}
              icon={dept.icon}
              description={dept.description}
              path={dept.path}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage; 