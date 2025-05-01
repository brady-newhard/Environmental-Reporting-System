import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuChange = (event) => {
    const value = event.target.value;
    setSelectedMenu(value);
    if (value === 'logout') {
      logout();
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'New Report', path: '/new-report' },
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
            onClick={logout}
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
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: '#ffffff',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Environmental Reporting System
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ color: '#ffffff' }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              {drawer}
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={selectedMenu}
                onChange={handleMenuChange}
                displayEmpty
                sx={{
                  color: '#ffffff',
                  '& .MuiSelect-icon': {
                    color: '#ffffff',
                  },
                  '&:before': {
                    borderColor: '#ffffff',
                  },
                  '&:after': {
                    borderColor: '#ffffff',
                  },
                  '& .MuiSelect-select': {
                    padding: '8px 32px 8px 8px',
                  },
                }}
                IconComponent={() => (
                  <MenuIcon sx={{ 
                    color: '#ffffff',
                    position: 'absolute',
                    right: '8px',
                    pointerEvents: 'none',
                  }} />
                )}
              >
                <MenuItem value="" disabled sx={{ display: 'none' }}>
                  <MenuIcon />
                </MenuItem>
                {menuItems.map((item) => (
                  <MenuItem 
                    key={item.text} 
                    value={item.path} 
                    component={RouterLink} 
                    to={item.path}
                    sx={{ color: '#000000' }}
                  >
                    {item.text}
                  </MenuItem>
                ))}
                {isAuthenticated ? (
                  <>
                    <Divider />
                    <MenuItem value="profile" component={RouterLink} to="/profile" sx={{ color: '#000000' }}>
                      Profile
                    </MenuItem>
                    <MenuItem value="settings" component={RouterLink} to="/settings" sx={{ color: '#000000' }}>
                      Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem value="logout" sx={{ color: '#000000' }}>Logout</MenuItem>
                  </>
                ) : (
                  <>
                    <Divider />
                    <MenuItem value="login" component={RouterLink} to="/login" sx={{ color: '#000000' }}>
                      Login
                    </MenuItem>
                    <MenuItem value="signup" component={RouterLink} to="/signup" sx={{ color: '#000000' }}>
                      Sign Up
                    </MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 