import React from 'react';

const ProductCard = ({ product }) => {
  
  return (
    <div className="w-60 hover:cursor-pointer text-white my-4 rounded-xl bg-[#1e2329] border border-gray-700 shadow-sm overflow-hidden">

      <div className='relative'>
        <img src={product.imageURL} alt={product.title} className='w-full h-48 object-cover hover:scale-105 duration-250 transition ease-in' />
      </div>

      {/* Product Details */}
      <div className="p-3">

        {/* Product Title */}
        <h3 className="font-bold text-lg mb-0.5 line-clamp-1">{product.title}</h3>

        {/* Quantity */}
        <p className="text-gray-400 mb-4">{product.description}</p>

        {/* Price */}
        <div className="text-sm ml-2">
          <span className="font-bold text-lg">₹{product.price}</span>
        </div>

        {/*Buy mow */}
        <button
          onClick={product.onAddToCart}
          className="w-full rounded-md py-1.5 cursor-pointer mt-2 text-gray-200 font-medium border border-gray-700 hover:text-gray-100 hover:border-white duration-200 ease-in-out transition"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard