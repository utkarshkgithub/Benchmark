import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  deleteSubject,
  fetchAllStudents,
  fetchAllSubjects
} from "../../../../services/opretions/Subject";
import { deleteStudent } from "../../../../services/opretions/Settings";
import AddLocation from './AddLocation';

const Admin = () => {
  const { token } = useSelector((state) => state.auth);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subjectSortField, setSubjectSortField] = useState(null);
  const [subjectSortOrder, setSubjectSortOrder] = useState("asc");
  const [studentSortField, setStudentSortField] = useState(null);
  const [studentSortOrder, setStudentSortOrder] = useState("asc");
  const [showAddLocation, setShowAddLocation] = useState(false);
  
  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  const navigate = useNavigate();

  const fetcheSubject = async () => {
    setLoading(true);
    try {
      const res = await fetchAllSubjects();
      setSubjects(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to fetch subjects");
    }
    setLoading(false);
  };

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await fetchAllStudents();
      setStudents(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to fetch students");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetcheSubject();
    fetchStudent();
  }, []);

  useEffect(() => {
    const filtered = subjects.filter((subject) =>
      subject.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [subjects, searchTerm]);

  const handleAddSubject = () => {
    navigate("/dashboard/create-subject");
  };

  const handleSaveLocation = (location) => {
    // For now we'll just log and show a toast. Replace with API call as needed.
    console.log("Saved location:", location);
    toast.success("Location saved");
    setShowAddLocation(false);
  };

  const handleDeleteSubject = async (subjectId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this subject?");
    if (!confirmDelete) return;

    try {
      await deleteSubject(subjectId, token);
      toast.success("Subject deleted successfully");
      fetcheSubject();
    } catch (error) {
      toast.error("Failed to delete subject");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      await deleteStudent(studentId, token);
      toast.success("Student deleted successfully");
      fetchStudent();
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };

  const getFieldValue = (obj, field) => {
    if (!field.includes(".")) return obj[field];
    const keys = field.split(".");
    let value = obj;
    for (let key of keys) {
      value = value ? value[key] : "";
    }
    return value || "";
  };

  const sortData = (data, field, order) => {
    if (!field) return data;
    return [...data].sort((a, b) => {
      let aField = getFieldValue(a, field);
      let bField = getFieldValue(b, field);
      if (typeof aField === "string") aField = aField.toLowerCase();
      if (typeof bField === "string") bField = bField.toLowerCase();
      if (aField < bField) return order === "asc" ? -1 : 1;
      if (aField > bField) return order === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortSubjects = () => {
    return sortData(filteredSubjects, subjectSortField, subjectSortOrder);
  };

  const sortStudents = () => {
    return sortData(students, studentSortField, studentSortOrder);
  };

  const handleSubjectSort = (field) => {
    if (subjectSortField === field) {
      setSubjectSortOrder(subjectSortOrder === "asc" ? "desc" : "asc");
    } else {
      setSubjectSortField(field);
      setSubjectSortOrder("asc");
    }
  };

  const handleStudentSort = (field) => {
    if (studentSortField === field) {
      setStudentSortOrder(studentSortOrder === "asc" ? "desc" : "asc");
    } else {
      setStudentSortField(field);
      setStudentSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" style={{
        background: darkMode 
          ? 'linear-gradient(to bottom right, #111827, #1f2937, #374151)' 
          : 'linear-gradient(to bottom right, #f8fafc, #eff6ff, #faf5ff)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium" style={{
            color: darkMode ? '#d1d5db' : '#6b7280'
          }}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen" style={{
        background: darkMode 
          ? 'linear-gradient(to bottom right, #111827, #1f2937, #374151)' 
          : 'linear-gradient(to bottom right, #f8fafc, #eff6ff, #faf5ff)'
      }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{
      background: darkMode 
        ? 'linear-gradient(to bottom right, #111827, #1f2937, #374151)' 
        : 'linear-gradient(to bottom right, #f8fafc, #eff6ff, #faf5ff)'
    }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header with Animation */}
        <div className="animate-fade-in">
          <div className="backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 mb-8 border" style={{
            backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-extrabold text-4xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4"></div>
                <p className="text-2xl font-semibold" style={{
                  color: darkMode ? '#d1d5db' : '#374151'
                }}>
                  Manage Subjects & Students
                </p>
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 bg-clip-text text-transparent">
                    {subjects.length + students.length}
                  </div>
                  <div className="text-sm font-medium" style={{
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}>Total Records</div>
                </div>
              </div>
            </div>
          </div>
        </div>

       

        {/* Subjects Management Section */}
        <div className="backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border animate-slide-up" 
             style={{ 
               animationDelay: '0.2s',
               backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
               borderColor: darkMode ? '#374151' : 'rgba(255, 255, 255, 0.2)'
             }}>
          <div className="px-8 py-6 border-b" style={{
            backgroundColor: darkMode ? '#374151' : '#f9fafb',
            borderColor: darkMode ? '#4b5563' : '#e5e7eb'
          }}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold relative" style={{
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Manage Subjects
                  <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </h2>
                <p className="text-sm mt-3 font-medium" style={{
                  color: darkMode ? '#d1d5db' : '#6b7280'
                }}>
                  {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={handleAddSubject} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                  + Add Subject
                </button>
                <button onClick={() => setShowAddLocation(true)} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105">
                  + Add Location
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <input
              type="text"
              placeholder="🔍 Search by subject code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 shadow-sm"
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#ffffff' : '#1f2937'
              }}
            />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{
                  backgroundColor: darkMode ? '#374151' : '#f8fafc'
                }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>
                      Subject Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer" 
                        onClick={() => handleSubjectSort("subjectCode")}
                        style={{
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}>
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}>
                      Instructor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer" 
                        onClick={() => handleSubjectSort("semester")}
                        style={{
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}>
                      Semester
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                        style={{
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}>
                      Branch
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider"
                        style={{
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{
                  borderColor: darkMode ? '#374151' : '#e5e7eb'
                }}>
                  {sortSubjects().map((subject) => (
                    <tr key={subject._id} 
                        className="transition-all duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold" style={{
                        color: darkMode ? '#ffffff' : '#1f2937'
                      }}>{subject.subjectName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{
                        color: darkMode ? '#d1d5db' : '#6b7280'
                      }}>{subject.subjectCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{
                        color: darkMode ? '#d1d5db' : '#6b7280'
                      }}>{subject.instructor?.firstName} {subject.instructor?.lastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{
                        color: darkMode ? '#d1d5db' : '#6b7280'
                      }}>{subject.semester}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{
                        color: darkMode ? '#d1d5db' : '#6b7280'
                      }}>{subject.branches?.join(", ")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button className="text-blue-600 hover:text-blue-900 mr-4 px-3 py-1 rounded transition-colors">Edit</button>
                        <button className="text-red-600 hover:text-red-900 px-3 py-1 rounded transition-colors" onClick={() => handleDeleteSubject(subject._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Students Management Section */}
        <div className="backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border animate-slide-up" 
             style={{ 
               animationDelay: '0.3s',
               backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
               borderColor: darkMode ? '#374151' : 'rgba(255, 255, 255, 0.2)'
             }}>
          <div className="px-8 py-6 border-b" style={{
            backgroundColor: darkMode ? '#374151' : '#f9fafb',
            borderColor: darkMode ? '#4b5563' : '#e5e7eb'
          }}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold relative" style={{
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}>
                  Manage Students
                  <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </h2>
                <p className="text-sm mt-3 font-medium" style={{
                  color: darkMode ? '#d1d5db' : '#6b7280'
                }}>
                  {students.length} student{students.length !== 1 ? 's' : ''} registered
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{
                backgroundColor: darkMode ? '#374151' : '#f8fafc'
              }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer" 
                      onClick={() => handleStudentSort("userId.firstName")}
                      style={{
                        color: darkMode ? '#d1d5db' : '#374151'
                      }}>
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer" 
                      onClick={() => handleStudentSort("rollNumber")}
                      style={{
                        color: darkMode ? '#d1d5db' : '#374151'
                      }}>
                    Roll Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer" 
                      onClick={() => handleStudentSort("branch")}
                      style={{
                        color: darkMode ? '#d1d5db' : '#374151'
                      }}>
                    Branch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer" 
                      onClick={() => handleStudentSort("semester")}
                      style={{
                        color: darkMode ? '#d1d5db' : '#374151'
                      }}>
                    Semester
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider"
                      style={{
                        color: darkMode ? '#d1d5db' : '#374151'
                      }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{
                borderColor: darkMode ? '#374151' : '#e5e7eb'
              }}>
                {sortStudents().map((student) => (
                  <tr key={student._id}
                      className="transition-all duration-300"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{
                      color: darkMode ? '#ffffff' : '#1f2937'
                    }}>
                      {student.userId?.firstName} {student.userId?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{
                      color: darkMode ? '#d1d5db' : '#6b7280'
                    }}>
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{
                      color: darkMode ? '#d1d5db' : '#6b7280'
                    }}>
                      {student.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{
                      color: darkMode ? '#d1d5db' : '#6b7280'
                    }}>
                      {student.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <button className="text-red-600 hover:text-red-900 px-3 py-1 rounded transition-colors" onClick={() => handleDeleteStudent(student._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add CSS animations */}
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
      `}</style>
      {showAddLocation && (
        <AddLocation
          onClose={() => setShowAddLocation(false)}
          onSave={handleSaveLocation}
        />
      )}
    </div>
  );
};

export default Admin;
