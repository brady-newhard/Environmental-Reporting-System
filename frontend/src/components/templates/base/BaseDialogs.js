import React from 'react';

const BaseDialogs = ({ 
  deleteDialogOpen = false,
  exitDialogOpen = false,
  onDeleteConfirm,
  onExitConfirm,
  onCloseDeleteDialog,
  onCloseExitDialog
}) => {
  return (
    <>
      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="text-lg font-semibold mb-2">Delete Draft</div>
            <div className="mb-4">Are you sure you want to delete this draft? This action cannot be undone.</div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={onCloseDeleteDialog} 
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={onDeleteConfirm} 
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Dialog */}
      {exitDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="text-lg font-semibold mb-2">Exit Without Saving?</div>
            <div className="mb-4">Do you want to save your changes before exiting?</div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  onCloseExitDialog();
                  onExitConfirm(false);
                }} 
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Don't Save
              </button>
              <button 
                onClick={() => {
                  onCloseExitDialog();
                  onExitConfirm(true);
                }} 
                className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold"
              >
                Save & Exit
              </button>
              <button 
                onClick={onCloseExitDialog} 
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BaseDialogs; 