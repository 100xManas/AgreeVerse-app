import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const CropCard = ({ crop, onEdit, onDelete }) => {
    console.log(crop);

    const { title, description, imageURL, tag, price, createdAt } = crop;

    return (
        <div className="bg-[#1e2329] text-white border border-gray-700 rounded-xl shadow-lg p-4 w-64">
            <img
                src={imageURL}
                alt={title}
                className="w-full h-40 object-cover rounded-md"
            />
            <h3 className="text-lg font-semibold mt-2">{title}</h3>
            <p className="text-gray-400 text-sm mt-1">{description}</p>
            <div className="flex justify-between items-center mt-3">
                <span className="bg-green-600 px-2 py-1 text-xs rounded">{tag}</span>
                <span className="text-yellow-400 font-bold">${price}</span>
            </div>
            <p className="text-gray-500 text-xs mt-2">
                Added: {new Date(createdAt).toLocaleDateString()}
            </p>
            <div className="flex justify-between mt-3">
                <button
                    onClick={() => onEdit(crop)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                    <Edit size={16} /> Edit
                </button>
                <button
                    onClick={() => onDelete(crop)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                    <Trash2 size={16} /> Delete
                </button>
            </div>
        </div>
    );
};

export default CropCard;

// Example usage:
// function CropList() {
//   const [crops, setCrops] = useState([
//     {
//       id: 1,
//       title: "Fresh Tomatoes",
//       description: "Locally grown, organic tomatoes bursting with flavor",
//       imageURL: "/path/to/tomato-image.jpg",
//       tag: "vegetable",
//       price: 3.99,
//       createdAt: new Date()
//     }
//   ]);
//
//   const handleEdit = (crop) => {
//     // Implement edit logic
//     console.log("Editing crop:", crop);
//   };
//
//   const handleDelete = (crop) => {
//     // Implement delete logic
//     setCrops(crops.filter(c => c.id !== crop.id));
//   };
//
//   return (
//     <div className="flex flex-wrap gap-4">
//       {crops.map((crop) => (
//         <CropCard
//           key={crop.id}
//           crop={crop}
//           onEdit={handleEdit}
//           onDelete={handleDelete}
//         />
//       ))}
//     </div>
//   );
// }