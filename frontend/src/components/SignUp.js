import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Link as MuiLink,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import api from '../services/api';

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://environmental-reporting-system-febba9464fe7.herokuapp.com/api/'
    : 'http://localhost:8000/api/';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const generateUsername = (firstName, lastName) => {
    return `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(/\s+/g, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-generate username when first or last name changes
      if (name === 'first_name' || name === 'last_name') {
        if (newData.first_name && newData.last_name) {
          newData.username = generateUsername(newData.first_name, newData.last_name);
        }
      }
      
      return newData;
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await api.post('/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        confirm_password: formData.confirm_password,
      });

      navigate('/success-signup');
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response) {
        const errorData = err.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError('Error creating account. Please try again.');
      }
    }
  };

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
          <Typography 
            component="h1" 
            variant="h5" 
            sx={{ 
              mb: 3,
              color: '#000000',
              fontWeight: 600,
            }}
          >
            Sign Up
          </Typography>
          {error && (
            <Typography 
              color="error" 
              sx={{ 
                mb: 2,
                textAlign: 'center',
                width: '100%',
                whiteSpace: 'pre-line',
              }}
            >
              {error}
            </Typography>
          )}
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%',
              '& .MuiTextField-root': {
                mb: 2,
              },
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="first_name"
                  label="First Name"
                  name="first_name"
                  autoComplete="given-name"
                  value={formData.first_name}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#666666',
                      },
                      '&:hover fieldset': {
                        borderColor: '#000000',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="last_name"
                  label="Last Name"
                  name="last_name"
                  autoComplete="family-name"
                  value={formData.last_name}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#666666',
                      },
                      '&:hover fieldset': {
                        borderColor: '#000000',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#666666',
                  },
                  '&:hover fieldset': {
                    borderColor: '#000000',
                  },
                },
              }}
            />
            <TextField
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#666666',
                  },
                  '&:hover fieldset': {
                    borderColor: '#000000',
                  },
                },
              }}
            />
            <TextField
              required
              fullWidth
              id="phone_number"
              label="Phone Number"
              name="phone_number"
              autoComplete="tel"
              value={formData.phone_number}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#666666',
                  },
                  '&:hover fieldset': {
                    borderColor: '#000000',
                  },
                },
              }}
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: '#666666' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#666666',
                  },
                  '&:hover fieldset': {
                    borderColor: '#000000',
                  },
                },
              }}
            />
            <TextField
              required
              fullWidth
              name="confirm_password"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm_password"
              autoComplete="new-password"
              value={formData.confirm_password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                      sx={{ color: '#666666' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#666666',
                  },
                  '&:hover fieldset': {
                    borderColor: '#000000',
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
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
              Sign Up
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <MuiLink
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  color: '#666666',
                  textDecoration: 'none',
                  '&:hover': {
                    color: '#000000',
                  },
                }}
              >
                {"Already have an account? Sign In"}
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp; 