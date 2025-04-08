import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import Card from '../components/Card';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { ProductContext } from '../useContext/productContext';
import HowItWorks from '../components/HowItWork';

import fruitImage from "../assets/fruits.png";
import vegetablesImage from "../assets/vegetables.png";
import grainsImage from "../assets/grains.png";
import Loading from '../components/Loading';

function Home() {
  const [products, setProducts, loading, getProducts] = useContext(ProductContext);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    console.log(`Selected category: ${category}`);
  };

  return (
    <div className='w-full bg-[#181a20]'>
      <Navbar />
      <main className='mx-auto w-[97vw]'>
        <Carousel />

        <div className='flex justify-between items-center py-10 mx-16'>
          <Card bgColor={"bg-green-200"} title={"Vegetables"} cropImage={vegetablesImage} />
          <Card bgColor={"bg-orange-200"} title={"Fruits"} cropImage={fruitImage} />
          <Card bgColor={"bg-yellow-200"} title={"grains"} cropImage={grainsImage} />
        </div>

        <div className='bg-[#1e2329] mt-8 pb-20'>
          <div className="flex justify-between items-center px-10">
            <h2 className='text-3xl text-white font-semibold py-8'>All Our Products</h2>
            <button
              onClick={getProducts}
              className="border border-gray-600 hover:text-orange-400 font-semibold cursor-pointer hover:bg-gray-600 transition text-white px-4 py-2 rounded-md"
            >
              Refresh Products
            </button>
          </div>

          {loading ? (
            <Loading />
          ) : products && products.length > 0 ? (
            <div className='flex items-center justify-between flex-wrap px-10'>
              {products.map((item, index) => (
                <Link to={`/product/${item._id}`} key={index}>
                  <ProductCard product={item} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-white text-center py-10">
              No products available.
              <button
                onClick={getProducts}
                className="ml-2 underline text-green-400"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}

export default Home;