import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Sprout, Users, LogOut, Plus, X } from "lucide-react";

const UserModal = ({ isOpen, onClose, role }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1e2329] p-6 rounded-lg w-96 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Add {role}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <input type="text" placeholder="Name" className="w-full p-2 mb-2 bg-gray-700 rounded" />
        <input type="email" placeholder="Email" className="w-full p-2 mb-2 bg-gray-700 rounded" />
        <input type="text" placeholder="Phone" className="w-full p-2 mb-2 bg-gray-700 rounded" />
        <button className={`w-full py-2 rounded ${role === 'Farmer' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`}>Add {role}</button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState("");

  const openModal = (role) => {
    setModalRole(role);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#181a20]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e2329] text-white p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <nav className="mt-5">
            <ul className="space-y-4">
              <li className="transition py-2 px-4 rounded cursor-pointer hover:bg-zinc-700 flex items-center gap-2">
                <Home size={20} /> <Link to="/admin/home">Home</Link>
              </li>
              <li className="hover:bg-zinc-700 p-2 rounded cursor-pointer flex items-center gap-2">
                <Sprout size={20} /> <Link to="/admin/crops">Crops</Link>
              </li>
              <li className="transition py-2 px-4 rounded cursor-pointer hover:bg-zinc-700 flex items-center gap-2">
                <Users size={20} /> <Link to="/admin/farmers">Farmers</Link>
              </li>
              <li className="transition py-2 px-4 rounded cursor-pointer hover:bg-zinc-700 flex items-center gap-2">
                <Users size={20} /> <Link to="/admin/coordinators">Coordinators</Link>
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
          <div>
            <h2 className="text-xl text-white font-semibold">Username</h2>
            <p className="text-gray-400">Role: Admin</p>
          </div>
          <div className="flex space-x-4">
            <button onClick={() => openModal("Farmer")} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <Plus size={20} /> Add Farmer
            </button>
            <button onClick={() => openModal("Coordinator")} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <Plus size={20} /> Add Coordinator
            </button>
          </div>
        </header>
        
        <main className="p-6">
          <h1 className="text-3xl font-semibold text-white">Welcome to Admin Dashboard</h1>
        </main>
      </div>

      {/* Reusable Modal */}
      <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} role={modalRole} />
    </div>
  );
};

export default AdminDashboard;
