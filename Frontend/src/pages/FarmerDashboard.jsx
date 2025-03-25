import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, Sprout, LogOut, Plus } from 'lucide-react';
import CropCard from '../components/CropCard';

function FarmerDashboard() {
  const [crops, setCrops] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);

  // Fetch crops from backend
  useEffect(() => {
    const fetchCropByFarmer = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/farmer/preview-crops', { withCredentials: true });
        setCrops(response.data.crops);
      } catch (error) {
        console.error('Error fetching crops:', error);
      }
    };

    fetchCropByFarmer();
  }, []);
  

  const handleEdit = (crop) => {
    setSelectedCrop(crop);
    setIsModalOpen(true);
  };

  const handleDelete = async (cropId) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/v1/farmer/delete-crop/${cropId}`);
      if (response.data.success) {
        setCrops(crops.filter(c => c._id !== cropId));
      }
    } catch (error) {
      console.error('Error deleting crop:', error);
    }
  };

  const handleSave = async (crop) => {
    try {
      if (!selectedCrop) return;
      const response = await axios.put(`http://localhost:8080/api/v1/farmer/update-crop/${selectedCrop._id}`, crop);
      if (response.data.success) {
        setCrops(crops.map(c => (c._id === selectedCrop._id ? response.data.data : c)));
      }
      setIsModalOpen(false);
      setSelectedCrop(null);
    } catch (error) {
      console.error('Error updating crop:', error);
    }
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
          <div>
            <h2 className="text-xl text-white font-semibold">Username</h2>
            <p className="text-gray-400">Role: Farmer</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus size={20} /> Add New Crop
          </button>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-2 gap-4 mt-6">
            {crops.map((crop) => (
              <CropCard key={crop._id} {...crop} onEdit={() => handleEdit(crop)} onDelete={() => handleDelete(crop._id)} />
            ))}
          </div>
        </main>
      </div>
      {isModalOpen && <CropModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} crop={selectedCrop} onSave={handleSave} />}
    </div>
  );
}

export default FarmerDashboard;