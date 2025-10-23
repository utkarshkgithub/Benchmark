import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { VscSignOut } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../services/opretions/Auth.js";

function ProfileDropDown({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  return (
    <div className="flex justify-center items-center gap-6 relative">
      <Link
        to="/dashboard/my-profile"
        className="font-bold hover:text-gray-800"
        style={{
          color: darkMode ? '#f9fafb' : '#111827'
        }}
      >
        Profile
      </Link>

      {user.accountType === "Student" && (
        <Link
          to="/dashboard/student"
          className="font-bold hover:text-gray-800"
          style={{
            color: darkMode ? '#f9fafb' : '#111827'
          }}
        >
          Dashboard
        </Link>
      )}
      {user.accountType === "Instructor" && (
        <div className="flex gap-4">
          <Link
            to="/dashboard/genrate-qr"
            className="font-bold hover:text-gray-800"
            style={{
              color: darkMode ? '#f9fafb' : '#111827'
            }}
          >
            ShowQR
          </Link>
          <Link
            to="/dashboard/instructor"
            className="font-bold hover:text-gray-800"
            style={{
              color: darkMode ? '#f9fafb' : '#111827'
            }}
          >
            Dashboard
          </Link>
          
        </div>

      )}
      {user.accountType === "Admin" && (
        <Link
          to="/dashboard/admin"
          className="font-bold hover:text-gray-800"
          style={{
            color: darkMode ? '#f9fafb' : '#111827'
          }}
        >
          Dashboard
        </Link>
      )}

      {/* Profile Image + Hover Dropdown */}
      <div className="relative group w-[50px] cursor-pointer">
        <img
          src={`${user?.image}`}
          alt={`profile-${user?.firstName}`}
          className="aspect-square rounded-full w-[50px] object-cover mr-4"
        />

        {/* Hover Dropdown Menu */}
        <div 
          className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50"
          style={{
            backgroundColor: darkMode ? '#1f2937' : '#ffffff'
          }}
        >
          <button
            onClick={() => dispatch(logout(navigate))}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            style={{
              color: '#dc2626',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            <VscSignOut className="text-lg" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileDropDown;
