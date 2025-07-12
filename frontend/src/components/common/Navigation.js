import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Person,
  Menu as MenuIcon,
  DeveloperMode,
} from '@mui/icons-material';

const Navigation = () => {
  const { logout, user, toggleDevAutoSignIn } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const navigationItems = [
    { text: 'Home', path: '/' },
    { text: 'Documents', path: '/project-documents' },
    { text: 'Search', path: '/search' },
  ];

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <AppBar position="static" sx={{ backgroundColor: '#000000' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img
            src="/PIPE-Logo.png"
            alt="PIPE Logo"
            style={{ height: '80px', marginRight: '16px' }}
          />
        </Box>

        {/* Desktop Navigation - Hidden on mobile */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.text}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{ color: '#ffffff' }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        {/* Mobile Hamburger Menu */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
          <IconButton
            size="large"
            aria-label="menu"
            onClick={handleMobileMenuToggle}
            color="inherit"
            sx={{ color: '#ffffff' }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* User Menu - Only visible on desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
            sx={{ color: '#ffffff' }}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
              <Person sx={{ mr: 1 }} />
              {user?.username || user?.email || 'Profile'}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: '#000000',
            color: '#ffffff',
          },
        }}
      >
        {/* Logo and Slogan Section */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img
            src="/PIPE-Logo.png"
            alt="PIPE Logo"
            style={{ height: '70px', marginBottom: '12px', display: 'block' }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#ffffff', 
              opacity: 0.8,
              fontStyle: 'italic',
              fontSize: '0.65rem',
              lineHeight: 1.1,
              whiteSpace: 'nowrap'
            }}
          >
            Streamlining Reports. Elevating Results.
          </Typography>
        </Box>

        {/* Navigation Items */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 'bold' }}>
            Navigation
          </Typography>
          <List>
            {navigationItems.map((item) => (
              <ListItem
                key={item.text}
                button
                onClick={() => handleNavigation(item.path)}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', my: 2 }} />

          {/* User Section */}
          <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 'bold' }}>
            Account
          </Typography>
          <List>
            <ListItem
              button
              onClick={() => { handleNavigation('/profile'); handleMobileMenuClose(); }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <Person sx={{ mr: 2, color: '#ffffff' }} />
              <ListItemText 
                primary={user?.username || user?.email || 'Profile'} 
                secondary="Manage your account"
              />
            </ListItem>
            <ListItem
              button
              onClick={() => { handleLogout(); handleMobileMenuClose(); }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ExitToApp sx={{ mr: 2, color: '#ffffff' }} />
              <ListItemText 
                primary="Logout" 
                secondary="Sign out of your account"
              />
            </ListItem>
          </List>

          {/* Development Helper - Only show in development */}
          {isDevelopment && (
            <>
              <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', my: 2 }} />
              <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 'bold' }}>
                Development
              </Typography>
              <List>
                <ListItem
                  button
                  onClick={() => { 
                    toggleDevAutoSignIn(); 
                    handleMobileMenuClose(); 
                  }}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <DeveloperMode sx={{ mr: 2, color: '#ffffff' }} />
                  <ListItemText 
                    primary="Toggle Auto-Sign-In" 
                    secondary="Switch to brady-newhard for development"
                  />
                </ListItem>
              </List>
            </>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navigation; 