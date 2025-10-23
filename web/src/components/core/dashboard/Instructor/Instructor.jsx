import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { subjectEndPoints } from "../../../../services/api";
import { apiConnector } from "../../../../services/apiconnector";

const Instructor = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  // ✅ Fetch instructor subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await apiConnector("GET", subjectEndPoints.FETCH_SUBJECTS_BY_INSTRUCTOR, null, {
          Authorization: `Bearer ${token}`,
        });
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      }
    };
    fetchSubjects();
  }, [token]);

  // ✅ Fetch attendance of selected subject
  useEffect(() => {
    if (!selectedSubject) return;
    const fetchAttendance = async () => {
      try {
        const res = await apiConnector(
          "GET",
          `${subjectEndPoints.FETCH_ATTENDANCE_BY_SUBJECT}/${selectedSubject}`,
          null,
          { Authorization: `Bearer ${token}` }
        );
        // console.log("res:-",res)
        setAttendanceRecords(res.data.attendance || []);
        setFilteredRecords(res.data.attendance || []);
      } catch (err) {
        console.error("Failed to fetch attendance", err);
      }
    };
    fetchAttendance();
  }, [selectedSubject, token]);

  // ✅ Search filter by date
  useEffect(() => {
    if (!searchDate) {
      setFilteredRecords(attendanceRecords);
    } else {
      setFilteredRecords(
        attendanceRecords.filter((rec) =>
          rec.date.startsWith(searchDate)
        )
      );
    }
  }, [searchDate, attendanceRecords]);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 min-w-[calc(100vw-100px)]"
      style={{
        background: darkMode 
          ? 'linear-gradient(to bottom right, #0f172a, #111827, #581c87)'
          : 'linear-gradient(to bottom right, #eff6ff, #ffffff, #fdf4ff)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with Animation */}
        <div className="animate-fade-in">
          <div 
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 mb-8 border border-white/20"
            style={{
              backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-extrabold text-4xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 bg-clip-text text-transparent mb-2">
                  Instructor Dashboard
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4"></div>
                <p 
                  className="text-2xl text-gray-700 font-semibold"
                  style={{
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}
                >
                  Welcome, <span className="text-blue-600">{user.firstName.toUpperCase()}</span>{" "}
                  <span className="text-purple-600">{user.lastName.toUpperCase()}</span>
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg transform hover:scale-110 transition-transform duration-300">
                  {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Card with Animation */}
        <div 
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 mb-8 border border-white/20 animate-slide-up" 
          style={{
            animationDelay: '0.1s',
            backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(255, 255, 255, 0.2)'
          }}
        >
          <h2 
            className="text-2xl font-bold text-gray-800 mb-6 relative"
            style={{
              color: darkMode ? '#f9fafb' : '#1f2937'
            }}
          >
            Search & Filter
            <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Subject Dropdown */}
            <div className="space-y-3 transform hover:scale-105 transition-transform duration-300">
              <label className="block text-sm font-bold mb-2 uppercase tracking-wider" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>
                Select Subject
              </label>
              <div className="relative group">
                <select
                  className="w-full appearance-none border-2 rounded-xl px-6 py-4 pr-12 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#f8fafc',
                    borderColor: darkMode ? '#4b5563' : '#e2e8f0',
                    color: darkMode ? '#ffffff' : '#374151'
                  }}
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">-- Choose a Subject --</option>
                  {subjects.map((subj) => (
                    <option key={subj._id} value={subj._id}>
                      {subj.subjectName} ({subj.subjectCode})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none group-hover:text-blue-500 transition-colors duration-200">
                  <svg className="w-6 h-6" style={{
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Search */}
            <div className="space-y-3 transform hover:scale-105 transition-transform duration-300">
              <label className="block text-sm font-bold mb-2 uppercase tracking-wider" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>
                Search by Date
              </label>
              <div className="relative group">
                <input
                  type="date"
                  className="w-full border-2 rounded-xl px-6 py-4 pr-12 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#fdf2f8',
                    borderColor: darkMode ? '#4b5563' : '#e2e8f0',
                    color: darkMode ? '#ffffff' : '#374151'
                  }}
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none group-hover:text-purple-500 transition-colors duration-200">
                  <svg className="w-6 h-6" style={{
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table Card with Animation */}
        <div className="backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border animate-slide-up" 
             style={{ 
               animationDelay: '0.2s',
               backgroundColor: darkMode ? '#1f2937' : 'rgba(255, 255, 255, 0.9)',
               borderColor: darkMode ? '#374151' : 'rgba(255, 255, 255, 0.2)'
             }}>
          <div className="px-8 py-6 border-b" style={{
            backgroundColor: darkMode ? '#374151' : '#f9fafb',
            borderColor: darkMode ? '#4b5563' : '#e5e7eb'
          }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold relative" style={{
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Attendance Records
                  <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                </h3>
                <p className="text-sm mt-3 font-medium" style={{
                  color: darkMode ? '#d1d5db' : '#6b7280'
                }}>
                  {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="hidden md:block">
                <div className="px-6 py-3 rounded-xl" style={{
                  backgroundColor: darkMode ? '#374151' : '#fed7d7'
                }}>
                  <div className="text-2xl font-bold text-orange-600">{filteredRecords.length}</div>
                  <div className="text-xs uppercase tracking-wider" style={{
                    color: darkMode ? '#d1d5db' : '#6b7280'
                  }}>Total Records</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{
                backgroundColor: darkMode ? '#374151' : '#f8fafc'
              }}>
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider border-b" style={{
                    color: darkMode ? '#d1d5db' : '#374151',
                    borderColor: darkMode ? '#4b5563' : '#e5e7eb'
                  }}>
                    Date
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider border-b" style={{
                    color: darkMode ? '#d1d5db' : '#374151',
                    borderColor: darkMode ? '#4b5563' : '#e5e7eb'
                  }}>
                    Branch
                  </th>
                  <th className="px-8 py-5 text-center text-xs font-bold uppercase tracking-wider border-b" style={{
                    color: darkMode ? '#d1d5db' : '#374151',
                    borderColor: darkMode ? '#4b5563' : '#e5e7eb'
                  }}>
                    Total Students
                  </th>
                  <th className="px-8 py-5 text-center text-xs font-bold uppercase tracking-wider border-b" style={{
                    color: darkMode ? '#d1d5db' : '#374151',
                    borderColor: darkMode ? '#4b5563' : '#e5e7eb'
                  }}>
                    Present Students
                  </th>
                  <th className="px-8 py-5 text-center text-xs font-bold uppercase tracking-wider border-b" style={{
                    color: darkMode ? '#d1d5db' : '#374151',
                    borderColor: darkMode ? '#4b5563' : '#e5e7eb'
                  }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{
                borderColor: darkMode ? '#374151' : '#e5e7eb'
              }}>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec, index) => (
                    <React.Fragment key={rec._id}>
                      <tr className="hover:bg-gradient-to-r transition-all duration-300 animate-fade-in-row" 
                          style={{ 
                            animationDelay: `${0.3 + index * 0.1}s`,
                            backgroundColor: darkMode ? 'transparent' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center group">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-4 group-hover:scale-125 transition-transform duration-200"></div>
                            <span className="text-sm font-semibold" style={{
                              color: darkMode ? '#ffffff' : '#1f2937'
                            }}>
                              {rec.date.split("T")[0]}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 hover:from-purple-200 hover:to-pink-200 transition-colors duration-200">
                            {rec.branch}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full" style={{
                            backgroundColor: darkMode ? '#374151' : '#f3f4f6'
                          }}>
                            <span className="text-lg font-bold" style={{
                              color: darkMode ? '#ffffff' : '#1f2937'
                            }}>
                              {rec.totalStudents}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                              <span className="text-lg font-bold text-green-800">
                                {rec.presentStudent.length}
                              </span>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-green-600">
                                {Math.round((rec.presentStudent.length / rec.totalStudents) * 100)}%
                              </div>
                              <div className="text-xs text-gray-500">attendance</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-center">
                          <button
                            className={`inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                              expandedRow === index
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                            }`}
                            onClick={() =>
                              setExpandedRow(expandedRow === index ? null : index)
                            }
                          >
                            {expandedRow === index ? (
                              <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                Hide Students
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Show Students
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedRow === index && (
                        <tr className="animate-expand-row">
                          <td colSpan="5" className="px-8 py-6 bg-gradient-to-r from-blue-25 to-purple-25">
                            <div 
                              style={{
                                backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                borderColor: darkMode ? '#4b5563' : '#d1d5db'
                              }}
                              className="backdrop-blur-sm rounded-xl p-6 border shadow-lg"
                            >
                              <h4 
                                style={{
                                  color: darkMode ? '#e5e7eb' : '#1f2937'
                                }}
                                className="text-lg font-bold mb-4 flex items-center"
                              >
                                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-3">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                Present Students ({rec.presentStudent.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {rec.presentStudent.map((stu, stuIndex) => (
                                  <div 
                                    key={stu.studentId || stu._id} 
                                    style={{
                                      background: darkMode 
                                        ? 'linear-gradient(to right, rgba(75, 85, 99, 0.6), rgba(55, 65, 81, 0.6))'
                                        : 'linear-gradient(to right, rgba(249, 250, 251, 1), rgba(243, 244, 246, 1))',
                                      borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                      animationDelay: `${stuIndex * 0.1}s`
                                    }}
                                    className="flex items-center p-4 rounded-xl border hover:border-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-md animate-fade-in-student"
                                  >
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4 shadow-md">
                                      {(stu.name ? stu.name.charAt(0) : stu.firstName.charAt(0)).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p 
                                        style={{
                                          color: darkMode ? '#e5e7eb' : '#111827'
                                        }}
                                        className="text-sm font-semibold truncate"
                                      >
                                        {stu.name || `${stu.firstName} ${stu.lastName}`}
                                      </p>
                                      <p 
                                        style={{
                                          color: darkMode ? '#9ca3af' : '#4b5563'
                                        }}
                                        className="text-xs truncate"
                                      >
                                        {stu.email}
                                      </p>
                                      {stu.markedAt && (
                                        <p className="text-xs text-blue-600 font-medium mt-1">
                                          Marked: {new Date(stu.markedAt).toLocaleTimeString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 animate-pulse">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 
                          style={{
                            color: darkMode ? '#e5e7eb' : '#111827'
                          }}
                          className="text-2xl font-bold mb-2"
                        >
                          No attendance records found
                        </h3>
                        <p 
                          style={{
                            color: darkMode ? '#9ca3af' : '#4b5563'
                          }}
                          className="text-lg"
                        >
                          {selectedSubject ? 'Try selecting a different date or subject.' : 'Please select a subject to view attendance records.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

        @keyframes fade-in-row {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes expand-row {
          from {
            opacity: 0;
            max-height: 0;
            transform: scaleY(0);
          }
          to {
            opacity: 1;
            max-height: 1000px;
            transform: scaleY(1);
          }
        }

        @keyframes fade-in-student {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-fade-in-row {
          opacity: 0;
          animation: fade-in-row 0.6s ease-out forwards;
        }

        .animate-expand-row {
          animation: expand-row 0.4s ease-out forwards;
          transform-origin: top;
        }

        .animate-fade-in-student {
          opacity: 0;
          animation: fade-in-student 0.4s ease-out forwards;
        }

        /* Custom gradient backgrounds */
        .from-blue-25 { --tw-gradient-from: rgba(239, 246, 255, 0.5); }
        .to-purple-25 { --tw-gradient-to: rgba(250, 245, 255, 0.5); }
      `}</style>
    </div>
  );
};

export default Instructor;