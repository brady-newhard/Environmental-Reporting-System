import React, { useState } from 'react';
import { Box, Paper, Typography, Divider, Grid, TextField, Button, IconButton } from '@mui/material';
import PageHeader from '../common/PageHeader';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const initialAmbientRow = {
  location: '',
  time: '',
  weather: '',
  wind: '',
  temp: '',
  rh: '',
  steel: '',
  dew: '',
  db: '',
  wb: '',
  plusminus: '',
  comments: '',
};

const CoatingInspectionReportForm = () => {
  // Section 1A: Ambient Conditions state
  const [ambientRows, setAmbientRows] = useState([{ ...initialAmbientRow }]);

  const handleAmbientChange = (idx, field, value) => {
    setAmbientRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleAddAmbientRow = () => {
    setAmbientRows(rows => [...rows, { ...initialAmbientRow }]);
  };

  const handleDeleteAmbientRow = (idx) => {
    setAmbientRows(rows => rows.filter((_, i) => i !== idx));
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader title="Daily Inspection Report" backPath="/coating/reports" />
      <Paper sx={{ p: 3, mt: 2, maxWidth: 1200, margin: '0 auto' }}>
        {/* Section 1: Project/Report Info */}
        <Typography variant="h6" sx={{ mb: 2 }}>Project & Report Information</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}><TextField label="Contractor" fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={4}><TextField label="Project No./WBS" fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={4}><TextField label="Facility ID" fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={4}><TextField label="OQ Personnel" fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={4}><TextField label="Report #" fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={4}><TextField label="Date" type="date" InputLabelProps={{ shrink: true }} fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={4}><TextField label="QC Inspector Start/Stop Time" fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={4}><TextField label="Crew Start/Stop Time" fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={4}><TextField label="General Location" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 1A: Ambient Conditions */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 1A – Ambient Conditions</Typography>
        <Box sx={{ mb: 2 }}>
          {ambientRows.map((row, idx) => (
            <Box key={idx} sx={{ mb: 3 }}>
              {/* Row 1 */}
              <Grid
                container
                spacing={2}
                sx={{
                  width: '100%',
                  m: 0,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }
                }}
              >
                <Grid item>
                  <TextField label="Location" value={row.location} onChange={e => handleAmbientChange(idx, 'location', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="Time" value={row.time} onChange={e => handleAmbientChange(idx, 'time', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="Weather" value={row.weather} onChange={e => handleAmbientChange(idx, 'weather', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="Wind (MPH)" value={row.wind} onChange={e => handleAmbientChange(idx, 'wind', e.target.value)} fullWidth />
                </Grid>
              </Grid>
              {/* Row 2 */}
              <Grid
                container
                spacing={2}
                sx={{
                  width: '100%',
                  m: 0,
                  mt: 1,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(7, 1fr)' }
                }}
              >
                <Grid item>
                  <TextField label="°F" value={row.temp} onChange={e => handleAmbientChange(idx, 'temp', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="% RH" value={row.rh} onChange={e => handleAmbientChange(idx, 'rh', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="°F Steel" value={row.steel} onChange={e => handleAmbientChange(idx, 'steel', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="°F Dew Pt" value={row.dew} onChange={e => handleAmbientChange(idx, 'dew', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="DB °F" value={row.db} onChange={e => handleAmbientChange(idx, 'db', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="WB °F" value={row.wb} onChange={e => handleAmbientChange(idx, 'wb', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="+/-" value={row.plusminus} onChange={e => handleAmbientChange(idx, 'plusminus', e.target.value)} fullWidth />
                </Grid>
              </Grid>
              {/* Row 3 */}
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
                  <TextField label="Comments" value={row.comments} onChange={e => handleAmbientChange(idx, 'comments', e.target.value)} fullWidth multiline minRows={2} />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Button startIcon={<AddIcon />} onClick={handleAddAmbientRow} variant="outlined">
              Add New Location
            </Button>
            {ambientRows.length > 1 && (
              <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteAmbientRow(ambientRows.length - 1)} variant="outlined" color="error">
                Delete Last Location
              </Button>
            )}
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />

        {/* Section 1B: Surface Preparation */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 1B – Surface Preparation (Hold Point)</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={2}><TextField label="No." fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Location" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Surface Cleanliness" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Specified" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Actual" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Surface Profile" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Specified" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Actual" fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Comments" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 1C: Surface Preparation Checklist */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 1C – Surface Preparation Checklist</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={2}><TextField label="Checklist Item" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Yes" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="No" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="N/A" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 2A: Coating Application */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 2A – Coating Application</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={1}><TextField label="No." fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Location" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Coating Type/Product ID" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Application Method (Spray/Brush)" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Application Time Begin" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Application Time End" fullWidth /></Grid>
          <Grid item xs={12} sm={1}><TextField label="WFT Mils" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Comments" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 2B: Mixing Report */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 2B – Mixing Report</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={1}><TextField label="Mix #" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Location" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Comp A Batch #" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Comp B Batch #" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Mix Time" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Act Induct Time" fullWidth /></Grid>
          <Grid item xs={12} sm={1}><TextField label="Pot Life (min)" fullWidth /></Grid>
          <Grid item xs={12} sm={1}><TextField label="Qty Used" fullWidth /></Grid>
          <Grid item xs={12} sm={1}><TextField label="Witnessed By" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 2C: Coating Application Checklist */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 2C – Coating Application Checklist</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={2}><TextField label="Checklist Item" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Yes" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="No" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="N/A" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 3A: DFT Readings */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 3A – DFT Readings (Hold Point)</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={1}><TextField label="No." fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Location" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Specified" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Average" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Range" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Yes" fullWidth /></Grid>
          <Grid item xs={12} sm={1}><TextField label="No" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Comments" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 3B: Holiday Inspection (Hold Point) */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 3B – Holiday Inspection (Hold Point)</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={2}><TextField label="Inspection Location" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Jeep Calibration Verified?" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Number of Holidays" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Voltage" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Location of Repairs" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Comments" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 3C: Instrument Record */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 3C – Instrument Record</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={2}><TextField label="Instrument" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Brand" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Model" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Serial Number" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Calibration Date" fullWidth /></Grid>
          <Grid item xs={12} sm={2}><TextField label="Comments" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 4: Comments/Signatures */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 4 – Comments / Signatures</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}><TextField label="Comments" fullWidth multiline minRows={2} /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Signature" fullWidth /></Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="contained" color="primary">Submit</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CoatingInspectionReportForm; 