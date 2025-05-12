import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  MenuItem,
} from '@mui/material';
import PageHeader from '../common/PageHeader';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const initialState = {
  project: '',
  workDate: '',
  contractor: '',
  constructionWBS: '',
  inspector: '',
  retirementWBS: '',
  activity: '',
  hoursWorked: '',
  weldersOnsite: '',
  welds: {
    fab: { toDate: '', today: '', total: '' },
    onsite: { toDate: '', today: '', total: '' },
    tieIn: { toDate: '', today: '', total: '' },
    test: { toDate: '', today: '', total: '' },
  },
  xray: {
    fab: { toDate: '', today: '', total: '' },
    onsite: { toDate: '', today: '', total: '' },
    tieIn: { toDate: '', today: '', total: '' },
    test: { toDate: '', today: '', total: '' },
  },
  weldsRejected: {
    fab: { repaired: '', rejected: '', total: '' },
    onsite: { repaired: '', rejected: '', total: '' },
    tieIn: { repaired: '', rejected: '', total: '' },
    test: { repaired: '', rejected: '', total: '' },
  },
  xrayRepair: {
    fab: { repaired: '', rejected: '', total: '' },
    onsite: { repaired: '', rejected: '', total: '' },
    tieIn: { repaired: '', rejected: '', total: '' },
    test: { repaired: '', rejected: '', total: '' },
  },
  pipeInstalled: { size: '', footage: '', from: '', to: '' },
  roadXing: { size: '', footage: '', from: '', to: '', bore: '' },
  streamXings: { size: '', footage: '', from: '', to: '' },
  tapsInstalled: { size: '', no: '' },
  blockGates: { size: '', no: '' },
  cutOut2: { size: '', defect: '' },
  cutOut1: { size: '', defect: '' },
  weldingInspectorName: '',
  weldingInspectorSignature: '',
  contractorName: '',
  contractorSignature: '',
  supervisorName: '',
  supervisorSignature: '',
  weather: {
    skyCover: '',
    temperature: '',
    precipitationType: '',
  },
};

// Weather dropdown options from SWPPP
const WEATHER_OPTIONS = [
  'Sunny',
  'Mostly Sunny',
  'Partly Sunny',
  'Cloudy',
  'Overcast',
];
const PRECIP_TYPE_OPTIONS = [
  'none', 'drizzle', 'rain', 'snow', 'sleet', 'hail'
];

// Add these styles at the top of the file, after the imports
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
    '&:hover': {
      borderColor: 'primary.main',
    },
    '&:active': {
      borderColor: 'primary.dark',
    },
    overflow: 'hidden',
  },
  clearButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 'auto',
    p: 0.5,
    zIndex: 2,
    bgcolor: 'rgba(255, 255, 255, 0.9)',
    '&:hover': {
      bgcolor: 'rgba(255, 255, 255, 1)',
    },
  },
  prompt: {
    position: 'absolute',
    pointerEvents: 'none',
    opacity: 0.5,
    zIndex: 1,
    userSelect: 'none',
  }
};

const useSignaturePadLock = () => {
  const [isSigning, setIsSigning] = useState(false);
  return [isSigning, setIsSigning];
};

const DailyWeldingReportForm = () => {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const [exitPromptOpen, setExitPromptOpen] = useState(false);
  const [deletePromptOpen, setDeletePromptOpen] = useState(false);

  // Load draft on component mount
  useEffect(() => {
    const draftId = new URLSearchParams(window.location.search).get('draftId');
    if (draftId) {
      const savedDrafts = JSON.parse(localStorage.getItem('dailyWeldingReportDrafts') || '[]');
      const draft = savedDrafts.find(d => d.draftId === draftId);
      if (draft) {
        setForm({
          ...draft,
          draftId,
          weather: draft.weather || { skyCover: '', temperature: '', precipitationType: '' }
        });
      }
    }
  }, []);

  // Signature pad refs
  const weldingInspectorPadRef = useRef(null);
  const contractorPadRef = useRef(null);
  const supervisorPadRef = useRef(null);

  // Helper to safely parse numbers
  const num = (val) => Number(val) || 0;

  // Signature handlers for react-signature-canvas
  const handleSignatureEnd = (padRef, fieldName) => {
    if (padRef.current) {
      try {
        if (!padRef.current.isEmpty()) {
          const signatureData = padRef.current.getTrimmedCanvas().toDataURL('image/png');
          setForm(prev => ({ ...prev, [fieldName]: signatureData }));
        }
      } catch (error) {
        console.error('Error saving signature:', error);
      }
    }
  };

  const clearSignature = (padRef, fieldName) => {
    if (padRef.current) {
      padRef.current.clear();
    }
    setForm(prev => ({ ...prev, [fieldName]: '' }));
  };

  // Calculate totals for each section
  const calculateWeldsTotal = () => {
    return ['fab', 'onsite', 'tieIn', 'test'].reduce((sum, loc) => 
      sum + num(form.welds[loc].total), 0);
  };

  const calculateXrayTotal = () => {
    return ['fab', 'onsite', 'tieIn', 'test'].reduce((sum, loc) => 
      sum + num(form.xray[loc].total), 0);
  };

  const calculateRejectedTotal = () => {
    return ['fab', 'onsite', 'tieIn', 'test'].reduce((sum, loc) => 
      sum + num(form.weldsRejected[loc].total), 0);
  };

  const calculateXrayRepairTotal = () => {
    return ['fab', 'onsite', 'tieIn', 'test'].reduce((sum, loc) => 
      sum + num(form.xrayRepair[loc].total), 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleNestedSectionChange = (section, sub, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [sub]: { ...prev[section][sub], [field]: value },
      },
    }));
  };

  const handleWeatherChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      weather: {
        ...prev.weather,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const getCurrentDraftId = () => {
    return form.draftId || new URLSearchParams(window.location.search).get('draftId');
  };

  const handleSave = () => {
    const draftId = getCurrentDraftId() || `draft_${Date.now()}`;
    const draftData = { ...form, savedAt: new Date().toISOString(), draftId };
    const existingDrafts = JSON.parse(localStorage.getItem('dailyWeldingReportDrafts') || '[]');
    const draftIndex = existingDrafts.findIndex(d => d.draftId === draftId);
    let updatedDrafts;
    if (draftIndex !== -1) {
      updatedDrafts = [...existingDrafts];
      updatedDrafts[draftIndex] = draftData;
    } else {
      updatedDrafts = [...existingDrafts, draftData];
    }
    localStorage.setItem('dailyWeldingReportDrafts', JSON.stringify(updatedDrafts));
    setForm(prev => ({ ...prev, draftId }));
    alert('Form saved as draft!');
  };

  const handleSaveAndExit = () => {
    const draftId = getCurrentDraftId() || `draft_${Date.now()}`;
    const draftData = { ...form, savedAt: new Date().toISOString(), draftId };
    const existingDrafts = JSON.parse(localStorage.getItem('dailyWeldingReportDrafts') || '[]');
    const draftIndex = existingDrafts.findIndex(d => d.draftId === draftId);
    let updatedDrafts;
    if (draftIndex !== -1) {
      updatedDrafts = [...existingDrafts];
      updatedDrafts[draftIndex] = draftData;
    } else {
      updatedDrafts = [...existingDrafts, draftData];
    }
    localStorage.setItem('dailyWeldingReportDrafts', JSON.stringify(updatedDrafts));
    setForm(prev => ({ ...prev, draftId }));
    window.location.href = '/welding/reports';
  };

  const handleDelete = () => {
    setDeletePromptOpen(true);
  };

  const handleDeleteConfirm = () => {
    const draftId = new URLSearchParams(window.location.search).get('draftId');
    if (draftId) {
      const savedDrafts = JSON.parse(localStorage.getItem('dailyWeldingReportDrafts') || '[]');
      const updatedDrafts = savedDrafts.filter(draft => draft.draftId !== draftId);
      localStorage.setItem('dailyWeldingReportDrafts', JSON.stringify(updatedDrafts));
    }
    setDeletePromptOpen(false);
    navigate('/welding/reports');
  };

  const handleDeleteCancel = () => {
    setDeletePromptOpen(false);
  };

  // Add lock state for each signature
  const [inspectorSigning, setInspectorSigning] = useState(false);
  const [contractorSigning, setContractorSigning] = useState(false);
  const [supervisorSigning, setSupervisorSigning] = useState(false);

  // Signature section using react-signature-canvas
  const renderSignatureSection = () => (
    <>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>Signatures</Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr 1fr',
        },
        gap: 3,
        width: '100%',
      }}>
        {/* Welding Inspector */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Welding Inspector Name"
            value={form.weldingInspectorName}
            onChange={e => handleChange({ target: { name: 'weldingInspectorName', value: e.target.value } })}
            fullWidth
          />
          <Box sx={{ ...signaturePadStyles.container, minHeight: 150 }}>
            {/* If locked and signature exists, show image and 'Sign Again' */}
            {!inspectorSigning && form.weldingInspectorSignature ? (
              <>
                <img
                  src={form.weldingInspectorSignature}
                  alt="Welding Inspector Signature"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                />
                <Button
                  size="small"
                  onClick={() => { setInspectorSigning(true); clearSignature(weldingInspectorPadRef, 'weldingInspectorSignature'); }}
                  sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                >
                  Sign Again
                </Button>
              </>
            ) : inspectorSigning ? (
              <>
                <SignatureCanvas
                  ref={weldingInspectorPadRef}
                  penColor="black"
                  backgroundColor="white"
                  canvasProps={{
                    width: 400,
                    height: 120,
                    style: {
                      width: '100%',
                      height: '100%',
                      touchAction: 'none',
                      background: '#fff',
                      borderRadius: 4,
                      display: 'block',
                    }
                  }}
                  onEnd={() => handleSignatureEnd(weldingInspectorPadRef, 'weldingInspectorSignature')}
                />
                <Button
                  size="small"
                  onClick={() => setInspectorSigning(false)}
                  sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                >
                  Done
                </Button>
                <Button
                  size="small"
                  onClick={() => clearSignature(weldingInspectorPadRef, 'weldingInspectorSignature')}
                  sx={{ position: 'absolute', top: 4, left: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                >
                  Clear
                </Button>
              </>
            ) : (
              // Always show Sign button if locked and no signature
              <Button
                variant="outlined"
                onClick={() => setInspectorSigning(true)}
                fullWidth
                sx={{ height: '100%' }}
              >
                Sign
              </Button>
            )}
          </Box>
        </Box>
        {/* Contractor */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Contractor Name"
            value={form.contractorName}
            onChange={e => handleChange({ target: { name: 'contractorName', value: e.target.value } })}
            fullWidth
          />
          <Box sx={{ ...signaturePadStyles.container, minHeight: 150 }}>
            {/* If locked and signature exists, show image and 'Sign Again' */}
            {!contractorSigning && form.contractorSignature ? (
              <>
                <img
                  src={form.contractorSignature}
                  alt="Contractor Signature"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                />
                <Button
                  size="small"
                  onClick={() => { setContractorSigning(true); clearSignature(contractorPadRef, 'contractorSignature'); }}
                  sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                >
                  Sign Again
                </Button>
              </>
            ) : contractorSigning ? (
              <>
                <SignatureCanvas
                  ref={contractorPadRef}
                  penColor="black"
                  backgroundColor="white"
                  canvasProps={{
                    width: 400,
                    height: 120,
                    style: {
                      width: '100%',
                      height: '100%',
                      touchAction: 'none',
                      background: '#fff',
                      borderRadius: 4,
                      display: 'block',
                    }
                  }}
                  onEnd={() => handleSignatureEnd(contractorPadRef, 'contractorSignature')}
                />
                <Button
                  size="small"
                  onClick={() => setContractorSigning(false)}
                  sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                >
                  Done
                </Button>
                <Button
                  size="small"
                  onClick={() => clearSignature(contractorPadRef, 'contractorSignature')}
                  sx={{ position: 'absolute', top: 4, left: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                >
                  Clear
                </Button>
              </>
            ) : (
              // Always show Sign button if locked and no signature
              <Button
                variant="outlined"
                onClick={() => setContractorSigning(true)}
                fullWidth
                sx={{ height: '100%' }}
              >
                Sign
              </Button>
            )}
          </Box>
        </Box>
        {/* Supervisor */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Supervisor Name"
            value={form.supervisorName}
            onChange={e => handleChange({ target: { name: 'supervisorName', value: e.target.value } })}
            fullWidth
          />
          <Box sx={{ ...signaturePadStyles.container, minHeight: 150 }}>
            {/* If locked and signature exists, show image and 'Sign Again' */}
            {!supervisorSigning && form.supervisorSignature ? (
              <>
                <img
                  src={form.supervisorSignature}
                  alt="Supervisor Signature"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                />
                <Button
                  size="small"
                  onClick={() => { setSupervisorSigning(true); clearSignature(supervisorPadRef, 'supervisorSignature'); }}
                  sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                >
                  Sign Again
                </Button>
              </>
            ) : supervisorSigning ? (
              <>
                <SignatureCanvas
                  ref={supervisorPadRef}
                  penColor="black"
                  backgroundColor="white"
                  canvasProps={{
                    width: 400,
                    height: 120,
                    style: {
                      width: '100%',
                      height: '100%',
                      touchAction: 'none',
                      background: '#fff',
                      borderRadius: 4,
                      display: 'block',
                    }
                  }}
                  onEnd={() => handleSignatureEnd(supervisorPadRef, 'supervisorSignature')}
                />
                <Button
                  size="small"
                  onClick={() => setSupervisorSigning(false)}
                  sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                >
                  Done
                </Button>
                <Button
                  size="small"
                  onClick={() => clearSignature(supervisorPadRef, 'supervisorSignature')}
                  sx={{ position: 'absolute', top: 4, left: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                >
                  Clear
                </Button>
              </>
            ) : (
              // Always show Sign button if locked and no signature
              <Button
                variant="outlined"
                onClick={() => setSupervisorSigning(true)}
                fullWidth
                sx={{ height: '100%' }}
              >
                Sign
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );

  const handleExit = () => {
    setExitPromptOpen(true);
  };

  const handleExitSave = () => {
    handleSave();
    setExitPromptOpen(false);
    navigate('/welding/reports');
  };

  const handleExitNoSave = () => {
    setExitPromptOpen(false);
    navigate('/welding/reports');
  };

  if (submitted) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Daily Weld Report (Preview)" backPath="/welding/reports/daily" />
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Report Preview (Layout will match your image in final version)</Typography>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(form, null, 2)}</pre>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', p: { xs: 2, sm: 3 }, maxWidth: '100vw', overflowX: 'hidden' }}>
      <PageHeader title="Daily Weld Report" backPath="/welding/reports" />
      <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Daily Weld Report</Typography>
      <Box sx={{ bgcolor: '#fff', border: '2px solid #000', borderRadius: 2, boxShadow: 2, p: { xs: 2, sm: 3 }, width: '100%' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Project Information Section - Always two columns, never stacking */}
          <Typography variant="h6" sx={{ mb: 2 }}>Project Information</Typography>
          <Grid container spacing={2} sx={{ width: '100%', m: 0, display: 'grid', gridTemplateColumns: '1fr 1fr' }} alignItems="stretch">
            <Grid item sx={{ height: '100%' }}>
              <TextField label="Project *" name="project" value={form.project} onChange={handleChange} fullWidth required sx={{ height: '100%' }} />
            </Grid>
            <Grid item sx={{ height: '100%' }}>
              <TextField label="Work Date *" name="workDate" type="date" value={form.workDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required sx={{ height: '100%' }} />
            </Grid>
            <Grid item sx={{ height: '100%' }}>
              <TextField label="Contractor *" name="contractor" value={form.contractor} onChange={handleChange} fullWidth required sx={{ height: '100%' }} />
            </Grid>
            <Grid item sx={{ height: '100%' }}>
              <TextField label="Construction WBS" name="constructionWBS" value={form.constructionWBS} onChange={handleChange} fullWidth sx={{ height: '100%' }} />
            </Grid>
            <Grid item sx={{ height: '100%' }}>
              <TextField label="Inspector" name="inspector" value={form.inspector} onChange={handleChange} fullWidth required sx={{ height: '100%' }} />
            </Grid>
            <Grid item sx={{ height: '100%' }}>
              <TextField label="Retirement WBS" name="retirementWBS" value={form.retirementWBS} onChange={handleChange} fullWidth sx={{ height: '100%' }} />
            </Grid>
          </Grid>

          {/* Today's Activity / Procedures / Weather Section - Compact fields, justified left and right */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Today's Activity / Procedures / Weather</Typography>
          {/* Weather Data Row - full width, three equal columns */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 2, width: '100%' }}>
            <TextField
              select
              label="Sky Cover"
              name="skyCover"
              value={form.weather.skyCover}
              onChange={handleWeatherChange}
              fullWidth
              InputLabelProps={{
                sx: { fontSize: { xs: '1rem', sm: '1.25rem' } }
              }}
            >
              <MenuItem value="">Select...</MenuItem>
              {WEATHER_OPTIONS.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Temp"
              name="temperature"
              value={form.weather.temperature}
              onChange={handleWeatherChange}
              fullWidth
              InputLabelProps={{
                sx: { fontSize: { xs: '1rem', sm: '1.25rem' } }
              }}
            />
            <TextField
              select
              label="Precip"
              name="precipitationType"
              value={form.weather.precipitationType}
              onChange={handleWeatherChange}
              fullWidth
              InputLabelProps={{
                sx: { fontSize: { xs: '1rem', sm: '1.25rem' } }
              }}
            >
              <MenuItem value="">Select...</MenuItem>
              {PRECIP_TYPE_OPTIONS.map(opt => (
                <MenuItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField label="Activity / Procedures / Weather" name="activity" value={form.activity} onChange={handleChange} fullWidth multiline rows={3} sx={{ mb: 2 }} />
          {/* Hours Worked and Welders Onsite - always two columns, never stacking */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: '100%' }}>
            <TextField 
              label="Hours Worked" 
              name="hoursWorked" 
              value={form.hoursWorked} 
              onChange={handleChange} 
              fullWidth
            />
            <TextField 
              label="# Welders Onsite" 
              name="weldersOnsite" 
              value={form.weldersOnsite} 
              onChange={handleChange} 
              fullWidth
            />
          </Box>

          {/* Welds Section - fixed label column, inputs in line, totals row */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Welds</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, width: '100%' }}>
            {/* Header Row */}
            <Box />
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>To Date</Box>
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Today</Box>
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Total</Box>
            {/* Fab/Shop Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Fab / Shop</Box>
            <TextField value={form.welds.fab.toDate} onChange={e => handleNestedSectionChange('welds', 'fab', 'toDate', e.target.value)} fullWidth />
            <TextField value={form.welds.fab.today} onChange={e => handleNestedSectionChange('welds', 'fab', 'today', e.target.value)} fullWidth />
            <TextField value={form.welds.fab.total} onChange={e => handleNestedSectionChange('welds', 'fab', 'total', e.target.value)} fullWidth />
            {/* Onsite Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Onsite</Box>
            <TextField value={form.welds.onsite.toDate} onChange={e => handleNestedSectionChange('welds', 'onsite', 'toDate', e.target.value)} fullWidth />
            <TextField value={form.welds.onsite.today} onChange={e => handleNestedSectionChange('welds', 'onsite', 'today', e.target.value)} fullWidth />
            <TextField value={form.welds.onsite.total} onChange={e => handleNestedSectionChange('welds', 'onsite', 'total', e.target.value)} fullWidth />
            {/* Tie-in Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Tie-in</Box>
            <TextField value={form.welds.tieIn.toDate} onChange={e => handleNestedSectionChange('welds', 'tieIn', 'toDate', e.target.value)} fullWidth />
            <TextField value={form.welds.tieIn.today} onChange={e => handleNestedSectionChange('welds', 'tieIn', 'today', e.target.value)} fullWidth />
            <TextField value={form.welds.tieIn.total} onChange={e => handleNestedSectionChange('welds', 'tieIn', 'total', e.target.value)} fullWidth />
            {/* Test Welds Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Test Welds</Box>
            <TextField value={form.welds.test.toDate} onChange={e => handleNestedSectionChange('welds', 'test', 'toDate', e.target.value)} fullWidth />
            <TextField value={form.welds.test.today} onChange={e => handleNestedSectionChange('welds', 'test', 'today', e.target.value)} fullWidth />
            <TextField value={form.welds.test.total} onChange={e => handleNestedSectionChange('welds', 'test', 'total', e.target.value)} fullWidth />
            {/* Totals Row */}
            <Box />
            <Box />
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, justifyContent: 'flex-end' }}>Section Total</Box>
            <TextField
              value={
                (Number(form.welds.fab.total) || 0) +
                (Number(form.welds.onsite.total) || 0) +
                (Number(form.welds.tieIn.total) || 0) +
                (Number(form.welds.test.total) || 0)
              }
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>

          {/* X-Ray Section - same layout as Welds */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>X-Ray</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, width: '100%' }}>
            {/* Header Row */}
            <Box />
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>To Date</Box>
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Today</Box>
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Total</Box>
            {/* Fab/Shop Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Fab / Shop</Box>
            <TextField value={form.xray.fab.toDate} onChange={e => handleNestedSectionChange('xray', 'fab', 'toDate', e.target.value)} fullWidth />
            <TextField value={form.xray.fab.today} onChange={e => handleNestedSectionChange('xray', 'fab', 'today', e.target.value)} fullWidth />
            <TextField value={form.xray.fab.total} onChange={e => handleNestedSectionChange('xray', 'fab', 'total', e.target.value)} fullWidth />
            {/* Onsite Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Onsite</Box>
            <TextField value={form.xray.onsite.toDate} onChange={e => handleNestedSectionChange('xray', 'onsite', 'toDate', e.target.value)} fullWidth />
            <TextField value={form.xray.onsite.today} onChange={e => handleNestedSectionChange('xray', 'onsite', 'today', e.target.value)} fullWidth />
            <TextField value={form.xray.onsite.total} onChange={e => handleNestedSectionChange('xray', 'onsite', 'total', e.target.value)} fullWidth />
            {/* Tie-in Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Tie-in</Box>
            <TextField value={form.xray.tieIn.toDate} onChange={e => handleNestedSectionChange('xray', 'tieIn', 'toDate', e.target.value)} fullWidth />
            <TextField value={form.xray.tieIn.today} onChange={e => handleNestedSectionChange('xray', 'tieIn', 'today', e.target.value)} fullWidth />
            <TextField value={form.xray.tieIn.total} onChange={e => handleNestedSectionChange('xray', 'tieIn', 'total', e.target.value)} fullWidth />
            {/* Test Welds Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Test Welds</Box>
            <TextField value={form.xray.test.toDate} onChange={e => handleNestedSectionChange('xray', 'test', 'toDate', e.target.value)} fullWidth />
            <TextField value={form.xray.test.today} onChange={e => handleNestedSectionChange('xray', 'test', 'today', e.target.value)} fullWidth />
            <TextField value={form.xray.test.total} onChange={e => handleNestedSectionChange('xray', 'test', 'total', e.target.value)} fullWidth />
            {/* Totals Row */}
            <Box />
            <Box />
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, justifyContent: 'flex-end' }}>Section Total</Box>
            <TextField
              value={
                (Number(form.xray.fab.total) || 0) +
                (Number(form.xray.onsite.total) || 0) +
                (Number(form.xray.tieIn.total) || 0) +
                (Number(form.xray.test.total) || 0)
              }
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>

          {/* Welds Rejected / Repaired Section */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Welds Rejected / Repaired</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, width: '100%' }}>
            {/* Header Row */}
            <Box />
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Repaired</Box>
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Rejected</Box>
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Total</Box>
            {/* Fab/Shop Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Fab / Shop</Box>
            <TextField value={form.weldsRejected.fab.repaired} onChange={e => handleNestedSectionChange('weldsRejected', 'fab', 'repaired', e.target.value)} fullWidth />
            <TextField value={form.weldsRejected.fab.rejected} onChange={e => handleNestedSectionChange('weldsRejected', 'fab', 'rejected', e.target.value)} fullWidth />
            <TextField value={form.weldsRejected.fab.total} onChange={e => handleNestedSectionChange('weldsRejected', 'fab', 'total', e.target.value)} fullWidth />
            {/* Onsite Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Onsite</Box>
            <TextField value={form.weldsRejected.onsite.repaired} onChange={e => handleNestedSectionChange('weldsRejected', 'onsite', 'repaired', e.target.value)} fullWidth />
            <TextField value={form.weldsRejected.onsite.rejected} onChange={e => handleNestedSectionChange('weldsRejected', 'onsite', 'rejected', e.target.value)} fullWidth />
            <TextField value={form.weldsRejected.onsite.total} onChange={e => handleNestedSectionChange('weldsRejected', 'onsite', 'total', e.target.value)} fullWidth />
            {/* Tie-in Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Tie-in</Box>
            <TextField value={form.weldsRejected.tieIn.repaired} onChange={e => handleNestedSectionChange('weldsRejected', 'tieIn', 'repaired', e.target.value)} fullWidth />
            <TextField value={form.weldsRejected.tieIn.rejected} onChange={e => handleNestedSectionChange('weldsRejected', 'tieIn', 'rejected', e.target.value)} fullWidth />
            <TextField value={form.weldsRejected.tieIn.total} onChange={e => handleNestedSectionChange('weldsRejected', 'tieIn', 'total', e.target.value)} fullWidth />
            {/* Test Welds Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Test Welds</Box>
            <TextField value={form.weldsRejected.test.repaired} onChange={e => handleNestedSectionChange('weldsRejected', 'test', 'repaired', e.target.value)} fullWidth />
            <TextField value={form.weldsRejected.test.rejected} onChange={e => handleNestedSectionChange('weldsRejected', 'test', 'rejected', e.target.value)} fullWidth />
            <TextField value={form.weldsRejected.test.total} onChange={e => handleNestedSectionChange('weldsRejected', 'test', 'total', e.target.value)} fullWidth />
            {/* Totals Row */}
            <Box />
            <Box />
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, justifyContent: 'flex-end' }}>Section Total</Box>
            <TextField
              value={
                (Number(form.weldsRejected.fab.total) || 0) +
                (Number(form.weldsRejected.onsite.total) || 0) +
                (Number(form.weldsRejected.tieIn.total) || 0) +
                (Number(form.weldsRejected.test.total) || 0)
              }
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>

          {/* X-Ray Rejected / Repaired Section - custom headings */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>X-Ray Rejected / Repaired</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2, width: '100%' }}>
            {/* Header Row */}
            <Box />
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Repair To Date</Box>
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X-Ray To Date</Box>
            <Box sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Total</Box>
            {/* Fab/Shop Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Fab / Shop</Box>
            <TextField value={form.xrayRepair.fab.repaired} onChange={e => handleNestedSectionChange('xrayRepair', 'fab', 'repaired', e.target.value)} fullWidth />
            <TextField value={form.xrayRepair.fab.rejected} onChange={e => handleNestedSectionChange('xrayRepair', 'fab', 'rejected', e.target.value)} fullWidth />
            <TextField value={form.xrayRepair.fab.total} onChange={e => handleNestedSectionChange('xrayRepair', 'fab', 'total', e.target.value)} fullWidth />
            {/* Onsite Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Onsite</Box>
            <TextField value={form.xrayRepair.onsite.repaired} onChange={e => handleNestedSectionChange('xrayRepair', 'onsite', 'repaired', e.target.value)} fullWidth />
            <TextField value={form.xrayRepair.onsite.rejected} onChange={e => handleNestedSectionChange('xrayRepair', 'onsite', 'rejected', e.target.value)} fullWidth />
            <TextField value={form.xrayRepair.onsite.total} onChange={e => handleNestedSectionChange('xrayRepair', 'onsite', 'total', e.target.value)} fullWidth />
            {/* Tie-in Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Tie-in</Box>
            <TextField value={form.xrayRepair.tieIn.repaired} onChange={e => handleNestedSectionChange('xrayRepair', 'tieIn', 'repaired', e.target.value)} fullWidth />
            <TextField value={form.xrayRepair.tieIn.rejected} onChange={e => handleNestedSectionChange('xrayRepair', 'tieIn', 'rejected', e.target.value)} fullWidth />
            <TextField value={form.xrayRepair.tieIn.total} onChange={e => handleNestedSectionChange('xrayRepair', 'tieIn', 'total', e.target.value)} fullWidth />
            {/* Test Welds Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>Test Welds</Box>
            <TextField value={form.xrayRepair.test.repaired} onChange={e => handleNestedSectionChange('xrayRepair', 'test', 'repaired', e.target.value)} fullWidth />
            <TextField value={form.xrayRepair.test.rejected} onChange={e => handleNestedSectionChange('xrayRepair', 'test', 'rejected', e.target.value)} fullWidth />
            <TextField value={form.xrayRepair.test.total} onChange={e => handleNestedSectionChange('xrayRepair', 'test', 'total', e.target.value)} fullWidth />
            {/* Totals Row */}
            <Box />
            <Box />
            <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, justifyContent: 'flex-end' }}>Section Total</Box>
            <TextField
              value={
                (Number(form.xrayRepair.fab.total) || 0) +
                (Number(form.xrayRepair.onsite.total) || 0) +
                (Number(form.xrayRepair.tieIn.total) || 0) +
                (Number(form.xrayRepair.test.total) || 0)
              }
              InputProps={{ readOnly: true }}
              fullWidth
            />
          </Box>

          {/* Installations Section */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Installations</Typography>
          {/* Pipe Installed - responsive */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: '0.8fr 1.4fr 1.4fr 1.4fr 1.4fr',
            },
            gap: 2,
            width: '100%',
            mb: 2,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              gridColumn: { xs: '1 / -1', sm: 'auto' },
            }}>
              Pipe Installed
            </Box>
            <TextField label="Size" value={form.pipeInstalled.size} onChange={e => handleSectionChange('pipeInstalled', 'size', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1', sm: 'auto' } }} />
            <TextField label="Footage" value={form.pipeInstalled.footage} onChange={e => handleSectionChange('pipeInstalled', 'footage', e.target.value)} fullWidth sx={{ gridColumn: { xs: '2', sm: 'auto' } }} />
            <TextField label="From" value={form.pipeInstalled.from} onChange={e => handleSectionChange('pipeInstalled', 'from', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1', sm: 'auto' } }} />
            <TextField label="To" value={form.pipeInstalled.to} onChange={e => handleSectionChange('pipeInstalled', 'to', e.target.value)} fullWidth sx={{ gridColumn: { xs: '2', sm: 'auto' } }} />
          </Box>
          {/* Road Xing - responsive */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: '0.8fr 1.4fr 1.4fr 2.4fr',
            },
            gap: 2,
            width: '100%',
            mb: 2,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              gridColumn: { xs: '1 / -1', sm: 'auto' },
            }}>
              Road Xing
            </Box>
            <TextField label="Size" value={form.roadXing.size} onChange={e => handleSectionChange('roadXing', 'size', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1', sm: 'auto' } }} />
            <TextField label="Footage" value={form.roadXing.footage} onChange={e => handleSectionChange('roadXing', 'footage', e.target.value)} fullWidth sx={{ gridColumn: { xs: '2', sm: 'auto' } }} />
            <TextField select label="Bore / Open Cut / Conduit" value={form.roadXing.bore} onChange={e => handleSectionChange('roadXing', 'bore', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
              <MenuItem value="">Select...</MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Box>
          {/* Stream Xings - responsive */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: '0.8fr 1.4fr 1.4fr 1.4fr 1.4fr',
            },
            gap: 2,
            width: '100%',
            mb: 2,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              gridColumn: { xs: '1 / -1', sm: 'auto' },
            }}>
              Stream Xings
            </Box>
            <TextField label="Size" value={form.streamXings.size} onChange={e => handleSectionChange('streamXings', 'size', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1', sm: 'auto' } }} />
            <TextField label="Footage" value={form.streamXings.footage} onChange={e => handleSectionChange('streamXings', 'footage', e.target.value)} fullWidth sx={{ gridColumn: { xs: '2', sm: 'auto' } }} />
            <TextField label="From" value={form.streamXings.from} onChange={e => handleSectionChange('streamXings', 'from', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1', sm: 'auto' } }} />
            <TextField label="To" value={form.streamXings.to} onChange={e => handleSectionChange('streamXings', 'to', e.target.value)} fullWidth sx={{ gridColumn: { xs: '2', sm: 'auto' } }} />
          </Box>
          {/* Taps Installed - responsive */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: '0.8fr 2.1fr 2.1fr',
            },
            gap: 2,
            width: '100%',
            mb: 2,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              gridColumn: { xs: '1 / -1', sm: 'auto' },
            }}>
              Taps Installed
            </Box>
            <TextField label="Size" value={form.tapsInstalled.size} onChange={e => handleSectionChange('tapsInstalled', 'size', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1', sm: 'auto' } }} />
            <TextField label="No." value={form.tapsInstalled.no} onChange={e => handleSectionChange('tapsInstalled', 'no', e.target.value)} fullWidth sx={{ gridColumn: { xs: '2', sm: 'auto' } }} />
          </Box>
          {/* Block Gates Installed - responsive */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: '0.8fr 2.1fr 2.1fr',
            },
            gap: 2,
            width: '100%',
            mb: 2,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              gridColumn: { xs: '1 / -1', sm: 'auto' },
            }}>
              Block Gates Installed
            </Box>
            <TextField label="Size" value={form.blockGates.size} onChange={e => handleSectionChange('blockGates', 'size', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1', sm: 'auto' } }} />
            <TextField label="No." value={form.blockGates.no} onChange={e => handleSectionChange('blockGates', 'no', e.target.value)} fullWidth sx={{ gridColumn: { xs: '2', sm: 'auto' } }} />
          </Box>
          {/* Cut Out Defects in Pipe - 2 cuts - responsive */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: '0.8fr 2.1fr 2.1fr',
            },
            gap: 2,
            width: '100%',
            mb: 2,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              gridColumn: { xs: '1 / -1', sm: 'auto' },
            }}>
              Cut Out Defects in Pipe - 2 cuts
            </Box>
            <TextField label="Size" value={form.cutOut2.size} onChange={e => handleSectionChange('cutOut2', 'size', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1', sm: 'auto' } }} />
            <TextField label="Defect" value={form.cutOut2.defect} onChange={e => handleSectionChange('cutOut2', 'defect', e.target.value)} fullWidth sx={{ gridColumn: { xs: '2', sm: 'auto' } }} />
          </Box>
          {/* Cut Out Defects in Pipe - 1 cut - responsive */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: '0.8fr 2.1fr 2.1fr',
            },
            gap: 2,
            width: '100%',
            mb: 2,
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              gridColumn: { xs: '1 / -1', sm: 'auto' },
            }}>
              Cut Out Defects in Pipe - 1 cut
            </Box>
            <TextField label="Size" value={form.cutOut1.size} onChange={e => handleSectionChange('cutOut1', 'size', e.target.value)} fullWidth sx={{ gridColumn: { xs: '1', sm: 'auto' } }} />
            <TextField label="Defect" value={form.cutOut1.defect} onChange={e => handleSectionChange('cutOut1', 'defect', e.target.value)} fullWidth sx={{ gridColumn: { xs: '2', sm: 'auto' } }} />
          </Box>

          {/* Replace the old signature section with the new one */}
          {renderSignatureSection()}

          {/* Submit Button */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between', 
            mt: 3, 
            p: 0,
            gap: { xs: 0.5, sm: 1 }
          }}>
            <Button 
              onClick={handleDelete} 
              variant="contained" 
              size="small"
              sx={{ 
                bgcolor: '#ff0000', 
                '&:hover': { bgcolor: '#cc0000' },
                color: 'white',
                flex: { xs: '1 1 25%', sm: '0 1 auto' },
                minWidth: { xs: '80px', sm: '100px' },
                py: { xs: 0.5, sm: 1 },
                px: { xs: 0.5, sm: 2 }
              }}
            >
              Delete
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              color="secondary"
              size="small"
              sx={{ 
                flex: { xs: '1 1 25%', sm: '0 1 auto' },
                minWidth: { xs: '80px', sm: '100px' },
                py: { xs: 0.5, sm: 1 },
                px: { xs: 0.5, sm: 2 }
              }}
            >
              Save
            </Button>
            <Button 
              onClick={handleSaveAndExit} 
              variant="contained" 
              color="secondary"
              size="small"
              sx={{ 
                flex: { xs: '1 1 25%', sm: '0 1 auto' },
                minWidth: { xs: '80px', sm: '100px' },
                py: { xs: 0.5, sm: 1 },
                px: { xs: 0.5, sm: 2 }
              }}
            >
              Save & Exit
            </Button>
            <Button
              onClick={handleExit}
              variant="outlined"
              size="small"
              sx={{
                flex: { xs: '1 1 25%', sm: '0 1 auto' },
                minWidth: { xs: '80px', sm: '100px' },
                py: { xs: 0.5, sm: 1 },
                px: { xs: 0.5, sm: 2 },
                borderColor: '#000',
                color: '#000',
                ml: 1
              }}
            >
              Exit
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              size="small"
              sx={{ 
                bgcolor: 'green', 
                '&:hover': { bgcolor: 'darkgreen' },
                color: 'white',
                flex: { xs: '1 1 25%', sm: '0 1 auto' },
                minWidth: { xs: '80px', sm: '100px' },
                py: { xs: 0.5, sm: 1 },
                px: { xs: 0.5, sm: 2 }
              }}
            >
              Submit
            </Button>
          </Box>
          <Dialog open={exitPromptOpen} onClose={() => setExitPromptOpen(false)}>
            <DialogTitle>Save Changes Before Exiting</DialogTitle>
            <DialogContent>
              <Typography>Would you like to save your changes before exiting?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleExitSave} color="primary" variant="contained">Yes</Button>
              <Button onClick={handleExitNoSave} color="secondary" variant="outlined">No</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={deletePromptOpen} onClose={handleDeleteCancel}>
            <DialogTitle>Are you sure you want to delete?</DialogTitle>
            <DialogContent>
              <Typography>This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteConfirm} color="primary" variant="contained">Yes</Button>
              <Button onClick={handleDeleteCancel} color="secondary" variant="outlined">No</Button>
            </DialogActions>
          </Dialog>
        </form>
      </Box>
    </Box>
  );
};

export default DailyWeldingReportForm; 