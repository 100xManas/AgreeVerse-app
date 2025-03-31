import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Home, Sprout, LogOut, Plus, X } from 'lucide-react';
import CropCard from '../components/CropCard';
import { AuthContext } from '../useContext/AuthContext';

function FarmerDashboard() {
  const [crops, setCrops] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageURL: '',
    tag: 'vegetable',
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext);

  // Fetch crops from backend
  useEffect(() => {
    const fetchCropByFarmer = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/farmer/preview-crops', { withCredentials: true });
        setCrops(response.data.crops);
      } catch (error) {
        console.error('Error fetching crops:', error);
        alert('Failed to fetch crops');
      }
    };

    fetchCropByFarmer();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (selectedCrop) {
      setFormData({
        title: selectedCrop.title || '',
        description: selectedCrop.description || '',
        imageURL: selectedCrop.imageURL || '',
        tag: selectedCrop.tag || 'vegetable',
        price: selectedCrop.price || 0
      });
    } else {
      // Reset form when adding new
      setFormData({
        title: '',
        description: '',
        imageURL: '',
        tag: 'vegetable',
        price: 0
      });
    }
  }, [selectedCrop]);

  const handleEdit = (crop) => {
    setSelectedCrop(crop);
    setIsModalOpen(true);
  };

  const handleDelete = async (cropId) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/v1/farmer/delete-crop/${cropId}`, { withCredentials: true });
      if (response.data.success) {
        setCrops(crops.filter(c => c._id !== cropId));
        alert('Crop deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting crop:', error);
      alert('Failed to delete crop');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form data
    if (!formData.imageURL) {
      setError('Please provide an image URL');
      setLoading(false);
      return;
    }

    try {
      const cropData = {
        title: formData.title,
        description: formData.description,
        imageURL: formData.imageURL,
        tag: formData.tag,
        price: formData.price
      };

      // Note: backend adds farmerId automatically from the auth middleware

      if (selectedCrop) {
        // Update existing crop
        const response = await axios.put(
          `http://localhost:8080/api/v1/farmer/update-crop/${selectedCrop._id}`,
          cropData,
          { withCredentials: true }
        );

        if (response.data.success) {
          alert('Crop updated successfully');
          setIsModalOpen(false);
          setSelectedCrop(null);

          // Refresh crops list
          const updateResponse = await axios.get('http://localhost:8080/api/v1/farmer/preview-crops', { withCredentials: true });
          setCrops(updateResponse.data.crops);
        }
      } else {
        // Create new crop
        const response = await axios.post(
          'http://localhost:8080/api/v1/farmer/add-crop',
          cropData,
          { withCredentials: true }
        );

        if (response.data.success) {
          alert('Crop added successfully');
          setIsModalOpen(false);

          // Refresh crops list
          const updateResponse = await axios.get('http://localhost:8080/api/v1/farmer/preview-crops', { withCredentials: true });
          setCrops(updateResponse.data.crops);
        } else {
          setError(response.data.message || 'Failed to add crop');
        }
      }
    } catch (error) {
      console.error('Error saving crop:', error);
      setError(error.response?.data?.message || 'Failed to save crop');
      alert(error.response?.data?.message || 'Failed to save crop');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCrop(null);
    setError('');
  };

  return (
    <div className="flex h-screen bg-[#181a20]">
      <aside className="w-64 bg-[#1e2329] text-white p-5 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
          <nav className="mt-5">
            <ul className="space-y-4">
              <li className="hover:text-orange-400 transition w-fit py-2 px-4 rounded cursor-pointer flex items-center gap-2">
                <Home size={20} /> Home
              </li>
              <li className="bg-zinc-700 p-2 rounded cursor-pointer flex items-center gap-2">
                <Sprout size={20} /> Crops
              </li>
            </ul>
          </nav>
        </div>
        <button className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-[#1e2329] shadow-md p-4 flex justify-between items-center">
          <div className='flex gap-3 items-center'>
            <div className='h-16 w-16 overflow-hidden rounded-md'>
              <img src={user.googleProfilePicture} alt="profile picture" srcSet="" className='w-full h-full object-cover' />
            </div>
            <div>
              <h2 className="text-xl text-white font-semibold">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-gray-100 font-semibold">Role: {user.role}</p>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus size={20} /> Add New Crop
          </button>
        </header>

        <main className="p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {crops.map((crop) => (
              <CropCard key={crop._id} crop={crop} onEdit={() => handleEdit(crop)} onDelete={() => handleDelete(crop._id)} />
            ))}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e2329] text-white rounded-lg p-5 w-full max-w-xl mx-2 md:mx-0 max-h-[90vh] overflow-y-auto scrollbar-">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#1e2329] py-2">
              <h2 className="text-xl font-bold">
                {selectedCrop ? 'Edit Crop' : 'Add New Crop'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-[#292d35] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-[#292d35] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Image URL</label>
                  <input
                    type="url"
                    name="imageURL"
                    value={formData.imageURL}
                    onChange={handleChange}
                    className="w-full bg-[#292d35] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                    required
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {formData.imageURL && (
                  <div className="mt-2">
                    <p className="text-gray-300 text-xs mb-1">Preview:</p>
                    <img
                      src={formData.imageURL}
                      alt="Preview"
                      className="max-h-48 object-contain rounded border border-gray-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                        setError('Invalid image URL. Please provide a valid URL.');
                      }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Category</label>
                    <select
                      name="tag"
                      value={formData.tag}
                      onChange={handleChange}
                      className="w-full bg-[#292d35] cursor-pointer border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      required
                    >
                      <option value="vegetable">Vegetable</option>
                      <option value="fruit">Fruit</option>
                      <option value="grain">Grain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full bg-[#292d35] border border-gray-700 rounded px-3 py-2 text-sm text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 bg-[#1e2329] py-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 font-semibold bg-gray-700 cursor-pointer hover:bg-gray-600 rounded text-sm w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold cursor-pointer bg-green-600 hover:bg-green-700 rounded flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : selectedCrop ? 'Update Crop' : 'Add Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerDashboard;