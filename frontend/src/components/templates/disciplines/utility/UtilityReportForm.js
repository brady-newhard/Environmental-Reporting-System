import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveDraft, normalizeDraft, loadDraft } from '../../../../utils/draftUtils';
import PageHeader from '../../../common/PageHeader';
import BaseActionButtons from '../../base/BaseActionButtons';
import BaseFieldRenderer from '../../base/BaseFieldRenderer';
import BaseSignatureSection from '../../base/BaseSignatureSection';
import BaseDialogs from '../../base/BaseDialogs';
import BaseSnackbar from '../../base/BaseSnackbar';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

// Default items for utility reports
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

const UtilityReportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState(id || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', severity: 'success' });

  // Form state
  const [header, setHeader] = useState({
    project: '',
    date: new Date().toISOString().split('T')[0],
    inspector: '',
    contractor: '',
    spread: '',
  });

  const [items, setItems] = useState(
    defaultItems.map(row => ({ 
      ...row, 
      startSta: '', 
      endSta: '', 
      dailyQty: '', 
      isCustom: false, 
      comments: '', 
      unitQty: '' 
    }))
  );

  const [comments, setComments] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [signature, setSignature] = useState('');
  const [sigDate, setSigDate] = useState('');

  // Load existing draft if editing
  useEffect(() => {
    const loadExistingDraft = async () => {
      if (id) {
        try {
          const loadedDraft = await loadDraft('utility', id);
          if (loadedDraft) {
            setHeader(loadedDraft.header || header);
            setItems(loadedDraft.items || items);
            setComments(loadedDraft.comments || comments);
            setPreparedBy(loadedDraft.preparedBy || preparedBy);
            setSignature(loadedDraft.signature || signature);
            setSigDate(loadedDraft.sigDate || sigDate);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          setSnackbar({
            show: true,
            message: 'Error loading draft: ' + error.message,
            severity: 'error'
          });
        }
      }
    };

    loadExistingDraft();
  }, [id]);

  // Handlers
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => 
      i === idx ? { ...item, [field]: value } : item
    ));
  };

  const handleAddItem = () => {
    const newItem = {
      item: items.length + 1,
      description: '',
      unit: '',
      startSta: '',
      endSta: '',
      dailyQty: '',
      isCustom: true,
      comments: '',
      unitQty: ''
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      
      const dataToSave = {
        header,
        items,
        comments,
        preparedBy,
        signature,
        sigDate,
        reportType: 'utility'
      };

      const savedDraft = await saveDraft('utility', dataToSave);
      
      setSnackbar({ show: true, message: 'Draft saved successfully', severity: 'success' });
      
      if (!draftId) {
        setDraftId(savedDraft.id);
        navigate(`/utility/reports/edit/${savedDraft.id}`, { replace: true });
      }
      
      return savedDraft;
    } catch (error) {
      console.error('Error saving report:', error);
      setSnackbar({ 
        show: true, 
        message: 'Error saving draft: ' + (error.message || 'Unknown error'), 
        severity: 'error' 
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Delete logic here
      setDeleteDialogOpen(false);
      navigate('/utility/reports');
    } catch (error) {
      console.error('Error deleting draft:', error);
      setSnackbar({
        show: true,
        message: 'Error deleting draft: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleReview = () => {
    navigate(`/utility/reports/review/${draftId}`, {
      state: { 
        header, 
        items, 
        comments, 
        preparedBy, 
        signature, 
        sigDate 
      }
    });
  };

  const handleExit = () => {
    setExitDialogOpen(true);
  };

  const handleExitConfirm = async (shouldSave) => {
    if (shouldSave) {
      await handleSave();
    }
    navigate('/utility/reports');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSave();
  };

  return (
    <div className="bg-black min-h-screen pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          title="Daily Utility Report"
          backPath="/utility/reports"
          backButtonStyle={{
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#333333'
            }
          }}
        />

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Project Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Project</label>
                <input
                  type="text"
                  name="project"
                  value={header.project}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={header.date}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Inspector</label>
                <input
                  type="text"
                  name="inspector"
                  value={header.inspector}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Contractor</label>
                <input
                  type="text"
                  name="contractor"
                  value={header.contractor}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Spread</label>
                <input
                  type="text"
                  name="spread"
                  value={header.spread}
                  onChange={handleHeaderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Work Items</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Station</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Station</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => handleItemChange(idx, 'item', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.startSta}
                          onChange={(e) => handleItemChange(idx, 'startSta', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.endSta}
                          onChange={(e) => handleItemChange(idx, 'endSta', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.dailyQty}
                          onChange={(e) => handleItemChange(idx, 'dailyQty', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.unitQty}
                          onChange={(e) => handleItemChange(idx, 'unitQty', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.comments}
                          onChange={(e) => handleItemChange(idx, 'comments', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
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

          {/* Comments Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Additional Comments</h2>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              placeholder="Enter any additional comments..."
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

        {/* Dialogs */}
        <BaseDialogs
          deleteDialogOpen={deleteDialogOpen}
          exitDialogOpen={exitDialogOpen}
          onDeleteConfirm={handleDeleteConfirm}
          onExitConfirm={handleExitConfirm}
          onCloseDeleteDialog={() => setDeleteDialogOpen(false)}
          onCloseExitDialog={() => setExitDialogOpen(false)}
        />

        {/* Snackbar */}
        <BaseSnackbar
          snackbar={snackbar}
          onClose={() => setSnackbar({ show: false, message: '', severity: 'success' })}
        />
      </div>
    </div>
  );
};

export default UtilityReportForm; 