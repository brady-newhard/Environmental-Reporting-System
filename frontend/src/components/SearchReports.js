import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { searchReports } from '../services/api';

const SearchReports = () => {
  const [filters, setFilters] = useState({
    author: '',
    startDate: '',
    endDate: '',
    reportType: '',
    status: '',
    location: ''
  });

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchReports(filters);
      setReports(data);
    } catch (err) {
      setError('Failed to fetch reports. Please try again.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'under review':
        return { bg: '#fff3e0', color: '#ef6c00' };
      case 'submitted':
        return { bg: '#e3f2fd', color: '#1976d2' };
      default:
        return { bg: '#f5f5f5', color: '#666666' };
    }
  };

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
        <SearchIcon /> Search Reports
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '2px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              name="author"
              label="Author"
              value={filters.author}
              onChange={handleFilterChange}
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  height: '40px'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="date"
              name="startDate"
              label="Start Date"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  height: '40px'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              type="date"
              name="endDate"
              label="End Date"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  height: '40px'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              name="location"
              label="Location"
              value={filters.location}
              onChange={handleFilterChange}
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  height: '40px'
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                name="reportType"
                value={filters.reportType}
                onChange={handleFilterChange}
                sx={{ 
                  backgroundColor: '#fff',
                  height: '40px'
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Site Inspection">Site Inspection</MenuItem>
                <MenuItem value="Environmental Assessment">Environmental Assessment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                sx={{ 
                  backgroundColor: '#fff',
                  height: '40px'
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Submitted">Submitted</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
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
        /* Results Table */
        <TableContainer component={Paper} sx={{ borderRadius: '2px' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, color: '#000000' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#000000' }}>Author</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#000000' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#000000' }}>Weather</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#000000' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#000000' }}>Last Modified</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow 
                  key={report.id}
                  hover
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: '#f8f8f8',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                  <TableCell>{report.inspector.username}</TableCell>
                  <TableCell>{report.location}</TableCell>
                  <TableCell>{report.weather_conditions}</TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status || 'Submitted'}
                      size="small"
                      sx={{ 
                        backgroundColor: getStatusColor(report.status || 'Submitted').bg,
                        color: getStatusColor(report.status || 'Submitted').color,
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>{new Date(report.updated_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No reports found matching your search criteria.
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

export default SearchReports; 