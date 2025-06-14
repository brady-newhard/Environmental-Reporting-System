import React, { useRef, useState } from 'react';
import { PlusIcon, TrashIcon, CameraIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatPhotoUrl } from '../../utils/photoUtils';

const ReportPhotoSection = ({ photos = [], onPhotosChange, editable = true, content_type, object_id }) => {
  const fileInputRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editFields, setEditFields] = useState({ location: '', description: '' });

  // Handle file input change
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setLoading(true);
    try {
      const { uploadMultiplePhotos } = await import('../../utils/photoUtils');
      const uploadedPhotos = await uploadMultiplePhotos(files, {
        content_type,
        object_id,
      });
      // Immediately set editing for the first new photo
      onPhotosChange([...photos, ...uploadedPhotos]);
      setEditingIdx(photos.length); // index of first new photo
      setEditFields({ location: '', description: '' });
    } catch (error) {
      setAlert('Error uploading photos');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Remove photo
  const handleRemove = async (idx) => {
    try {
      const { deletePhoto } = await import('../../utils/photoUtils');
      await deletePhoto(photos[idx].id);
      onPhotosChange(photos.filter((_, i) => i !== idx));
    } catch {
      setAlert('Error deleting photo');
    }
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
      description: photos[idx].description || '',
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
    try {
      const { default: axios } = await import('../../utils/axios');
      await axios.patch(`/api/photos/photos/${photo.id}/`, editFields);
    } catch {
      setAlert('Error saving photo details');
    }
  };

  return (
    <div className="mb-8">
      {/* <h2 className="text-lg font-bold text-gray-800 mb-2">Photos</h2> */}
      {alert && (
        <div className="mb-2 text-red-600 bg-red-100 rounded p-2">{alert}</div>
      )}
      {loading && <div className="text-sm text-gray-500 mb-2">Uploading...</div>}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {photos.map((photo, idx) => (
          <div key={photo.id || idx} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow flex flex-col">
            <img
              src={formatPhotoUrl(photo.image_url || photo.file || photo.image)}
              alt={`Photo ${idx + 1}`}
              className="w-full h-32 object-contain bg-gray-100 cursor-pointer"
              onClick={() => handleThumbnailClick(photo)}
            />
            <div className="p-2 flex-1 flex flex-col justify-between">
              {editingIdx === idx ? (
                <form
                  className="space-y-1"
                  onSubmit={e => { e.preventDefault(); saveEdit(idx); }}
                >
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-1 focus:ring-2 focus:ring-yellow-400"
                    placeholder="Location"
                    value={editFields.location}
                    onChange={e => handleEditChange('location', e.target.value)}
                    autoFocus
                  />
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-1 focus:ring-2 focus:ring-yellow-400"
                    placeholder="Description"
                    value={editFields.description}
                    onChange={e => handleEditChange('description', e.target.value)}
                  />
                  <div className="flex gap-2 mt-1">
                    <button type="submit" className="text-xs bg-green-500 text-white rounded px-2 py-1" disabled={!editFields.location && !editFields.description}>Save</button>
                    <button type="button" className="text-xs bg-gray-200 text-gray-700 rounded px-2 py-1" onClick={cancelEdit}>Cancel</button>
                  </div>
                </form>
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
        ))}
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
              src={formatPhotoUrl(modalPhoto.image_url || modalPhoto.file || modalPhoto.image)}
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
    </div>
  );
};

export default ReportPhotoSection; 