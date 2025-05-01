import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SuccessSignUp = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            bgcolor: '#ffffff',
            borderRadius: '8px',
          }}
        >
          <CheckCircleIcon 
            sx={{ 
              fontSize: 60, 
              color: '#4CAF50',
              mb: 2,
            }} 
          />
          <Typography 
            component="h1" 
            variant="h5" 
            sx={{ 
              mb: 2,
              color: '#000000',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Account Created Successfully!
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              color: '#666666',
              textAlign: 'center',
            }}
          >
            Your account has been created successfully. You can now sign in to access your account.
          </Typography>
          <Button
            component={RouterLink}
            to="/signin"
            variant="contained"
            fullWidth
            sx={{ 
              mb: 2, 
              bgcolor: '#000000',
              '&:hover': {
                bgcolor: '#333333',
              },
              height: '48px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Go to Sign In
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default SuccessSignUp; 