import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { apiConnector } from '../../../../services/apiconnector';
import { locationEndPoints } from '../../../../services/api';

const AddLocation = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);

  const themeState = useSelector((state) => state.theme);
  const token = useSelector((state) => state.auth?.token);
  const darkMode = themeState?.darkMode || false;

  const validateCoordinates = (latitude, longitude) => {
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return 'Latitude and longitude must be numbers';
    if (latNum < -90 || latNum > 90) return 'Latitude must be between -90 and 90';
    if (lngNum < -180 || lngNum > 180) return 'Longitude must be between -180 and 180';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !lat.trim() || !lng.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    const coordError = validateCoordinates(lat, lng);
    if (coordError) {
      toast.error(coordError);
      return;
    }

    const location = {
      name: name.trim(),
      address: address.trim(),
      coordinates: {
        latitude: Number(lat),
        longitude: Number(lng),
      },
    };

    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = locationEndPoints?.ADD_LOCATION_API || (import.meta.env.VITE_BASE_URL + "/location/create");

      const res = await apiConnector("POST", url, location, headers);
      const saved = res?.data?.data || res?.data;
      toast.success("Location saved");
      onSave && onSave(saved);
    } catch (err) {
      console.error('Save location error', err);
      toast.error(err?.response?.data?.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl mx-4">
        <div className={`rounded-lg shadow-lg p-6 ${darkMode ? 'bg-[#111827] text-white' : 'bg-white text-[#111827]'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Add Location</h3>
            <button onClick={onClose} className="text-sm px-3 py-1 rounded hover:opacity-80">Close</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${darkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e5e7eb]'}`}
                placeholder="e.g., Main Gate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none ${darkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e5e7eb]'}`}
                placeholder="Full address or description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none ${darkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e5e7eb]'}`}
                  placeholder="e.g., 28.6139"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none ${darkMode ? 'bg-[#1f2937] border-[#374151]' : 'bg-white border-[#e5e7eb]'}`}
                  placeholder="e.g., 77.2090"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-blue-600 text-white">
                {loading ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLocation;
