import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Checkbox, Card, CardContent, Grid } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PhotoCamera } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import PageHeader from '../../../../components/common/PageHeader';
import styles from './I3DailyUtilityReport.module.css';

const defaultRow = () => ({
  phase: '', startSta: '', endSta: '', dailyFootage: '', cumulativeFootage: '', percentComplete: '', contractor: '', crew: '', hours: '', equipment: '', qty: '', hoursUsed: ''
});
const defaultWeather = { clear: false, cloudy: false, rain: false, snow: false, temp: '' };

const skyCoverOptions = [
  'Clear',
  'Partly Cloudy',
  'Mostly Cloudy',
  'Overcast',
];
const precipOptions = [
  'None',
  'Drizzle',
  'Rain',
  'Snow',
  'Thunderstorm',
  'Other',
];

// Add usePrevious hook
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const I3DailyUtilityReport = () => {
  const [header, setHeader] = useState({
    project: '', inspector: '', afe: '', contractor: '', sub1: '', sub2: '', sub3: '', date: '', reportNo: '', weekday: '', totalFootage: '', spread: ''
  });
  const [weather, setWeather] = useState({
    am: { sky: '', precip: '', temp: '' },
    pm: { sky: '', precip: '', temp: '' }
  });
  const [am, setAm] = useState(false);
  const [pm, setPm] = useState(false);
  const [rows, setRows] = useState([defaultRow()]);
  const [generalSummary, setGeneralSummary] = useState('');
  const [landSummary, setLandSummary] = useState('');
  const [envSummary, setEnvSummary] = useState('');
  const [safety, setSafety] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [signature, setSignature] = useState('');
  const [sigDate, setSigDate] = useState('');
  const [signing, setSigning] = useState(false);
  const sigPadRef = useRef();
  const [photos, setPhotos] = useState([]);
  const navigate = useNavigate();

  // Add usePrevious hook
  const prevSigning = usePrevious(signing);

  // Handlers
  const handleHeaderChange = e => setHeader({ ...header, [e.target.name]: e.target.value });
  const handleWeatherChange = (period, field, value) => setWeather(w => ({ ...w, [period]: { ...w[period], [field]: value } }));
  const handleRowChange = (idx, field, value) => setRows(rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  const handleAddRow = () => setRows([...rows, defaultRow()]);
  const handleRemoveRow = idx => setRows(rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows);

  // Signature
  const handleClearSig = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
    setSignature('');
    setSigning(false);
  };
  const handleEndSig = () => { setSignature(sigPadRef.current.getTrimmedCanvas().toDataURL('image/png')); setSigning(false); };

  // Photos
  const handlePhotoChange = e => {
    const files = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...files]);
  };
  const handleRemovePhoto = idx => setPhotos(photos.filter((_, i) => i !== idx));

  // Submit
  const handleSubmit = e => {
    e.preventDefault();
    navigate('/utility/reports/daily/i3/review', { state: { header, weather, am, pm, rows, generalSummary, landSummary, envSummary, safety, preparedBy, signature, sigDate, photos } });
  };

  useEffect(() => {
    if (signing && !prevSigning && sigPadRef.current) {
      sigPadRef.current.clear();
    }
  }, [signing, prevSigning]);

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <PageHeader
          title="I3 Daily Utility Report"
          backPath="/utility"
          backButtonStyle={{ backgroundColor: '#000000', color: '#ffffff', '&:hover': { backgroundColor: '#333333' } }}
        />
        <Paper className={styles.paper} sx={{ mt: 2, p: { xs: 1, sm: 3 } }}>
          <form onSubmit={handleSubmit}>
            {/* Project Info */}
            <Card className={styles.card} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Project Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Project" name="project" value={header.project} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Spread" name="spread" value={header.spread} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Inspector" name="inspector" value={header.inspector} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="AFE Number" name="afe" value={header.afe} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Contractor" name="contractor" value={header.contractor} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Subcontractor" name="sub1" value={header.sub1} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Subcontractor" name="sub2" value={header.sub2} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Subcontractor" name="sub3" value={header.sub3} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Date" name="date" value={header.date} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Report No." name="reportNo" value={header.reportNo} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Weekday" name="weekday" value={header.weekday} onChange={handleHeaderChange} fullWidth /></Grid>
                  <Grid item xs={12} sm={6} md={4}><TextField label="Total Footage" name="totalFootage" value={header.totalFootage} onChange={handleHeaderChange} fullWidth /></Grid>
                </Grid>
              </CardContent>
            </Card>
            {/* Weather */}
            <Card className={styles.card} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Weather</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {['am', 'pm'].map(period => (
                    <Box
                      key={period}
                      className={styles.weatherSubBox}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>{period.toUpperCase()} Weather</Typography>
                      <TextField
                        select
                        label="Sky Cover"
                        value={weather[period].sky}
                        onChange={e => handleWeatherChange(period, 'sky', e.target.value)}
                        SelectProps={{ native: true }}
                        fullWidth
                      >
                        <option value=""></option>
                        {skyCoverOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </TextField>
                      <TextField
                        select
                        label="Precipitation Type"
                        value={weather[period].precip}
                        onChange={e => handleWeatherChange(period, 'precip', e.target.value)}
                        SelectProps={{ native: true }}
                        fullWidth
                      >
                        <option value=""></option>
                        {precipOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </TextField>
                      <TextField
                        label="Temp (°F)"
                        type="number"
                        value={weather[period].temp}
                        onChange={e => handleWeatherChange(period, 'temp', e.target.value)}
                        fullWidth
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
            {/* Construction Table */}
            <Card className={styles.card} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Construction Phases</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>CONSTRUCTION PHASE</TableCell>
                        <TableCell>START STA.</TableCell>
                        <TableCell>END STA.</TableCell>
                        <TableCell>DAILY FOOTAGE</TableCell>
                        <TableCell>CUMULATIVE FOOTAGE</TableCell>
                        <TableCell>% Complete</TableCell>
                        <TableCell>CONTRACTOR NAME</TableCell>
                        <TableCell>NUMBER IN CREW</TableCell>
                        <TableCell>TOTAL HOURS</TableCell>
                        <TableCell>EQUIPMENT</TableCell>
                        <TableCell>QTY OF EACH</TableCell>
                        <TableCell>HOURS USED</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell><TextField value={row.phase} onChange={e => handleRowChange(idx, 'phase', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.startSta} onChange={e => handleRowChange(idx, 'startSta', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.endSta} onChange={e => handleRowChange(idx, 'endSta', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.dailyFootage} onChange={e => handleRowChange(idx, 'dailyFootage', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.cumulativeFootage} onChange={e => handleRowChange(idx, 'cumulativeFootage', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.percentComplete} onChange={e => handleRowChange(idx, 'percentComplete', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.contractor} onChange={e => handleRowChange(idx, 'contractor', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.crew} onChange={e => handleRowChange(idx, 'crew', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.hours} onChange={e => handleRowChange(idx, 'hours', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.equipment} onChange={e => handleRowChange(idx, 'equipment', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.qty} onChange={e => handleRowChange(idx, 'qty', e.target.value)} size="small" /></TableCell>
                          <TableCell><TextField value={row.hoursUsed} onChange={e => handleRowChange(idx, 'hoursUsed', e.target.value)} size="small" /></TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleRemoveRow(idx)} disabled={rows.length === 1}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button startIcon={<AddIcon />} onClick={handleAddRow} sx={{ mt: 2 }}>Add Row</Button>
              </CardContent>
            </Card>
            {/* Summaries */}
            <Card className={styles.card} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Summaries</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="General Summary" value={generalSummary} onChange={e => setGeneralSummary(e.target.value)} fullWidth multiline rows={2} />
                  <TextField label="Land Summary" value={landSummary} onChange={e => setLandSummary(e.target.value)} fullWidth multiline rows={2} />
                  <TextField label="Environmental Summary" value={envSummary} onChange={e => setEnvSummary(e.target.value)} fullWidth multiline rows={2} />
                  <TextField label="Safety Concerns / Visitors / Events" value={safety} onChange={e => setSafety(e.target.value)} fullWidth multiline rows={2} />
                </Box>
              </CardContent>
            </Card>
            {/* Signature */}
            <Card className={styles.card} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Inspector Signature</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Inspector/Report Prepared by"
                    value={preparedBy}
                    onChange={e => setPreparedBy(e.target.value)}
                    fullWidth
                  />
                  <Box
                    sx={{
                      width: '100%',
                      minHeight: 100,
                      height: 100,
                      border: '1px solid #222',
                      borderRadius: 2,
                      background: '#fff',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      p: 1,
                    }}
                  >
                    {!signing && signature ? (
                      <>
                        <img
                          src={signature}
                          alt="Signature"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff', display: 'block' }}
                        />
                        <Button
                          size="small"
                          onClick={() => setSigning(true)}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Sign Again
                        </Button>
                      </>
                    ) : signing ? (
                      <>
                        <SignaturePad
                          ref={sigPadRef}
                          canvasProps={{ width: 300, height: 100, className: styles['signature-canvas'] }}
                        />
                        <Button
                          size="small"
                          onClick={handleEndSig}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Done
                        </Button>
                        <Button
                          size="small"
                          onClick={handleClearSig}
                          sx={{ position: 'absolute', top: 4, left: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Clear
                        </Button>
                      </>
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                        onClick={() => setSigning(true)}
                      >
                        <Typography sx={{ color: '#bbb', fontSize: 18, userSelect: 'none', pointerEvents: 'none' }}>
                          Tap to Sign
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <TextField
                    label="Date"
                    value={sigDate}
                    onChange={e => setSigDate(e.target.value)}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
            {/* Photos */}
            <Card className={styles.card} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Photos</Typography>
                <Button variant="outlined" component="label" startIcon={<PhotoCamera />} sx={{ mb: 2 }}>
                  Add Photo
                  <input type="file" accept="image/*" multiple capture="environment" hidden onChange={handlePhotoChange} />
                </Button>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {photos.map((file, idx) => (
                    <Box key={idx} sx={{ position: 'relative', width: 100, height: 100, border: '1px solid #ccc', borderRadius: 2, overflow: 'hidden', bgcolor: '#fafafa' }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Photo ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: '#fff' }} onClick={() => handleRemovePhoto(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
            {/* Review Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button type="submit" variant="contained" color="primary">Review</Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default I3DailyUtilityReport; 