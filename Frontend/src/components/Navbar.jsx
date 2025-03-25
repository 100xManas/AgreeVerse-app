import React, { useContext, useState } from 'react';
import { Search, User, MoveRight } from 'lucide-react';
import UserProfileCard from './UserProfile';
import { AuthContext } from '../useContext/AuthContext';

function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const { user } = useContext(AuthContext);
  console.log(user);
  

  return (
    <header className="w-full bg-zinc-700 border-b border-zinc-600 py-4 px-4 md:px-8 flex items-center justify-between flex-wrap gap-4 lg:px-16 lg:flex-nowrap lg:space-x-8">
      {/* Logo and Hamburger Menu */}
      <div className="flex items-center justify-between w-full lg:w-auto">
        {/* Logo Section */}
        <a
          href="/"
          className="font-bold lg:text-xl text-[#F0B90B] transition-colors text-lg"
        >
          AgreeVerse
        </a>

        {/* Hamburger Menu Toggle (Visible on Mobile and Tablet) */}
        <button
          onClick={toggleMenu}
          className="lg:hidden text-gray-100 hover:text-[#F0B90B] transition-colors focus:outline-none"
        >
          {isMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation links */}
      <nav
        className={`${isMenuOpen ? 'block' : 'hidden'} w-full absolute bg-zinc-700 z-50 top-12 left-0 lg:static lg:flex lg:bg-transparent lg:w-auto`}
      >
        {/* Signup and Signin Links (Visible on Mobile/Tablet) */}
        <div className='border-b border-b-[#F0B90B] py-2 lg:hidden'>
          <a href="" className='flex items-center justify-between px-4 py-1 text-white'>
            <span className='font-semibold text-sm'>Signup</span>
            <MoveRight />
          </a>

          <a href="" className='flex mt-1 items-center justify-between px-4 py-1 text-white'>
            <span className='font-semibold text-sm'>Signin</span>
            <MoveRight />
          </a>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col py-2 lg:flex-row ">
          {['Grocery Items', 'Meats', 'Dry Foods', 'Best Deals', 'Blog'].map(
            (item, idx) => (
              <li key={idx} className="whitespace-nowrap">
                <a
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="block py-2 px-4 text-white font-medium tracking-tight hover:text-[#F0B90B] transition-colors truncate max-w-full text-sm"
                  onClick={closeMenu}
                >
                  {item}
                </a>
              </li>
            )
          )}
        </ul>
      </nav>

      {/* Search Bar (Visible on Desktop) */}
      <div className="relative hidden lg:block w-full max-w-xs">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full py-2 pl-10 pr-4 bg-transparent border-2 border-gray-400 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F0B90B] focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
      </div>

      {/* User Icons (Visible on Desktop Only) */}
      <div className="hidden lg:flex items-center space-x-5 relative">
        <div
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          className="relative"
        >
          <a
            href="#user"
            className="flex flex-col items-center group hover:text-[#F0B90B] transition-colors"
          >
            <User
              size={25}
              className="text-gray-100 mb-1 group-hover:text-[#F0B90B] transition-colors"
            />
          </a>

          {/* Popup */}
          {isHover && (
            <div className="absolute top-full transform -translate-x-1/2 w-48 bg-zinc-700 text-white rounded-lg shadow-lg py-3 mt-1 z-50">
              <a href="/signup" className="flex items-center justify-between px-4 py-2 text-white hover:text-[#F0B90B] hover:px-4.5 transition duration-150 text-sm">
                <span className="font-semibold">Signup</span>
                <MoveRight />
              </a>

              <a href="/signin" className="flex mt-1 items-center justify-between px-4 py-2 text-white hover:text-[#F0B90B] hover:px-4.5 transition duration-150 text-sm">
                <span className="font-semibold">Signin</span>
                <MoveRight />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* <UserProfileCard /> */}
    </header>
  );
}

export default Navbar;