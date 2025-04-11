import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Home, Sprout, LogOut, Plus, X, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CropCard from '../components/CropCard';
import { AuthContext } from '../useContext/AuthContext';

function FarmerDashboard() {
  const [crops, setCrops] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tag: 'vegetable',
    price: 0,
    imageURL: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  // Add a ref to track the error timeout
  const errorTimeoutRef = useRef(null);

  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate()

  // Auto-dismiss error messages after 5 seconds
  useEffect(() => {
    if (error) {
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Set new timeout to clear error after 5 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setError('');
      }, 5000);
    }

    // Cleanup function to clear timeout when component unmounts or error changes
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  // Fetch crops from backend
  useEffect(() => {
    const fetchCropByFarmer = async () => {
      try {
        const response = await axios.get('https://agreeverse-app.onrender.com/api/v1/farmer/preview-crops', { withCredentials: true });
        setCrops(response.data.crops);
      } catch (error) {
        console.error('Error fetching crops:', error);
        setError('Failed to fetch crops');
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
        tag: selectedCrop.tag || 'vegetable',
        price: selectedCrop.price || 0,
        imageURL: selectedCrop.imageURL || ''
      });
      setPreviewURL(selectedCrop.imageURL || '');
    } else {
      // Reset form when adding new
      setFormData({
        title: '',
        description: '',
        tag: 'vegetable',
        price: 0,
        imageURL: ''
      });
      setPreviewURL('');
      setSelectedFile(null);
    }
  }, [selectedCrop]);

  const handleEdit = (crop) => {
    setSelectedCrop(crop);
    setIsModalOpen(true);
  };

  const handleDelete = async (cropId) => {
    try {
      const response = await axios.delete(`https://agreeverse-app.onrender.com/api/v1/farmer/delete-crop/${cropId}`, { withCredentials: true });
      if (response.data.success) {
        setCrops(crops.filter(c => c._id !== cropId));
        alert('Crop deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting crop:', error);
      setError('Failed to delete crop');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) : value
    });
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      setIsConverting(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setIsConverting(false);
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        setIsConverting(false);
        reject(error);
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File is too large. Maximum size is 5MB.');
        return;
      }

      setSelectedFile(file);

      try {
        // Convert the file to base64
        const base64 = await convertToBase64(file);
        setFormData({
          ...formData,
          imageURL: base64
        });
        setPreviewURL(base64);
      } catch (error) {
        console.error('Error converting file to base64:', error);
        setError('Failed to process the image. Please try another file.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form data
    if (!formData.imageURL) {
      setError('Please upload an image');
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

      console.log(cropData);

      let response;
      if (selectedCrop) {
        // Update existing crop
        response = await axios.put(
          `https://agreeverse-app.onrender.com/api/v1/farmer/update-crop/${selectedCrop._id}`,
          cropData,
          { withCredentials: true }
        );
      } else {
        // Create new crop
        response = await axios.post(
          'https://agreeverse-app.onrender.com/api/v1/farmer/add-crop',
          cropData,
          { withCredentials: true }
        );
      }

      if (response.data.success) {
        alert(selectedCrop ? 'Crop updated successfully' : 'Crop added successfully');
        setIsModalOpen(false);
        setSelectedCrop(null);

        // Reset the form data
        setFormData({
          title: '',
          description: '',
          tag: 'vegetable',
          price: 0,
          imageURL: ''
        });
        setPreviewURL('');
        setSelectedFile(null);

        // Refresh crops list
        const updateResponse = await axios.get('https://agreeverse-app.onrender.com/api/v1/farmer/preview-crops', { withCredentials: true });
        setCrops(updateResponse.data.crops);
      } else {
        setError(response.data.message || 'Failed to save crop');
      }
    } catch (error) {
      console.error('Error saving crop:', error);
      setError(error.response?.data?.message || 'Failed to save crop');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCrop(null);
    setError('');
    setPreviewURL('');
    setSelectedFile(null);

    // Revoke object URL to prevent memory leaks
    if (previewURL && !previewURL.startsWith('data:') && !previewURL.startsWith('http')) {
      URL.revokeObjectURL(previewURL);
    }
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      alert("Logged out successfully")
      navigate("/"); 
    }
  };

  return (
    <div className="flex h-screen bg-[#181a20]">
      <aside className="w-64 bg-[#1e2329] text-white p-5 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
          <nav className="mt-5">
            <ul className="space-y-4">
              <li onClick={()=> {
                console.log("navigate");
                
                navigate('/user/home')
                }} className="hover:text-orange-400 hover:bg-zinc-700 transition py-2 px-4 rounded cursor-pointer flex items-center gap-2">
                <Home size={20} /> Home
              </li>
              <li className="bg-zinc-700 p-2 rounded cursor-pointer flex items-center gap-2">
                <Sprout size={20} /> Crops
              </li>
            </ul>
          </nav>
        </div>
        <button 
        onClick={handleLogout} 
        className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-[#1e2329] shadow-md p-4 flex justify-between items-center">
          <div className='flex gap-3 items-center'>
            <div className='h-16 w-16 overflow-hidden rounded-md'>
              <img src={user.googleProfilePicture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="profile picture" srcSet="" className='w-full h-full object-cover' />
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
          {crops.length > 0 ? (
            <div className="flex flex-wrap gap-8 mt-2">
              {crops.map((crop) => (
                <CropCard key={crop._id} crop={crop} onEdit={() => handleEdit(crop)} onDelete={() => handleDelete(crop._id)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-[#1e2329] rounded-lg p-4 mt-2 text-center">
              <Sprout size={48} className="text-gray-400 mb-4" />
              <h3 className="text-xl text-white font-semibold mb-2">No Crops Found</h3>
              <p className="text-gray-400 mb-6">You haven't added any crops yet. Get started by adding your first crop.</p>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e2329] text-white rounded-lg p-5 w-full max-w-xl mx-2 md:mx-0 max-h-[90vh] overflow-y-auto ">
            <div className="flex justify-between items-center bg-[#1e2329] py-2">
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
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-2 rounded mb-4 text-sm transition-opacity duration-300">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <button
                    onClick={() => setError('')}
                    className="text-red-100 hover:text-white ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-2">
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
                    className="w-full bg-[#292d35] border resize-none border-gray-700 rounded px-3 py-2 text-sm text-white"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Image Upload</label>
                  <div className="border border-dashed border-gray-600 rounded-lg p-4 relative">
                    {previewURL ? (
                      <div className="flex flex-col items-center">
                        <div className="relative w-full">
                          <img
                            src={previewURL}
                            alt="Preview"
                            className="max-h-40 object-contain mx-auto"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                              setError('Invalid image. Please try another file.');
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewURL('');
                              setFormData({ ...formData, imageURL: '' });
                              setSelectedFile(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <span className="text-xs text-gray-400 mt-2">
                          {selectedFile ? selectedFile.name : 'Current image'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <input
                          type="file"
                          id="cropImage"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="cropImage"
                          className="cursor-pointer bg-[#292d35] hover:bg-[#35393f] text-center w-full px-3 py-4 rounded-md flex flex-col items-center justify-center gap-2 transition"
                        >
                          <Upload size={24} className="text-gray-400" />
                          <span className="text-sm text-gray-300">Click to upload image</span>
                          <span className="text-xs text-gray-400">JPG, PNG, GIF (Max 5MB)</span>
                        </label>
                      </div>
                    )}
                    {isConverting && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <p className="text-sm text-white">Converting image...</p>
                      </div>
                    )}
                  </div>
                </div>

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

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 bg-[#1e2329] py-3">
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
                  disabled={loading || isConverting}
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