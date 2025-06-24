import React, { useState } from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import SignaturePad from 'react-signature-canvas';
import ReportPhotoSection from '../../../common/ReportPhotoSection';

const SWPPPReportForm = ({ config, initialData, onSave, onReview, onDelete }) => {

  const [header, setHeader] = useState(initialData?.header || {});
  const [sections, setSections] = useState(initialData?.sections || {});
  const [preparedBy, setPreparedBy] = useState(initialData?.preparedBy || '');
  const [signature, setSignature] = useState(initialData?.signature || '');
  const [sigDate, setSigDate] = useState(initialData?.sigDate || null);
  const sigPadRef = React.useRef(null);
  const sigPadContainerRef = React.useRef(null);


  const handleHeaderChange = (e) => setHeader({ ...header, [e.target.name]: e.target.value });

  const renderField = (field, value, onChange) => {
    // Simplified field renderer for this form
    const commonProps = {
      name: field.name,
      value: value || '',
      onChange: onChange,
      className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    };
    switch (field.type) {
      case 'dropdown':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {(field.options || []).map(option => (
              <option key={option.value || option} value={option.value || option}>{option.label || option}</option>
            ))}
          </select>
        );
      case 'multiline': return <textarea {...commonProps} rows={4} />;
      default: return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Inspection Information */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Inspection Information</h2>
        <div className="flex flex-wrap -mx-2">
          {config.headerFields.filter(f => ['inspection_type', 'inspection_date'].includes(f.name)).map(field => (
            <div key={field.name} className="w-full md:w-1/2 px-2 mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
              {renderField(field, header[field.name], handleHeaderChange)}
            </div>
          ))}
        </div>
      </div>

      {/* Project Information */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Project Information</h2>
        <div className="flex flex-wrap -mx-2">
          {config.headerFields.filter(f => ['project', 'spread', 'facility', 'contractor', 'inspector'].includes(f.name)).map(field => (
            <div key={field.name} className={`px-2 mb-4 ${field.className || 'w-full'}`}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{field.label}</label>
              {renderField(field, header[field.name], handleHeaderChange)}
            </div>
          ))}
        </div>
      </div>

      {/* More sections will be added here */}

    </div>
  );
};

export default SWPPPReportForm; 