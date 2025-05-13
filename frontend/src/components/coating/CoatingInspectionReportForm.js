import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Divider, Grid, TextField, Button, IconButton, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme, useMediaQuery, Card, CardContent, FormControlLabel } from '@mui/material';
import PageHeader from '../common/PageHeader';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SignatureCanvas from 'react-signature-canvas';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

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

const signaturePadStyles = {
  canvas: {
    width: '100%',
    height: '100%',
    touchAction: 'none',
    backgroundColor: '#fff',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  container: {
    border: '1px solid #ccc',
    borderRadius: 1,
    p: 1,
    bgcolor: '#fff',
    height: 150,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'crosshair',
    overflow: 'hidden',
  },
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

  // Add state for new Section 3C
  const [backfillUsed, setBackfillUsed] = useState('');
  const [rockShieldUsed, setRockShieldUsed] = useState('');

  // Section 3D instrument rows
  const instrumentRows = [
    'Psychrometer',
    'Surface Thermometer',
    'Testex Tape & Micrometer',
    'Surface Prep. Comparator',
    'Chloride Test Kit',
    'Dry Film Gage',
    'Coating Thermometer',
    'Holiday Inspection (Jeep)',
    'Shore D Hardness'
  ];
  const [instrumentTable, setInstrumentTable] = useState(
    instrumentRows.map(() => ({ calibrated: { yes: false, no: false, na: false }, brand: '', serial: '' }))
  );
  const handleInstrumentCheck = (idx, field) => {
    setInstrumentTable(prev => prev.map((row, i) =>
      i === idx
        ? { ...row, calibrated: { yes: field === 'yes' ? !row.calibrated.yes : false, no: field === 'no' ? !row.calibrated.no : false, na: field === 'na' ? !row.calibrated.na : false } }
        : row
    ));
  };
  const handleInstrumentChange = (idx, key, value) => {
    setInstrumentTable(prev => prev.map((row, i) =>
      i === idx ? { ...row, [key]: value } : row
    ));
  };

  const [qcSignature, setQCSignature] = useState('');
  const [qcSigning, setQCSigning] = useState(false);
  const qcPadRef = React.useRef(null);
  const [i3Signature, setI3Signature] = useState('');
  const [i3Signing, setI3Signing] = useState(false);
  const i3PadRef = React.useRef(null);

  const handleSignatureEnd = (padRef, setSignature) => {
    if (padRef.current) {
      try {
        if (!padRef.current.isEmpty()) {
          const signatureData = padRef.current.getTrimmedCanvas().toDataURL('image/png');
          setSignature(signatureData);
        }
      } catch (error) {
        console.error('Error saving signature:', error);
      }
    }
  };
  const clearSignature = (padRef, setSignature) => {
    if (padRef.current) {
      padRef.current.clear();
    }
    setSignature('');
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [deletePromptOpen, setDeletePromptOpen] = useState(false);

  const handleDelete = () => setDeletePromptOpen(true);
  const handleDeleteConfirm = () => {
    setDeletePromptOpen(false);
    // TODO: Delete logic
  };
  const handleDeleteCancel = () => setDeletePromptOpen(false);
  const handleSave = () => { /* TODO: Save logic */ };
  const handleSaveExit = () => { /* TODO: Save & Exit logic */ };
  const handleExit = () => { /* TODO: Exit logic */ };
  const handleSubmit = () => { /* TODO: Submit logic */ };

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
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            {checklistGroups[0].items.map((item, i) => {
              const key = `0-${i}`;
              return (
                <Card key={key} variant="outlined" sx={{ p: 1 }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{item}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                      Acceptable
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'center' }}>
                      <FormControlLabel
                        control={<Checkbox checked={checklist[key].yes} onChange={() => handleChecklistCheck(key, 'yes')} />}
                        label="YES"
                        sx={{ mr: 1 }}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={checklist[key].no} onChange={() => handleChecklistCheck(key, 'no')} />}
                        label="NO"
                        sx={{ mr: 1 }}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={checklist[key].na} onChange={() => handleChecklistCheck(key, 'na')} />}
                        label="N/A"
                      />
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
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
        )}
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
          <Grid item>
            <TextField
              select
              label="Witnessed"
              fullWidth
              defaultValue=""
            >
              <option value=""></option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </TextField>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 2C: Coating Application Checklist */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 2C – Coating Application Checklist</Typography>
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            {coatingAppChecklistItems.map((item, i) => (
              <Card key={i} variant="outlined" sx={{ p: 1 }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{item}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                    Acceptable
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'center' }}>
                    <FormControlLabel
                      control={<Checkbox checked={coatingAppChecklist[i].yes} onChange={() => handleCoatingAppChecklistCheck(i, 'yes')} />}
                      label="YES"
                      sx={{ mr: 1 }}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={coatingAppChecklist[i].no} onChange={() => handleCoatingAppChecklistCheck(i, 'no')} />}
                      label="NO"
                      sx={{ mr: 1 }}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={coatingAppChecklist[i].na} onChange={() => handleCoatingAppChecklistCheck(i, 'na')} />}
                      label="N/A"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
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
        )}
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <TextField
            select
            label="Jeep Calibration Verified?"
            value={holidayInspections[0].jeepCalibration}
            onChange={e => handleHolidayChange(0, 'jeepCalibration', e.target.value)}
            sx={{ minWidth: 250 }}
          >
            <option value=""></option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </TextField>
        </Box>
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
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }
              }}
            >
              <Grid item>
                <TextField
                  label="Location"
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
                  label="Material Used for Repairs"
                  value={holidayInspections[idx].materialUsed}
                  onChange={e => handleHolidayChange(idx, 'materialUsed', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Holiday Detection Voltage"
                  value={holidayInspections[idx].voltage}
                  onChange={e => handleHolidayChange(idx, 'voltage', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  label="Cure Test Shore D Hardness Reading"
                  value={holidayInspections[idx].shoreDHardness}
                  onChange={e => handleHolidayChange(idx, 'shoreDHardness', e.target.value)}
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

        {/* Section 3C: Backfill and Rock Shield */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 3C – Backfill & Rock Shield</Typography>
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
              select
              label="Was backfill used?"
              value={backfillUsed}
              onChange={e => setBackfillUsed(e.target.value)}
              fullWidth
            >
              <option value=""></option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </TextField>
          </Grid>
          <Grid item>
            <TextField
              select
              label="Was Rock Shield Used?"
              value={rockShieldUsed}
              onChange={e => setRockShieldUsed(e.target.value)}
              fullWidth
            >
              <option value=""></option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </TextField>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {/* Section 3D: Instrument Record (was 3C) */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 3D – Instrument Record</Typography>
        {isMobile ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            {instrumentRows.map((instrument, i) => (
              <Card key={instrument} variant="outlined" sx={{ p: 1 }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{instrument}</Typography>
                  <TextField
                    label="Brand"
                    value={instrumentTable[i].brand}
                    onChange={e => handleInstrumentChange(i, 'brand', e.target.value)}
                    variant="outlined"
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    label="Serial Number"
                    value={instrumentTable[i].serial}
                    onChange={e => handleInstrumentChange(i, 'serial', e.target.value)}
                    variant="outlined"
                    fullWidth
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'nowrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>Calibrated:</Typography>
                    <FormControlLabel
                      control={<Checkbox checked={instrumentTable[i].calibrated.yes} onChange={() => handleInstrumentCheck(i, 'yes')} />}
                      label="Yes"
                      sx={{ mr: 1 }}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={instrumentTable[i].calibrated.no} onChange={() => handleInstrumentCheck(i, 'no')} />}
                      label="No"
                      sx={{ mr: 1 }}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={instrumentTable[i].calibrated.na} onChange={() => handleInstrumentCheck(i, 'na')} />}
                      label="N/A"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 2, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ background: '#ddd', whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 } }}></TableCell>
                  <TableCell sx={{ background: '#ddd', whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 } }}></TableCell>
                  <TableCell sx={{ background: '#ddd', whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 } }}></TableCell>
                  <TableCell colSpan={3} sx={{ background: '#ddd', textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid #333', whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 } }}>Calibrated</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #333', whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.85rem', sm: '1rem' } }}>Instrument</TableCell>
                  <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold', whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.85rem', sm: '1rem' } }}>Brand</TableCell>
                  <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold', whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.85rem', sm: '1rem' } }}>Serial Number</TableCell>
                  <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid #333', whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.85rem', sm: '1rem' } }}>Yes</TableCell>
                  <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold', whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.85rem', sm: '1rem' } }}>No</TableCell>
                  <TableCell sx={{ background: '#eee', textAlign: 'center', fontWeight: 'bold', whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.85rem', sm: '1rem' } }}>N/A</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instrumentRows.map((instrument, i) => (
                  <TableRow key={instrument} sx={{ py: 0.5 }}>
                    <TableCell sx={{ borderRight: '1px solid #333', fontWeight: 'bold', py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.95rem', sm: '1rem' } }}>{instrument}</TableCell>
                    <TableCell sx={{ py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                      <TextField value={instrumentTable[i].brand} onChange={e => handleInstrumentChange(i, 'brand', e.target.value)} variant="outlined" fullWidth size="small" />
                    </TableCell>
                    <TableCell sx={{ py: 0.5, whiteSpace: 'normal', wordBreak: 'break-word', p: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                      <TextField value={instrumentTable[i].serial} onChange={e => handleInstrumentChange(i, 'serial', e.target.value)} variant="outlined" fullWidth size="small" />
                    </TableCell>
                    <TableCell align="center" sx={{ borderLeft: '1px solid #333', py: 0.5, p: { xs: 0.5, sm: 1 } }}>
                      <Checkbox checked={instrumentTable[i].calibrated.yes} onChange={() => handleInstrumentCheck(i, 'yes')} />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.5, p: { xs: 0.5, sm: 1 } }}>
                      <Checkbox checked={instrumentTable[i].calibrated.no} onChange={() => handleInstrumentCheck(i, 'no')} />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.5, p: { xs: 0.5, sm: 1 } }}>
                      <Checkbox checked={instrumentTable[i].calibrated.na} onChange={() => handleInstrumentCheck(i, 'na')} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Divider sx={{ my: 3 }} />

        {/* Section 3E: Additional Comments */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 3E – Additional Comments</Typography>
        <TextField label="Comments" fullWidth multiline minRows={3} sx={{ mb: 3 }} />

        {/* Section 4: Comments/Signatures */}
        <Typography variant="h6" sx={{ mb: 2 }}>Section 4 – Comments / Signatures</Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableBody>
              {/* Contractor QC Inspector Block */}
              <TableRow>
                <TableCell sx={{ width: '50%' }}>
                  <TextField label="Contractor QC Inspector NACE #" fullWidth size="small" InputProps={{ style: { fontStyle: 'italic' } }} />
                </TableCell>
                <TableCell sx={{ width: '50%' }}>
                  <TextField label="Date" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2}>
                  <TextField label="Contractor QC Inspector Name" fullWidth size="small" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2}>
                  {/* Contractor QC Inspector Signature Pad */}
                  <Box sx={signaturePadStyles.container}>
                    {!qcSigning && qcSignature ? (
                      <React.Fragment>
                        <img
                          src={qcSignature}
                          alt="QC Inspector Signature"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                        />
                        <Button
                          size="small"
                          onClick={() => { setQCSigning(true); clearSignature(qcPadRef, setQCSignature); }}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Sign Again
                        </Button>
                      </React.Fragment>
                    ) : qcSigning ? (
                      <React.Fragment>
                        <SignatureCanvas
                          ref={qcPadRef}
                          penColor="black"
                          backgroundColor="white"
                          canvasProps={{
                            width: 400,
                            height: 150,
                            style: {
                              width: '100%',
                              height: '100%',
                              touchAction: 'none',
                              background: '#fff',
                              borderRadius: 4,
                              display: 'block',
                            }
                          }}
                          onEnd={() => handleSignatureEnd(qcPadRef, setQCSignature)}
                        />
                        <Button
                          size="small"
                          onClick={() => setQCSigning(false)}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Done
                        </Button>
                        <Button
                          size="small"
                          onClick={() => clearSignature(qcPadRef, setQCSignature)}
                          sx={{ position: 'absolute', top: 4, left: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Clear
                        </Button>
                      </React.Fragment>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={() => setQCSigning(true)}
                        fullWidth
                        sx={{ height: '100%' }}
                      >
                        Sign
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
              {/* i3 Rep Block */}
              <TableRow>
                <TableCell sx={{ width: '50%' }}>
                  <TextField label="Client NACE #" fullWidth size="small" InputProps={{ style: { fontStyle: 'italic' } }} />
                </TableCell>
                <TableCell sx={{ width: '50%' }}>
                  <TextField label="Date" type="date" InputLabelProps={{ shrink: true }} fullWidth size="small" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2}>
                  <TextField label="Client Name" fullWidth size="small" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2}>
                  {/* i3 Rep Signature Pad */}
                  <Box sx={signaturePadStyles.container}>
                    {!i3Signing && i3Signature ? (
                      <React.Fragment>
                        <img
                          src={i3Signature}
                          alt="i3 Rep Signature"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                        />
                        <Button
                          size="small"
                          onClick={() => { setI3Signing(true); clearSignature(i3PadRef, setI3Signature); }}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Sign Again
                        </Button>
                      </React.Fragment>
                    ) : i3Signing ? (
                      <React.Fragment>
                        <SignatureCanvas
                          ref={i3PadRef}
                          penColor="black"
                          backgroundColor="white"
                          canvasProps={{
                            width: 400,
                            height: 150,
                            style: {
                              width: '100%',
                              height: '100%',
                              touchAction: 'none',
                              background: '#fff',
                              borderRadius: 4,
                              display: 'block',
                            }
                          }}
                          onEnd={() => handleSignatureEnd(i3PadRef, setI3Signature)}
                        />
                        <Button
                          size="small"
                          onClick={() => setI3Signing(false)}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Done
                        </Button>
                        <Button
                          size="small"
                          onClick={() => clearSignature(i3PadRef, setI3Signature)}
                          sx={{ position: 'absolute', top: 4, left: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Clear
                        </Button>
                      </React.Fragment>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={() => setI3Signing(true)}
                        fullWidth
                        sx={{ height: '100%' }}
                      >
                        Sign
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: { xs: 'stretch', sm: 'flex-end' },
            alignItems: { xs: 'stretch', sm: 'center' },
            mt: 3,
            gap: { xs: 0, sm: 2 },
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={handleDelete}
            fullWidth
            sx={{ mb: { xs: 1.5, sm: 0 }, maxWidth: { sm: 120 } }}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{ bgcolor: '#222', color: '#fff', '&:hover': { bgcolor: '#111' }, mb: { xs: 1.5, sm: 0 }, maxWidth: { sm: 120 } }}
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{ bgcolor: '#222', color: '#fff', '&:hover': { bgcolor: '#111' }, mb: { xs: 1.5, sm: 0 }, maxWidth: { sm: 140 } }}
            onClick={handleSaveExit}
          >
            Save & Exit
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ bgcolor: '#fff', color: '#222', borderColor: '#ccc', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#aaa' }, mb: { xs: 2.5, sm: 0 }, maxWidth: { sm: 120 } }}
            onClick={handleExit}
          >
            Exit
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            fullWidth
            sx={{ maxWidth: { sm: 120 } }}
          >
            Submit
          </Button>
        </Box>
        <Dialog open={deletePromptOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Report?</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this report? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default CoatingInspectionReportForm; 