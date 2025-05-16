import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PageHeader from '../../../../components/common/PageHeader';

const defaultItems = [
  // Items 1-24
  { item: 1, description: 'MOBILIZATION', unit: 'FT.' },
  { item: 2, description: 'DEVELOPING ACCESS ROADS', unit: 'FT.' },
  { item: 3, description: 'CLEARING R/W', unit: 'FT.' },
  { item: 4, description: 'GRADING RIGHT OF WAY', unit: 'FT.' },
  { item: 5, description: 'EXCAVATING DITCH', unit: 'FT.' },
  { item: 6, description: 'STRINGING', unit: 'FT.' },
  { item: 7, description: 'BEND & WELD PIPE', unit: 'FT.' },
  { item: 8, description: 'COATING', unit: 'FT.' },
  { item: 9, description: 'LOWER IN AND BACKFILL PIPE', unit: 'FT.' },
  { item: 10, description: 'PERFORMANCE TEST, ANOMALY REPAIRS, AND DRYING', unit: 'FT.' },
  { item: 11, description: 'CLEAN-UP, SEEDING, AND MULCHING', unit: 'FT.' },
  { item: 12, description: 'VIA BORE IN SOIL OR SOFT ROCK UNDER ROADS', unit: 'FT.' },
  { item: 13, description: 'VIA BORE IN CONSOLIDATED ROCK UNDER ROADS', unit: 'FT.' },
  { item: 14, description: 'VIA OPEN CUT IN SOIL OR SOFT ROCK UNDER ROADS', unit: 'FT.' },
  { item: 15, description: 'VIA OPEN CUT IN CONSOLIDATED ROCK UNDER ROADS', unit: 'FT.' },
  { item: 16, description: 'VIA OPEN CUT IN WATERBODIES', unit: 'FT.' },
  { item: 17, description: 'VIA OPEN CUT IN WATERBODIES (without mats included)', unit: 'FT.' },
  { item: 18, description: 'PIPESAK NEGATIVE BUOYANCY', unit: 'EA.' },
  { item: 19, description: 'TIMBER MAT 18\' OR LESS', unit: 'EA.' },
  { item: 20, description: 'TIMBER MAT 18\' OR MORE', unit: 'EA.' },
  { item: 21, description: 'UTILITY CROSSINGS UNDER 12" IN DIAMETER', unit: 'EA.' },
  { item: 22, description: 'UTILITY CROSSINGS OVER 12" IN DIAMETER', unit: 'EA.' },
  { item: 23, description: 'ROCK DITCH EXCAVATED BY BLASTING', unit: 'FT.' },
  { item: 24, description: 'ROCK DITCH EXCAVATED BY HOE-RAM', unit: 'FT.' },

  // Items 43-51
  { item: 43, description: '#57 STONE', unit: 'TON' },
  { item: 44, description: 'REMOVAL AND DISPOSAL OF ALL STONE TYPES', unit: 'TON' },
  { item: 45, description: 'SELECT BACKFILL IMPORTED LIMESTONE ROCK DUST', unit: 'TON' },
  { item: 46, description: 'SELECT BACKFILL IMPORTED SCREENED SAND', unit: 'TON' },
  { item: 47, description: 'EROSION CONTROL FABRIC', unit: 'SQ. FT.' },
  { item: 48, description: 'LANDLOK 435 TRM', unit: 'SQ. FT.' },
  { item: 49, description: 'PYRAMAT', unit: 'SQ. FT.' },
  { item: 50, description: 'LANDLOK ECB-52', unit: 'SQ. FT.' },
  { item: 51, description: 'NORTH AMERICAN GREEN C125 BLANKET', unit: 'SQ. FT.' },

  // Items 53-97
  { item: 53, description: 'STABILIZED CONSTRUCTION ENTRANCES', unit: 'SQ. FT.' },
  { item: 54, description: 'HYDROMATTING', unit: 'EA.' },
  { item: 55, description: 'TEMPORARY SEED', unit: 'ACRE' },
  { item: 56, description: 'TEMPORARY MULCH', unit: 'ACRE' },
  { item: 57, description: 'CUTTING OUT A SECTION OF PIPE AND REWELD', unit: 'WELD INCH' },
  { item: 58, description: 'CUTTING OUT A SECTION OF PIPE NO WELD', unit: 'WELD INCH' },
  { item: 59, description: 'ORANGE SAFETY FENCE', unit: 'FT.' },
  { item: 60, description: 'EXTRA DEPTH', unit: 'FT.' },
  { item: 61, description: 'WOVEN WIRE FENCE', unit: 'FT.' },
  { item: 62, description: 'BARBED WIRE FENCE', unit: 'FT.' },
  { item: 63, description: 'ELECTRIC WIRE FENCE', unit: 'FT.' },
  { item: 64, description: '16" GATE INSTALLATION', unit: 'EA.' },
  { item: 65, description: 'LINE MARKER/HIGH CONSEQUENCE AREA MARKER', unit: 'EA.' },
  { item: 66, description: 'FRENCH DRAIN', unit: 'FT.' },
  { item: 67, description: 'FLOWABLE FILL', unit: 'CU. FT.' },
  { item: 68, description: 'TURBIDITY CURTAINS', unit: 'FT.' },
  { item: 69, description: 'TRENCH DRAIN WITH OUTLET', unit: 'EA.' },
  { item: 70, description: 'WICK DRAINS', unit: 'FT.' },
  { item: 71, description: 'INSTALLING MATCOR MITIGATOR AWG NO. 2 FOR AC MITIGATION', unit: 'FT.' },
  { item: 72, description: 'INSTALLING SOLID STATE DECOUPLERS FOR AC MITIGATION', unit: 'EA.' },
  { item: 73, description: 'INSTALLING 12" TEMP WATERLINE FOR TEST WATER', unit: 'FT.' },
  { item: 74, description: 'INSTALLING 12" POLY WATERLINE VIA OPEN CUT IN SOIL OR SOFT ROCK UNDER RUSH RUN RD (SPREAD 2)', unit: 'FT.' },
  { item: 75, description: 'INSTALLING 12" POLY WATERLINE VIA OPEN CUT IN CONSOLIDATED ROCK UNDER RUSH RUN RD (SPREAD 2)', unit: 'FT.' },
  { item: 76, description: 'AC COUPON TEST STATION WITH STEALTH 7 IR FOR AC MITIGATION', unit: 'EA.' },
  { item: 77, description: 'INTERLOCKING MATTING (Heavy Duty)', unit: 'SQ. FT.' },
  { item: 78, description: 'INTERLOCKING MATTING (Light Duty)', unit: 'SQ. FT.' },
  { item: 79, description: 'INSTALLING MATCOR MITIGATOR AWG NO. 2 FOR AC MITIGATION', unit: 'FT.' },
  { item: 80, description: 'INSTALLING SOLID STATE DECOUPLERS FOR AC MITIGATION', unit: 'EA.' },
  { item: 81, description: 'INSTALLING 12" TEMP WATERLINE FOR TEST WATER', unit: 'FT.' },
  { item: 82, description: 'INSTALLING 12" POLY WATERLINE VIA OPEN CUT IN SOIL OR SOFT ROCK UNDER RUSH RUN RD (SPREAD 2)', unit: 'FT.' },
  { item: 83, description: 'INSTALLING 12" POLY WATERLINE VIA OPEN CUT IN CONSOLIDATED ROCK UNDER RUSH RUN RD (SPREAD 2)', unit: 'FT.' },
  { item: 84, description: 'AC COUPON TEST STATION WITH STEALTH 7 IR FOR AC MITIGATION', unit: 'EA.' },
  { item: 85, description: 'INTERLOCKING MATTING (Heavy Duty)', unit: 'SQ. FT.' },
  { item: 86, description: 'INTERLOCKING MATTING (Light Duty)', unit: 'SQ. FT.' },
  { item: 87, description: 'PLACEHOLDER ITEM 87', unit: '' },
  { item: 88, description: 'PLACEHOLDER ITEM 88', unit: '' },
  { item: 89, description: 'PLACEHOLDER ITEM 89', unit: '' },
  { item: 90, description: 'PLACEHOLDER ITEM 90', unit: '' },
  { item: 91, description: 'PLACEHOLDER ITEM 91', unit: '' },
  { item: 92, description: 'PLACEHOLDER ITEM 92', unit: '' },
  { item: 93, description: 'PLACEHOLDER ITEM 93', unit: '' },
  { item: 94, description: 'PLACEHOLDER ITEM 94', unit: '' },
  { item: 95, description: 'PLACEHOLDER ITEM 95', unit: '' },
  { item: 96, description: 'PLACEHOLDER ITEM 96', unit: '' },
  { item: 97, description: 'PLACEHOLDER ITEM 97', unit: '' },
];

const DailyUtilityReport = () => {
  const [header, setHeader] = useState({
    project: '',
    date: new Date(),
    inspector: '',
    contractor: '',
  });
  const [items, setItems] = useState(defaultItems.map(row => ({ ...row, startSta: '', endSta: '', dailyQty: '', isCustom: false, comments: '' })));
  const [comments, setComments] = useState('');
  const [signatures, setSignatures] = useState({ inspector: '', contractor: '', inspectorDate: '', contractorDate: '' });

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
  };
  const handleDateChange = (date) => setHeader(prev => ({ ...prev, date }));

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleAddItem = () => {
    setItems(prev => ([
      ...prev,
      { item: prev.length + 1, description: '', unit: '', startSta: '', endSta: '', dailyQty: '', isCustom: true, comments: '' }
    ]));
  };

  const handleSignatureChange = (e) => {
    const { name, value } = e.target;
    setSignatures(prev => ({ ...prev, [name]: value }));
  };

  const handleSignatureDateChange = (field, date) => {
    setSignatures(prev => ({ ...prev, [field]: date }));
  };

  // Helper to get the absolute index in the items array for each group
  const getAbsoluteIndex = (group, idx) => {
    if (group === 1) return idx;
    if (group === 2) return idx + 11;
    if (group === 3) return idx + 16;
    return idx;
  };

  const handleDuplicateRow = (absIdx) => {
    const newItem = {
      ...items[absIdx],
      item: items.length + 1,
      isCustom: true,
      startSta: '',
      endSta: '',
      dailyQty: '',
      comments: ''
    };
    setItems(prev => [
      ...prev.slice(0, absIdx + 1),
      newItem,
      ...prev.slice(absIdx + 1)
    ]);
  };

  const handleDeleteItem = (absIdx) => {
    setItems(prev => prev.filter((_, i) => i !== absIdx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    alert('Report submitted!');
  };

  const tableCellSx = {
    px: { xs: 0.5, sm: 1 },
    py: { xs: 0.5, sm: 1 },
    fontSize: { xs: '0.85rem', sm: '1rem' },
    wordBreak: 'break-word',
    maxWidth: { xs: 120, sm: 300 },
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)', overflow: 'auto' }}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <PageHeader 
          title="Daily Utility Report"
          backPath="/utility/reports"
          backButtonStyle={{ backgroundColor: '#000000', color: '#ffffff', '&:hover': { backgroundColor: '#333333' } }}
          sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' } }}
        />
        <Paper sx={{ p: { xs: 1, sm: 3 }, mt: { xs: 1, sm: 3 } }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Project" name="project" value={header.project} onChange={handleHeaderChange} fullWidth required size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker label="Date" value={header.date} onChange={handleDateChange} slotProps={{ textField: { fullWidth: true, required: true, size: 'small' } }} />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Inspector" name="inspector" value={header.inspector} onChange={handleHeaderChange} fullWidth required size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Contractor" name="contractor" value={header.contractor} onChange={handleHeaderChange} fullWidth required size="small" />
              </Grid>
            </Grid>

            {/* Group 1: Base Lay Progress Payment */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Base Lay Progress Payment
              </Typography>
              <Stack spacing={2}>
                {items.slice(0, 11).map((row, idx) => {
                  const absIdx = getAbsoluteIndex(1, idx);
                  return (
                    <Paper key={`${row.item}-${idx}`} sx={{ p: 1, mb: 1, boxShadow: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', mr: 1 }}>{row.item}.</Typography>
                        <Typography sx={{ fontWeight: 500 }}>{row.description}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                        {/* Left: stacked fields */}
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <TextField label="Unit" value={row.unit} onChange={e => handleItemChange(absIdx, 'unit', e.target.value)} fullWidth size="small" />
                          <TextField label="Start Sta." value={row.startSta} onChange={e => handleItemChange(absIdx, 'startSta', e.target.value)} fullWidth size="small" />
                          <TextField label="End Sta." value={row.endSta} onChange={e => handleItemChange(absIdx, 'endSta', e.target.value)} fullWidth size="small" />
                          <TextField label="Daily Quantity" value={row.dailyQty} onChange={e => handleItemChange(absIdx, 'dailyQty', e.target.value)} fullWidth size="small" />
                        </Box>
                        {/* Right: comments fills height */}
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                          <TextField
                            label="Comments"
                            value={row.comments}
                            onChange={e => handleItemChange(absIdx, 'comments', e.target.value)}
                            fullWidth
                            size="small"
                            multiline
                            minRows={4}
                            maxRows={8}
                            sx={{ height: '100%' }}
                            InputProps={{
                              sx: { height: '100%', alignItems: 'stretch', display: 'flex', flex: 1 }
                            }}
                          />
                        </Box>
                      </Box>
                      {/* Actions row, full width */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <IconButton aria-label="duplicate" color="primary" onClick={() => handleDuplicateRow(absIdx)} size="small">
                          <AddIcon />
                        </IconButton>
                        {row.isCustom && (
                          <IconButton aria-label="delete" color="error" onClick={() => handleDeleteItem(absIdx)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            {/* Group 2: Installing 16" Steel Pipeline */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Installing 16" Steel Pipeline
              </Typography>
              <Stack spacing={2}>
                {items.slice(11, 17).map((row, idx) => {
                  const absIdx = getAbsoluteIndex(2, idx);
                  return (
                    <Paper key={`${row.item}-${idx}`} sx={{ p: 1, mb: 1, boxShadow: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', mr: 1 }}>{row.item}.</Typography>
                        <Typography sx={{ fontWeight: 500 }}>{row.description}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <TextField label="Unit" value={row.unit} onChange={e => handleItemChange(absIdx, 'unit', e.target.value)} fullWidth size="small" />
                          <TextField label="Start Sta." value={row.startSta} onChange={e => handleItemChange(absIdx, 'startSta', e.target.value)} fullWidth size="small" />
                          <TextField label="End Sta." value={row.endSta} onChange={e => handleItemChange(absIdx, 'endSta', e.target.value)} fullWidth size="small" />
                          <TextField label="Daily Quantity" value={row.dailyQty} onChange={e => handleItemChange(absIdx, 'dailyQty', e.target.value)} fullWidth size="small" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                          <TextField
                            label="Comments"
                            value={row.comments}
                            onChange={e => handleItemChange(absIdx, 'comments', e.target.value)}
                            fullWidth
                            size="small"
                            multiline
                            minRows={4}
                            maxRows={8}
                            sx={{ height: '100%' }}
                            InputProps={{
                              sx: { height: '100%', alignItems: 'stretch', display: 'flex', flex: 1 }
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <IconButton aria-label="duplicate" color="primary" onClick={() => handleDuplicateRow(absIdx)} size="small">
                          <AddIcon />
                        </IconButton>
                        {row.isCustom && (
                          <IconButton aria-label="delete" color="error" onClick={() => handleDeleteItem(absIdx)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            {/* Group 3: Other Items */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Other Items
              </Typography>
              <Stack spacing={2}>
                {items.slice(17).map((row, idx) => {
                  const absIdx = getAbsoluteIndex(3, idx);
                  return (
                    <Paper key={`${row.item}-${idx}`} sx={{ p: 1, mb: 1, boxShadow: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', mr: 1 }}>{row.item}.</Typography>
                        <Typography sx={{ fontWeight: 500 }}>{row.description}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <TextField label="Unit" value={row.unit} onChange={e => handleItemChange(absIdx, 'unit', e.target.value)} fullWidth size="small" />
                          <TextField label="Start Sta." value={row.startSta} onChange={e => handleItemChange(absIdx, 'startSta', e.target.value)} fullWidth size="small" />
                          <TextField label="End Sta." value={row.endSta} onChange={e => handleItemChange(absIdx, 'endSta', e.target.value)} fullWidth size="small" />
                          <TextField label="Daily Quantity" value={row.dailyQty} onChange={e => handleItemChange(absIdx, 'dailyQty', e.target.value)} fullWidth size="small" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                          <TextField
                            label="Comments"
                            value={row.comments}
                            onChange={e => handleItemChange(absIdx, 'comments', e.target.value)}
                            fullWidth
                            size="small"
                            multiline
                            minRows={4}
                            maxRows={8}
                            sx={{ height: '100%' }}
                            InputProps={{
                              sx: { height: '100%', alignItems: 'stretch', display: 'flex', flex: 1 }
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <IconButton aria-label="duplicate" color="primary" onClick={() => handleDuplicateRow(absIdx)} size="small">
                          <AddIcon />
                        </IconButton>
                        {row.isCustom && (
                          <IconButton aria-label="delete" color="error" onClick={() => handleDeleteItem(absIdx)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Button startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined" size="small" fullWidth sx={{ maxWidth: { xs: '100%', sm: 300 } }}>
                Add Item
              </Button>
            </Box>

            <TextField
              label="Comments"
              value={comments}
              onChange={e => setComments(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2, fontSize: { xs: '0.95rem', sm: '1rem' } }}
              size="small"
            />

            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} sm={3}>
                <TextField label="Inspector Signature" name="inspector" value={signatures.inspector} onChange={handleSignatureChange} fullWidth size="small" />
              </Grid>
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker label="Date" value={signatures.inspectorDate} onChange={date => handleSignatureDateChange('inspectorDate', date)} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Contractor Signature" name="contractor" value={signatures.contractor} onChange={handleSignatureChange} fullWidth size="small" />
              </Grid>
              <Grid item xs={12} sm={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker label="Date" value={signatures.contractorDate} onChange={date => handleSignatureDateChange('contractorDate', date)} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />
                </LocalizationProvider>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
              <Button type="submit" variant="contained" fullWidth={true} sx={{ maxWidth: { xs: '100%', sm: 300 } }}>
                Submit Report
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default DailyUtilityReport; 