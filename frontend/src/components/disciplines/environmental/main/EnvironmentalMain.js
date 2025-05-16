import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import {
  NoteAdd as CreateReportIcon,
  Description as PermitsIcon,
  Map as MapsIcon,
  Folder as DocumentsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../common/PageHeader';

const CategoryCard = ({ title, icon: Icon, description, path }) => {
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
          View {title}
        </Button>
      </CardContent>
    </Card>
  );
};

const EnvironmentalMain = () => {
  const navigate = useNavigate();
  const categories = [
    {
      title: "Create Report",
      icon: CreateReportIcon,
      description: "Create and manage environmental reports including daily reports, SWPPP inspections, and more.",
      path: "/environmental/reports"
    },
    {
      title: "Permits",
      icon: PermitsIcon,
      description: "Access and manage environmental permits, certifications, and regulatory documents.",
      path: "/environmental/permits"
    },
    {
      title: "Maps",
      icon: MapsIcon,
      description: "View and manage site maps, environmental overlays, and geographical data.",
      path: "/environmental/maps"
    },
    {
      title: "Documents",
      icon: DocumentsIcon,
      description: "Access environmental documentation, procedures, and reference materials.",
      path: "/environmental/documents"
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
        title="Environmental Management" 
        backPath="/"
        backButtonStyle={{
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#333333',
          }
        }}
      />
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(2, 1fr)',
        },
        gap: 3,
      }}>
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            title={category.title}
            icon={category.icon}
            description={category.description}
            path={category.path}
          />
        ))}
      </Box>
    </Box>
  );
};

export default EnvironmentalMain; 