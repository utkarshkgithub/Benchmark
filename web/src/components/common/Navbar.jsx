import React, { useState, useEffect, useRef } from 'react'
import CTAButton from './CTAButton'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import { VscSignOut } from "react-icons/vsc"
import { useSelector, useDispatch } from 'react-redux'
import { logout } from "../../services/opretions/Auth.js"

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const mobileMenuRef = useRef(null)
  const profileDropdownRef = useRef(null)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {token} = useSelector((state)=>state.auth)
  const {user} = useSelector((state)=>state.auth)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsProfileDropdownOpen(false)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    dispatch(logout(navigate))
    setIsMobileMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/Indian_Institute_of_Information_Technology%2C_Bhagalpur_logo.png/250px-Indian_Institute_of_Information_Technology%2C_Bhagalpur_logo.png" 
              alt="IIIT Logo" 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
            />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-wide">
              <span className="hidden sm:inline">BENCHMARK</span>
              <span className="sm:hidden">IIITBH-BMK</span>
            </h2>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {!token ? (
              <div className="flex items-center space-x-3">
                <Link to='/login'>
                  <CTAButton text="Login" active={false} />
                </Link>
                <Link to='/signup'>
                  <CTAButton text="Signup" active="true" />
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Navigation Links */}
                <Link
                  to="/dashboard/my-profile"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profile
                </Link>

                {user?.accountType === "Student" && (
                  <Link
                    to="/dashboard/student"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                {user?.accountType === "Instructor" && (
                  <>
                    <Link
                      to="/dashboard/genrate-qr"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      ShowQR
                    </Link>
                    <Link
                      to="/dashboard/instructor"
                      className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                  </>
                )}

                {user?.accountType === "Admin" && (
                  <Link
                    to="/dashboard/admin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                {/* Desktop Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  >
                    <img
                      src={user?.image}
                      alt={`${user?.firstName}`}
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-300"
                    />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border py-1">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        <VscSignOut />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden" ref={mobileMenuRef}>
            {token ? (
              <div className="flex items-center space-x-3">
                {/* Mobile Profile Image */}
                <img
                  src={user?.image}
                  alt={`${user?.firstName}`}
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-300"
                />
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                >
                  {isMobileMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
                </button>
              </div>
            ) : (
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
              </button>
            )}

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
              <div className="absolute right-4 top-16 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                {!token ? (
                  <div className="px-4 py-2 space-y-3">
                    <Link to='/login' onClick={closeMobileMenu} className="block">
                      <CTAButton text="Login" active={false} />
                    </Link>
                    <Link to='/signup' onClick={closeMobileMenu} className="block">
                      <CTAButton text="Signup" active="true" />
                    </Link>
                  </div>
                ) : (
                  <div>
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user?.image}
                          alt={`${user?.firstName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{user?.accountType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-2">
                      <Link
                        to="/dashboard/my-profile"
                        onClick={closeMobileMenu}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Profile
                      </Link>

                      {user?.accountType === "Student" && (
                        <Link
                          to="/dashboard/student"
                          onClick={closeMobileMenu}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Dashboard
                        </Link>
                      )}

                      {user?.accountType === "Instructor" && (
                        <>
                          <Link
                            to="/dashboard/genrate-qr"
                            onClick={closeMobileMenu}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            ShowQR
                          </Link>
                          <Link
                            to="/dashboard/instructor"
                            onClick={closeMobileMenu}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Dashboard
                          </Link>
                        </>
                      )}

                      {user?.accountType === "Admin" && (
                        <Link
                          to="/dashboard/admin"
                          onClick={closeMobileMenu}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Dashboard
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <VscSignOut />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar