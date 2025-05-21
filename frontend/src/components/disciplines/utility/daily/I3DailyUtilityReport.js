import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Checkbox, Card, CardContent, Grid } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, PhotoCamera } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import PageHeader from '../../../../components/common/PageHeader';
import styles from './I3DailyUtilityReport.module.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const constructionPhaseOptions = [
  "MOBILIZATION",
  "DEVELOPING ACCESS ROADS",
  "TREE FELLING",
  "CLEARING RIGHT OF WAY",
  "GRADING RIGHT OF WAY",
  "EXCAVATING DITCH",
  "STRINGING",
  "BEND PIPE",
  "WELD PIPE",
  "COATING",
  "LOWER IN PIPE",
  "BACKFILL PIPE",
  "PERFORMANCE TEST, ANOMALY REPAIRS, AND DRYING",
  "CLEAN-UP, SEEDING, AND MULCHING",
  "TEMPORARY HDPE WATER LINE",
  "Other"
];

const defaultRow = () => ({
  phase: '', customPhase: '', startSta: '', endSta: '', dailyFootage: '', cumulativeFootage: '', percentComplete: '', contractor: '', crew: '', hours: '', equipment: '', qty: '', hoursUsed: ''
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

// Helper to get weekday from date
function getWeekday(date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString(undefined, { weekday: 'long' });
  } catch {
    return '';
  }
}

const I3DailyUtilityReport = () => {
  const [header, setHeader] = useState({
    project: '', inspector: '', afe: '', contractor: '', date: null, reportNo: 'Pending', weekday: '', totalFootage: '', spread: ''
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
  const [showSigDatePicker, setShowSigDatePicker] = useState(false);
  const [equipmentRows, setEquipmentRows] = useState([{ equipment: '', qty: '', hoursUsed: '' }]);

  // Add usePrevious hook
  const prevSigning = usePrevious(signing);

  // Handlers
  const handleHeaderChange = e => setHeader({ ...header, [e.target.name]: e.target.value });
  const handleWeatherChange = (period, field, value) => setWeather(w => ({ ...w, [period]: { ...w[period], [field]: value } }));
  const handleRowChange = (idx, field, value) => setRows(rows.map((row, i) => {
    if (i !== idx) return row;
    if (field === 'phase' && value !== 'Other') {
      // Reset customPhase if not 'Other'
      return { ...row, phase: value, customPhase: '' };
    }
    return { ...row, [field]: value };
  }));
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
    navigate('/utility/reports/daily/i3/review', { state: { header, weather, am, pm, rows, equipmentRows, generalSummary, landSummary, envSummary, safety, preparedBy, signature, sigDate, photos } });
  };

  useEffect(() => {
    if (signing && !prevSigning && sigPadRef.current) {
      sigPadRef.current.clear();
    }
  }, [signing, prevSigning]);

  useEffect(() => {
    // Pre-fill form if editing a draft
    const draftId = localStorage.getItem('i3_daily_utility_current_draftId');
    if (draftId) {
      const draftData = localStorage.getItem(`i3_daily_utility_draft_${draftId}`);
      if (draftData) {
        const draft = JSON.parse(draftData);
        if (draft.header) setHeader(draft.header);
        if (draft.weather) setWeather(draft.weather);
        if (typeof draft.am !== 'undefined') setAm(draft.am);
        if (typeof draft.pm !== 'undefined') setPm(draft.pm);
        if (draft.rows) setRows(draft.rows);
        if (draft.equipmentRows) setEquipmentRows(draft.equipmentRows);
        if (typeof draft.generalSummary !== 'undefined') setGeneralSummary(draft.generalSummary);
        if (typeof draft.landSummary !== 'undefined') setLandSummary(draft.landSummary);
        if (typeof draft.envSummary !== 'undefined') setEnvSummary(draft.envSummary);
        if (typeof draft.safety !== 'undefined') setSafety(draft.safety);
        if (typeof draft.preparedBy !== 'undefined') setPreparedBy(draft.preparedBy);
        if (typeof draft.signature !== 'undefined') setSignature(draft.signature);
        if (typeof draft.sigDate !== 'undefined') setSigDate(draft.sigDate);
        if (draft.photos) setPhotos(draft.photos);
      }
      localStorage.removeItem('i3_daily_utility_current_draftId');
    }
  }, []);

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <PageHeader
          title="I3 Daily Utility Report"
          backPath="/utility/reports"
          backButtonStyle={{ backgroundColor: '#000000', color: '#ffffff', '&:hover': { backgroundColor: '#333333' } }}
        />
        <Paper className={styles.paper} sx={{ mt: 2, p: { xs: 1, sm: 3 } }}>
          <form onSubmit={handleSubmit}>
            {/* Project Info */}
            <Card className={styles.card} sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Project Information</Typography>
                {/* First row: 4 text fields */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                  <TextField label="Project" name="project" value={header.project} onChange={handleHeaderChange} fullWidth sx={{ flex: 1, bgcolor: '#fff' }} />
                  <TextField label="Spread" name="spread" value={header.spread} onChange={handleHeaderChange} fullWidth sx={{ flex: 1, bgcolor: '#fff' }} />
                  <TextField label="Inspector" name="inspector" value={header.inspector} onChange={handleHeaderChange} fullWidth sx={{ flex: 1, bgcolor: '#fff' }} />
                  <TextField label="AFE Number" name="afe" value={header.afe} onChange={handleHeaderChange} fullWidth sx={{ flex: 1, bgcolor: '#fff' }} />
                </Box>
                {/* Second row: Contractor Name and Subcontractors */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2, alignItems: 'flex-start' }}>
                  <TextField label="Contractor" name="contractor" value={header.contractor} onChange={handleHeaderChange} fullWidth sx={{ flex: 1, bgcolor: '#fff' }} />
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, flex: 2, gap: 2, alignItems: 'center' }}>
                    {[1,2,3].map(i => (
                      header[`sub${i}`] !== undefined ? (
                        <Box key={`sub${i}`} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 1 }}>
                          <TextField
                            label={`Subcontractor ${i}`}
                            name={`sub${i}`}
                            value={header[`sub${i}`]}
                            onChange={handleHeaderChange}
                            fullWidth
                            sx={{ bgcolor: '#fff', minWidth: 180 }}
                          />
                          <IconButton
                            aria-label={`Remove Subcontractor ${i}`}
                            onClick={() => {
                              const newHeader = { ...header };
                              delete newHeader[`sub${i}`];
                              setHeader(newHeader);
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : null
                    ))}
                    {([1,2,3].filter(i => header[`sub${i}`] !== undefined).length < 3) && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          const nextSub = [1,2,3].find(i => header[`sub${i}`] === undefined);
                          if (nextSub) setHeader({ ...header, [`sub${nextSub}`]: '' });
                        }}
                        sx={{ height: 40, minWidth: 60, px: 2 }}
                      >
                        +Sub
                      </Button>
                    )}
                  </Box>
                </Box>
                {/* Third row: Report Number, Date, Weekday, Total Footage */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <TextField label="Report No." name="reportNo" value={header.reportNo} fullWidth sx={{ flex: 1, bgcolor: '#fff' }} InputProps={{ readOnly: true }} />
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={header.date}
                      onChange={date => setHeader(h => ({ ...h, date }))}
                      slotProps={{ textField: { fullWidth: true, sx: { flex: 1, bgcolor: '#fff' } } }}
                    />
                  </LocalizationProvider>
                  <TextField label="Weekday" name="weekday" value={getWeekday(header.date)} fullWidth sx={{ flex: 1, bgcolor: '#fff' }} InputProps={{ readOnly: true }} />
                  <TextField label="Total Footage" name="totalFootage" value={header.totalFootage} onChange={handleHeaderChange} fullWidth sx={{ flex: 1, bgcolor: '#fff' }} />
                </Box>
              </CardContent>
            </Card>
            {/* Weather */}
            <Card className={styles.card} sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
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
                        sx={{ bgcolor: '#fff' }}
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
                        sx={{ bgcolor: '#fff' }}
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
                        sx={{ bgcolor: '#fff' }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
            {/* Construction Phases */}
            <Card className={styles.card} sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Construction Phases</Typography>
                <Stack spacing={2}>
                  {rows.map((row, idx) => (
                    <Paper key={idx} sx={{ p: 2, pb: 6, position: 'relative', width: '100%', bgcolor: '#f3f3f3' }}>
                      {/* First row */}
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <TextField
                            select
                            label="Construction Phase"
                            value={row.phase}
                            onChange={e => handleRowChange(idx, 'phase', e.target.value)}
                            SelectProps={{ native: true }}
                            fullWidth
                            sx={{ bgcolor: '#fff' }}
                          >
                            <option value=""></option>
                            {constructionPhaseOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </TextField>
                          {row.phase === "Other" && (
                            <TextField
                              label="Custom Phase"
                              value={row.customPhase || ""}
                              onChange={e => handleRowChange(idx, 'customPhase', e.target.value)}
                              fullWidth
                              sx={{ mt: 1, bgcolor: '#fff' }}
                            />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <TextField label="Start Sta." value={row.startSta} onChange={e => handleRowChange(idx, 'startSta', e.target.value)} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <TextField label="End Sta." value={row.endSta} onChange={e => handleRowChange(idx, 'endSta', e.target.value)} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Box>
                      </Box>
                      {/* Second row */}
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <TextField label="Daily Footage" value={row.dailyFootage} onChange={e => handleRowChange(idx, 'dailyFootage', e.target.value)} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <TextField label="Cumulative Footage" value={row.cumulativeFootage} onChange={e => handleRowChange(idx, 'cumulativeFootage', e.target.value)} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <TextField label="% Complete" value={row.percentComplete} onChange={e => handleRowChange(idx, 'percentComplete', e.target.value)} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Box>
                      </Box>
                      {/* Third row */}
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <TextField label="Contractor Name" value={row.contractor} onChange={e => handleRowChange(idx, 'contractor', e.target.value)} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <TextField label="Number in Crew" value={row.crew} onChange={e => handleRowChange(idx, 'crew', e.target.value)} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <TextField label="Total Hours" value={row.hours} onChange={e => handleRowChange(idx, 'hours', e.target.value)} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Box>
                      </Box>
                      {/* Delete button in bottom right */}
                      <IconButton
                        onClick={() => handleRemoveRow(idx)}
                        sx={{ position: 'absolute', bottom: 8, right: 8 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Paper>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={handleAddRow}>Add Row</Button>
                </Stack>
              </CardContent>
            </Card>
            {/* Equipment Section */}
            <Card className={styles.card} sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Equipment</Typography>
                <Stack spacing={2}>
                  {equipmentRows.map((row, idx) => (
                    <Box key={idx} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', position: 'relative', pb: 4 }}>
                      <TextField
                        label="Equipment"
                        value={row.equipment}
                        onChange={e => setEquipmentRows(equipmentRows.map((r, i) => i === idx ? { ...r, equipment: e.target.value } : r))}
                        fullWidth
                        sx={{ bgcolor: '#fff' }}
                      />
                      <TextField
                        label="Qty of Each"
                        value={row.qty}
                        onChange={e => setEquipmentRows(equipmentRows.map((r, i) => i === idx ? { ...r, qty: e.target.value } : r))}
                        fullWidth
                        sx={{ bgcolor: '#fff' }}
                      />
                      <TextField
                        label="Hours Used"
                        value={row.hoursUsed}
                        onChange={e => setEquipmentRows(equipmentRows.map((r, i) => i === idx ? { ...r, hoursUsed: e.target.value } : r))}
                        fullWidth
                        sx={{ bgcolor: '#fff' }}
                      />
                      <IconButton
                        onClick={() => setEquipmentRows(equipmentRows.length > 1 ? equipmentRows.filter((_, i) => i !== idx) : equipmentRows)}
                        sx={{ position: 'absolute', bottom: 8, right: 8 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button startIcon={<AddIcon />} onClick={() => setEquipmentRows([...equipmentRows, { equipment: '', qty: '', hoursUsed: '' }])}>
                    Add Equipment
                  </Button>
                </Stack>
              </CardContent>
            </Card>
            {/* Summaries */}
            <Card className={styles.card} sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Summaries</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="General Summary" value={generalSummary} onChange={e => setGeneralSummary(e.target.value)} fullWidth multiline rows={2} sx={{ bgcolor: '#fff' }} />
                  <TextField label="Land Summary" value={landSummary} onChange={e => setLandSummary(e.target.value)} fullWidth multiline rows={2} sx={{ bgcolor: '#fff' }} />
                  <TextField label="Environmental Summary" value={envSummary} onChange={e => setEnvSummary(e.target.value)} fullWidth multiline rows={2} sx={{ bgcolor: '#fff' }} />
                  <TextField label="Safety Concerns / Visitors / Events" value={safety} onChange={e => setSafety(e.target.value)} fullWidth multiline rows={2} sx={{ bgcolor: '#fff' }} />
                </Box>
              </CardContent>
            </Card>
            {/* Signature */}
            <Card className={styles.card} sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Inspector Signature</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Inspector/Report Prepared by"
                    value={preparedBy}
                    onChange={e => setPreparedBy(e.target.value)}
                    fullWidth
                    sx={{ bgcolor: '#fff' }}
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
                    fullWidth
                    sx={{ bgcolor: '#fff' }}
                    value={sigDate}
                    InputProps={{ readOnly: true }}
                    onClick={e => setShowSigDatePicker(true)}
                  />
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      open={showSigDatePicker}
                      onClose={() => setShowSigDatePicker(false)}
                      label="Date"
                      value={sigDate ? new Date(sigDate) : null}
                      onChange={date => {
                        setSigDate(date ? date.toISOString().slice(0, 10) : '');
                        setShowSigDatePicker(false);
                      }}
                      slotProps={{ textField: { style: { display: 'none' } } }}
                    />
                  </LocalizationProvider>
                </Box>
              </CardContent>
            </Card>
            {/* Photos */}
            <Card className={styles.card} sx={{ mb: 2, bgcolor: '#f3f3f3' }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
              <Button type="submit" variant="contained" color="primary">Review</Button>
              <Button variant="outlined" color="success" onClick={() => {
                // Save as draft logic
                const draftKey = `i3_daily_utility_draft_${Date.now()}`;
                const draftData = {
                  header,
                  weather,
                  am,
                  pm,
                  rows,
                  equipmentRows,
                  generalSummary,
                  landSummary,
                  envSummary,
                  safety,
                  preparedBy,
                  signature,
                  sigDate,
                  photos,
                  lastModified: Date.now(),
                };
                localStorage.setItem(draftKey, JSON.stringify(draftData));
                alert('Draft saved!');
              }}>Save</Button>
              <Button variant="outlined" color="error" onClick={() => {
                if (window.confirm('Are you sure you want to delete this report?')) {
                  // Placeholder: implement delete logic here
                  alert('Report deleted.');
                  navigate('/'); // Or wherever you want to go after delete
                }
              }}>Delete</Button>
              <Button variant="outlined" onClick={() => {
                if (window.confirm('Are you sure you want to exit? Unsaved changes will be lost.')) {
                  navigate('/'); // Or wherever you want to go on exit
                }
              }}>Exit</Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default I3DailyUtilityReport; 