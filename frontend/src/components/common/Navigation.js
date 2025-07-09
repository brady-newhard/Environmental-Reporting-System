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
} from '@mui/material';
import {
  AccountCircle,
  ArrowDropDown,
  ExitToApp,
  Person,
} from '@mui/icons-material';

const Navigation = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [environmentalAnchorEl, setEnvironmentalAnchorEl] = useState(null);
  const [weldingAnchorEl, setWeldingAnchorEl] = useState(null);
  const [coatingAnchorEl, setCoatingAnchorEl] = useState(null);
  const [utilityAnchorEl, setUtilityAnchorEl] = useState(null);
  const [showEnvironmentalMenu, setShowEnvironmentalMenu] = useState(false);
  const [showWeldingMenu, setShowWeldingMenu] = useState(false);
  const [showCoatingMenu, setShowCoatingMenu] = useState(false);
  const [showUtilityMenu, setShowUtilityMenu] = useState(false);

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

  const handleEnvironmentalMenu = (event) => {
    setEnvironmentalAnchorEl(event.currentTarget);
  };

  const handleEnvironmentalClose = () => {
    setEnvironmentalAnchorEl(null);
  };

  const handleWeldingMenu = (event) => {
    setWeldingAnchorEl(event.currentTarget);
  };

  const handleWeldingClose = () => {
    setWeldingAnchorEl(null);
  };

  const handleCoatingMenu = (event) => {
    setCoatingAnchorEl(event.currentTarget);
  };

  const handleCoatingClose = () => {
    setCoatingAnchorEl(null);
  };

  const handleUtilityMenu = (event) => {
    setUtilityAnchorEl(event.currentTarget);
  };

  const handleUtilityClose = () => {
    setUtilityAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#000000' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img
            src="http://localhost:8000/staticfiles/PIPE-Logo.png"
            alt="PIPE Logo"
            style={{ height: '40px', marginRight: '16px' }}
          />
          <Typography variant="h6" component="div" sx={{ color: '#ffffff' }}>
            Environmental Reporting System
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ color: '#ffffff' }}
          >
            Home
          </Button>

          <Button
            color="inherit"
            onClick={() => setShowEnvironmentalMenu(!showEnvironmentalMenu)}
            endIcon={<ArrowDropDown />}
            sx={{ color: '#ffffff' }}
          >
            Environmental
          </Button>
          {showEnvironmentalMenu && (
            <Menu
              anchorEl={environmentalAnchorEl}
              open={Boolean(environmentalAnchorEl)}
              onClose={handleEnvironmentalClose}
            >
              <MenuItem onClick={() => { navigate('/environmental'); handleEnvironmentalClose(); }}>
                Overview
              </MenuItem>
              <MenuItem onClick={() => { navigate('/environmental/reports'); handleEnvironmentalClose(); }}>
                Reports
              </MenuItem>
              <MenuItem onClick={() => { navigate('/environmental/reports/daily/new'); handleEnvironmentalClose(); }}>
                Daily Report
              </MenuItem>
              <MenuItem onClick={() => { navigate('/environmental/swppp/new'); handleEnvironmentalClose(); }}>
                SWPPP Report
              </MenuItem>
              <MenuItem onClick={() => { navigate('/environmental/reports/punchlist/new'); handleEnvironmentalClose(); }}>
                Punchlist
              </MenuItem>
            </Menu>
          )}

          <Button
            color="inherit"
            onClick={() => navigate('/welding')}
            endIcon={<ArrowDropDown />}
            sx={{ color: '#ffffff' }}
          >
            Welding
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate('/coating')}
            endIcon={<ArrowDropDown />}
            sx={{ color: '#ffffff' }}
          >
            Coating
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate('/utility')}
            endIcon={<ArrowDropDown />}
            sx={{ color: '#ffffff' }}
          >
            Utility
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate('/project-documents')}
            sx={{ color: '#ffffff' }}
          >
            Documents
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate('/search')}
            sx={{ color: '#ffffff' }}
          >
            Search
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate('/contacts')}
            sx={{ color: '#ffffff' }}
          >
            Contacts
          </Button>

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
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 