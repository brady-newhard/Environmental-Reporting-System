import React from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({ title, backPath }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      mb: { xs: 3, sm: 4 },
    }}>
      <IconButton
        onClick={handleBack}
        sx={{ 
          bgcolor: '#000000',
          color: '#ffffff',
          width: { xs: 40, sm: 44 },
          height: { xs: 40, sm: 44 },
          '&:hover': {
            bgcolor: '#333333',
          },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
      </IconButton>
      <Typography 
        variant="h5" 
        sx={{ 
          color: '#000000',
          fontWeight: 600,
          fontSize: { xs: '1.5rem', sm: '1.75rem' }
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default PageHeader; 