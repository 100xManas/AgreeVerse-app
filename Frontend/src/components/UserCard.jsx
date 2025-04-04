import { useState } from "react";
import { Trash2, User } from "lucide-react";

const UserCard = ({ user, onDelete }) => {
    
  const handleDeleteConfirm = () => {
    onDelete(user._id);
  };

  return (
    <div className="bg-[#1e2329] shadow-md rounded-lg p-4 flex items-center space-x-4 border border-gray-600 relative">
      <div className="bg-gray-200 p-3 rounded-full">
        <User className="w-8 h-8 text-gray-600" />
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <p className="text-sm text-gray-500">{user.email}</p>
        <p className="text-sm text-white font-medium">Role: {user.role}</p>
      </div>
      <div>
        <button 
          onClick={handleDeleteConfirm}
          className="bg-red-500 hover:bg-red-600 text-white cursor-pointer px-4 py-2 rounded flex items-center justify-center transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UserCard;