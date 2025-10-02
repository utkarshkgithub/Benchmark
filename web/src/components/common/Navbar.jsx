import React, { useState, useEffect, useRef } from 'react'
import CTAButton from './CTAButton'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import { VscSignOut } from "react-icons/vsc"
import { useSelector, useDispatch } from 'react-redux'
import { logout } from "../../services/opretions/Auth.js"
import { NavLink, MobileNavLink } from './NavLink'

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mobileMenuRef = useRef(null)
  const profileDropdownRef = useRef(null)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.auth)

  const isActive = (path) => location.pathname === path

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <nav className={`w-full sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/90 backdrop-blur-xl shadow-xl border-b border-white/20' 
        : 'bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand with Animation */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 flex-shrink-0 group animate-fade-in-left"
          >
            <div className="relative">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/Indian_Institute_of_Information_Technology%2C_Bhagalpur_logo.png/250px-Indian_Institute_of_Information_Technology%2C_Bhagalpur_logo.png" 
                alt="IIIT Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <div className="relative">
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-wide">
                <span className="hidden sm:inline">IIITBH-BENCHMARK</span>
                <span className="sm:hidden">IIITBH-BMK</span>
              </h2>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 animate-fade-in-down">
            {!token ? (
              <div className="flex items-center space-x-6 animate-fade-in-right" style={{ animationDelay: '0.2s' }}>
                <NavLink to="/learn">About</NavLink>
                <Link to='/login' className="transform hover:scale-105 transition-transform duration-200">
                  <CTAButton text="Login" active={false} />
                </Link>
                <Link to='/signup' className="transform hover:scale-105 transition-transform duration-200">
                  <CTAButton text="Signup" active="true" />
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop Navigation Links */}
                <div className="flex items-center space-x-6">
                  <NavLink to="/learn">About</NavLink>
                  <NavLink to="/dashboard/my-profile">Profile</NavLink>

                  {user?.accountType === "Student" && (
                    <NavLink to="/dashboard/student">Dashboard</NavLink>
                  )}

                  {user?.accountType === "Instructor" && (
                    <>
                      <NavLink to="/dashboard/genrate-qr">ShowQR</NavLink>
                      <NavLink to="/dashboard/instructor">Dashboard</NavLink>
                    </>
                  )}

                  {user?.accountType === "Admin" && (
                    <NavLink to="/dashboard/admin">Dashboard</NavLink>
                  )}
                </div>

                {/* Desktop Profile Dropdown */}
                <div className="relative animate-fade-in-right" ref={profileDropdownRef} style={{ animationDelay: '0.3s' }}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 group transition-all duration-300"
                  >
                    <div className="relative">
                      <img
                        src={user?.image}
                        alt={`${user?.firstName}`}
                        className="h-10 w-10 rounded-full object-cover border-2 border-transparent group-hover:border-blue-400 transition-all duration-300 transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-2 animate-dropdown-in">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user?.image}
                            alt={`${user?.firstName}`}
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 mt-1">
                              {user?.accountType}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                      >
                        <VscSignOut className="text-lg group-hover:scale-110 transition-transform duration-200" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden animate-fade-in-right" ref={mobileMenuRef}>
            {token ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user?.image}
                    alt={`${user?.firstName}`}
                    className="h-10 w-10 rounded-full object-cover border-2 border-gray-300"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transform hover:scale-105 transition-all duration-200"
                >
                  <div className="relative w-6 h-6">
                    <FaBars className={`absolute inset-0 h-5 w-5 transition-all duration-300 transform ${isMobileMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'}`} />
                    <FaTimes className={`absolute inset-0 h-5 w-5 transition-all duration-300 transform ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`} />
                  </div>
                </button>
              </div>
            ) : (
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transform hover:scale-105 transition-all duration-200"
              >
                <div className="relative w-6 h-6">
                  <FaBars className={`absolute inset-0 h-5 w-5 transition-all duration-300 transform ${isMobileMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'}`} />
                  <FaTimes className={`absolute inset-0 h-5 w-5 transition-all duration-300 transform ${isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`} />
                </div>
              </button>
            )}

            {isMobileMenuOpen && (
              <div className="absolute right-4 top-16 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-3 z-50 animate-mobile-menu-in">
                {!token ? (
                  <div className="px-5 py-4 space-y-4">
                    <MobileNavLink to="/learn" onClick={closeMobileMenu}>About</MobileNavLink>
                    <Link to='/login' onClick={closeMobileMenu} className="block transform hover:scale-105 transition-transform duration-200">
                      <CTAButton text="Login" active={false} />
                    </Link>
                    <Link to='/signup' onClick={closeMobileMenu} className="block transform hover:scale-105 transition-transform duration-200">
                      <CTAButton text="Signup" active="true" />
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="px-5 py-4 border-b border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={user?.image}
                            alt={`${user?.firstName}`}
                            className="h-14 w-14 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-gray-900 truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 mt-2">
                            {user?.accountType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <MobileNavLink to="/learn" onClick={closeMobileMenu}>About</MobileNavLink>
                      <MobileNavLink to="/dashboard/my-profile" onClick={closeMobileMenu}>Profile</MobileNavLink>

                      {user?.accountType === "Student" && (
                        <MobileNavLink to="/dashboard/student" onClick={closeMobileMenu}>
                          Dashboard
                        </MobileNavLink>
                      )}

                      {user?.accountType === "Instructor" && (
                        <>
                          <MobileNavLink to="/dashboard/genrate-qr" onClick={closeMobileMenu}>
                            ShowQR
                          </MobileNavLink>
                          <MobileNavLink to="/dashboard/instructor" onClick={closeMobileMenu}>
                            Dashboard
                          </MobileNavLink>
                        </>
                      )}

                      {user?.accountType === "Admin" && (
                        <MobileNavLink to="/dashboard/admin" onClick={closeMobileMenu}>
                          Dashboard
                        </MobileNavLink>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
                      >
                        <VscSignOut className="text-lg group-hover:scale-110 transition-transform duration-200" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dropdown-in {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes mobile-menu-in {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out forwards;
        }

        .animate-fade-in-right {
          opacity: 0;
          animation: fade-in-right 0.6s ease-out forwards;
        }

        .animate-fade-in-down {
          opacity: 0;
          animation: fade-in-down 0.6s ease-out forwards;
        }

        .animate-dropdown-in {
          animation: dropdown-in 0.3s ease-out forwards;
        }

        .animate-mobile-menu-in {
          animation: mobile-menu-in 0.3s ease-out forwards;
        }
      `}</style>
    </nav>
  )
}

export default Navbar