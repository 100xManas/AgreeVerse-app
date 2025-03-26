import React, { useContext, useState } from 'react';
import { AuthContext } from '../useContext/AuthContext';
import { Home, ShoppingCart, LogOut, X } from 'lucide-react';
import axios from 'axios';
import Loading from '../components/Loading';

function UserDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('welcome');

  const { user } = useContext(AuthContext);

  const fetchOrders = async () => {
    setLoading(true);
    setActiveSection('orders');

    try {
      const res = await axios.get(`http://localhost:8080/api/v1/user/user-purchases/${user._id}`, {
        withCredentials: true
      });

      if (res.data.success) {
        setOrders(res.data.purchases);
      }
    } catch (error) {
      alert('Something went wrong! Please try again.');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleHomeClick = () => {
    setActiveSection('welcome');
  };

  return (
    <div className="flex h-screen bg-[#181a20]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e2329] text-white p-5 space-y-6">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <nav>
          <ul className="space-y-4">
            <li
              className="hover:bg-zinc-700 hover:text-orange-400 transition ease-in-out p-2 rounded cursor-pointer flex items-center gap-2"
              onClick={handleHomeClick}
            >
              <Home size={20} /> Home
            </li>

            <li
              className="hover:bg-zinc-700 hover:text-orange-400 transition ease-in-out p-2 rounded cursor-pointer flex items-center gap-2"
              onClick={fetchOrders}
            >
              <ShoppingCart size={20} /> Orders
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-[#1e2329] shadow-md p-2 flex justify-between items-center">
          <div>
            <h2 className="text-xl text-white font-semibold">{user?.name || 'Username'}</h2>
            <p className='text-md text-white '>{user?.email}</p>
            <p className='text-white font-semibold'>Role: {user?.role} </p>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2">
            <LogOut size={20} /> Logout
          </button>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <div className="bg-[#1e2329] text-white border border-gray-700 rounded-xl shadow-lg p-8">
            {/* Welcome Section */}
            {activeSection === 'welcome' && (
              <>
                <h3 className="text-lg font-semibold">Welcome, {user?.name || ''} 👋</h3>
                <p className="text-gray-400 font-semibold mt-2">Track your crops, manage orders, and stay updated.</p>
              </>
            )}

            {/* Orders Section */}
            {activeSection === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold">Your Orders</h4>
                  <button
                    onClick={handleHomeClick}
                    className="text-gray-400 hover:text-white cursor-pointer transition"
                  >
                    <X size={24} />
                  </button>
                </div>

                {loading ? (
                  <Loading />
                ) : orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="bg-[#181a20] p-4 rounded-lg border border-gray-700"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold">Order ID: {order._id}</p>
                          <span className="text-sm text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <p>Total Amount: ${order.totalAmount?.toFixed(2) || 'N/A'}</p>
                          <p>Status: <span className={`
                            ${order.status === 'Completed' ? 'text-green-500' :
                              order.status === 'Pending' ? 'text-yellow-500' : 'text-red-500'}
                          `}>
                            {order.status || 'Unknown'}
                          </span></p>
                        </div>
                        {order.items && (
                          <div className="mt-3">
                            <h5 className="text-sm font-semibold mb-2">Items:</h5>
                            {order.items.map((item, index) => (
                              <div key={index} className="text-sm text-gray-300">
                                {item.name} - Qty: {item.quantity}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No orders found.</p>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserDashboard;