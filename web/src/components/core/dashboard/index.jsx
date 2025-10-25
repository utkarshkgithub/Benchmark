import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import CTAButton from '../../common/CTAButton.jsx';
import ChangeProfilePicture from './Settings/ChangeProfilePicture.jsx';

function MyProfile() {
  const { user } = useSelector((state) => state.auth);

  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  return (
    <div
      className='flex items-center justify-center h-[calc(100vh-65px)] overflow-y-hidden bg-gradient-to-br from-slate-50 to-blue-50'
      style={{
        background: darkMode
          ? 'linear-gradient(to bottom right, #0f172a, #1e293b)'
          : 'linear-gradient(to bottom right, #f8fafc, #eff6ff)'
      }}
    >
      <div className="flex flex-col gap-8 h-[calc(100vh-150px)] w-11/12 overflow-y-scroll overflow-x-hidden scrollbar-hide">
        <div className="animate-fade-in flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="font-extrabold text-5xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="transform hover:scale-100 transition-transform duration-300">
              <ChangeProfilePicture />
            </div>
            </div>

          {/* Personal Details Section */}
          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-2 sm:p-8 border border-white/20 animate-slide-up"
            style={{
              animationDelay: '0.2s',
              backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              borderColor: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2
                className="text-3xl font-bold text-gray-800 relative"
                style={{
                  color: darkMode ? '#f9fafb' : '#1f2937'
                }}
              >
                Personal Details
                <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </h2>
            </div>

            <div className="space-y-6 ">
              <div
                className="grid sm:grid-cols-2 grid-cols-1 gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors duration-300"
                style={{
                  background: darkMode
                    ? 'linear-gradient(to right, #1e3a8a, #3730a3)'
                    : 'linear-gradient(to right, #eff6ff, #eef2ff)'
                }}
              >
                <div className="space-y-1">
                  <p
                    className="text-gray-500 text-sm font-medium uppercase tracking-wider"
                    style={{
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    First Name
                  </p>
                  <p
                    className="text-gray-800 font-semibold text-lg"
                    style={{
                      color: darkMode ? '#f9fafb' : '#1f2937'
                    }}
                  >
                    {user?.firstName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p
                    className="text-gray-500 text-sm font-medium uppercase tracking-wider"
                    style={{
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    Last Name
                  </p>
                  <p
                    className="text-gray-800 font-semibold text-lg"
                    style={{
                      color: darkMode ? '#f9fafb' : '#1f2937'
                    }}
                  >
                    {user?.lastName}
                  </p>
                </div>
              </div>

              <div
                className="grid grid-cols-1 gap-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors duration-300"
                style={{
                  background: darkMode
                    ? 'linear-gradient(to right, #581c87, #be185d)'
                    : 'linear-gradient(to right, #fdf4ff, #fdf2f8)'
                }}
              >
                <div className="space-y-1 ">
                  <p
                    className="text-gray-500 text-sm font-medium uppercase tracking-wider"
                    style={{
                      color: darkMode ? '#9ca3af' : '#6b7280'
                    }}
                  >
                    Email
                  </p>
                  <p
                    className="text-gray-800 font-semibold text-lg break-all "
                    style={{
                      color: darkMode ? '#f9fafb' : '#1f2937'
                    }}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information for Students */}
          {user?.accountType == "Student" && (
            <div
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border border-white/20 animate-slide-up"
              style={{
                animationDelay: '0.3s',
                backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2
                  className="text-3xl font-bold text-gray-800 relative"
                  style={{
                    color: darkMode ? '#f9fafb' : '#1f2937'
                  }}
                >
                  Academic Information
                  <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
                </h2>
              </div>

              <div className="space-y-6">
                <div 
                  className="grid md:grid-cols-4 grid-cols-2 gap-6 p-6 rounded-xl transition-colors duration-300"
                  style={{
                    background: darkMode
                      ? 'linear-gradient(to right, #064e3b, #065f46)'
                      : 'linear-gradient(to right, #f0fdf4, #ecfdf5)'
                  }}
                >
                  <div className="space-y-1">
                    <p 
                      className="text-sm font-medium uppercase tracking-wider"
                      style={{
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      Semester
                    </p>
                    <p 
                      className="font-semibold text-lg"
                      style={{
                        color: darkMode ? '#f9fafb' : '#1f2937'
                      }}
                    >
                      {user?.semester}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p 
                      className="text-sm font-medium uppercase tracking-wider"
                      style={{
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      Branch
                    </p>
                    <p 
                      className="font-semibold text-lg"
                      style={{
                        color: darkMode ? '#f9fafb' : '#1f2937'
                      }}
                    >
                      {user?.branch}
                    </p>
                  </div>
                </div>

                <div 
                  className="grid md:grid-cols-4 grid-cols-3 gap-6 p-6 rounded-xl transition-colors duration-300"
                  style={{
                    background: darkMode
                      ? 'linear-gradient(to right, #0c4a6e, #0369a1)'
                      : 'linear-gradient(to right, #f0f9ff, #e0f2fe)'
                  }}
                >
                  <div className="space-y-1">
                    <p 
                      className="text-sm font-medium uppercase tracking-wider"
                      style={{
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      Roll Number
                    </p>
                    <p 
                      className="font-semibold text-lg"
                      style={{
                        color: darkMode ? '#f9fafb' : '#1f2937'
                      }}
                    >
                      {user?.rollNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Information for Instructors */}
          {user?.accountType == "Instructor" && (
            <div 
              className="backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 border animate-slide-up" 
              style={{ 
                animationDelay: '0.3s',
                backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 
                  className="text-3xl font-bold relative"
                  style={{
                    color: darkMode ? '#f9fafb' : '#1f2937'
                  }}
                >
                  Academic Information
                  <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                </h2>
              </div>

              <div className="space-y-6">
                <div 
                  className="grid md:grid-cols-4 grid-cols-2 gap-6 p-6 rounded-xl transition-colors duration-300"
                  style={{
                    background: darkMode
                      ? 'linear-gradient(to right, #7c2d12, #dc2626)'
                      : 'linear-gradient(to right, #fff7ed, #fef2f2)'
                  }}
                >
                  <div className="space-y-1">
                    <p 
                      className="text-sm font-medium uppercase tracking-wider"
                      style={{
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      Department
                    </p>
                    <p 
                      className="font-semibold text-lg"
                      style={{
                        color: darkMode ? '#f9fafb' : '#1f2937'
                      }}
                    >
                      {user?.department}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p 
                      className="text-sm font-medium uppercase tracking-wider"
                      style={{
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      Role
                    </p>
                    <p 
                      className="font-semibold text-lg"
                      style={{
                        color: darkMode ? '#f9fafb' : '#1f2937'
                      }}
                    >
                      {user?.accountType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
