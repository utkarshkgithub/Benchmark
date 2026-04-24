import React, { useState, useEffect, useRef } from 'react'
import CTAButton from './CTAButton'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'
import { VscSignOut } from 'react-icons/vsc'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../services/opretions/Auth.js'
import { NavLink, MobileNavLink } from './NavLink'
import ThemeToggle from './ThemeToggle'
import logodark from '../../assets/logodark.png'
import logolight from '../../assets/logolight.png'

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const mobileMenuRef = useRef(null)
  const profileDropdownRef = useRef(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { token, user } = useSelector((state) => state.auth)
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }, [location.pathname])

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
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logout(navigate))
    setIsMobileMenuOpen(false)
    setIsProfileDropdownOpen(false)
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{
        background: darkMode ? 'rgba(10, 11, 13, 0.94)' : 'rgba(255, 255, 255, 0.94)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div className="cb-container">
        <div className="flex h-20 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={darkMode ? logodark : logolight}
              alt="Benchmark"
              className="h-10 w-10 rounded-xl object-contain"
            />
            <div>
              <p className="cb-display-tight text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Benchmark
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Attendance Platform
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            <ThemeToggle />
            <NavLink to="/learn">About</NavLink>

            {!token ? (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <CTAButton text="Login" active={false} />
                </Link>
                <Link to="/signup">
                  <CTAButton text="Create Account" active='true' />
                </Link>
              </div>
            ) : (
              <>
                <NavLink to="/dashboard/my-profile">Profile</NavLink>

                {user?.accountType === 'Student' && <NavLink to="/dashboard/student">Dashboard</NavLink>}

                {user?.accountType === 'Instructor' && (
                  <>
                    <NavLink to="/dashboard/genrate-qr">Show QR</NavLink>
                    <NavLink to="/dashboard/instructor">Dashboard</NavLink>
                  </>
                )}

                {user?.accountType === 'Admin' && <NavLink to="/dashboard/admin">Dashboard</NavLink>}

                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
                    className="rounded-full p-0.5"
                    aria-label="Open profile menu"
                  >
                    <img
                      src={user?.image}
                      alt={user?.firstName || 'profile'}
                      className="h-10 w-10 rounded-full border object-cover"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    />
                  </button>

                  {isProfileDropdownOpen && (
                    <div
                      className="absolute right-0 top-12 w-72 rounded-2xl border p-4 shadow-lg"
                      style={{
                        background: 'var(--surface-primary)',
                        borderColor: 'var(--border-subtle)'
                      }}
                    >
                      <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: 'var(--border-subtle)' }}>
                        <img
                          src={user?.image}
                          alt={user?.firstName || 'profile'}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {user?.email}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--cb-link)' }}>
                            {user?.accountType}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                        style={{ borderColor: 'rgba(220, 38, 38, 0.35)' }}
                      >
                        <VscSignOut className="text-base" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="relative lg:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="cb-pill-btn cb-pill-secondary !min-h-[40px] !px-3 !py-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {isMobileMenuOpen && (
              <div
                className="absolute right-0 top-14 w-72 rounded-2xl border p-4 shadow-lg"
                style={{
                  background: 'var(--surface-primary)',
                  borderColor: 'var(--border-subtle)'
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <ThemeToggle />
                </div>

                <div className="space-y-1">
                  <MobileNavLink to="/learn" onClick={() => setIsMobileMenuOpen(false)}>
                    About
                  </MobileNavLink>

                  {!token ? (
                    <div className="mt-3 flex flex-col gap-2">
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <CTAButton text="Login" active={false} className="w-full" />
                      </Link>
                      <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <CTAButton text="Create Account" active='true' className="w-full" />
                      </Link>
                    </div>
                  ) : (
                    <>
                      <MobileNavLink to="/dashboard/my-profile" onClick={() => setIsMobileMenuOpen(false)}>
                        Profile
                      </MobileNavLink>

                      {user?.accountType === 'Student' && (
                        <MobileNavLink to="/dashboard/student" onClick={() => setIsMobileMenuOpen(false)}>
                          Dashboard
                        </MobileNavLink>
                      )}

                      {user?.accountType === 'Instructor' && (
                        <>
                          <MobileNavLink to="/dashboard/genrate-qr" onClick={() => setIsMobileMenuOpen(false)}>
                            Show QR
                          </MobileNavLink>
                          <MobileNavLink to="/dashboard/instructor" onClick={() => setIsMobileMenuOpen(false)}>
                            Dashboard
                          </MobileNavLink>
                        </>
                      )}

                      {user?.accountType === 'Admin' && (
                        <MobileNavLink to="/dashboard/admin" onClick={() => setIsMobileMenuOpen(false)}>
                          Dashboard
                        </MobileNavLink>
                      )}

                      <button
                        onClick={handleLogout}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                        style={{ borderColor: 'rgba(220, 38, 38, 0.35)' }}
                      >
                        <VscSignOut />
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar