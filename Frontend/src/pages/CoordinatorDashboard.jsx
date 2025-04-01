import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Sprout, Users, LogOut, Plus, X, Upload } from "lucide-react";
import { AuthContext } from "../useContext/AuthContext";
import axios from "axios";
import CropCard from "../components/CropCard";

const CoordinatorDashboard = () => {
  // State for modal management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState("");

  const { user } = useContext(AuthContext)

  // State specifically for crop form
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageURL: "",
    tag: "vegetable",
    price: ""
  });
  const [crops, setCrops] = useState([])



  useEffect(() => {
    async function fetchCrops(){
      const res = await axios.get(`http://localhost/api/v1/${user._id}/all-farmers`, {withCredentials:true})
      setCrops(res.data)
    }

    fetchCrops()
  }, [crops])

  // Modal control functions
  const openModal = (role) => {
    setModalRole(role);
    setIsModalOpen(true);

    // Reset form data when opening a new crop modal
    if (role === "Crop") {
      setFormData({
        title: "",
        description: "",
        imageURL: "",
        tag: "vegetable",
        price: ""
      });
      setPreviewURL("");
      setSelectedFile(null);
      setError("");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCrop(null);
    setError("");
  };

  // Form handling functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }

    setSelectedFile(file);
    setIsConverting(true);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewURL(reader.result);
      setFormData({
        ...formData,
        imageURL: reader.result
      });
      setIsConverting(false);
    };
    reader.onerror = () => {
      setError("Error reading file");
      setIsConverting(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setLoading(false);
      closeModal();
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#181a20]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e2329] text-white p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coordinator Dashboard</h2>
          <nav className="mt-5">
            <ul className="space-y-4">
              <li className="hover:text-orange-400 transition w-fit py-2 px-4 rounded cursor-pointer flex items-center gap-2">
                <Home size={20} /> <Link to="/coordinator/home">Home</Link>
              </li>
              <li className="bg-zinc-700 p-2 rounded cursor-pointer flex items-center gap-2">
                <Sprout size={20} /> <Link to="/coordinator/crops">Crops</Link>
              </li>
              <li className="hover:text-orange-400 transition w-fit py-2 px-4 rounded cursor-pointer flex items-center gap-2">
                <Users size={20} /> <Link to="/coordinator/farmers">Farmers</Link>
              </li>
            </ul>
          </nav>
        </div>
        <button className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-[#1e2329] shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-md overflow-hidden">
              <img src={user.googleProfilePicture} alt="Profile Picture" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl text-white font-semibold">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-white font-semibold">Role: {user.role}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => openModal("Farmer")} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <Plus size={20} /> Add Farmer
            </button>
            <button onClick={() => openModal("Crop")} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <Plus size={20} /> Add a Crop
            </button>
          </div>
        </header>

        <main className="p-6">
          {
            crops.length > 1 ? (
              crops.map((crop, index)=>(
                <CropCard />
              ))
            ) : (
              <p>No crop yet</p>
            )
          }
        </main>
      </div>

      {/* Simple Farmer Modal */}
      {isModalOpen && modalRole === "Farmer" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#1e2329] p-6 rounded-lg w-96 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add Farmer</h2>
              <button onClick={closeModal}><X size={20} /></button>
            </div>
            <input type="text" placeholder="Name" className="w-full p-2 mb-2 bg-gray-700 rounded" />
            <input type="email" placeholder="Email" className="w-full p-2 mb-2 bg-gray-700 rounded" />
            <input type="text" placeholder="Phone" className="w-full p-2 mb-2 bg-gray-700 rounded" />
            <button className="w-full py-2 rounded bg-blue-500 hover:bg-blue-600">Add Farmer</button>
          </div>
        </div>
      )}

      {/* Enhanced Crop Modal */}
      {isModalOpen && modalRole === "Crop" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e2329] text-white rounded-lg p-5 w-full max-w-xl mx-2 md:mx-0 max-h-[90vh] overflow-y-auto">
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
};

export default CoordinatorDashboard;