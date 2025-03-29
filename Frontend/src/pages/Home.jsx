import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Carousel from '../components/Carousel'
import Card from '../components/Card'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import { useContext, useState } from 'react'
import { ProductContext } from '../useContext/productContext'
import HowItWorks from '../components/HowItWork'

import fruitImage from "../assets/fruits.png";
import vegetablesImage from "../assets/vegetables.png";
import grainsImage from "../assets/grains.png";

function Home() {
  const [products] = useContext(ProductContext)
  console.log(products);

  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    console.log(`Selected category: ${category}`);
    // You can add additional functionality here
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
          <h2 className='text-3xl text-white text-center font-semibold py-10'>All Our Products </h2>

          <div className="flex flex-col items-center">
            <div className="flex justify-center flex-wrap gap-3 py-4">
              {['All', 'vegetable', 'fruit', 'grain'].map((category, index) => (
                <button
                  key={index}
                  className={`px-10 py-1.5 capitalize font-semibold text-white rounded-full cursor-pointer border border-gray-700 transition ${selectedCategory === category ? 'bg-green-500' : 'bg-[#1e2329] hover:bg-zinc-700'
                    }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className='flex items-center justify-between flex-wrap px-10'>
            {
              products.map((item, index) => (
                <Link to={`/product/${item.id}`} key={index}>
                  <ProductCard product={item} key={index} />
                </Link>
              ))
            }
          </div>
        </div>
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}

export default Home
