import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import PageHeader from '../common/PageHeader';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useNavigate } from 'react-router-dom';

const initialState = {
  contractor: '',
  reportNumber: '',
  oqPersonnel: '',
  facilityId: '',
  date: '',
  purchaseOrder: '',
  location: '',
  qaInspector: '',
  signature: '',
  items: Array(11).fill('').map(() => ({
    sat: false,
    unsat: false,
    na: false,
    nw: false,
    comments: '',
    subItems: [],
  })),
};

const oversightItems = [
  'Project schedule change requested?',
  'Specialized containment in place?',
  'Protective coverings in place?',
  'Abrasive type being used?',
  'Surface Preparation',
  'Soluble salt remediation?',
  'Surface condition prior to coating?',
  'Material storage and mixing?',
  'Coating application',
  'Repair of Damage?',
  'Contractor QA documentation',
];

const subItems = {
  4: [
    'a. Weld spatter, edges removed?',
    'b. Rust scale / pack rust removed?',
    'c. Steel defects present?',
    'd. Compressed air cleanliness?',
    'e. Ambient conditions?',
    'f. Surface prep. cleanliness? HOLD POINT',
    'g. Surface profile? HOLD POINT',
  ],
  8: [
    'a. Application methods appropriate?',
    'b. Ambient conditions?',
    'c. Wet film thickness?',
    'd. Stripe coat?',
    'e. Coverage/continuity/cleanliness/recoat times?',
    'f. Dry film thickness? HOLD POINT',
  ],
};

const statusOptions = ['sat', 'unsat', 'na', 'nw'];

const CoatingDailyReportForm = () => {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [deletePromptOpen, setDeletePromptOpen] = useState(false);
  const [exitPromptOpen, setExitPromptOpen] = useState(false);
  const navigate = useNavigate();

  // Load draft on mount if draftId in URL
  React.useEffect(() => {
    const draftId = new URLSearchParams(window.location.search).get('draftId');
    if (draftId) {
      const savedDrafts = JSON.parse(localStorage.getItem('dailyCoatingReportDrafts') || '[]');
      const draft = savedDrafts.find(d => d.draftId === draftId);
      if (draft) {
        setForm({ ...draft, draftId });
      }
    }
  }, []);

  const getCurrentDraftId = () => {
    return form.draftId || new URLSearchParams(window.location.search).get('draftId');
  };

  const handleSave = () => {
    const draftId = getCurrentDraftId() || `draft_${Date.now()}`;
    const draftData = { ...form, savedAt: new Date().toISOString(), draftId };
    const existingDrafts = JSON.parse(localStorage.getItem('dailyCoatingReportDrafts') || '[]');
    const draftIndex = existingDrafts.findIndex(d => d.draftId === draftId);
    let updatedDrafts;
    if (draftIndex !== -1) {
      updatedDrafts = [...existingDrafts];
      updatedDrafts[draftIndex] = draftData;
    } else {
      updatedDrafts = [...existingDrafts, draftData];
    }
    localStorage.setItem('dailyCoatingReportDrafts', JSON.stringify(updatedDrafts));
    setForm(prev => ({ ...prev, draftId }));
    alert('Form saved as draft!');
  };

  const handleSaveAndExit = () => {
    const draftId = getCurrentDraftId() || `draft_${Date.now()}`;
    const draftData = { ...form, savedAt: new Date().toISOString(), draftId };
    const existingDrafts = JSON.parse(localStorage.getItem('dailyCoatingReportDrafts') || '[]');
    const draftIndex = existingDrafts.findIndex(d => d.draftId === draftId);
    let updatedDrafts;
    if (draftIndex !== -1) {
      updatedDrafts = [...existingDrafts];
      updatedDrafts[draftIndex] = draftData;
    } else {
      updatedDrafts = [...existingDrafts, draftData];
    }
    localStorage.setItem('dailyCoatingReportDrafts', JSON.stringify(updatedDrafts));
    setForm(prev => ({ ...prev, draftId }));
    navigate('/coating/reports');
  };

  const handleDelete = () => {
    setDeletePromptOpen(true);
  };

  const handleDeleteConfirm = () => {
    const draftId = getCurrentDraftId();
    if (draftId) {
      const savedDrafts = JSON.parse(localStorage.getItem('dailyCoatingReportDrafts') || '[]');
      const updatedDrafts = savedDrafts.filter(draft => draft.draftId !== draftId);
      localStorage.setItem('dailyCoatingReportDrafts', JSON.stringify(updatedDrafts));
    }
    setDeletePromptOpen(false);
    navigate('/coating/reports');
  };

  const handleDeleteCancel = () => {
    setDeletePromptOpen(false);
  };

  const handleExit = () => {
    setExitPromptOpen(true);
  };

  const handleExitConfirm = () => {
    setExitPromptOpen(false);
    navigate('/coating/reports');
  };

  const handleExitCancel = () => {
    setExitPromptOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[idx][field] = value;
      return { ...prev, items };
    });
  };

  const handleSubItemChange = (itemIdx, subIdx, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      if (!items[itemIdx].subItems[subIdx]) items[itemIdx].subItems[subIdx] = {};
      items[itemIdx].subItems[subIdx][field] = value;
      return { ...prev, items };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Final submit logic (send to backend)
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <PageHeader title="Daily Coating Report (Preview)" backPath="/coating/reports/daily" />
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Report Preview</Typography>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(form, null, 2)}</pre>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100vw', overflowX: 'hidden' }}>
      <PageHeader title="Daily Coating Report" backPath="/coating/reports" />
      <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Daily Coating Report</Typography>
      <Box sx={{ bgcolor: '#fff', border: '2px solid #000', borderRadius: 2, boxShadow: 2, p: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Project Information</Typography>
          <Grid container spacing={2} sx={{ width: '100%', m: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }} alignItems="stretch">
            <Grid item><TextField label="Contractor" name="contractor" value={form.contractor} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="Report #" name="reportNumber" value={form.reportNumber} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="OQ Personnel*" name="oqPersonnel" value={form.oqPersonnel} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="Facility ID" name="facilityId" value={form.facilityId} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
            <Grid item><TextField label="Purchase Order No." name="purchaseOrder" value={form.purchaseOrder} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="Location" name="location" value={form.location} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="QA Inspector Name" name="qaInspector" value={form.qaInspector} onChange={handleChange} fullWidth /></Grid>
            <Grid item><TextField label="Signature" name="signature" value={form.signature} onChange={handleChange} fullWidth /></Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>Daily Project Oversight Items</Typography>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #bbb', padding: 4 }}>#</th>
                    <th style={{ border: '1px solid #bbb', padding: 4 }}>Daily Project Oversight Items</th>
                    {statusOptions.map(opt => (
                      <th key={opt} style={{ border: '1px solid #bbb', padding: 4 }}>{opt.toUpperCase()}</th>
                    ))}
                    <th style={{ border: '1px solid #bbb', padding: 4 }}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {oversightItems.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td style={{ border: '1px solid #bbb', padding: 4, verticalAlign: 'top' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #bbb', padding: 4, verticalAlign: 'top' }}>{item}</td>
                        {statusOptions.map(opt => (
                          <td key={opt} style={{ border: '1px solid #bbb', padding: 4, textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={!!form.items[idx][opt]}
                              onChange={e => handleItemChange(idx, opt, e.target.checked)}
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #bbb', padding: 4 }}>
                          <TextField
                            value={form.items[idx].comments}
                            onChange={e => handleItemChange(idx, 'comments', e.target.value)}
                            size="small"
                            fullWidth
                            multiline
                            minRows={2}
                          />
                        </td>
                      </tr>
                      {subItems[idx] && subItems[idx].map((sub, subIdx) => (
                        <tr key={subIdx}>
                          <td style={{ border: '1px solid #bbb', padding: 4, verticalAlign: 'top' }}></td>
                          <td style={{ border: '1px solid #bbb', padding: 4, verticalAlign: 'top', paddingLeft: 24 }}>{sub}</td>
                          {statusOptions.map(opt => (
                            <td key={opt} style={{ border: '1px solid #bbb', padding: 4, textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={!!(form.items[idx].subItems && form.items[idx].subItems[subIdx] && form.items[idx].subItems[subIdx][opt])}
                                onChange={e => handleSubItemChange(idx, subIdx, opt, e.target.checked)}
                              />
                            </td>
                          ))}
                          <td style={{ border: '1px solid #bbb', padding: 4 }}>
                            <TextField
                              value={form.items[idx].subItems && form.items[idx].subItems[subIdx] ? form.items[idx].subItems[subIdx].comments || '' : ''}
                              onChange={e => handleSubItemChange(idx, subIdx, 'comments', e.target.value)}
                              size="small"
                              fullWidth
                              multiline
                              minRows={2}
                            />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </Box>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              {oversightItems.map((item, idx) => (
                <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #bbb', borderRadius: 2, bgcolor: '#fafafa' }}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>{idx + 1}. {item}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    {statusOptions.map(opt => (
                      <Box key={opt} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <input
                          type="checkbox"
                          checked={!!form.items[idx][opt]}
                          onChange={e => handleItemChange(idx, opt, e.target.checked)}
                          id={`main-${idx}-${opt}`}
                        />
                        <label htmlFor={`main-${idx}-${opt}`} style={{ fontSize: 13 }}>{opt.toUpperCase()}</label>
                      </Box>
                    ))}
                  </Box>
                  <TextField
                    value={form.items[idx].comments}
                    onChange={e => handleItemChange(idx, 'comments', e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    label="Comments"
                  />
                  {subItems[idx] && subItems[idx].map((sub, subIdx) => (
                    <Box key={subIdx} sx={{ mt: 2, ml: 2, p: 1, borderLeft: '3px solid #bbb', bgcolor: '#fff' }}>
                      <Typography sx={{ fontWeight: 500, mb: 1 }}>{sub}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        {statusOptions.map(opt => (
                          <Box key={opt} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <input
                              type="checkbox"
                              checked={!!(form.items[idx].subItems && form.items[idx].subItems[subIdx] && form.items[idx].subItems[subIdx][opt])}
                              onChange={e => handleSubItemChange(idx, subIdx, opt, e.target.checked)}
                              id={`sub-${idx}-${subIdx}-${opt}`}
                            />
                            <label htmlFor={`sub-${idx}-${subIdx}-${opt}`} style={{ fontSize: 13 }}>{opt.toUpperCase()}</label>
                          </Box>
                        ))}
                      </Box>
                      <TextField
                        value={form.items[idx].subItems && form.items[idx].subItems[subIdx] ? form.items[idx].subItems[subIdx].comments || '' : ''}
                        onChange={e => handleSubItemChange(idx, subIdx, 'comments', e.target.value)}
                        size="small"
                        fullWidth
                        multiline
                        minRows={2}
                        label="Comments"
                      />
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: { xs: 'nowrap', sm: 'wrap' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              mt: 3,
              gap: { xs: 1, sm: 2 },
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'row' },
                gap: { xs: 1, sm: 2 },
                flex: 1,
                width: '100%',
                justifyContent: { xs: 'space-between', sm: 'space-between' },
              }}
            >
              <Button
                onClick={handleDelete}
                variant="contained"
                size="large"
                fullWidth
                color="error"
                sx={{
                  minWidth: { xs: 0, sm: 120 },
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  flex: 1,
                  bgcolor: '#d32f2f',
                  '&:hover': { bgcolor: '#b71c1c' },
                  height: { sm: 56 },
                }}
              >
                Delete
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                size="large"
                fullWidth
                color="secondary"
                sx={{
                  minWidth: { xs: 0, sm: 120 },
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  flex: 1,
                  height: { sm: 56 },
                }}
              >
                Save
              </Button>
              <Button
                onClick={handleSaveAndExit}
                variant="contained"
                size="large"
                fullWidth
                color="secondary"
                sx={{
                  minWidth: { xs: 0, sm: 120 },
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  flex: 1,
                  height: { sm: 56 },
                }}
              >
                Save & Exit
              </Button>
              <Button
                onClick={handleExit}
                variant="outlined"
                size="large"
                fullWidth
                color="primary"
                sx={{
                  minWidth: { xs: 0, sm: 120 },
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  flex: 1,
                  height: { sm: 56 },
                }}
              >
                Exit
              </Button>
            </Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                minWidth: { xs: 0, sm: 120 },
                fontSize: { xs: '0.85rem', sm: '1rem' },
                flex: 1,
                bgcolor: '#388e3c',
                color: '#fff',
                '&:hover': { bgcolor: '#1b5e20' },
                height: { sm: 56 },
                mt: { xs: 1, sm: 0 },
                ml: { xs: 0, sm: 2 },
              }}
            >
              Submit
            </Button>
          </Box>
          <Dialog open={deletePromptOpen} onClose={handleDeleteCancel}>
            <DialogTitle>Delete Draft?</DialogTitle>
            <DialogContent>
              Are you sure you want to delete this draft? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
              <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={exitPromptOpen} onClose={handleExitCancel}>
            <DialogTitle>Exit Without Saving?</DialogTitle>
            <DialogContent>
              Do you want to exit without saving changes?
            </DialogContent>
            <DialogActions>
              <Button onClick={handleExitCancel} color="primary">Cancel</Button>
              <Button onClick={handleExitConfirm} color="error">Exit</Button>
            </DialogActions>
          </Dialog>
        </form>
      </Box>
    </Box>
  );
};

export default CoatingDailyReportForm; 