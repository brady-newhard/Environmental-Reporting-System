import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const Profile = () => {
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    username: '',
  });

  useEffect(() => {
    // TODO: Fetch user data from API
    // For now, using mock data
    setUserData({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone_number: '(123) 456-7890',
      username: 'john-doe',
    });
  }, []);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
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
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: '#000000',
              mb: 2,
            }}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              color: '#000000',
              fontWeight: 600,
            }}
          >
            Profile
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userData.first_name}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#666666',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userData.last_name}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#666666',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={userData.username}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#666666',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={userData.email}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#666666',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={userData.phone_number}
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#666666',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            sx={{
              mt: 3,
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
            Edit Profile
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 