import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CTAButton from '../../common/CTAButton.jsx';
import ChangeProfilePicture from './Settings/ChangeProfilePicture.jsx';

function MyProfile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className='flex justify-center items-center h-[calc(100vh-65px)] overflow-y-hidden bg-gradient-to-br from-slate-50 to-blue-50'>
      <div className="flex flex-col gap-8 h-[calc(100vh-150px)] overflow-y-scroll overflow-x-hidden scrollbar-hide">
        <div className="animate-fade-in">
          <h1 className="font-extrabold text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="transform hover:scale-100 transition-transform duration-300">
            <ChangeProfilePicture />
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-2 sm:p-8 border border-white/20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 relative">
              Personal Details
              <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </h2>
          </div>
          
          <div className="space-y-6 ">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors duration-300">
              <div className="space-y-1">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">First Name</p>
                <p className="text-gray-800 font-semibold text-lg">{user?.firstName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Last Name</p>
                <p className="text-gray-800 font-semibold text-lg">{user?.lastName}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors duration-300">
              <div className="space-y-1 ">
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Email</p>
                <p className="text-gray-800 font-semibold text-lg break-all ">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information for Students */}
        {user?.accountType == "Student" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-white/20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 relative">
                Academic Information
                <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 grid-cols-2 gap-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-colors duration-300">
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Semester</p>
                  <p className="text-gray-800 font-semibold text-lg">{user?.semester}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Branch</p>
                  <p className="text-gray-800 font-semibold text-lg">{user?.branch}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-4 grid-cols-3 gap-6 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl hover:from-teal-100 hover:to-cyan-100 transition-colors duration-300">
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Roll Number</p>
                  <p className="text-gray-800 font-semibold text-lg">{user?.rollNumber}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Academic Information for Instructors */}
        {user?.accountType == "Instructor" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-white/20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 relative">
                Academic Information
                <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              </h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 grid-cols-2 gap-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-colors duration-300">
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Department</p>
                  <p className="text-gray-800 font-semibold text-lg">{user?.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Role</p>
                  <p className="text-gray-800 font-semibold text-lg">{user?.accountType}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.8s ease-out forwards;
        }

        /* Scrollbar hidden style */
        .scrollbar-hide::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
}

export default MyProfile;
