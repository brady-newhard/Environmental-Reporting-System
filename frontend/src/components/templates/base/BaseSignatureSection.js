import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';

const BaseSignatureSection = ({ 
  signature = '',
  sigDate = '',
  preparedBy = '',
  onSignatureChange,
  onSigDateChange,
  onPreparedByChange,
  onClearSignature,
  title = 'Signature Section',
  showPreparedBy = true,
  showDate = true
}) => {
  const sigPadRef = useRef(null);

  const handleClearSignature = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
    onClearSignature();
  };

  const handleSignatureEnd = () => {
    if (sigPadRef.current) {
      onSignatureChange(sigPadRef.current.toDataURL());
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prepared By Field */}
        {showPreparedBy && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Prepared By
            </label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => onPreparedByChange(e.target.value)}
              className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
            />
          </div>
        )}

        {/* Signature Date Field */}
        {showDate && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Date
            </label>
            <input
              type="date"
              value={sigDate ? new Date(sigDate).toISOString().split('T')[0] : ''}
              onChange={(e) => onSigDateChange(e.target.value)}
              className="w-full bg-white border border-gray-600 text-gray-900 font-semibold rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow"
            />
          </div>
        )}
      </div>

      {/* Signature Pad */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Signature
        </label>
        <div className="mt-1 border border-gray-300 rounded-md">
          <SignaturePad
            ref={sigPadRef}
            canvasProps={{ className: 'w-full h-48 rounded-md' }}
            onEnd={handleSignatureEnd}
          />
        </div>
        <button
          type="button"
          onClick={handleClearSignature}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Clear Signature
        </button>
      </div>
    </div>
  );
};

export default BaseSignatureSection; 