import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({ title, backPath, backButtonStyle }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      {backPath && (
        <IconButton
          onClick={() => navigate(backPath)}
          sx={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333',
            },
            ...backButtonStyle
          }}
        >
          <ArrowBack />
        </IconButton>
      )}
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
  );
};

export default PageHeader; 