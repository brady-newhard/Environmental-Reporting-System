import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import api from '../services/api';

const SearchReports = () => {
  const [filters, setFilters] = useState({
    report_type: '',
    columns_to_include: 'All',
    start_date: '',
    end_date: '',
    milepost_start: '',
    milepost_end: '',
    station_start: '',
    station_end: '',
    facility: '',
    route: '',
    spread: '',
    report_review_status: '',
    author: '',
    compliance_level: '',
    category: '',
    activity_group: '',
    activity_type: '',
    keyword: '',
  });

  const [searchResults, setSearchResults] = useState([]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearResults = () => {
    setSearchResults([]);
  };

  const handleClearSearchSettings = () => {
    setFilters({
      report_type: '',
      columns_to_include: 'All',
      start_date: '',
      end_date: '',
      milepost_start: '',
      milepost_end: '',
      station_start: '',
      station_end: '',
      facility: '',
      route: '',
      spread: '',
      report_review_status: '',
      author: '',
      compliance_level: '',
      category: '',
      activity_group: '',
      activity_type: '',
      keyword: '',
    });
  };

  const handleSearch = async () => {
    try {
      const response = await api.get('/reports/search/', { params: filters });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching reports:', error);
      alert('Error searching reports. Please try again.');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await api.post('/reports/generate/', {
        filters,
        results: searchResults
      });
      // Handle the generated report file
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f3f4f6' }}>
      {/* Main Content */}
      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
        {/* Search Form */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#e5e7eb' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#000000', fontWeight: 'bold' }}>SEARCH REPORTS</Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            {/* Left Column - General Search Criteria */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>General Search</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { position: 'relative', transform: 'none', marginBottom: '8px' } }}>
                    <InputLabel>REPORT TYPE</InputLabel>
                    <Select
                      name="report_type"
                      value={filters.report_type}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="daily">Daily Report</MenuItem>
                      <MenuItem value="variance">Variance Report</MenuItem>
                      <MenuItem value="punchlist">Punchlist</MenuItem>
                      <MenuItem value="progress">Progress Report</MenuItem>
                      <MenuItem value="swppp">SWPPP Report</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { position: 'relative', transform: 'none', marginBottom: '8px' } }}>
                    <InputLabel>COLUMNS TO INCLUDE</InputLabel>
                    <Select
                      name="columns_to_include"
                      value={filters.columns_to_include}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="Basic">Basic</MenuItem>
                      <MenuItem value="Custom">Custom</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>DATE</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="START"
                        type="date"
                        name="start_date"
                        value={filters.start_date}
                        onChange={handleFilterChange}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="END"
                        type="date"
                        name="end_date"
                        value={filters.end_date}
                        onChange={handleFilterChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>MILEPOST</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="START"
                        name="milepost_start"
                        value={filters.milepost_start}
                        onChange={handleFilterChange}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="END"
                        name="milepost_end"
                        value={filters.milepost_end}
                        onChange={handleFilterChange}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>STATION</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="START"
                        name="station_start"
                        value={filters.station_start}
                        onChange={handleFilterChange}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="END"
                        name="station_end"
                        value={filters.station_end}
                        onChange={handleFilterChange}
                      />
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="KEYWORD"
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                  />
                </Box>
              </Box>
            </Box>

            {/* Right Column - Route and Activity Related */}
            <Box sx={{ flex: 1, borderLeft: '1px solid #d1d5db', pl: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>Route & Activity</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { position: 'relative', transform: 'none', marginBottom: '8px' } }}>
                    <InputLabel>ROUTE</InputLabel>
                    <Select
                      name="route"
                      value={filters.route}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      {/* Add route options */}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { position: 'relative', transform: 'none', marginBottom: '8px' } }}>
                    <InputLabel>SPREAD</InputLabel>
                    <Select
                      name="spread"
                      value={filters.spread}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      {/* Add spread options */}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { position: 'relative', transform: 'none', marginBottom: '8px' } }}>
                    <InputLabel>FACILITY</InputLabel>
                    <Select
                      name="facility"
                      value={filters.facility}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      {/* Add facility options */}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { position: 'relative', transform: 'none', marginBottom: '8px' } }}>
                    <InputLabel>REPORT REVIEW STATUS</InputLabel>
                    <Select
                      name="reportReviewStatus"
                      value={filters.reportReviewStatus}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { position: 'relative', transform: 'none', marginBottom: '8px' } }}>
                    <InputLabel>COMPLIANCE LEVEL</InputLabel>
                    <Select
                      name="complianceLevel"
                      value={filters.complianceLevel}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { position: 'relative', transform: 'none', marginBottom: '8px' } }}>
                    <InputLabel>CATEGORY</InputLabel>
                    <Select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      {/* Add category options */}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { position: 'relative', transform: 'none', marginBottom: '8px' } }}>
                    <InputLabel>ACTIVITY GROUP</InputLabel>
                    <Select
                      name="activityGroup"
                      value={filters.activityGroup}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      {/* Add activity group options */}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { position: 'relative', transform: 'none', marginBottom: '8px' } }}>
                    <InputLabel>ACTIVITY TYPE</InputLabel>
                    <Select
                      name="activityType"
                      value={filters.activityType}
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      {/* Add activity type options */}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Search Buttons */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearResults}
                sx={{ mr: 1, bgcolor: '#6b7280', height: '32px' }}
              >
                CLEAR RESULTS
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearSearchSettings}
                sx={{ bgcolor: '#6b7280', height: '32px' }}
              >
                CLEAR SEARCH SETTINGS
              </Button>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ bgcolor: '#4b5563', height: '32px' }}
            >
              SEARCH
            </Button>
          </Box>
        </Paper>

        {/* Search Results */}
        <Paper sx={{ p: 3, bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>SEARCH RESULTS</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>REPORT TYPE</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="punchlist">PUNCHLIST</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>DOCUMENT TYPE</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleGenerateReport}
                sx={{ bgcolor: '#6b7280', height: '32px' }}
              >
                GENERATE REPORT OF SEARCH RESULTS SHOWN
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                  <TableCell>Report ID</TableCell>
                  <TableCell>Report Date</TableCell>
                  <TableCell>Compliance Level</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Spread</TableCell>
                  <TableCell>Facility</TableCell>
                  <TableCell>Milepost Start</TableCell>
                  <TableCell>Milepost End</TableCell>
                  <TableCell>Station Start</TableCell>
                  <TableCell>Station End</TableCell>
                  <TableCell>Activity Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.id}</TableCell>
                    <TableCell>{result.date}</TableCell>
                    <TableCell>{result.complianceLevel}</TableCell>
                    <TableCell>{result.author}</TableCell>
                    <TableCell>{result.route}</TableCell>
                    <TableCell>{result.spread}</TableCell>
                    <TableCell>{result.facility}</TableCell>
                    <TableCell>{result.milepostStart}</TableCell>
                    <TableCell>{result.milepostEnd}</TableCell>
                    <TableCell>{result.stationStart}</TableCell>
                    <TableCell>{result.stationEnd}</TableCell>
                    <TableCell>{result.activityType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default SearchReports; 