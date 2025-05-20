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
  Stack,
  Collapse
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PageHeader from '../../../../components/common/PageHeader';
import styles from './DailyUtilityReport.module.css';
import SignaturePad from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';

const defaultItems = [
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
  { item: 43, description: 'SHEET PILING', unit: 'FT.' },
  { item: 44, description: 'WELLPOINTS', unit: 'FT.' },
  { item: 45, description: 'CATHODIC TEST STAND TYPICAL', unit: 'EA.' },
  { item: 46, description: 'CATHODIC TEST STAND HDD 4-WIRE', unit: 'EA.' },
  { item: 47, description: 'SINGLE WRAP ROCKSHIELD ON 16"', unit: 'EA.' },
  { item: 48, description: 'DOUBLE WRAP ROCKSHIELD ON 16"', unit: 'FT.' },
  { item: 49, description: 'TRENCH PLUGS/BREAKERS (EARTH FILLED)', unit: 'FT.' },
  { item: 50, description: 'TRENCH PLUGS/BREAKERS (CEMENT FILLED)', unit: 'EA.' },
  { item: 51, description: 'SILT FENCE - SILT SAVER BSRF PRIORITY II BLACK BAND', unit: 'EA.' },
  { item: 53, description: 'SILT FENCE - SILT SAVER BSRF PRIORITY I GREEN BAND', unit: 'FT.' },
  { item: 54, description: 'COIR LOGS', unit: 'FT.' },
  { item: 55, description: '12" COMPOSITE FILTER SOCK', unit: 'FT.' },
  { item: 56, description: '18" COMPOSITE FILTER SOCK', unit: 'FT.' },
  { item: 57, description: '24" COMPOSITE FILTER SOCK', unit: 'FT.' },
  { item: 58, description: 'STRAW BALE', unit: 'BALE' },
  { item: 59, description: '#3 LIMESTONE', unit: 'TON' },
  { item: 60, description: '#4 LIMESTONE', unit: 'TON' },
  { item: 61, description: '2RC GRAVEL', unit: 'TON' },
  { item: 62, description: '#57 STONE', unit: 'TON' },
  { item: 63, description: 'REMOVAL AND DISPOSAL OF ALL STONE TYPES', unit: 'TON' },
  { item: 64, description: 'SELECT BACKFILL IMPORTED LIMESTONE ROCK DUST', unit: 'TON' },
  { item: 65, description: 'SELECT BACKFILL IMPORTED SCREENED SAND', unit: 'TON' },
  { item: 66, description: 'EROSION CONTROL FABRIC', unit: 'SQ. FT.' },
  { item: 67, description: 'LANDLOK 435 TRM', unit: 'SQ. FT.' },
  { item: 68, description: 'PYRAMAT', unit: 'SQ. FT.' },
  { item: 69, description: 'LANDLOK ECB-52', unit: 'SQ. FT.' },
  { item: 70, description: 'NORTH AMERICAN GREEN C125 BLANKET', unit: 'SQ. FT.' },
  { item: 71, description: 'GEOTEXTILE FABRIC', unit: 'SQ. FT.' },
  { item: 72, description: 'STABILIZED CONSTRUCTION ENTRANCES', unit: 'SQ. FT.' },
  { item: 73, description: 'HYDROMATTING', unit: 'EA.' },
  { item: 74, description: 'TEMPORARY SEED', unit: 'ACRE' },
  { item: 75, description: 'TEMPORARY MULCH', unit: 'ACRE' },
  { item: 76, description: 'CUTTING OUT A SECTION OF PIPE AND REWELD', unit: 'WELD INCH' },
  { item: 77, description: 'CUTTING OUT A SECTION OF PIPE NO WELD', unit: 'WELD INCH' },
  { item: 78, description: 'ORANGE SAFETY FENCE', unit: 'FT.' },
  { item: 79, description: 'EXTRA DEPTH', unit: 'FT.' },
  { item: 80, description: 'WOVEN WIRE FENCE', unit: 'FT.' },
  { item: 81, description: 'BARBED WIRE FENCE', unit: 'FT.' },
  { item: 82, description: 'ELECTRIC WIRE FENCE', unit: 'FT.' },
  { item: 83, description: '16\' GATE INSTALLATION', unit: 'EA.' },
  { item: 84, description: 'LINE MARKER/HIGH CONSEQUENCE AREA MARKER', unit: 'EA.' },
  { item: 85, description: 'FRENCH DRAIN', unit: 'FT.' },
  { item: 86, description: 'FLOWABLE FILL', unit: 'CU. FT.' },
  { item: 87, description: 'TURBIDITY CURTAINS', unit: 'FT.' },
  { item: 88, description: 'TRENCH DRAIN WITH OUTLET', unit: 'EA.' },
  { item: 89, description: 'WICK DRAINS', unit: 'FT.' },
  { item: 90, description: 'INSTALLING MATCOR MITIGATOR AWG NO. 2 FOR AC MITIGATION', unit: 'FT.' },
  { item: 91, description: 'INSTALLING SOLID STATE DECOUPLERS FOR AC MITIGATION', unit: 'EA.' },
  { item: 92, description: 'INSTALLING 12" TEMP WATERLINE FOR TEST WATER', unit: 'FT.' },
  { item: 93, description: 'INSTALLING 12" POLY WATERLINE VIA OPEN CUT IN SOIL OR SOFT ROCK UNDER RUSH RUN RD (SPREAD 2)', unit: 'FT.' },
  { item: 94, description: 'INSTALLING 12" POLY WATERLINE VIA OPEN CUT IN CONSOLIDATED ROCK UNDER RUSH RUN RD (SPREAD 2)', unit: 'FT.' },
  { item: 95, description: 'AC COUPON TEST STATION WITH STEALTH 7 IR FOR AC MITIGATION', unit: 'EA.' },
  { item: 96, description: 'INTERLOCKING MATTING (Heavy Duty)', unit: 'SQ. FT.' },
  { item: 97, description: 'INTERLOCKING MATTING (Light Duty)', unit: 'SQ. FT.' },
];

// Helper functions for item management
const getItemGroup = (item) => {
  const itemStr = item.item.toString();
  const baseNum = parseInt(itemStr.split('.')[0]);
  if (baseNum <= 11) return 1;
  if (baseNum <= 16) return 2;
  return 3;
};

const getGroupItems = (items, groupNum) => {
  return items.filter(item => getItemGroup(item) === groupNum);
};

const getNextItemNumber = (items, baseNum) => {
  // Find all items in the group
  const groupItems = items.filter(item => {
    const itemStr = item.item.toString();
    return itemStr.startsWith(baseNum.toString());
  });

  // Find the highest custom letter
  const customItems = groupItems
    .filter(item => item.item.toString().includes('.'))
    .map(item => item.item.toString().split('.')[1]);

  if (customItems.length === 0) {
    return `${baseNum}.a`;
  }

  // Get the highest letter and increment
  const lastLetter = customItems.sort().slice(-1)[0];
  const nextLetter = String.fromCharCode(lastLetter.charCodeAt(0) + 1);
  return `${baseNum}.${nextLetter}`;
};

const reletterGroupItems = (items, baseNum) => {
  return items.map(item => {
    const itemStr = item.item.toString();
    if (!itemStr.startsWith(baseNum.toString())) return item;

    const isBase = itemStr === baseNum.toString();
    if (isBase) return item;

    const customItems = items
      .filter(i => i.item.toString().startsWith(baseNum.toString()) && i.item.toString() !== baseNum.toString())
      .sort((a, b) => a.item.toString().localeCompare(b.item.toString()));

    const index = customItems.findIndex(i => i.item === item.item);
    if (index === -1) return item;

    return {
      ...item,
      item: `${baseNum}.${String.fromCharCode(97 + index)}`
    };
  });
};

// Helper to group items by base number
const groupItemsByBase = (items) => {
  return items.reduce((acc, item, idx) => {
    const baseNum = item.item.toString().split('.')[0];
    if (!acc[baseNum]) acc[baseNum] = [];
    acc[baseNum].push({ ...item, absIdx: idx });
    return acc;
  }, {});
};

const DailyUtilityReport = () => {
  const [header, setHeader] = useState({
    project: '',
    date: new Date(),
    inspector: '',
    contractor: '',
    spread: '',
  });
  const [items, setItems] = useState(defaultItems.map(row => ({ ...row, startSta: '', endSta: '', dailyQty: '', isCustom: false, comments: '', unitQty: '' })));
  const [comments, setComments] = useState('');
  const [signatures, setSignatures] = useState({ inspector: '', contractor: '', inspectorDate: '', contractorDate: '' });
  const [expandedItems, setExpandedItems] = useState({});
  const [inspectorSig, setInspectorSig] = useState(null);
  const [foremanSig, setForemanSig] = useState(null);
  const inspectorPadRef = React.useRef();
  const foremanPadRef = React.useRef();
  const [inspectorSigning, setInspectorSigning] = useState(false);
  const [foremanSigning, setForemanSigning] = useState(false);
  const navigate = useNavigate();

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
  };
  const handleDateChange = (date) => setHeader(prev => ({ ...prev, date }));

  const handleItemChange = (idx, field, value) => {
    console.log('Changing', idx, field, value);
    setItems(prev => {
      const updated = prev.map((row, i) => i === idx ? { ...row, [field]: value } : row);
      console.log('Updated items:', updated);
      return updated;
    });
  };

  const handleDuplicateRow = (absIdx) => {
    setItems(prev => {
      const originalItem = prev[absIdx];
      const baseNum = parseInt(originalItem.item.toString().split('.')[0]);
      const nextItemNumber = getNextItemNumber(prev, baseNum);

      const newItem = {
        ...originalItem,
        item: nextItemNumber,
        startSta: '',
        endSta: '',
        dailyQty: '',
        unitQty: '',
        comments: '',
        isCustom: true,
      };

      return [
        ...prev.slice(0, absIdx + 1),
        newItem,
        ...prev.slice(absIdx + 1)
      ];
    });
  };

  const handleDeleteItem = (absIdx, groupLength) => {
    if (groupLength === 1) return; // Prevent deleting the last item in the group

    setItems(prev => {
      const itemToDelete = prev[absIdx];
      const itemStr = itemToDelete.item.toString();
      const baseNum = parseInt(itemStr.split('.')[0]);
      const isBaseItem = itemStr === baseNum.toString();

      let newItems = [...prev];
      newItems.splice(absIdx, 1);

      if (isBaseItem) {
        // If deleting base item, promote first custom item
        const customItems = newItems
          .filter(item => item.item.toString().startsWith(baseNum.toString()) && item.item.toString() !== baseNum.toString())
          .sort((a, b) => a.item.toString().localeCompare(b.item.toString()));

        if (customItems.length > 0) {
          const firstCustom = customItems[0];
          const firstCustomIndex = newItems.findIndex(item => item.item === firstCustom.item);
          newItems[firstCustomIndex] = {
            ...firstCustom,
            item: baseNum,
            isCustom: false
          };
        }
      }

      // Re-letter all items in the group
      return reletterGroupItems(newItems, baseNum);
    });
  };

  const handleAddItem = () => {
    // This function is no longer needed since we're using handleDuplicateRow
    // But keeping it for backward compatibility
    const lastItem = items[items.length - 1];
    const originalItemNumber = parseInt(lastItem.item.toString().split('.')[0]);
    const nextItemNumber = getNextItemNumber(items, originalItemNumber);

    setItems(prev => ([
      ...prev,
      {
        item: nextItemNumber,
        description: lastItem.description,
        unit: lastItem.unit,
        startSta: '',
        endSta: '',
        dailyQty: '',
        isCustom: true,
        comments: ''
      }
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

  const handleReview = (e) => {
    e.preventDefault();
    navigate('/utility/reports/daily/review', {
      state: {
        formData: {
          header,
          items,
          comments,
          signatures,
          inspectorSig,
          foremanSig,
        },
      },
    });
  };

  const handleItemExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const isItemEmpty = (item) => {
    return !item.startSta && !item.endSta && !item.dailyQty && !item.comments;
  };

  const renderItemCard = (row, absIdx, { groupLength, groupIdx, isLastInGroup }) => {
    const isExpanded = expandedItems[row.item] || !isItemEmpty(row);
    const isBaseItem = /^\d+$/.test(row.item.toString());
    const isCustomItem = /^\d+\.[a-z]$/.test(row.item.toString());
    
    // Show + on last item, show trash can on all items if more than one
    const showAddButton = isLastInGroup;
    const showDeleteButton = groupLength > 1;
    
    return (
      <Paper key={absIdx} sx={{ p: 1, mb: 1, boxShadow: 2, backgroundColor: '#f5f5f5' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            p: 1,
            borderRadius: 1
          }}
          onClick={() => handleItemExpand(row.item)}
        >
          <Typography sx={{ fontWeight: 'bold', mr: 1 }}>{row.item}.</Typography>
          <Typography sx={{ fontWeight: 500, flex: 1 }}>{row.description}</Typography>
          <IconButton size="small">
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={isExpanded}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField 
                label={row.unit}
                value={String(row.unitQty ?? '')}
                onChange={e => handleItemChange(absIdx, 'unitQty', e.target.value)}
                fullWidth 
                size="small"
                sx={{ input: { color: '#222' } }}
              />
              <TextField 
                label="Start Sta." 
                value={String(row.startSta ?? '')}
                onChange={e => handleItemChange(absIdx, 'startSta', e.target.value)} 
                fullWidth 
                size="small"
                sx={{ input: { color: '#222' } }}
              />
              <TextField 
                label="End Sta." 
                value={String(row.endSta ?? '')}
                onChange={e => handleItemChange(absIdx, 'endSta', e.target.value)} 
                fullWidth 
                size="small"
                sx={{ input: { color: '#222' } }}
              />
              <TextField 
                label="Daily Quantity" 
                value={String(row.dailyQty ?? '')}
                onChange={e => handleItemChange(absIdx, 'dailyQty', e.target.value)} 
                fullWidth 
                size="small"
                sx={{ input: { color: '#222' } }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <TextField
                label="Comments"
                value={String(row.comments ?? '')}
                onChange={e => handleItemChange(absIdx, 'comments', e.target.value)}
                fullWidth
                size="small"
                multiline
                minRows={4}
                maxRows={8}
                sx={{ input: { color: '#222' }, height: '100%', '& .MuiOutlinedInput-root': { height: '100%' } }}
                InputProps={{
                  sx: { height: '100%', alignItems: 'stretch', display: 'flex', flex: 1 }
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
            {showAddButton && (
              <IconButton 
                aria-label="duplicate" 
                color="primary" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleDuplicateRow(absIdx); 
                }} 
                size="small"
              >
                <AddIcon />
              </IconButton>
            )}
            {showDeleteButton && (
              <IconButton 
                aria-label="delete" 
                color="error" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleDeleteItem(absIdx, groupLength); 
                }} 
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </Collapse>
      </Paper>
    );
  };

  const tableCellSx = {
    px: { xs: 0.5, sm: 1 },
    py: { xs: 0.5, sm: 1 },
    fontSize: { xs: '0.85rem', sm: '1rem' },
    wordBreak: 'break-word',
    maxWidth: { xs: 120, sm: 300 },
  };

  const handleClearInspectorSig = () => {
    if (inspectorPadRef.current) {
      inspectorPadRef.current.clear();
    }
    setInspectorSig(null);
    setInspectorSigning(false);
  };
  const handleClearForemanSig = () => {
    if (foremanPadRef.current) {
      foremanPadRef.current.clear();
    }
    setForemanSig(null);
    setForemanSigning(false);
  };

  const handleEndInspectorSig = () => {
    setInspectorSig(inspectorPadRef.current.getTrimmedCanvas().toDataURL('image/png'));
    setInspectorSigning(false);
  };
  const handleEndForemanSig = () => {
    setForemanSig(foremanPadRef.current.getTrimmedCanvas().toDataURL('image/png'));
    setForemanSigning(false);
  };

  // Ensure date values are always Date objects or null
  const getDateValue = (val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  // Grouped rendering with correct absolute indices
  const groupedItems = groupItemsByBase(items);
  const groupOrder = Object.keys(groupedItems).sort((a, b) => Number(a) - Number(b));

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
          <Box className={styles['header-fields-container']}>
            <div className={`${styles['header-row']} ${styles['top']}`}>
              <TextField label="Project" name="project" value={header.project} onChange={handleHeaderChange} fullWidth required size="small" className={styles['header-field']} />
              <TextField label="Spread" name="spread" value={header.spread || ''} onChange={handleHeaderChange} fullWidth size="small" className={styles['header-field']} />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker label="Date" value={header.date} onChange={handleDateChange} slotProps={{ textField: { fullWidth: true, required: true, size: 'small', className: styles['header-field'] } }} />
              </LocalizationProvider>
            </div>
            <div className={`${styles['header-row']} ${styles['bottom']}`}>
              <TextField label="Inspector" name="inspector" value={header.inspector} onChange={handleHeaderChange} fullWidth required size="small" className={styles['header-field']} />
              <TextField label="Contractor" name="contractor" value={header.contractor} onChange={handleHeaderChange} fullWidth required size="small" className={styles['header-field']} />
            </div>
          </Box>
          <form onSubmit={handleReview}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Utility Items
              </Typography>
              <Stack spacing={2}>
                {groupOrder.map(baseNum => {
                  const group = groupedItems[baseNum];
                  return (
                    <Box key={baseNum}>
                      {group.map((row, groupIdx) => {
                        const groupLength = group.length;
                        const isLastInGroup = groupIdx === groupLength - 1;
                        return renderItemCard(row, row.absIdx, {
                          groupLength,
                          groupIdx,
                          isLastInGroup,
                        });
                      })}
                    </Box>
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

            <Box className={styles['header-fields-container']}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Signatures
              </Typography>
              <div className={`${styles['header-row']} ${styles['bottom']}`}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="Inspector Name" name="inspector" value={signatures.inspector} onChange={handleSignatureChange} fullWidth size="small" className={styles['header-field']} />
                  <Box sx={{ mt: 1, mb: 1, background: '#fff', border: '1px solid #222', borderRadius: 1, p: 1, height: { xs: 180, sm: 120 }, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {!inspectorSigning && inspectorSig ? (
                      <>
                        <img
                          src={inspectorSig}
                          alt="Inspector Signature"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff', display: 'block' }}
                        />
                        <Button
                          size="small"
                          onClick={() => { setInspectorSigning(true); handleClearInspectorSig(); }}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Sign Again
                        </Button>
                      </>
                    ) : inspectorSigning ? (
                      <>
                        <SignaturePad
                          ref={inspectorPadRef}
                          canvasProps={{ width: 300, height: 100, className: styles['signature-canvas'] }}
                        />
                        <Button
                          size="small"
                          onClick={() => {
                            if (inspectorPadRef.current && !inspectorPadRef.current.isEmpty()) {
                              setInspectorSig(inspectorPadRef.current.getTrimmedCanvas().toDataURL('image/png'));
                              setInspectorSigning(false);
                            }
                          }}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Done
                        </Button>
                        <Button
                          size="small"
                          onClick={handleClearInspectorSig}
                          sx={{ position: 'absolute', top: 4, left: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Clear
                        </Button>
                      </>
                    ) : (
                      <Box
                        sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
                        onClick={() => setInspectorSigning(true)}
                      >
                        <Typography sx={{ color: '#bbb', fontSize: 18, userSelect: 'none', pointerEvents: 'none' }}>Tap to Sign</Typography>
                      </Box>
                    )}
                  </Box>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker label="Date" value={getDateValue(signatures.inspectorDate)} onChange={date => handleSignatureDateChange('inspectorDate', date)} slotProps={{ textField: { fullWidth: true, size: 'small', className: styles['header-field'] } }} />
                  </LocalizationProvider>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="Foreman Name" name="contractor" value={signatures.contractor} onChange={handleSignatureChange} fullWidth size="small" className={styles['header-field']} />
                  <Box sx={{ mt: 1, mb: 1, background: '#fff', border: '1px solid #222', borderRadius: 1, p: 1, height: { xs: 180, sm: 120 }, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {!foremanSigning && foremanSig ? (
                      <>
                        <img
                          src={foremanSig}
                          alt="Foreman Signature"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff', display: 'block' }}
                        />
                        <Button
                          size="small"
                          onClick={() => { setForemanSigning(true); handleClearForemanSig(); }}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Sign Again
                        </Button>
                      </>
                    ) : foremanSigning ? (
                      <>
                        <SignaturePad
                          ref={foremanPadRef}
                          canvasProps={{ width: 300, height: 100, className: styles['signature-canvas'] }}
                        />
                        <Button
                          size="small"
                          onClick={() => {
                            if (foremanPadRef.current && !foremanPadRef.current.isEmpty()) {
                              setForemanSig(foremanPadRef.current.getTrimmedCanvas().toDataURL('image/png'));
                              setForemanSigning(false);
                            }
                          }}
                          sx={{ position: 'absolute', top: 4, right: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Done
                        </Button>
                        <Button
                          size="small"
                          onClick={handleClearForemanSig}
                          sx={{ position: 'absolute', top: 4, left: 4, minWidth: 'auto', p: 0.5, zIndex: 2 }}
                        >
                          Clear
                        </Button>
                      </>
                    ) : (
                      <Box
                        sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
                        onClick={() => setForemanSigning(true)}
                      >
                        <Typography sx={{ color: '#bbb', fontSize: 18, userSelect: 'none', pointerEvents: 'none' }}>Tap to Sign</Typography>
                      </Box>
                    )}
                  </Box>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker label="Date" value={getDateValue(signatures.contractorDate)} onChange={date => handleSignatureDateChange('contractorDate', date)} slotProps={{ textField: { fullWidth: true, size: 'small', className: styles['header-field'] } }} />
                  </LocalizationProvider>
                </Box>
              </div>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
              <Button onClick={handleReview} variant="contained" fullWidth={true} sx={{ maxWidth: { xs: '100%', sm: 300 } }}>
                Review
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default DailyUtilityReport; 