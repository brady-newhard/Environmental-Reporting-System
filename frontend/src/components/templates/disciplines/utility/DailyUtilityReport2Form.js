import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveDraft, loadDraft } from '../../../../utils/draftUtils';
import PageHeader from '../../../common/PageHeader';
import BaseActionButtons from '../../base/BaseActionButtons';
import BaseSignatureSection from '../../base/BaseSignatureSection';
import BaseDialogs from '../../base/BaseDialogs';
import BaseSnackbar from '../../base/BaseSnackbar';
import ReportPhotoSection from '../../../common/ReportPhotoSection';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const defaultProgressRows = [
  { activity: 'ECD removal (CPS)', from: '', to: '', feet: '', comments: '' },
  { activity: 'ECD removal (Silt Fence)', from: '', to: '', feet: '', comments: '' },
  { activity: 'ECD removal (Super silt fence)', from: '', to: '', feet: '', comments: '' },
  { activity: 'Rough Cleanup (Full Restoration Area)', from: '', to: '', feet: '', comments: '' },
  { activity: 'Ditch Excavation & Karst Inspection', from: '', to: '', feet: '', comments: '' },
  { activity: 'Seeding and Mulching', from: '', to: '', feet: '', comments: '' },
  { activity: 'Final Cleanup and Restoration', from: '', to: '', feet: '', comments: '' },
  { activity: 'Marts Yard Restoration', from: '', to: '', feet: '', comments: '' },
];

// Replace defaultPayItems with a fixed array of all pay items
const fixedPayItems = [
  { item: 'B1 - Timber Mats (16-foot minimum)', uom: 'EA' },
  { item: 'B2 - Bridge Mats (40-foot minimum)', uom: 'EA' },
  { item: 'B3 - Truck Mats (14-foot minimum)', uom: 'EA' },
  { item: 'B4 - Bridge Mats (40-foot minimum)', uom: 'EA' },
  { item: 'C1 - 18-inch Culvert', uom: 'LF' },
  { item: 'C2 - 12-inch Culvert', uom: 'LF' },
  { item: 'C3 - 24-inch Culvert', uom: 'LF' },
  { item: 'C4 - 36-inch Culvert', uom: 'LF' },
  { item: 'C5 - 48-inch Culvert', uom: 'LF' },
  { item: 'C6 - 60-inch Culvert', uom: 'LF' },
  { item: 'C7 - Drain Tile, Up to 15\" Diameter', uom: 'LF' },
  { item: 'C8 - Drain Tile, 16\" to 17\" Diameter', uom: 'LF' },
  { item: 'C9 - Drain Tile, 18\" to 30\" Diameter', uom: 'LF' },
  { item: 'C10 - Drain Tile, 31\" to 36\" Diameter', uom: 'LF' },
  { item: 'C11 - Drain Tile, 37\" to 60\" Diameter', uom: 'LF' },
  { item: 'C12a - Drain Tile, 31\" to 60\" Diameter', uom: 'LF' },
  { item: 'C12b - Drain Tile, 31\" to 42\" Diameter', uom: 'LF' },
  { item: 'D1 - Silt Saver RSSF Priority 1 Black Band', uom: 'LF' },
  { item: 'D2 - Silt Saver RSSF Priority 1 Green Band Heavy Duty', uom: 'LF' },
  { item: 'D3 - Dori Logs', uom: 'LF' },
  { item: 'D4 - Composite Filter Sock (12\" Diameter Compost Filter Sock)', uom: 'LF' },
  { item: 'D5 - Composite Filter Sock (18\" Diameter Compost Filter Sock)', uom: 'LF' },
  { item: 'D6 - Composite Filter Sock (24\" Diameter Compost Filter Sock)', uom: 'LF' },
  { item: 'D7 - Straw Bales', uom: 'EA' },
  { item: 'D8 - French Drains', uom: 'LF' },
  { item: 'D9 - Stream Bank Stabilization (Landlok 435 TRM)', uom: 'SF' },
  { item: 'D10 - Stream Bank Stabilization (Pyramat)', uom: 'SF' },
  { item: 'D11 - Stream Bank Stabilization (Landlok ECB-52)', uom: 'SF' },
  { item: 'D12 - Geotextile Fabric', uom: 'SF' },
  { item: 'D13 - Jute Matting', uom: 'SF' },
  { item: 'E1 - Stone Rip Rap, 4-inch Minus', uom: 'TN' },
  { item: 'E2 - Stone Rip Rap, 6-inch Minus', uom: 'TN' },
  { item: 'E3 - Stone Rip Rap, 8-inch Minus', uom: 'TN' },
  { item: 'E4 - Stone Rip Rap, 12-inch Minus', uom: 'TN' },
  { item: 'E5 - Stone Rip Rap, 18-inch Minus', uom: 'TN' },
  { item: 'E6 - Stone Aggregate, #9 Limestone', uom: 'TN' },
  { item: 'E7 - Stone Aggregate, #4 Limestone', uom: 'TN' },
  { item: 'E8 - Stone Aggregate, R2C Gravel', uom: 'TN' },
  { item: 'F1 - Orange Safety Fence', uom: 'LF' },
  { item: 'F2 - Orange Safety Fence', uom: 'LF' },
  { item: 'F3 - Barbed Wire Fence', uom: 'LF' },
  { item: 'F4 - High Tensile Electric Fence', uom: 'LF' },
  { item: 'F5 - Woven Wire Fence', uom: 'LF' },
  { item: 'F6 - Single Strand Electric Wire Fence', uom: 'LF' },
  { item: 'F7 - Temporary Fence Gap', uom: 'LF' },
  { item: 'F8 - Utility/Farm Gate (8-foot)', uom: 'EA' },
  { item: 'F9 - Utility/Farm Gate (10-foot)', uom: 'EA' },
  { item: 'F10 - Utility/Farm Gate (12-foot)', uom: 'EA' },
  { item: 'F11 - Utility/Farm Gate (16-foot)', uom: 'EA' },
  { item: 'G1 - Unplanned Move Around (Mechanical Haulout)', uom: 'EA' },
  { item: 'G2 - Unplanned Move Around (Rough Cleanup)', uom: 'EA' },
  { item: 'G3 - Unplanned Move Around (Seeding and Mulching)', uom: 'EA' },
  { item: 'G4 - Unplanned Move Around (Final Cleanup and Restoration)', uom: 'EA' },
  { item: 'H1 - Construction Crew Shutdown (Mechanical Haulout)', uom: 'EA' },
  { item: 'H2 - Construction Crew Shutdown (Rough Cleanup)', uom: 'EA' },
  { item: 'H3 - Construction Crew Shutdown (Seeding and Mulching)', uom: 'EA' },
  { item: 'H4 - Construction Crew Shutdown (Final Cleanup and Restoration)', uom: 'EA' },
  { item: 'M1 - Placement of ACP provided Digging Mat or Truck Mat (Located at Eltweter Yard)', uom: 'EA' },
  { item: 'M2 - Winter Maintenance Crew', uom: 'EA' },
  { item: 'N1 - Placement of existing Concrete or Yard Stone', uom: 'TN' },
  { item: 'S1 - Hydromulch - Ground Applied - New - Flexterra 3,200lb/acre', uom: 'ACRE' },
  { item: 'S2 - Hydromulch - Aerial Applications - New - Flexterra 3,200lb/acre', uom: 'ACRE' },
  { item: 'S3 - Conventional Broadcast Seed & Mulch - New - Lime 1 ton/acre, Fert 350lb/acre, mulch 2 tons/acre', uom: 'ACRE' },
  { item: 'S4 - Winter seed / lbs', uom: 'LB' },
  { item: 'S5 - Temporary Stabilization / acre', uom: 'ACRE' },
  { item: 'S6 - Promatrix Hydromulch - Ground Applied', uom: 'ACRE' },
  { item: 'D13 - Super Silt Fence Fabric', uom: 'LF' },
];

const defaultHeadcounts = {
  office: '', foreman: '', laborers: '', operators: '', teamsters: '', welders: '', helpers: '', other: ''
};

const DailyUtilityReport2Form = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState(id || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', severity: 'success' });

  // Header state
  const [header, setHeader] = useState({
    section: '',
    spread: '',
    contractor: '',
    workDate: new Date().toISOString().split('T')[0],
  });
  const [headcounts, setHeadcounts] = useState(defaultHeadcounts);
  const [subcontractors, setSubcontractors] = useState([{ company: '', headcount: '' }]);
  const [inspectionPersonnel, setInspectionPersonnel] = useState([{ company: '', headcount: '' }]);
  const [craft, setCraft] = useState('');
  const [environmental, setEnvironmental] = useState('');
  const [survey, setSurvey] = useState('');
  const [land, setLand] = useState('');

  // Weather/conditions
  const [morningTemp, setMorningTemp] = useState('');
  const [midTemp, setMidTemp] = useState('');
  const [wind, setWind] = useState('');
  const [weather, setWeather] = useState('');
  const [precipitation, setPrecipitation] = useState('');
  const [abnormalConditions, setAbnormalConditions] = useState('');
  const [crewAdverse, setCrewAdverse] = useState('');

  // Progress/activity
  const [progressRows, setProgressRows] = useState(defaultProgressRows);
  // Remove payItems state, instead use a state for the editable fields only
  // Change fixedPayItems to a state variable payItems, initialized with the fixed list
  const initialPayItems = fixedPayItems.map(item => ({ ...item, from: '', to: '', qty: '', comments: '' }));
  const [payItems, setPayItems] = useState(initialPayItems);

  // Remarks, equipment, crews
  const [remarks, setRemarks] = useState('');
  const [equipment, setEquipment] = useState([{ name: '', qty: '' }]);
  const [crews, setCrews] = useState([{ name: '', qty: '' }]);

  // Photos/signature
  const [photos, setPhotos] = useState([]);
  const [preparedBy, setPreparedBy] = useState('');
  const [signature, setSignature] = useState('');
  const [sigDate, setSigDate] = useState('');

  // Load existing draft if editing
  useEffect(() => {
    const loadExistingDraft = async () => {
      if (id) {
        try {
          const loadedDraft = await loadDraft('daily_utility_2', id);
          if (loadedDraft) {
            setHeader(loadedDraft.header || header);
            setHeadcounts(loadedDraft.headcounts || defaultHeadcounts);
            setSubcontractors(loadedDraft.subcontractors || [{ company: '', headcount: '' }]);
            setInspectionPersonnel(loadedDraft.inspectionPersonnel || [{ company: '', headcount: '' }]);
            setCraft(loadedDraft.craft || '');
            setEnvironmental(loadedDraft.environmental || '');
            setSurvey(loadedDraft.survey || '');
            setLand(loadedDraft.land || '');
            setMorningTemp(loadedDraft.morningTemp || '');
            setMidTemp(loadedDraft.midTemp || '');
            setWind(loadedDraft.wind || '');
            setWeather(loadedDraft.weather || '');
            setPrecipitation(loadedDraft.precipitation || '');
            setAbnormalConditions(loadedDraft.abnormalConditions || '');
            setCrewAdverse(loadedDraft.crewAdverse || '');
            setProgressRows(loadedDraft.progressRows || defaultProgressRows);
            // The payItemFields state is not directly loaded from draft, so it will be empty initially
            // or the user will need to re-enter them.
            // setPayItemFields(loadedDraft.payItemFields || fixedPayItems.map(() => ({ from: '', to: '', qty: '', comments: '' })));
            setPayItems(loadedDraft.payItems || initialPayItems);
            setRemarks(loadedDraft.remarks || '');
            setEquipment(loadedDraft.equipment || [{ name: '', qty: '' }]);
            setCrews(loadedDraft.crews || [{ name: '', qty: '' }]);
            setPhotos(loadedDraft.photos || []);
            setPreparedBy(loadedDraft.preparedBy || '');
            setSignature(loadedDraft.signature || '');
            setSigDate(loadedDraft.sigDate || '');
          }
        } catch (error) {
          setSnackbar({ show: true, message: 'Error loading draft: ' + error.message, severity: 'error' });
        }
      }
    };
    loadExistingDraft();
    // eslint-disable-next-line
  }, [id]);

  // Handlers for all fields (omitted for brevity, but will match the original form's logic)

  // Add save, review, delete, and exit handlers
  const handleSave = async () => {
    try {
      setLoading(true);
      const dataToSave = {
        id: draftId, // Include the current draft ID if it exists
        header,
        headcounts,
        subcontractors,
        inspectionPersonnel,
        craft,
        environmental,
        survey,
        land,
        morningTemp,
        midTemp,
        wind,
        weather,
        precipitation,
        abnormalConditions,
        crewAdverse,
        progressRows,
        payItems,
        remarks,
        equipment,
        crews,
        photos,
        preparedBy,
        signature,
        sigDate,
        reportType: 'daily_utility_2',
      };
      
      console.log('Saving draft with:', { draftId, hasId: !!draftId });
      
      const savedDraft = await saveDraft('daily_utility_2', dataToSave);
      
      console.log('Draft saved successfully:', { 
        originalDraftId: draftId, 
        savedDraftId: savedDraft.id,
        willNavigate: true 
      });
      
      setSnackbar({ show: true, message: 'Draft saved successfully', severity: 'success' });
      
      // Always navigate to edit page with the saved draft ID
      const targetId = savedDraft.id || draftId;
      console.log('Navigating to:', `/utility/reports/daily2/edit/${targetId}`);
      
      if (!draftId && savedDraft.id) {
        setDraftId(savedDraft.id);
        navigate(`/utility/reports/daily2/edit/${savedDraft.id}`, { replace: true });
      } else {
        navigate(`/utility/reports/daily2/edit/${targetId}`);
      }
      
      return savedDraft;
    } catch (error) {
      console.error('Error saving draft:', error);
      setSnackbar({ show: true, message: 'Error saving draft: ' + (error.message || 'Unknown error'), severity: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    const reviewData = {
      id: draftId,
      header,
      headcounts,
      subcontractors,
      inspectionPersonnel,
      craft,
      environmental,
      survey,
      land,
      morningTemp,
      midTemp,
      wind,
      weather,
      precipitation,
      abnormalConditions,
      crewAdverse,
      progressRows,
      payItems,
      remarks,
      equipment,
      crews,
      photos,
      preparedBy,
      signature,
      sigDate,
      reportType: 'daily_utility_2',
    };
    try {
      const savedDraft = await saveDraft('daily_utility_2', reviewData);
      if (savedDraft.id && savedDraft.id !== draftId) {
        setDraftId(savedDraft.id);
        navigate(`/utility/reports/daily2/review/${savedDraft.id}`, { state: savedDraft });
      } else {
        navigate(`/utility/reports/daily2/review/${draftId}`, { state: savedDraft });
      }
    } catch (error) {
      navigate(`/utility/reports/daily2/review/${draftId}`, { state: reviewData });
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Implement delete logic here (e.g., call an API or remove from local storage)
      setDeleteDialogOpen(false);
      navigate('/utility/reports/daily2/drafts');
    } catch (error) {
      setSnackbar({ show: true, message: 'Error deleting draft: ' + error.message, severity: 'error' });
    }
  };

  const handleExit = () => {
    setExitDialogOpen(true);
  };

  const handleExitConfirm = async (shouldSave) => {
    if (shouldSave) {
      await handleSave();
    }
    navigate('/utility/reports/daily2/drafts');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSave();
  };

  // Add handlePhotoNotification function if not present
  const handlePhotoNotification = (message, severity) => {
    setSnackbar({ show: true, message, severity });
  };

  // Render all sections: header, headcounts, weather, progress, pay items, remarks, equipment, crews, photos, signature, action buttons
  // (Omitted for brevity, but will match the structure and styling of DailyUtilityReportForm.js)

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Daily Utility Report 2"
          backPath="/utility/reports"
          backButtonStyle={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
        />
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Section</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={header.section} onChange={e => setHeader({ ...header, section: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Spread</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={header.spread} onChange={e => setHeader({ ...header, spread: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Contractor</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={header.contractor} onChange={e => setHeader({ ...header, contractor: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Work Date</label>
                <input type="date" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={header.workDate} onChange={e => setHeader({ ...header, workDate: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Contractor Headcount Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Contractor Headcount</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(headcounts).map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={headcounts[key]} onChange={e => setHeadcounts({ ...headcounts, [key]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          {/* Subcontractors & Inspection Personnel */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Subcontractors</h2>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={subcontractors[0]?.company || ''} onChange={e => setSubcontractors([{ ...subcontractors[0], company: e.target.value }])} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Headcount</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={subcontractors[0]?.headcount || ''} onChange={e => setSubcontractors([{ ...subcontractors[0], headcount: e.target.value }])} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 mt-6">Inspection Personnel</h2>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={inspectionPersonnel[0]?.company || ''} onChange={e => setInspectionPersonnel([{ ...inspectionPersonnel[0], company: e.target.value }])} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Headcount</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={inspectionPersonnel[0]?.headcount || ''} onChange={e => setInspectionPersonnel([{ ...inspectionPersonnel[0], headcount: e.target.value }])} />
              </div>
            </div>
          </div>

          {/* Craft/Environmental/Survey/Land */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Other Info</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Craft</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={craft} onChange={e => setCraft(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Environmental</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={environmental} onChange={e => setEnvironmental(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Survey</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={survey} onChange={e => setSurvey(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Land</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={land} onChange={e => setLand(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Weather & Working Conditions */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Weather & Working Conditions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Morning Temp</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={morningTemp} onChange={e => setMorningTemp(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mid Temp</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={midTemp} onChange={e => setMidTemp(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Wind</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={wind} onChange={e => setWind(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Weather</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={weather} onChange={e => setWeather(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Precipitation</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={precipitation} onChange={e => setPrecipitation(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Did ABNORMAL working conditions exist that adversely affected progress?</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={abnormalConditions} onChange={e => setAbnormalConditions(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Any Crews affected by adverse weather, right-of-way or other working conditions?</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={crewAdverse} onChange={e => setCrewAdverse(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Progress/Activity Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Progress / Activity</h2>
            <div className="">
              <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words" style={{ width: '220px' }}>Activity</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '90px' }}>From</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '90px' }}>To</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '90px' }}>Feet Today</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words" style={{ width: '100%' }}>Comments</th>
                    <th style={{ width: '48px' }}></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {progressRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2 whitespace-normal break-words text-sm text-gray-900 w-48 align-top">{row.activity}</td>
                      <td className="px-1 py-2 align-top">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={row.from} onChange={e => {
                          const newRows = [...progressRows];
                          newRows[idx].from = e.target.value;
                          setProgressRows(newRows);
                        }} />
                      </td>
                      <td className="px-1 py-2 align-top">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={row.to} onChange={e => {
                          const newRows = [...progressRows];
                          newRows[idx].to = e.target.value;
                          setProgressRows(newRows);
                        }} />
                      </td>
                      <td className="px-1 py-2 align-top">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={row.feet} onChange={e => {
                          const newRows = [...progressRows];
                          newRows[idx].feet = e.target.value;
                          setProgressRows(newRows);
                        }} />
                      </td>
                      <td className="px-2 py-2 whitespace-normal break-words align-top">
                        <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm min-h-[2.5rem] resize-y" rows={2} value={row.comments} onChange={e => {
                          const newRows = [...progressRows];
                          newRows[idx].comments = e.target.value;
                          setProgressRows(newRows);
                        }} />
                      </td>
                      <td className="px-1 py-2 align-top flex gap-1" style={{ width: '48px', textAlign: 'center' }}>
                        <button type="button" onClick={() => {
                          const newRows = [...progressRows];
                          newRows.splice(idx + 1, 0, {
                            activity: row.activity,
                            from: '',
                            to: '',
                            feet: '',
                            comments: ''
                          });
                          setProgressRows(newRows);
                        }} className="text-green-600 hover:text-green-800 p-1" title="Add another entry for this activity">
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        {/* Show trashcan only if there is more than one row for this activity */}
                        {progressRows.filter(r => r.activity === row.activity).length > 1 && (
                          <button type="button" onClick={() => {
                            const newRows = progressRows.filter((_, i) => i !== idx);
                            setProgressRows(newRows);
                          }} className="text-red-600 hover:text-red-800 p-1" title="Remove this entry">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pay Item Logs Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pay Item Logs</h2>
            <div className="">
              <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words" style={{ width: '220px' }}>Item</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '60px' }}>UOM</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '90px' }}>From</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '90px' }}>To</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '90px' }}>Quantity Today</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-normal break-words" style={{ width: '100%' }}>Comments</th>
                    <th style={{ width: '48px' }}></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2 whitespace-normal break-words text-sm text-gray-900 w-48 align-top">{item.item}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 w-12 align-top">{item.uom}</td>
                      <td className="px-1 py-2 align-top">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={item.from} onChange={e => {
                          const newItems = [...payItems];
                          newItems[idx].from = e.target.value;
                          setPayItems(newItems);
                        }} />
                      </td>
                      <td className="px-1 py-2 align-top">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={item.to} onChange={e => {
                          const newItems = [...payItems];
                          newItems[idx].to = e.target.value;
                          setPayItems(newItems);
                        }} />
                      </td>
                      <td className="px-1 py-2 align-top">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={item.qty} onChange={e => {
                          const newItems = [...payItems];
                          newItems[idx].qty = e.target.value;
                          setPayItems(newItems);
                        }} />
                      </td>
                      <td className="px-2 py-2 whitespace-normal break-words align-top">
                        <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm min-h-[2.5rem] resize-y" rows={2} value={item.comments} onChange={e => {
                          const newItems = [...payItems];
                          newItems[idx].comments = e.target.value;
                          setPayItems(newItems);
                        }} />
                      </td>
                      <td className="px-1 py-2 align-top flex gap-1" style={{ width: '48px', textAlign: 'center' }}>
                        <button type="button" onClick={() => {
                          const newItems = [...payItems];
                          newItems.splice(idx + 1, 0, { ...item, from: '', to: '', qty: '', comments: '' });
                          setPayItems(newItems);
                        }} className="text-green-600 hover:text-green-800 p-1" title="Add another entry for this pay item">
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        {/* Show trashcan only if there is more than one row for this pay item */}
                        {payItems.filter((i) => i.item === item.item).length > 1 && (
                          <button type="button" onClick={() => {
                            const newItems = payItems.filter((_, i) => i !== idx);
                            setPayItems(newItems);
                          }} className="text-red-600 hover:text-red-800 p-1" title="Remove this entry">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Remarks</h2>
            <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm min-h-[2.5rem] resize-y" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Enter any remarks or notes..." />
          </div>

          {/* Equipment & Crews Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Equipment & Crews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Equipment</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={equipment[0]?.name || ''} onChange={e => setEquipment([{ ...equipment[0], name: e.target.value }])} placeholder="Equipment name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={equipment[0]?.qty || ''} onChange={e => setEquipment([{ ...equipment[0], qty: e.target.value }])} placeholder="Qty" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Crew</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={crews[0]?.name || ''} onChange={e => setCrews([{ ...crews[0], name: e.target.value }])} placeholder="Crew name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={crews[0]?.qty || ''} onChange={e => setCrews([{ ...crews[0], qty: e.target.value }])} placeholder="Qty" />
              </div>
            </div>
          </div>

          {/* Photos Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Photos</h2>
            <ReportPhotoSection
              photos={photos}
              onPhotosChange={setPhotos}
              editable={true}
              content_type="daily_utility_2"
              object_id={draftId && !String(draftId).startsWith('temp_') ? draftId : null}
              onNotification={handlePhotoNotification}
            />
          </div>

          {/* Signature Section */}
          <BaseSignatureSection
            signature={signature}
            sigDate={sigDate}
            preparedBy={preparedBy}
            onSignatureChange={setSignature}
            onSigDateChange={setSigDate}
            onPreparedByChange={setPreparedBy}
            onClearSignature={() => setSignature('')}
            title="Signature Section"
          />

          {/* Action Buttons */}
          <BaseActionButtons
            loading={loading}
            draftId={draftId}
            onExit={handleExit}
            onDelete={handleDelete}
            onReview={handleReview}
            onSave={handleSave}
          />
        </form>
        <BaseDialogs
          deleteDialogOpen={deleteDialogOpen}
          exitDialogOpen={exitDialogOpen}
          onDeleteConfirm={handleDeleteConfirm}
          onExitConfirm={handleExitConfirm}
          onCloseDeleteDialog={() => setDeleteDialogOpen(false)}
          onCloseExitDialog={() => setExitDialogOpen(false)}
        />
        <BaseSnackbar
          snackbar={snackbar}
          onClose={() => setSnackbar({ show: false, message: '', severity: 'success' })}
        />
      </div>
    </div>
  );
};

export default DailyUtilityReport2Form; 