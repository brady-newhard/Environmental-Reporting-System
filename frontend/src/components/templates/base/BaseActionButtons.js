import React from 'react';
import { 
  ArrowLeftOnRectangleIcon,
  TrashIcon,
  CheckIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const BaseActionButtons = ({ 
  loading = false,
  draftId = null,
  onExit,
  onDelete,
  onReview,
  onSave,
  showReviewButton = true,
  showDeleteButton = true,
  showExitButton = true,
  showSaveButton = true,
  customButtons = []
}) => {
  const hasValidDraftId = draftId && !String(draftId).startsWith('temp_');

  return (
    <div className="flex flex-wrap gap-4 justify-end print:hidden action-buttons">
      {/* Exit Button */}
      {showExitButton && (
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      )}

      {/* Delete Button - Only show if we have a valid draft ID */}
      {showDeleteButton && hasValidDraftId && (
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <TrashIcon className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      )}

      {/* Review Button - Only show if we have a valid draft ID */}
      {showReviewButton && hasValidDraftId && (
        <button
          type="button"
          onClick={onReview}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
        >
          <CheckIcon className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Review</span>
        </button>
      )}

      {/* Custom Buttons */}
      {customButtons.map((button, index) => (
        <button
          key={index}
          type="button"
          onClick={button.onClick}
          disabled={button.disabled || loading}
          className={`inline-flex items-center px-4 py-2 rounded-md transition-colors ${button.className || 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {button.icon && <span className="mr-2">{button.icon}</span>}
          <span className="hidden sm:inline">{button.label}</span>
        </button>
      ))}

      {/* Save Button */}
      {showSaveButton && (
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PencilIcon className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">{loading ? 'Saving...' : 'Save'}</span>
        </button>
      )}
    </div>
  );
};

export default BaseActionButtons; 