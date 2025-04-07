import React, { useContext, useState } from "react";
import { Home, Sprout, Users, LogOut, Plus, DollarSign } from "lucide-react";
import { AuthContext } from "../useContext/AuthContext";
import UserCard from "../components/UserCard";
import CropCard from "../components/CropCard";
import axios from "axios";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  console.log(user);

  const [activeSection, setActiveSection] = useState("home");
  const [farmers, setFarmers] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [crops, setCrops] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const axiosConfig = { withCredentials: true };

  // Fetch farmers 
  const showFarmers = () => {
    setLoading(true);
    setActiveSection("farmers");
    axios
      .get("http://localhost:8080/api/v1/admin/get-farmers", axiosConfig)
      .then((response) => {
        setFarmers(response.data.farmers);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching farmers:", err);
        setLoading(false);
      });
  };

  // Fetch coordinators
  const showCoordinators = () => {
    setLoading(true);
    setActiveSection("coordinators");
    axios
      .get("http://localhost:8080/api/v1/admin/get-coordinators", axiosConfig)
      .then((response) => {
        setCoordinators(response.data.coordinators);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching coordinators:", err);
        setLoading(false);
      });
  };

  // Fetch crops
  const showCrops = () => {
    setLoading(true);
    setActiveSection("crops");
    axios
      .get("http://localhost:8080/api/v1/admin/get-crops", axiosConfig)
      .then((response) => {
        setCrops(response.data.crops);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching crops:", err);
        setLoading(false);
      });
  };

  // Fetch payments 
  const showPayments = () => {
    setLoading(true);
    setActiveSection("payments");
    axios
      .get("http://localhost:8080/api/v1/admin/payment-status", axiosConfig)
      .then((response) => {
        setPayments(response.data.data.payments);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching payments:", err);
        setLoading(false);
      });
  };

  const showHome = () => {
    setActiveSection("home");
  };

  // Fixed function to handle deleting a user based on their role
  const deleteUser = (userId, userRole) => {
    if (userRole === "farmer") {
      deleteFarmer(userId);
    } else if (userRole === "coordinator") {
      deleteCoordinator(userId);
    }
  };

  // Delete a farmer 
  const deleteFarmer = (farmerId) => {
    axios
      .delete(`http://localhost:8080/api/v1/admin/delete-farmer/${farmerId}`, axiosConfig)
      .then(() => {
        setFarmers(farmers.filter((f) => f._id !== farmerId));
      })
      .catch((err) => console.log("Error deleting farmer:", err));
  };

  // Delete a coordinator
  const deleteCoordinator = (coordinatorId) => {
    axios
      .delete(`http://localhost:8080/api/v1/admin/delete-coordinator/${coordinatorId}`, axiosConfig)
      .then(() => {
        setCoordinators(coordinators.filter((c) => c._id !== coordinatorId));
      })
      .catch((err) => console.log("Error deleting coordinator:", err));
  };

  // Delete a crop
  const deleteCrop = (cropId) => {
    axios
      .delete(`http://localhost:8080/api/v1/admin/delete-crop/${cropId}`, axiosConfig)
      .then(() => setCrops(crops.filter((c) => c._id !== cropId)))
      .catch((err) => console.log("Error deleting crop:", err));
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
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e2329] text-white p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold capitalize">Admin Dashboard</h2>
          <nav className="mt-5">
            <ul className="space-y-4">
              <li
                onClick={showHome}
                className={`py-2 px-4 rounded cursor-pointer hover:bg-zinc-700 flex items-center gap-2 ${activeSection === "home" ? "bg-zinc-700" : ""
                  }`}
              >
                <Home size={20} /> Home
              </li>
              <li
                onClick={showCrops}
                className={`py-2 px-4 rounded cursor-pointer hover:bg-zinc-700 flex items-center gap-2 ${activeSection === "crops" ? "bg-zinc-700" : ""
                  }`}
              >
                <Sprout size={20} /> Crops
              </li>
              <li
                onClick={showFarmers}
                className={`py-2 px-4 rounded cursor-pointer hover:bg-zinc-700 flex items-center gap-2 ${activeSection === "farmers" ? "bg-zinc-700" : ""
                  }`}
              >
                <Users size={20} /> Farmers
              </li>
              <li
                onClick={showCoordinators}
                className={`py-2 px-4 rounded cursor-pointer hover:bg-zinc-700 flex items-center gap-2 ${activeSection === "coordinators" ? "bg-zinc-700" : ""
                  }`}
              >
                <Users size={20} /> Coordinators
              </li>
              <li
                onClick={showPayments}
                className={`py-2 px-4 rounded cursor-pointer hover:bg-zinc-700 flex items-center gap-2 ${activeSection === "payments" ? "bg-zinc-700" : ""
                  }`}
              >
                <DollarSign size={20} /> Payments
              </li>
            </ul>
          </nav>
        </div>
        <button 
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#1e2329] shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md overflow-hidden">
              <img
                src={user.googleProfilePicture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl text-white font-semibold">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-white font-semibold">Role: {user.role}</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {activeSection === "home" && (
            <h1 className="text-3xl text-center font-semibold text-white">
              Welcome to Admin Dashboard
            </h1>
          )}

          {/* Farmers Section */}
          {activeSection === "farmers" && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-white">Farmers</h2>
              {loading ? (
                <p className="text-white mt-4">Loading...</p>
              ) : farmers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {farmers.map((farmer) => (
                    <UserCard
                      key={farmer._id}
                      user={farmer}
                      onDelete={(id) => deleteUser(id, "farmer")}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-white mt-4">No farmers yet</p>
              )}
            </section>
          )}

          {/* Coordinators Section */}
          {activeSection === "coordinators" && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-white">Coordinators</h2>
              {loading ? (
                <p className="text-white mt-4">Loading...</p>
              ) : coordinators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {coordinators.map((coordinator) => (
                    <UserCard
                      key={coordinator._id}
                      user={coordinator}
                      onDelete={(id) => deleteUser(id, "coordinator")}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-white mt-4">No coordinators yet</p>
              )}
            </section>
          )}

          {/* Crops Section */}
          {activeSection === "crops" && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-white">Crops</h2>
              {loading ? (
                <p className="text-white mt-4">Loading...</p>
              ) : crops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {crops.map((crop) => (
                    <CropCard
                      key={crop._id}
                      crop={crop}
                      onEdit={() => console.log("Edit crop clicked")}
                      onDelete={deleteCrop}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-white mt-4">No crops yet</p>
              )}
            </section>
          )}

          {/* Payments Section */}
          {activeSection === "payments" && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold text-white">Payments</h2>
              {loading ? (
                <p className="text-white mt-4">Loading...</p>
              ) : payments.length > 0 ? (
                <div className="mt-4">
                  {payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="bg-[#1e2329] p-4 rounded mb-2 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-white">Farmer: {payment.farmerId?.name || "Unknown"}</p>
                        <p className="text-gray-400">Amount: ${payment.amount}</p>
                        <p className="text-gray-400">Status: {payment.status}</p>
                      </div>
                      <p className="text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white mt-4">No payments yet</p>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;