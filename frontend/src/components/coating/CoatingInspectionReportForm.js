import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Divider, Grid, TextField, Button, IconButton, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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

const initialSurfaceRow = {
  no: '',
  location: '',
  cleanliness: '',
  specified: '',
  actual: '',
  profile: '',
  profileSpecified: '',
  profileActual: '',
  comments: '',
};

const initialDFTRow = {
  no: '',
  location: '',
  specified: '',
  average: '',
  range: '',
  rework: '', // 'yes' or 'no'
  comments: '',
};

const checklistGroups = [
  {
    title: 'SURFACE PREPARATION CHECKLIST',
    items: [
      "Rust scale and pack rust (between mating surfaces) removed?",
      "Is surface free of visible moisture (except for sweating)?",
      "Sweating surfaces – surface constantly wiped?",
      "Compressed air check satisfactory?",
      "Dust and abrasive removal satisfactory? Hold Point",
      "Grease and oil removed?",
      "Protective coverings suitable/in-place?",
      "Salt removal? Hold Point (Attach Results)",
      "Record: Base Metal Reading (BMR) in mils",
      "Record: Type and size abrasive for blasting"
    ]
  }
];

const coatingAppChecklistItems = [
  "Protective coverings in place?",
  "Compressed air check satisfactory?",
  "Material agitation satisfactory?",
  "Application equipment satisfactory?: AS/CS/B/R",
  "Time from surface preparation to coat:",
  "Recoat times satisfactory?",
  "Intercoat cleanliness sat? (Hold Point)",
  "Stripe coat applied?",
  "Free of application deficiencies?",
  "Caulking satisfactory? (Hold Point)"
];

const coatingChecklistLeft = [
  "Protective coverings in place?",
  "Compressed air check satisfactory?",
  "Material agitation satisfactory?",
  "Application equipment satisfactory?: AS/CS/B/R",
  "Time from surface preparation to coat:"
];

const coatingChecklistRight = [
  "Recoat times satisfactory?",
  "Intercoat cleanliness sat? (Hold Point)",
  "Stripe coat applied?",
  "Free of application deficiencies?",
  "Caulking satisfactory? (Hold Point)"
];

const inspectionStages = [
  "Coating Inspection 1st",
  "Coating Inspection 2nd",
  "Coating Inspection Final"
];

const initialHolidayRow = {
  inspectionLocation: '',
  jeepCalibration: '',
  numHolidays: '',
  voltage: '',
  repairLocation: '',
  comments: '',
};

const CoatingInspectionReportForm = () => {
  // Section 1A: Ambient Conditions state
  const [ambientRows, setAmbientRows] = useState([{ ...initialAmbientRow }]);
  // Section 1B: Surface Preparation state
  const [surfaceRows, setSurfaceRows] = useState([{ ...initialSurfaceRow }]);
  // Section 3A: DFT Readings state
  const [dftRows, setDFTRows] = useState([{ ...initialDFTRow }]);
  // Checklist state: always matches checklistGroups/items
  const [checklist, setChecklist] = useState(() => {
    const state = {};
    checklistGroups.forEach((group, gIdx) => {
      group.items.forEach((_, i) => {
        state[`${gIdx}-${i}`] = { yes: false, no: false, na: false };
      });
    });
    return state;
  });

  // Reset checklist state if checklistGroups/items change (dev safety)
  useEffect(() => {
    const state = {};
    checklistGroups.forEach((group, gIdx) => {
      group.items.forEach((_, i) => {
        state[`${gIdx}-${i}`] = { yes: false, no: false, na: false };
      });
    });
    setChecklist(state);
  }, []);

  const handleAmbientChange = (idx, field, value) => {
    setAmbientRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleAddAmbientRow = () => {
    setAmbientRows(rows => [...rows, { ...initialAmbientRow }]);
  };

  const handleDeleteAmbientRow = (idx) => {
    setAmbientRows(rows => rows.filter((_, i) => i !== idx));
  };

  const handleSurfaceChange = (idx, field, value) => {
    setSurfaceRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleAddSurfaceRow = () => {
    setSurfaceRows(rows => [...rows, { ...initialSurfaceRow }]);
  };

  const handleDeleteSurfaceRow = (idx) => {
    setSurfaceRows(rows => rows.filter((_, i) => i !== idx));
  };

  const handleChecklistCheck = (key, field) => {
    setChecklist(prev => ({
      ...prev,
      [key]: {
        yes: field === 'yes' ? !prev[key].yes : false,
        no: field === 'no' ? !prev[key].no : false,
        na: field === 'na' ? !prev[key].na : false,
      }
    }));
  };

  const handleDFTChange = (idx, field, value) => {
    setDFTRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleAddDFTRow = () => setDFTRows(rows => [...rows, { ...initialDFTRow }]);

  const handleDeleteDFTRow = idx => setDFTRows(rows => rows.filter((_, i) => i !== idx));

  const [coatingAppChecklist, setCoatingAppChecklist] = useState(
    coatingAppChecklistItems.map(() => ({ yes: false, no: false, na: false }))
  );

  const handleCoatingAppChecklistCheck = (idx, field) => {
    setCoatingAppChecklist(prev =>
      prev.map((row, i) =>
        i === idx
          ? {
              yes: field === 'yes' ? !row.yes : false,
              no: field === 'no' ? !row.no : false,
              na: field === 'na' ? !row.na : false
            }
          : row
      )
    );
  };

  const [holidayInspections, setHolidayInspections] = useState(
    inspectionStages.map(() => ({ ...initialHolidayRow }))
  );

  const handleHolidayChange = (idx, field, value) => {
    setHolidayInspections(rows =>
      rows.map((row, i) => i === idx ? { ...row, [field]: value } : row)
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <PageHeader title="Daily Inspection Report" backPath="/coating/reports" />
      <Paper sx={{ p: 3, mt: 2, maxWidth: 1200, margin: '0 auto' }}>
        {/* Section 1: Project/Report Info */}
        <Typography variant="h6" sx={{ mb: 2 }}>Project & Report Information</Typography>
        <Grid
          container
          spacing={2}
          sx={{
            width: '100%',
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }
          }}
        >
          <Grid item><TextField label="Contractor" fullWidth /></Grid>
          <Grid item><TextField label="Project No./WBS" fullWidth /></Grid>
          <Grid item><TextField label="Facility ID" fullWidth /></Grid>
          <Grid item><TextField label="OQ Personnel" fullWidth /></Grid>
          <Grid item><TextField label="Report #" fullWidth /></Grid>
          <Grid item><TextField label="Date" type="date" InputLabelProps={{ shrink: true }} fullWidth /></Grid>
          <Grid item><TextField label="QC Inspector Start/Stop Time" fullWidth /></Grid>
          <Grid item><TextField label="Crew Start/Stop Time" fullWidth /></Grid>
          <Grid item><TextField label="General Location" fullWidth /></Grid>
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
        <Box sx={{ mb: 2 }}>
          {surfaceRows.map((row, idx) => (
            <Box key={idx} sx={{ mb: 3 }}>
              {/* Row 1 */}
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
                  <TextField label="No." value={row.no} onChange={e => handleSurfaceChange(idx, 'no', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="Location" value={row.location} onChange={e => handleSurfaceChange(idx, 'location', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="Surface Cleanliness" value={row.cleanliness} onChange={e => handleSurfaceChange(idx, 'cleanliness', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="Specified" value={row.specified} onChange={e => handleSurfaceChange(idx, 'specified', e.target.value)} fullWidth />
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
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }
                }}
              >
                <Grid item>
                  <TextField label="Actual" value={row.actual} onChange={e => handleSurfaceChange(idx, 'actual', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="Surface Profile" value={row.profile} onChange={e => handleSurfaceChange(idx, 'profile', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="Specified" value={row.profileSpecified} onChange={e => handleSurfaceChange(idx, 'profileSpecified', e.target.value)} fullWidth />
                </Grid>
                <Grid item>
                  <TextField label="Actual" value={row.profileActual} onChange={e => handleSurfaceChange(idx, 'profileActual', e.target.value)} fullWidth />
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
                  <TextField label="Comments" value={row.comments} onChange={e => handleSurfaceChange(idx, 'comments', e.target.value)} fullWidth multiline minRows={2} />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Button startIcon={<AddIcon />} onClick={handleAddSurfaceRow} variant="outlined">
              Add New Location
            </Button>
            {surfaceRows.length > 1 && (
              <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteSurfaceRow(surfaceRows.length - 1)} variant="outlined" color="error">
                Delete Last Location
              </Button>
            )}
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />

        {/* Section 1C: Surface Preparation Checklist */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 1C – Surface Preparation Checklist</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} sx={{ background: '#ddd', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                  Checklist Item
                </TableCell>
                <TableCell
                  colSpan={3}
                  sx={{
                    background: '#ddd',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #333'
                  }}
                >
                  ACCEPTABLE
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold' }}>YES</TableCell>
                <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold' }}>NO</TableCell>
                <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold' }}>N/A</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {checklistGroups[0].items.map((item, i) => {
                const key = `0-${i}`;
                return (
                  <TableRow key={key}>
                    <TableCell sx={{ borderRight: '1px solid #333' }}>{item}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={checklist[key].yes}
                        onChange={() => handleChecklistCheck(key, 'yes')}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={checklist[key].no}
                        onChange={() => handleChecklistCheck(key, 'no')}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={checklist[key].na}
                        onChange={() => handleChecklistCheck(key, 'na')}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 3 }} />

        {/* Section 2A: Coating Application */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 2A – Coating Application</Typography>
        <Grid
          container
          spacing={2}
          sx={{
            width: '100%',
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(8, 1fr)' }
          }}
        >
          <Grid item><TextField label="No." fullWidth /></Grid>
          <Grid item><TextField label="Location" fullWidth /></Grid>
          <Grid item><TextField label="Coating Type/Product ID" fullWidth /></Grid>
          <Grid item><TextField label="Application Method (Spray/Brush)" fullWidth /></Grid>
          <Grid item><TextField label="Application Time Begin" fullWidth /></Grid>
          <Grid item><TextField label="Application Time End" fullWidth /></Grid>
          <Grid item><TextField label="WFT Mils" fullWidth /></Grid>
          <Grid item><TextField label="Comments" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 2B: Mixing Report */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 2B – Mixing Report</Typography>
        <Grid
          container
          spacing={2}
          sx={{
            width: '100%',
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(9, 1fr)' }
          }}
        >
          <Grid item><TextField label="Mix #" fullWidth /></Grid>
          <Grid item><TextField label="Location" fullWidth /></Grid>
          <Grid item><TextField label="Comp A Batch #" fullWidth /></Grid>
          <Grid item><TextField label="Comp B Batch #" fullWidth /></Grid>
          <Grid item><TextField label="Mix Time" fullWidth /></Grid>
          <Grid item><TextField label="Act Induct Time" fullWidth /></Grid>
          <Grid item><TextField label="Pot Life (min)" fullWidth /></Grid>
          <Grid item><TextField label="Qty Used" fullWidth /></Grid>
          <Grid item><TextField label="Witnessed By" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 2C: Coating Application Checklist */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 2C – Coating Application Checklist</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} sx={{ background: '#ddd', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                  Checklist Item
                </TableCell>
                <TableCell
                  colSpan={3}
                  sx={{
                    background: '#ddd',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #333'
                  }}
                >
                  ACCEPTABLE
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold' }}>YES</TableCell>
                <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold' }}>NO</TableCell>
                <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold' }}>N/A</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coatingAppChecklistItems.map((item, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ borderRight: '1px solid #333' }}>{item}</TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={coatingAppChecklist[i].yes}
                      onChange={() => handleCoatingAppChecklistCheck(i, 'yes')}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={coatingAppChecklist[i].no}
                      onChange={() => handleCoatingAppChecklistCheck(i, 'no')}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={coatingAppChecklist[i].na}
                      onChange={() => handleCoatingAppChecklistCheck(i, 'na')}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 3 }} />

        {/* Section 3A: DFT Readings */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 3A – Dry Film Thickness (Hold Point)</Typography>
        {dftRows.map((row, idx) => (
          <Box key={idx} sx={{ mb: 3 }}>
            <Grid
              container
              spacing={2}
              sx={{
                width: '100%',
                m: 0,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(6, 1fr)' }
              }}
            >
              <Grid item>
                <TextField label="No." value={row.no} onChange={e => handleDFTChange(idx, 'no', e.target.value)} fullWidth />
              </Grid>
              <Grid item>
                <TextField label="Location" value={row.location} onChange={e => handleDFTChange(idx, 'location', e.target.value)} fullWidth />
              </Grid>
              <Grid item>
                <TextField label="Specified (mils)" value={row.specified} onChange={e => handleDFTChange(idx, 'specified', e.target.value)} fullWidth />
              </Grid>
              <Grid item>
                <TextField label="Average (mils)" value={row.average} onChange={e => handleDFTChange(idx, 'average', e.target.value)} fullWidth />
              </Grid>
              <Grid item>
                <TextField label="Range (mils)" value={row.range} onChange={e => handleDFTChange(idx, 'range', e.target.value)} fullWidth />
              </Grid>
              <Grid item>
                <TextField
                  select
                  label="Rework Required"
                  value={row.rework}
                  onChange={e => handleDFTChange(idx, 'rework', e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                >
                  <option value=""></option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </TextField>
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
                <TextField label="Comments" value={row.comments} onChange={e => handleDFTChange(idx, 'comments', e.target.value)} fullWidth multiline minRows={2} />
              </Grid>
            </Grid>
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={handleAddDFTRow}>Add Location</Button>
          {dftRows.length > 1 && (
            <Button variant="outlined" color="error" onClick={() => handleDeleteDFTRow(dftRows.length - 1)}>
              Delete Last Location
            </Button>
          )}
        </Box>
        <Divider sx={{ my: 3 }} />

        {/* Section 3B: Holiday Inspection (Hold Point) */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 3B – Holiday Inspection (Hold Point)</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <TextField
              label="Jeep Calibration Verified?"
              value={holidayInspections[0].jeepCalibration}
              onChange={e => handleHolidayChange(0, 'jeepCalibration', e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
        {inspectionStages.map((stage, idx) => (
          <Box key={stage} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{stage}</Typography>
            <Grid
              container
              spacing={2}
              sx={{
                width: '100%',
                m: 0,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(6, 1fr)' }
              }}
            >
              <Grid item>
                <TextField
                  label="Inspection Location"
                  value={holidayInspections[idx].inspectionLocation}
                  onChange={e => handleHolidayChange(idx, 'inspectionLocation', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Number of Holidays"
                  value={holidayInspections[idx].numHolidays}
                  onChange={e => handleHolidayChange(idx, 'numHolidays', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Voltage"
                  value={holidayInspections[idx].voltage}
                  onChange={e => handleHolidayChange(idx, 'voltage', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Location of Repairs"
                  value={holidayInspections[idx].repairLocation}
                  onChange={e => handleHolidayChange(idx, 'repairLocation', e.target.value)}
                  fullWidth
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
                  label="Comments"
                  value={holidayInspections[idx].comments}
                  onChange={e => handleHolidayChange(idx, 'comments', e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>
          </Box>
        ))}
        <Divider sx={{ my: 3 }} />

        {/* Section 3C: Instrument Record */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 3C – Instrument Record</Typography>
        <Grid
          container
          spacing={2}
          sx={{
            width: '100%',
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(6, 1fr)' }
          }}
        >
          <Grid item><TextField label="Instrument" fullWidth /></Grid>
          <Grid item><TextField label="Brand" fullWidth /></Grid>
          <Grid item><TextField label="Model" fullWidth /></Grid>
          <Grid item><TextField label="Serial Number" fullWidth /></Grid>
          <Grid item><TextField label="Calibration Date" fullWidth /></Grid>
          <Grid item><TextField label="Comments" fullWidth /></Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 4: Comments/Signatures */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 4 – Comments / Signatures</Typography>
        <Grid
          container
          spacing={2}
          sx={{
            width: '100%',
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }
          }}
        >
          <Grid item><TextField label="Comments" fullWidth multiline minRows={2} /></Grid>
          <Grid item><TextField label="Signature" fullWidth /></Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="contained" color="primary">Submit</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CoatingInspectionReportForm; 