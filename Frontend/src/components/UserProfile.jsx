import React from 'react';
import { LogOut, ShoppingBag } from 'lucide-react';

const UserProfile = ({ user, onLogout }) => {
  
  console.log(user);
  

  return (
    <div className="bg-zinc-700 rounded-lg shadow-lg w-[100%] overflow-hidden">
      {/* User Profile Section */}
      <div className="p-4 flex items-center gap-3">
        <img
          src={user?.googleProfilePicture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
          alt="User profile"
          className="w-12 h-12 object-cover rounded-md"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm tracking-tight truncate">{user?.name || "User Name"}</p>
          <p className="text-zinc-400 text-xs truncate">{user?.email || "user@example.com"}</p>
          <p className="text-zinc-400 text-sm font-semibold truncate">Role: {user?.role || "role"}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800 mx-2"></div>

      {/* Orders Link */}
      {
        user?.role == "user" ? (
          <a
            href="/orders"
            className="flex items-center gap-3 p-4 text-zinc-300 hover:bg-zinc-600 hover:text-orange-400 transition-colors"
          >
            <ShoppingBag size={20} />
            <span>Orders</span>
          </a>
        ) : null
      }


      {/* Divider */}
      <div className="border-t border-zinc-800 mx-2"></div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="flex items-center gap-3 p-4 cursor-pointer text-zinc-300 hover:bg-zinc-600 hover:text-orange-400 transition-colors w-full text-left"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default UserProfile;