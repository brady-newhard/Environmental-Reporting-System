import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search as SearchIcon, ContactPhone as ContactPhoneIcon } from '@mui/icons-material';
import api from '../../services/api';

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  // Format as (XXX) XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
};

const generateVCard = (contact) => {
  const vCard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.full_name}`,
    `EMAIL:${contact.email}`,
  ];

  if (contact.phone_number) {
    const cleanedPhone = contact.phone_number.replace(/\D/g, '');
    vCard.push(`TEL:${cleanedPhone}`);
  }

  vCard.push('END:VCARD');
  return vCard.join('\n');
};

const downloadVCard = (contact) => {
  const vCardContent = generateVCard(contact);
  const blob = new Blob([vCardContent], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${contact.full_name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/contacts/');
        if (response.data && Array.isArray(response.data)) {
          setContacts(response.data);
        } else {
          setError('Invalid data received from server');
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
        if (err.response) {
          if (err.response.status === 401) {
            setError('Please log in to view contacts');
          } else {
            setError('Failed to fetch contacts. Please try again.');
          }
        } else {
          setError('Network error. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(contact => {
    if (!contact) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (contact.full_name?.toLowerCase() || '').includes(searchLower) ||
      (contact.email?.toLowerCase() || '').includes(searchLower) ||
      (contact.phone_number?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          color: '#000000',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        Contact List
      </Typography>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '2px' }}>
        <TextField
          fullWidth
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666666' }} />
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
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Contacts Table */
        <TableContainer component={Paper} sx={{ borderRadius: '2px' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#000000' }}>Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#000000' }}>Email</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#000000' }}>Phone Number</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#000000' }}>Add Contact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.map((contact, index) => (
                <TableRow 
                  key={index}
                  hover
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: '#f8f8f8',
                    }
                  }}
                >
                  <TableCell align="center">{contact.full_name}</TableCell>
                  <TableCell align="center">
                    <Link 
                      href={`mailto:${contact.email}`}
                      sx={{
                        color: '#000000',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {contact.email}
                    </Link>
                  </TableCell>
                  <TableCell align="center">
                    {contact.phone_number ? (
                      <Link 
                        href={`tel:${contact.phone_number.replace(/\D/g, '')}`}
                        sx={{
                          color: '#000000',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {formatPhoneNumber(contact.phone_number)}
                      </Link>
                    ) : (
                      'No phone number'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Add to Contacts">
                      <IconButton 
                        onClick={() => downloadVCard(contact)}
                        sx={{ 
                          color: '#000000',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        <ContactPhoneIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredContacts.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No contacts found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ContactList; 