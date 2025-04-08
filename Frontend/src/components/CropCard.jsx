import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const CropCard = ({ crop, onEdit, onDelete }) => {
    const { title, description, imageURL, tag, price, createdAt } = crop;

    return (
        <div className="bg-[#1e2329] text-white border border-gray-700 rounded-xl shadow-lg p-4 w-64">
            <img
                src={imageURL}
                alt={title}
                className="w-full h-40 object-cover rounded-md hover:scale-105 transition duration-300"
            />
            <h3 className="text-lg font-semibold mt-2">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
            <div className="flex justify-between items-center mt-3">
                <span className="bg-green-600 px-2 py-1 text-xs rounded-md">{tag}</span>
                <span className="text-yellow-400 font-bold">₹{price}</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">
                Added: {new Date(createdAt).toLocaleDateString()}
            </p>
            <div className="flex justify-between mt-3">
                <button
                    onClick={() => onEdit(crop)}
                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white px-3 py-1 rounded flex items-center gap-1"
                >
                    <Edit size={16} /> Edit
                </button>
                <button
                    onClick={() => onDelete(crop)}
                    className="bg-red-600 hover:bg-red-700 text-white cursor-pointer px-3 py-1 rounded flex items-center gap-1"
                >
                    <Trash2 size={16} /> Delete
                </button>
            </div>
        </div>
    );
};

export default CropCard;