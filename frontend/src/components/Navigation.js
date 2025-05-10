import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'Project Documents', path: '/project-documents' },
    { text: 'Search Reports', path: '/search' },
    { text: 'Contacts', path: '/contacts' },
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={RouterLink} 
            to={item.path}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemText 
              primary={item.text} 
              sx={{ 
                color: '#000000',
                '& .MuiTypography-root': {
                  fontWeight: 500,
                },
              }} 
            />
          </ListItem>
        ))}
      </List>
      <Divider />
      {isAuthenticated ? (
        <List>
          <ListItem 
            button 
            onClick={handleLogout}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemText 
              primary="Logout" 
              sx={{ 
                color: '#000000',
                '& .MuiTypography-root': {
                  fontWeight: 500,
                },
              }} 
            />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem 
            button 
            component={RouterLink} 
            to="/login"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemText 
              primary="Login" 
              sx={{ 
                color: '#000000',
                '& .MuiTypography-root': {
                  fontWeight: 500,
                },
              }} 
            />
          </ListItem>
          <ListItem 
            button 
            component={RouterLink} 
            to="/signup"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemText 
              primary="Sign Up" 
              sx={{ 
                color: '#000000',
                '& .MuiTypography-root': {
                  fontWeight: 500,
                },
              }} 
            />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <AppBar position="static" sx={{ 
      backgroundColor: '#000000', 
      boxShadow: 'none', 
      borderBottom: '1px solid #000000',
      '& .MuiTypography-root': {
        color: '#ffffff',
      },
      '& .MuiIconButton-root': {
        color: '#ffffff',
      },
      '& .MuiSelect-select': {
        color: '#ffffff',
      },
      '& .MuiSelect-icon': {
        color: '#ffffff',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#ffffff',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#ffffff',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#ffffff',
      },
    }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{ 
            color: '#ffffff',
            mr: 2,
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textDecoration: 'none' }} component={RouterLink} to="/">
        <Typography
            variant="h5"
          sx={{
              color: '#ffffff',
              fontWeight: 700,
              letterSpacing: 2,
              lineHeight: 1,
            textDecoration: 'none',
            }}
          >
            PIPE
          </Typography>
          <Typography
            variant="caption"
            sx={{
            color: '#ffffff',
              opacity: 0.8,
              fontWeight: 400,
              fontSize: '0.75rem',
              lineHeight: 1,
              textDecoration: 'none',
              mt: 0.5,
          }}
        >
            Pipeline Information & Project Evaluation
        </Typography>
        </Box>

        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {user?.first_name || user?.username || 'User'}
            </Typography>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ color: '#ffffff' }}
            >
              <Avatar sx={{ bgcolor: '#ffffff', color: '#000000' }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem 
                component={RouterLink} 
                to="/profile"
                onClick={handleProfileMenuClose}
              >
                Profile
              </MenuItem>
              <MenuItem 
                component={RouterLink} 
                to="/settings"
                onClick={handleProfileMenuClose}
              >
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        )}

        {!isAuthenticated && !isMobile && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              component={RouterLink}
              to="/login"
              sx={{ color: '#ffffff' }}
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              sx={{ color: '#ffffff' }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navigation; 