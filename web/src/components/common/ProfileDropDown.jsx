import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { VscSignOut } from "react-icons/vsc";
import { useDispatch } from "react-redux";
import { logout } from "../../services/opretions/Auth.js";

function ProfileDropDown({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center gap-6 relative">
      <Link
        to="/dashboard/my-profile"
        className="font-bold hover:text-gray-800"
      >
        Profile
      </Link>

      {user.accountType === "Student" && (
        <Link
          to="/dashboard/student"
          className="font-bold hover:text-gray-800"
        >
          Dashboard
        </Link>
      )}
      {user.accountType === "Instructor" && (
        <Link
          to="/dashboard/instructor"
          className="font-bold hover:text-gray-800"
        >
          Dashboard
        </Link>
      )}
      {user.accountType === "Admin" && (
        <Link
          to="/dashboard/admin"
          className="font-bold hover:text-gray-800"
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
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50">
          <button
            onClick={() => dispatch(logout(navigate))}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
