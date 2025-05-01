import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    navigate('/signin');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#000000' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'white',
            fontWeight: 600,
          }}
        >
          Environmental Reporting System
        </Typography>
        <Box>
          {token ? (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/new-report"
                sx={{ mx: 1 }}
              >
                New Report
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/search"
                sx={{ mx: 1 }}
              >
                Search Reports
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/contacts"
                sx={{ mx: 1 }}
              >
                Contacts
              </Button>
              <Button
                color="inherit"
                onClick={handleSignOut}
                sx={{ mx: 1 }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/signin"
                sx={{ mx: 1 }}
              >
                Sign In
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/signup"
                sx={{ mx: 1 }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 