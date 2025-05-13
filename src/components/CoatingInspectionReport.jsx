import React, { useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Grid, TextField, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const CoatingInspectionReport = () => {
  const [jeepCalibrationVerified, setJeepCalibrationVerified] = useState('');
  const [section3B, setSection3B] = useState([{
    inspectionLocation: '',
    numberOfHolidays: '',
    voltage: '',
    locationOfRepairs: '',
    comments: ''
  }]);

  const addSection3BRow = () => {
    setSection3B([...section3B, {
      inspectionLocation: '',
      numberOfHolidays: '',
      voltage: '',
      locationOfRepairs: '',
      comments: ''
    }]);
  };

  const handleSection3BChange = (idx, field, value) => {
    setSection3B(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  return (
    <Box>
      {/* Section 3B: Holiday Inspection */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          3B. Holiday Inspection
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Jeep Calibration Verified?</InputLabel>
            <Select
              value={jeepCalibrationVerified}
              onChange={(e) => setJeepCalibrationVerified(e.target.value)}
              label="Jeep Calibration Verified?"
            >
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {section3B.map((row, idx) => (
          <Box key={idx} sx={{ mb: 3 }}>
            <Grid
              container
              spacing={2}
              sx={{
                width: '100%',
                m: 0,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }
              }}
            >
              <Grid item>
                <TextField
                  fullWidth
                  label="Inspection Location"
                  value={row.inspectionLocation}
                  onChange={(e) => handleSection3BChange(idx, 'inspectionLocation', e.target.value)}
                />
              </Grid>
              <Grid item>
                <TextField
                  fullWidth
                  label="Number of Holidays"
                  value={row.numberOfHolidays}
                  onChange={(e) => handleSection3BChange(idx, 'numberOfHolidays', e.target.value)}
                />
              </Grid>
              <Grid item>
                <TextField
                  fullWidth
                  label="Voltage"
                  value={row.voltage}
                  onChange={(e) => handleSection3BChange(idx, 'voltage', e.target.value)}
                />
              </Grid>
              <Grid item>
                <TextField
                  fullWidth
                  label="Location of Repairs"
                  value={row.locationOfRepairs}
                  onChange={(e) => handleSection3BChange(idx, 'locationOfRepairs', e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid
              container
              spacing={2}
              sx={{
                width: '100%',
                m: 0,
                mt: 1,
                display: 'grid',
                gridTemplateColumns: '1fr'
              }}
            >
              <Grid item>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Comments"
                  value={row.comments}
                  onChange={(e) => handleSection3BChange(idx, 'comments', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        ))}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={addSection3BRow}
            startIcon={<AddIcon />}
          >
            Add Location
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CoatingInspectionReport; 