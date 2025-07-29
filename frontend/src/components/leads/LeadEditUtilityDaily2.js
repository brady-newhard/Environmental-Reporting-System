import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { saveDraft, loadDraft } from '../../utils/draftUtils';
import PageHeader from '../common/PageHeader';
import BaseSignatureSection from '../templates/base/BaseSignatureSection';
import BaseSnackbar from '../templates/base/BaseSnackbar';
import ReportPhotoSection from '../common/ReportPhotoSection';
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

const LeadEditUtilityDaily2 = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', severity: 'success' });

  // Header state
  const [header, setHeader] = useState({
    section: '',
    spread: '',
    contractor: '',
    inspector: '',
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
  
  // Equipment options for dropdown
  const equipmentOptions = [
    'MINI EXCAVATOR 305/50',
    'TRACK LOADER 259/T66',
    'EXCAVATOR 313/130',
    'EXCAVATOR 320/210',
    'DOZER D4/650',
    'DOZER D6T/850',
    'ROLLER 84"',
    'TELEHANDLER 12K',
    'TRACK TRUCK 14 TON',
    'ART. DUMP TRUCK 30 TON',
    'CTL/MINI EXCAVATOR ATTACH',
    'UTILITY TRAILER',
    'CREW TRUCK W/TOOLS',
    'WELDING RIG',
    'DUMPTRUCK TRI-AXLE',
    '10 TON DUMP TRUCK',
    'SIDE X SIDE',
    'HAMMER ATTACH 130/210',
    'ROTOBUC ATTACH',
  ];
  
  // Trucking options for dropdown
  const truckingOptions = [
    'TRACTOR W/LOWBOY',
    'ROLLBACK',
    'ESCORT/PILOT',
    '1 TON FLAT BED',
  ];
  
  // Crew options for dropdown
  const crewOptions = [
    '1 MAN CREW W/TRUCK',
    '2 MAN CREW W/TRUCK',
    '3 MAN CREW W/TRUCK',
    '4 MAN CREW W/TRUCK',
    '5 MAN CREW W/TRUCK',
    '6 MAN CREW W/TRUCK',
  ];
  
  // Equipment state - dynamic list
  const [equipment, setEquipment] = useState([{ type: '', qty: '', isCustom: false, customType: '', isCustomComplete: false }]);
  
  // Trucking state - dynamic list (remove names)
  const [trucking, setTrucking] = useState([{ type: '', qty: '', isCustom: false, customType: '', isCustomComplete: false }]);
  
  // Crews state - dynamic list
  const [crews, setCrews] = useState([{ type: '', qty: '', isCustom: false, customType: '', isCustomComplete: false }]);

  // Photos/signature
  const [photos, setPhotos] = useState([]);
  const [preparedBy, setPreparedBy] = useState('');
  const [signature, setSignature] = useState('');
  const [sigDate, setSigDate] = useState('');

  // Load existing report data for lead editing
  useEffect(() => {
    const loadReportData = async () => {
      // Try to get data from either reportData or draft
      const reportData = location.state?.reportData || location.state?.draft;
      
      if (reportData) {
        try {
          // Map snake_case backend data to camelCase form data
          setHeader(reportData.header || header);
          setHeadcounts(reportData.headcounts || defaultHeadcounts);
          setSubcontractors(reportData.subcontractors || [{ company: '', headcount: '' }]);
          setInspectionPersonnel(reportData.inspection_personnel || [{ company: '', headcount: '' }]);
          setCraft(reportData.craft || '');
          setEnvironmental(reportData.environmental || '');
          setSurvey(reportData.survey || '');
          setLand(reportData.land || '');
          
          // Map temperature fields from snake_case to camelCase
          setMorningTemp(reportData.morning_temp || reportData.morningTemp || '');
          setMidTemp(reportData.mid_temp || reportData.midTemp || '');
          
          setWeather(reportData.weather || '');
          setPrecipitation(reportData.precipitation || '');
          setAbnormalConditions(reportData.abnormal_conditions || reportData.abnormalConditions || '');
          setCrewAdverse(reportData.crew_adverse || reportData.crewAdverse || '');
          setProgressRows(reportData.progress_rows || reportData.progressRows || defaultProgressRows);
          setPayItems(reportData.pay_items || reportData.payItems || initialPayItems);
          setRemarks(reportData.remarks || '');
          setEquipment(reportData.equipment || [{ type: '', qty: '', isCustom: false, customType: '', isCustomComplete: false }]);
          setTrucking(reportData.trucking || [{ type: '', qty: '', isCustom: false, customType: '', isCustomComplete: false }]);
          setCrews(reportData.crews || [{ type: '', qty: '', isCustom: false, customType: '', isCustomComplete: false }]);
          setPhotos(reportData.photos || []);
          
          // Handle different field name variations for signature fields
          setPreparedBy(reportData.prepared_by || reportData.preparedBy || '');
          setSignature(reportData.signature || '');
          setSigDate(reportData.signature_date || reportData.signatureDate || '');
          
        } catch (error) {
          setSnackbar({ show: true, message: 'Error loading report data: ' + error.message, severity: 'error' });
        }
      } else {
        setSnackbar({ show: true, message: 'No report data provided for editing', severity: 'error' });
      }
    };
    loadReportData();
  }, [location.state]);

  // Handlers for all fields (omitted for brevity, but will match the original form's logic)

  // Add save, review, delete, and exit handlers
  const handleSave = async () => {
    try {
      setLoading(true);
      
      const dataToSave = {
        id: reportId, // Set the ID to the report ID so it saves with the correct key
        header,
        headcounts,
        subcontractors,
        inspection_personnel: inspectionPersonnel,
        craft,
        environmental,
        survey,
        land,
        morning_temp: morningTemp,
        mid_temp: midTemp,
        weather,
        precipitation,
        abnormal_conditions: abnormalConditions,
        crew_adverse: crewAdverse,
        progress_rows: progressRows,
        pay_items: payItems,
        remarks,
        equipment,
        trucking,
        crews,
        photos,
        prepared_by: preparedBy,
        signature,
        signature_date: sigDate,
        reportType: 'daily_utility_2',
        lastSaved: new Date().toISOString(), // Add timestamp to verify saves
      };
      
      // For lead editing, we'll save as a draft and stay on the page
      const savedDraft = await saveDraft('daily_utility_2', dataToSave);
      
      setSnackbar({ show: true, message: 'Lead edits saved successfully', severity: 'success' });
      
      // Stay on the page instead of navigating away
      
      return savedDraft;
    } catch (error) {
      console.error('Error saving lead edits:', error);
      setSnackbar({ show: true, message: 'Error saving lead edits: ' + (error.message || 'Unknown error'), severity: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        <PageHeader
          title="Daily Utility Report 2 (Lead Edit)"
          backPath={`/leads/review/${reportId}`}
          backButtonStyle={{ backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#333' } }}
        />
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Project Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Section</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center" value={header.section} onChange={e => setHeader({ ...header, section: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Spread</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center" value={header.spread} onChange={e => setHeader({ ...header, spread: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Contractor</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center" value={header.contractor} onChange={e => setHeader({ ...header, contractor: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Inspector</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center" value={header.inspector} onChange={e => setHeader({ ...header, inspector: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Work Date</label>
                <input type="date" className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center" value={header.workDate} onChange={e => setHeader({ ...header, workDate: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Contractor/Subcontractor Headcount Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Contractor/Subcontractor Headcount</h2>
            
            {/* Contractor Headcount */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Contractor</h3>
              
              {/* Line 1: Office and Foreman */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Office</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={headcounts.office} onChange={e => setHeadcounts({ ...headcounts, office: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Foreman Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={headcounts.foreman} onChange={e => setHeadcounts({ ...headcounts, foreman: e.target.value })} />
                </div>
              </div>
              
              {/* Line 2: Remaining headcount fields */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Laborers</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={headcounts.laborers} onChange={e => setHeadcounts({ ...headcounts, laborers: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Operators</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={headcounts.operators} onChange={e => setHeadcounts({ ...headcounts, operators: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Teamsters</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={headcounts.teamsters} onChange={e => setHeadcounts({ ...headcounts, teamsters: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Welders</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={headcounts.welders} onChange={e => setHeadcounts({ ...headcounts, welders: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Helpers</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={headcounts.helpers} onChange={e => setHeadcounts({ ...headcounts, helpers: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Other</label>
                  <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={headcounts.other} onChange={e => setHeadcounts({ ...headcounts, other: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Subcontractors */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Subcontractors</h3>
              {subcontractors.map((subcontractor, idx) => (
                <div key={idx} className="flex flex-row gap-2 mb-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Company</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm" 
                      value={subcontractor.company || ''} 
                      onChange={e => {
                        const newList = [...subcontractors];
                        newList[idx].company = e.target.value;
                        setSubcontractors(newList);
                      }} 
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Headcount</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm" 
                      value={subcontractor.headcount || ''} 
                      onChange={e => {
                        const newList = [...subcontractors];
                        newList[idx].headcount = e.target.value;
                        setSubcontractors(newList);
                      }} 
                    />
                  </div>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800 px-2"
                    onClick={() => setSubcontractors(subcontractors.filter((_, i) => i !== idx))}
                    disabled={subcontractors.length === 1}
                    title="Remove"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
                onClick={() => setSubcontractors([...subcontractors, { company: '', headcount: '' }])}
              >
                + Add Subcontractor
              </button>
            </div>
          </div>

          {/* Craft/Environmental/Survey/Land */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Inspection Personnel</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Morning Temp</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={morningTemp} onChange={e => setMorningTemp(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mid Temp</label>
                <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={midTemp} onChange={e => setMidTemp(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Weather</label>
                <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={weather} onChange={e => setWeather(e.target.value)}>
                  <option value="">Select Weather</option>
                  <option value="Sunny">Sunny</option>
                  <option value="Mostly Sunny">Mostly Sunny</option>
                  <option value="Partly Sunny">Partly Sunny</option>
                  <option value="Cloudy">Cloudy</option>
                  <option value="Overcast">Overcast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Precipitation</label>
                <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={precipitation} onChange={e => setPrecipitation(e.target.value)}>
                  <option value="">Select Precipitation</option>
                  <option value="none">None</option>
                  <option value="drizzle">Drizzle</option>
                  <option value="rain">Rain</option>
                  <option value="snow">Snow</option>
                  <option value="sleet">Sleet</option>
                  <option value="hail">Hail</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Did ABNORMAL working conditions exist that adversely affected progress?</label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={abnormalConditions === 'yes'}
                      onChange={() => setAbnormalConditions(abnormalConditions === 'yes' ? '' : 'yes')}
                    />
                    <span className="ml-2">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={abnormalConditions === 'no'}
                      onChange={() => setAbnormalConditions(abnormalConditions === 'no' ? '' : 'no')}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Any Crews affected by adverse weather, right-of-way or other working conditions?</label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={crewAdverse === 'yes'}
                      onChange={() => setCrewAdverse(crewAdverse === 'yes' ? '' : 'yes')}
                    />
                    <span className="ml-2">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600"
                      checked={crewAdverse === 'no'}
                      onChange={() => setCrewAdverse(crewAdverse === 'no' ? '' : 'no')}
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Progress/Activity Section - Mobile Responsive Cards */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Progress / Activity</h2>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feet Today</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {progressRows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2 text-sm text-gray-900">{row.activity}</td>
                      <td className="px-1 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={row.from} onChange={e => {
                          const newRows = [...progressRows];
                          newRows[idx].from = e.target.value;
                          setProgressRows(newRows);
                        }} />
                      </td>
                      <td className="px-1 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={row.to} onChange={e => {
                          const newRows = [...progressRows];
                          newRows[idx].to = e.target.value;
                          setProgressRows(newRows);
                        }} />
                      </td>
                      <td className="px-1 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={row.feet} onChange={e => {
                          const newRows = [...progressRows];
                          newRows[idx].feet = e.target.value;
                          setProgressRows(newRows);
                        }} />
                      </td>
                      <td className="px-2 py-2">
                        <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm min-h-[2.5rem] resize-y" rows={2} value={row.comments} onChange={e => {
                          const newRows = [...progressRows];
                          newRows[idx].comments = e.target.value;
                          setProgressRows(newRows);
                        }} />
                      </td>
                      <td className="px-1 py-2 flex gap-1">
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

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {progressRows.map((row, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
                    <div className="text-sm text-gray-900 font-medium">{row.activity}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={row.from} onChange={e => {
                        const newRows = [...progressRows];
                        newRows[idx].from = e.target.value;
                        setProgressRows(newRows);
                      }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={row.to} onChange={e => {
                        const newRows = [...progressRows];
                        newRows[idx].to = e.target.value;
                        setProgressRows(newRows);
                      }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Feet Today</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={row.feet} onChange={e => {
                        const newRows = [...progressRows];
                        newRows[idx].feet = e.target.value;
                        setProgressRows(newRows);
                      }} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Comments</label>
                    <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm min-h-[2.5rem] resize-y" rows={2} value={row.comments} onChange={e => {
                      const newRows = [...progressRows];
                      newRows[idx].comments = e.target.value;
                      setProgressRows(newRows);
                    }} />
                  </div>
                  <div className="flex gap-2">
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
                    {progressRows.filter(r => r.activity === row.activity).length > 1 && (
                      <button type="button" onClick={() => {
                        const newRows = progressRows.filter((_, i) => i !== idx);
                        setProgressRows(newRows);
                      }} className="text-red-600 hover:text-red-800 p-1" title="Remove this entry">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pay Item Logs Section - Mobile Responsive Cards */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pay Item Logs</h2>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Today</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2 text-sm text-gray-900">{item.item}</td>
                      <td className="px-2 py-2 text-sm text-gray-900">{item.uom}</td>
                      <td className="px-1 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={item.from} onChange={e => {
                          const newItems = [...payItems];
                          newItems[idx].from = e.target.value;
                          setPayItems(newItems);
                        }} />
                      </td>
                      <td className="px-1 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={item.to} onChange={e => {
                          const newItems = [...payItems];
                          newItems[idx].to = e.target.value;
                          setPayItems(newItems);
                        }} />
                      </td>
                      <td className="px-1 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={item.qty} onChange={e => {
                          const newItems = [...payItems];
                          newItems[idx].qty = e.target.value;
                          setPayItems(newItems);
                        }} />
                      </td>
                      <td className="px-2 py-2">
                        <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm min-h-[2.5rem] resize-y" rows={2} value={item.comments} onChange={e => {
                          const newItems = [...payItems];
                          newItems[idx].comments = e.target.value;
                          setPayItems(newItems);
                        }} />
                      </td>
                      <td className="px-1 py-2 flex gap-1">
                        <button type="button" onClick={() => {
                          const newItems = [...payItems];
                          newItems.splice(idx + 1, 0, { ...item, from: '', to: '', qty: '', comments: '' });
                          setPayItems(newItems);
                        }} className="text-green-600 hover:text-green-800 p-1" title="Add another entry for this pay item">
                          <PlusIcon className="h-4 w-4" />
                        </button>
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

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {payItems.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                    <div className="text-sm text-gray-900 font-medium">{item.item}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={item.from} onChange={e => {
                        const newItems = [...payItems];
                        newItems[idx].from = e.target.value;
                        setPayItems(newItems);
                      }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={item.to} onChange={e => {
                        const newItems = [...payItems];
                        newItems[idx].to = e.target.value;
                        setPayItems(newItems);
                      }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Qty Today</label>
                      <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={item.qty} onChange={e => {
                        const newItems = [...payItems];
                        newItems[idx].qty = e.target.value;
                        setPayItems(newItems);
                      }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">UOM</label>
                      <div className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded border">{item.uom}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Comments</label>
                    <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm min-h-[2.5rem] resize-y" rows={2} value={item.comments} onChange={e => {
                      const newItems = [...payItems];
                      newItems[idx].comments = e.target.value;
                      setPayItems(newItems);
                    }} />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => {
                      const newItems = [...payItems];
                      newItems.splice(idx + 1, 0, { ...item, from: '', to: '', qty: '', comments: '' });
                      setPayItems(newItems);
                    }} className="text-green-600 hover:text-green-800 p-1" title="Add another entry for this pay item">
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    {payItems.filter((i) => i.item === item.item).length > 1 && (
                      <button type="button" onClick={() => {
                        const newItems = payItems.filter((_, i) => i !== idx);
                        setPayItems(newItems);
                      }} className="text-red-600 hover:text-red-800 p-1" title="Remove this entry">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Section - Dropdown List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Equipment</h2>
            {equipment.map((item, idx) => (
              <div key={idx} className="flex flex-row gap-2 mb-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  {item.isCustom && item.isCustomComplete ? (
                    <div className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50">
                      {item.customType}
                    </div>
                  ) : (
                    <>
                      <select
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        value={item.type}
                        onChange={e => {
                          const newList = [...equipment];
                          newList[idx].type = e.target.value;
                          newList[idx].isCustom = e.target.value === 'CUSTOM';
                          if (e.target.value !== 'CUSTOM') {
                            newList[idx].customType = '';
                          }
                          setEquipment(newList);
                        }}
                      >
                        <option value="">Select equipment</option>
                        {equipmentOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="CUSTOM">Custom...</option>
                      </select>
                      {item.isCustom && (
                        <div className="mt-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Custom Equipment</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={item.customType}
                            onChange={e => {
                              const newList = [...equipment];
                              newList[idx].customType = e.target.value;
                              setEquipment(newList);
                            }}
                            onBlur={e => {
                              if (e.target.value.trim() !== '') {
                                const newList = [...equipment];
                                newList[idx].isCustomComplete = true;
                                setEquipment(newList);
                              }
                            }}
                            onKeyPress={e => {
                              if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                const newList = [...equipment];
                                newList[idx].isCustomComplete = true;
                                setEquipment(newList);
                              }
                            }}
                            placeholder="Enter custom equipment name"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={item.qty}
                    onChange={e => {
                      const newList = [...equipment];
                      newList[idx].qty = e.target.value;
                      setEquipment(newList);
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 px-2"
                  onClick={() => setEquipment(equipment.filter((_, i) => i !== idx))}
                  disabled={equipment.length === 1}
                  title="Remove"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
              onClick={() => setEquipment([...equipment, { type: '', qty: '', isCustom: false, customType: '', isCustomComplete: false }])}
            >
              + Add Equipment
            </button>
          </div>

          {/* Trucking Section - Dropdown List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Trucking</h2>
            {trucking.map((item, idx) => (
              <div key={idx} className="flex flex-row gap-2 mb-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  {item.isCustom && item.isCustomComplete ? (
                    <div className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50">
                      {item.customType}
                    </div>
                  ) : (
                    <>
                      <select
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        value={item.type}
                        onChange={e => {
                          const newList = [...trucking];
                          newList[idx].type = e.target.value;
                          newList[idx].isCustom = e.target.value === 'CUSTOM';
                          if (e.target.value !== 'CUSTOM') {
                            newList[idx].customType = '';
                          }
                          setTrucking(newList);
                        }}
                      >
                        <option value="">Select trucking</option>
                        {truckingOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="CUSTOM">Custom...</option>
                      </select>
                      {item.isCustom && (
                        <div className="mt-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Custom Trucking</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={item.customType}
                            onChange={e => {
                              const newList = [...trucking];
                              newList[idx].customType = e.target.value;
                              setTrucking(newList);
                            }}
                            onBlur={e => {
                              if (e.target.value.trim() !== '') {
                                const newList = [...trucking];
                                newList[idx].isCustomComplete = true;
                                setTrucking(newList);
                              }
                            }}
                            onKeyPress={e => {
                              if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                const newList = [...trucking];
                                newList[idx].isCustomComplete = true;
                                setTrucking(newList);
                              }
                            }}
                            placeholder="Enter custom trucking name"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={item.qty}
                    onChange={e => {
                      const newList = [...trucking];
                      newList[idx].qty = e.target.value;
                      setTrucking(newList);
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 px-2"
                  onClick={() => setTrucking(trucking.filter((_, i) => i !== idx))}
                  disabled={trucking.length === 1}
                  title="Remove"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
              onClick={() => setTrucking([...trucking, { type: '', qty: '', isCustom: false, customType: '', isCustomComplete: false }])}
            >
              + Add Trucking
            </button>
          </div>

          {/* Crews Section - Dropdown List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Crews</h2>
            {crews.map((item, idx) => (
              <div key={idx} className="flex flex-row gap-2 mb-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  {item.isCustom && item.isCustomComplete ? (
                    <div className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50">
                      {item.customType}
                    </div>
                  ) : (
                    <>
                      <select
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        value={item.type}
                        onChange={e => {
                          const newList = [...crews];
                          newList[idx].type = e.target.value;
                          newList[idx].isCustom = e.target.value === 'CUSTOM';
                          if (e.target.value !== 'CUSTOM') {
                            newList[idx].customType = '';
                          }
                          setCrews(newList);
                        }}
                      >
                        <option value="">Select crew</option>
                        {crewOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="CUSTOM">Custom...</option>
                      </select>
                      {item.isCustom && (
                        <div className="mt-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Custom Crew</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                            value={item.customType}
                            onChange={e => {
                              const newList = [...crews];
                              newList[idx].customType = e.target.value;
                              setCrews(newList);
                            }}
                            onBlur={e => {
                              if (e.target.value.trim() !== '') {
                                const newList = [...crews];
                                newList[idx].isCustomComplete = true;
                                setCrews(newList);
                              }
                            }}
                            onKeyPress={e => {
                              if (e.key === 'Enter' && e.target.value.trim() !== '') {
                                const newList = [...crews];
                                newList[idx].isCustomComplete = true;
                                setCrews(newList);
                              }
                            }}
                            placeholder="Enter custom crew name"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={item.qty}
                    onChange={e => {
                      const newList = [...crews];
                      newList[idx].qty = e.target.value;
                      setCrews(newList);
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="text-red-600 hover:text-red-800 px-2"
                  onClick={() => setCrews(crews.filter((_, i) => i !== idx))}
                  disabled={crews.length === 1}
                  title="Remove"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
              onClick={() => setCrews([...crews, { type: '', qty: '', isCustom: false, customType: '', isCustomComplete: false }])}
            >
              + Add Crew
            </button>
          </div>

          {/* Remarks Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Remarks</h2>
            <textarea className="w-full border border-gray-300 rounded px-2 py-1 text-sm min-h-[2.5rem] resize-y" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Enter any remarks or notes..." />
          </div>

          {/* Photos Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Photos</h2>
            <ReportPhotoSection
              photos={photos}
              onPhotosChange={setPhotos}
              editable={true}
              content_type="daily_utility_2"
              object_id={reportId && !String(reportId).startsWith('temp_') ? reportId : null}
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
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/leads/review/${reportId}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => navigate(`/leads/review/${reportId}`)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Exit
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
        <BaseSnackbar
          snackbar={snackbar}
          onClose={() => setSnackbar({ show: false, message: '', severity: 'success' })}
        />
      </div>
    </div>
  );
};

export default LeadEditUtilityDaily2; 