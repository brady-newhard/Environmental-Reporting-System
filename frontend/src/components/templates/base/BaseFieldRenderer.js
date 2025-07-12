import React, { useState, useRef, useEffect } from 'react';
import { formatPhotoUrl } from '../../../utils/photoUtils';
import ReportPhotoSection from '../../common/ReportPhotoSection';

const BaseFieldRenderer = ({ field, value, onChange, config = {}, draftId = null }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = () => setDropdownOpen(prev => !prev);

  const handleOptionChange = (option) => {
    const newValue = value.includes(option)
      ? value.filter(item => item !== option)
      : [...value, option];
    onChange({ target: { name: field.name, value: newValue } });
  };

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          name={field.name}
          value={value || ''}
          onChange={onChange}
          placeholder={field.placeholder || field.label}
          required={field.required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      );

    case 'number':
      return (
        <input
          type="number"
          name={field.name}
          value={value || ''}
          onChange={onChange}
          placeholder={field.placeholder || field.label}
          required={field.required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      );

    case 'date':
      return (
        <input
          type="date"
          name={field.name}
          value={value ? new Date(value).toISOString().split('T')[0] : ''}
          onChange={onChange}
          required={field.required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      );

    case 'multiline':
      return (
        <textarea
          name={field.name}
          value={value || ''}
          onChange={onChange}
          rows={field.rows || 4}
          placeholder={field.placeholder || field.label}
          required={field.required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
        />
      );

    case 'dropdown':
      return (
        <select
          name={field.name}
          value={value || ''}
          onChange={onChange}
          required={field.required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{field.label}</option>
          {field.options?.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case 'multiselect':
      return (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={handleDropdownToggle}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-left bg-white"
          >
            {value.length > 0 ? value.join(', ') : field.label}
          </button>
          {dropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {field.options?.map(option => (
                <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={() => handleOptionChange(option)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
        </div>
      );

    case 'photoArray':
      return (
        <ReportPhotoSection
          photos={value || []}
          onPhotosChange={(newPhotos) => onChange({ target: { name: field.name, value: newPhotos } })}
          editable={true}
          content_type={config.reportType || 'template'}
          object_id={draftId && !String(draftId).startsWith('temp_') ? draftId : null}
        />
      );

    case 'array':
      return (
        <div className="space-y-2">
          {(value || []).map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item || ''}
                onChange={(e) => {
                  const newValue = [...(value || [])];
                  newValue[index] = e.target.value;
                  onChange({ target: { name: field.name, value: newValue } });
                }}
                placeholder={`${field.label} ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  const newValue = [...(value || [])];
                  newValue.splice(index, 1);
                  onChange({ target: { name: field.name, value: newValue } });
                }}
                className="px-3 py-2 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newValue = [...(value || []), ''];
              onChange({ target: { name: field.name, value: newValue } });
            }}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add {field.label}
          </button>
        </div>
      );

    default:
      return (
        <input
          type="text"
          name={field.name}
          value={value || ''}
          onChange={onChange}
          placeholder={field.placeholder || field.label}
          required={field.required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      );
  }
};

export default BaseFieldRenderer; 