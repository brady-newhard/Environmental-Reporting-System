import React, { useEffect } from 'react';

const BaseSnackbar = ({ 
  snackbar = { show: false, message: '', severity: 'success' },
  onClose,
  autoHideDuration = 3000
}) => {
  // Auto-hide snackbar after specified duration
  useEffect(() => {
    if (snackbar.show) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [snackbar.show, autoHideDuration, onClose]);

  if (!snackbar.show) return null;

  const getSeverityClasses = (severity) => {
    switch (severity) {
      case 'success':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-green-600';
    }
  };

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl text-white text-center transition-all duration-300 min-w-64 max-w-md ${getSeverityClasses(snackbar.severity)}`}>
      <div className="flex items-center justify-between">
        <span className="flex-1">{snackbar.message}</span>
        <button
          onClick={onClose}
          className="ml-3 text-white hover:text-gray-200 text-lg font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default BaseSnackbar; 