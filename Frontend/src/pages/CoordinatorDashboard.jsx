import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Sprout, Users, LogOut, Plus, X } from "lucide-react";
import { AuthContext } from "../useContext/AuthContext";
import axios from "axios";
import UserCard from "../components/UserCard";
import CropCard from "../components/CropCard";

const CoordinatorDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("crops");
  const { user, logout } = useContext(AuthContext); // Added setUser
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [farmerFormData, setFarmerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "farmer"
  });
  const [crops, setCrops] = useState([]);

  const API_BASE_URL = "http://localhost:8080/api/v1/coordinator";

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/all-farmers`, { withCredentials: true });
      if (response.data.success) {
        setFarmers(response.data.farmers);
      }
    } catch (error) {
      console.error("Error fetching farmers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/all-crops`, { withCredentials: true });
      if (response.data.success) {
        setCrops(response.data.crops || []);
      }
    } catch (error) {
      console.error("Error fetching crops:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleLogout = async () => {
  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/signout`, {}, { withCredentials: true });
  //     console.log(response.data);

  //     if (response.data.success) {
  //       navigate("/signin"); 
  //     } else {
  //       console.error("Logout failed:", response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error during logout:", error.response?.data || error.message);
  //   }
  // };



  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      alert("Logged out successfully")
      navigate("/"); 
    }
  };


  const openModal = () => {
    setIsModalOpen(true);
    setFarmerFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "farmer"
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFarmerChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") return;
    setFarmerFormData({
      ...farmerFormData,
      [name]: value
    });
  };

  const handleFarmerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/add-farmer`,
        farmerFormData,
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchFarmers();
        closeModal();
        alert("Farmer added successfully");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert("Farmer with this email or phone already exists");
      } else {
        alert("Failed to add farmer");
      }
      console.error("Error adding farmer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFarmer = async (farmerId) => {
    if (window.confirm("Are you sure you want to delete this farmer?")) {
      try {
        setLoading(true);
        const response = await axios.delete(
          `${API_BASE_URL}/delete-farmer/${farmerId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          fetchFarmers();
          alert("Farmer deleted successfully");
        }
      } catch (error) {
        alert("Failed to delete farmer");
        console.error("Error deleting farmer:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (window.confirm("Are you sure you want to delete this crop?")) {
      try {
        setLoading(true);
        const response = await axios.delete(
          `${API_BASE_URL}/delete-crop/${cropId}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          fetchCrops();
          alert("Crop deleted successfully");
        }
      } catch (error) {
        alert("Failed to delete crop");
        console.error("Error deleting crop:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'farmers' && farmers.length === 0) {
      fetchFarmers();
    }
  };

  const getProfilePicture = () => {
    if (user?.googleProfilePicture) {
      return user.googleProfilePicture;
    }
    return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
  };

  return (
    <div className="flex h-screen bg-[#181a20]">
      <aside className="w-64 bg-[#1e2329] text-white p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coordinator Dashboard</h2>
          <nav className="mt-5">
            <ul className="space-y-4">
              <li className="hover:text-orange-400 transition p-2 rounded cursor-pointer flex items-center gap-2">
                <Home size={20} /> <Link to="/user/home">Home</Link>
              </li>
              <li
                className={`${activeTab === 'crops' ? 'bg-zinc-700' : 'hover:text-orange-400 transition'} p-2 rounded cursor-pointer flex items-center gap-2`}
                onClick={() => handleTabChange('crops')}
              >
                <Sprout size={20} /> <span>Crops</span>
              </li>
              <li
                className={`${activeTab === 'farmers' ? 'bg-zinc-700' : 'hover:text-orange-400 transition'} p-2 rounded cursor-pointer flex items-center gap-2`}
                onClick={() => handleTabChange('farmers')}
              >
                <Users size={20} /> <span>Farmers</span>
              </li>
            </ul>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-[#1e2329] shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-md overflow-hidden">
              <img src={getProfilePicture()} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl text-white font-semibold">{user?.name || "Coordinator"}</h2>
              <p className="text-gray-400">{user?.email || "email@example.com"}</p>
              <p className="text-white font-semibold">Role: Coordinator</p>
            </div>
          </div>
          <div>
            <button onClick={openModal} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <Plus size={20} /> Add Farmer
            </button>
          </div>
        </header>

        <main className="p-6 text-white overflow-y-auto">
          {activeTab === 'farmers' ? (
            <>
              <h3 className="text-xl font-semibold mb-4">Farmers</h3>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {farmers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {farmers.map((farmer) => (
                        <UserCard
                          key={farmer._id}
                          user={farmer}
                          onDelete={handleDeleteFarmer}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No farmers found. Add your first farmer!</p>
                      <button
                        onClick={openModal}
                        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center gap-2"
                      >
                        <Plus size={18} /> Add Farmer
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-4">Crops</h3>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <>
                  {crops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {crops.map((crop) => (
                        <CropCard
                          key={crop._id}
                          crop={crop}
                          onDelete={() => handleDeleteCrop(crop._id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No crops available.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-[#1e2329] p-6 rounded-lg w-96 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add Farmer</h2>
              <button onClick={closeModal}><X size={20} /></button>
            </div>

            <form onSubmit={handleFarmerSubmit}>
              <div className="mb-3">
                <label className="block text-gray-300 mb-1 text-sm">Name</label>
                <input
                  type="text"
                  name="name"
                  value={farmerFormData.name}
                  onChange={handleFarmerChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-gray-300 mb-1 text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={farmerFormData.email}
                  onChange={handleFarmerChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-gray-300 mb-1 text-sm">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={farmerFormData.phone}
                  onChange={handleFarmerChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-gray-300 mb-1 text-sm">Password</label>
                <input
                  type="password"
                  name="password"
                  value={farmerFormData.password}
                  onChange={handleFarmerChange}
                  className="w-full p-2 bg-gray-700 rounded"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="block text-gray-300 mb-1 text-sm">Role*</label>
                <input
                  type="text"
                  name="role"
                  value={farmerFormData.role}
                  onChange={handleFarmerChange}
                  className="w-full p-2 bg-gray-700 rounded text-gray-400 cursor-not-allowed"
                  disabled
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-blue-500 hover:bg-blue-600 flex justify-center items-center"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Farmer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorDashboard;