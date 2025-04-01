import { useState } from "react";
import { Trash2, User } from "lucide-react";

const UserCard = ({ user, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(user.id);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4 border relative">
      <div className="bg-gray-200 p-3 rounded-full">
        <User className="w-8 h-8 text-gray-600" />
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-semibold">{user.name}</h2>
        <p className="text-sm text-gray-500">{user.email}</p>
        <p className="text-sm text-gray-700 font-medium">Role: {user.role}</p>
      </div>
      <div>
        <button 
          onClick={handleDeleteClick}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center justify-center transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Are you sure?</h2>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;