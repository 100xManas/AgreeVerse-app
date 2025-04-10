import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Carousel from '../components/Carousel';
import Card from '../components/Card';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { ProductContext } from '../useContext/productContext';
import HowItWorks from '../components/HowItWork';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

import fruitImage from "../assets/fruits.png";
import vegetablesImage from "../assets/vegetables.png";
import grainsImage from "../assets/grains.png";
import agreeAppBanner from "../assets/agreeApp-banner.png"

function Home() {
  const [products, setProducts, loading, getProducts] = useContext(ProductContext);

  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/v1/verify", { withCredentials: true });

        const role = res.data.role

        // redirect based on role
        if (role === "admin") navigate("/admin/dashboard");
        else if (role === "coordinator") navigate("/coordinator/dashboard");
        else if (role === "farmer") navigate("/farmer/dashboard");
        else if (role === "user") navigate("/user/home");
      } catch (error) {
        alert("User not logged")
      }
    }

    // verify()
  }, [])

  return (
    <div className='w-full bg-[#181a20]'>
      <Navbar />
      <main className='mx-auto w-[97vw]'>
        {/* <Carousel /> */}

        <div className='relative w-[94vw] h-[21vw] mx-auto my-6 rounded-t-xl rounded-bl-xl overflow-hidden'>
          <img src={agreeAppBanner} alt="" className='w-full h-full object-cover' />
        </div>

        <div className='flex justify-between items-center py-10 mx-12'>
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