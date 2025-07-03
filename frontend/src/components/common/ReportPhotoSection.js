import React, { useRef, useState } from 'react';
import { PlusIcon, TrashIcon, CameraIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatPhotoUrl } from '../../utils/photoUtils';

const ReportPhotoSection = ({ photos = [], onPhotosChange, editable = true, content_type, object_id, onNotification }) => {
  const fileInputRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editFields, setEditFields] = useState({ location: '', description: '' });
  const [deleteIdx, setDeleteIdx] = useState(null); // Track which photo is pending deletion

  // Debug: log photos prop on render
  React.useEffect(() => {
    console.log('ReportPhotoSection - photos prop:', photos);
  }, [photos]);

  // Handle file input change
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setLoading(true);
    try {
      // Check if we have a valid object_id for uploading
      if (!object_id || String(object_id).startsWith('temp_')) {
        // If no valid object_id, store photos locally until draft is saved
        const localPhotos = files.map(file => ({
          id: `temp_${Date.now()}_${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          location: '',
          description: '',
          isLocal: true
        }));
        onPhotosChange([...photos, ...localPhotos]);
        setEditingIdx(photos.length); // index of first new photo
        setEditFields({ location: '', description: '' });
        if (onNotification) {
          onNotification('Photos added locally. They will be uploaded when you save the draft.', 'success');
        }
      } else {
        // Upload photos to server
        const { uploadMultiplePhotos } = await import('../../utils/photoUtils');
        const uploadedPhotos = await uploadMultiplePhotos(files, {
          content_type,
          object_id,
        });
        // Immediately set editing for the first new photo
        onPhotosChange([...photos, ...uploadedPhotos]);
        setEditingIdx(photos.length); // index of first new photo
        setEditFields({ location: '', description: '' });
        if (onNotification) {
          onNotification('Photos uploaded successfully', 'success');
        }
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      if (onNotification) {
        onNotification('Error uploading photos: ' + (error.message || 'Unknown error'), 'error');
      }
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Remove photo
  const handleRemove = async (idx) => {
    setDeleteIdx(idx);
    setShowModal(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    const idx = deleteIdx;
    setShowModal(false);
    setDeleteIdx(null);
    const photo = photos[idx];
    try {
      // Check if this is a local photo (has file property or temp ID)
      const isLocalPhoto = !photo || !photo.id || photo.id.toString().startsWith('temp_') || photo.file;
      
      if (isLocalPhoto) {
        // Just remove from local state
        onPhotosChange(photos.filter((_, i) => i !== idx));
        if (onNotification) {
          onNotification('Photo removed from local state', 'success');
        }
        return;
      }
      
      // Server photo - try to delete from server
      const { deletePhoto } = await import('../../utils/photoUtils');
      await deletePhoto(photo.id);
      onPhotosChange(photos.filter((_, i) => i !== idx));
      if (onNotification) {
        onNotification('Photo deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      if (onNotification) {
        onNotification('Error deleting photo: ' + (error.message || 'Unknown error'), 'error');
      }
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowModal(false);
    setDeleteIdx(null);
  };

  // Open modal
  const handleThumbnailClick = (photo) => {
    setModalPhoto(photo);
    setShowModal(true);
  };
  const handleModalClose = () => setShowModal(false);

  // Drag and drop for add box
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files } });
    }
  };
  const handleDragOver = (e) => e.preventDefault();

  // Inline edit logic
  const startEdit = (idx) => {
    setEditingIdx(idx);
    setEditFields({
      location: photos[idx].location || '',
      description: photos[idx].description || photos[idx].comment || photos[idx].comments || '',
    });
  };
  const cancelEdit = () => {
    setEditingIdx(null);
    setEditFields({ location: '', description: '' });
  };
  const handleEditChange = (field, value) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };
  const saveEdit = async (idx) => {
    const photo = photos[idx];
    // Only save if at least one field is non-empty
    if (!editFields.location && !editFields.description) return;
    const updated = photos.map((p, i) => i === idx ? { ...p, ...editFields } : p);
    onPhotosChange(updated);
    setEditingIdx(null);
    setEditFields({ location: '', description: '' });
    
    // Check if this is a local photo (has file property or temp ID)
    const isLocalPhoto = !photo || !photo.id || photo.id.toString().startsWith('temp_') || photo.file;
    
    if (isLocalPhoto) {
      // Local photo - just update local state (already done above)
      if (onNotification) {
        onNotification('Photo details updated locally', 'success');
      }
      return;
    }
    
    // Server photo - try to update on server
    try {
      const { default: axios } = await import('../../utils/axios');
      await axios.patch(`/api/photos/photos/${photo.id}/`, editFields);
      if (onNotification) {
        onNotification('Photo details updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating photo details:', error);
      if (onNotification) {
        onNotification('Error updating photo details', 'error');
      }
    }
  };

  return (
    <div className="mb-8">
      {/* <h2 className="text-lg font-bold text-gray-800 mb-2">Photos</h2> */}
      {loading && <div className="text-sm text-gray-500 mb-2">Uploading...</div>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {photos.map((photo, idx) => {
          // Safely extract the image URL from various possible properties
          // For uploaded photos, use image_url or url
          // For local photos, use preview (blob URL) or create object URL from file
          let possibleImageUrl;
          if (photo.image_url || photo.url) {
            // Uploaded photo with server URL
            possibleImageUrl = photo.image_url || photo.url;
          } else if (photo.preview) {
            // Local photo with blob preview URL
            possibleImageUrl = photo.preview;
          } else if (photo.file && photo.file instanceof File) {
            // Local photo with File object - create object URL
            possibleImageUrl = URL.createObjectURL(photo.file);
          } else {
            // Fallback to any other URL property
            possibleImageUrl = photo.file || photo.image;
          }
          
          const imageSrc = formatPhotoUrl(possibleImageUrl);
          // Debug: log computed image source
          console.log(`ReportPhotoSection - photo[${idx}]`, photo);
          console.log(`ReportPhotoSection - possibleImageUrl[${idx}]`, possibleImageUrl);
          console.log(`ReportPhotoSection - imageSrc[${idx}]`, imageSrc);
          
          return (
            <div key={photo.id || idx} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow flex flex-col">
              <img
                src={imageSrc}
                alt={`Photo ${idx + 1}`}
                className="w-full h-32 object-contain bg-gray-100 cursor-pointer"
                onClick={() => handleThumbnailClick(photo)}
              />
              <div className="p-2 flex-1 flex flex-col justify-between">
                {editingIdx === idx ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-1 focus:ring-2 focus:ring-yellow-400"
                      placeholder="Location"
                      value={editFields.location}
                      onChange={e => handleEditChange('location', e.target.value)}
                      autoFocus
                    />
                    <textarea
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-1 focus:ring-2 focus:ring-yellow-400"
                      placeholder="Description"
                      value={editFields.description}
                      onChange={e => handleEditChange('description', e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        className="text-xs bg-green-500 text-white rounded px-2 py-1"
                        disabled={!editFields.location && !editFields.description}
                        onClick={() => saveEdit(idx)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="text-xs bg-gray-200 text-gray-700 rounded px-2 py-1"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-gray-700 truncate cursor-pointer flex items-center gap-1" onClick={() => editable && startEdit(idx)}>
                      {photo.location ? photo.location : <span className="italic text-gray-400">No location</span>}
                      {editable && <PencilIcon className="w-3 h-3 text-gray-400" />}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate cursor-pointer flex items-center gap-1" onClick={() => editable && startEdit(idx)}>
                      {photo.description ? photo.description : <span className="italic text-gray-300">No description</span>}
                      {editable && <PencilIcon className="w-3 h-3 text-gray-300" />}
                    </div>
                  </>
                )}
              </div>
              {editable && (
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100"
                  onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                  title="Delete photo"
                >
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </button>
              )}
            </div>
          );
        })}
        {editable && (
          <div
            className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg shadow cursor-pointer hover:bg-gray-100 h-32 w-full min-w-0 relative"
            onClick={() => fileInputRef.current.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            tabIndex={0}
            title="Add photo"
          >
            <PlusIcon className="w-8 h-8 text-gray-400 mb-1" />
            <span className="text-xs text-gray-500 font-semibold">Add Photo</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
      {/* Modal for full-size preview */}
      {showModal && modalPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={handleModalClose}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <img
              src={(() => {
                // Use the same logic as the main photo display
                if (modalPhoto.image_url || modalPhoto.url) {
                  return formatPhotoUrl(modalPhoto.image_url || modalPhoto.url);
                } else if (modalPhoto.preview) {
                  return modalPhoto.preview;
                } else if (modalPhoto.file && modalPhoto.file instanceof File) {
                  return URL.createObjectURL(modalPhoto.file);
                } else {
                  return formatPhotoUrl(modalPhoto.file || modalPhoto.image);
                }
              })()}
              alt="Full size"
              className="w-full h-auto max-h-[60vh] object-contain bg-gray-100"
            />
            <div className="mt-2">
              <div className="text-sm font-semibold text-gray-700">Location: <span className="font-normal">{modalPhoto.location || <span className="italic text-gray-400">No location</span>}</span></div>
              <div className="text-sm text-gray-500 mt-1">{modalPhoto.description || <span className="italic text-gray-300">No description</span>}</div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="text-lg font-semibold mb-2">Delete Photo</div>
            <div className="mb-4">Are you sure you want to delete this photo? This action cannot be undone.</div>
            <div className="flex justify-end gap-2">
              <button onClick={cancelDelete} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPhotoSection; 