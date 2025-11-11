import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchStudentAttendance } from "../../../../services/opretions/Subject";

const Student = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  // Fetch attendance
  const getAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetchStudentAttendance(token);
      setAttendance(res?.data?.attendance || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Failed to fetch attendance");
    }
    setLoading(false);
  };

  useEffect(() => {
    getAttendance();
  }, []);

  useEffect(() => {
    const filtered = attendance.filter((record) =>
      record.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAttendance(filtered);
  }, [attendance, searchTerm]);

  // Handle card click to navigate to calendar view
  const handleCardClick = (subjectId, subjectName) => {
    navigate(`/dashboard/student/attendance/${subjectId}`, {
      state: { subjectName }
    });
  };

  if (loading) {
    return (
      <div 
        className="flex justify-center items-center h-screen w-full bg-gray-100"
        style={{
          backgroundColor: darkMode ? '#111827' : '#f3f4f6'
        }}
      >
        <p 
          className="text-gray-600 text-lg"
          style={{
            color: darkMode ? '#d1d5db' : '#4b5563'
          }}
        >
          Loading attendance...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex justify-center items-center h-screen bg-gray-100"
        style={{
          backgroundColor: darkMode ? '#111827' : '#f3f4f6'
        }}
      >
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div 
      className="max-h-[calc(100vh-70px)] flex  items-center justify-center overflow-hidden "
      style={{
        backgroundColor: darkMode ? '#111827' : 'transparent'
      }}
    >
      <div className=" flex flex-col w-10/12 mt-10">
      <div className="flex justify-between">
                <div className="flex justify-between items-center mb-6">
          <h1 
            className="text-2xl font-bold text-gray-800"
            style={{
              color: darkMode ? '#f9fafb' : '#1f2937'
            }}
          >
            Welcome {user.firstName} {user.lastName} 
          </h1>
        </div>

        {/* Search bar */}
        <div className="mb-6 ml-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by subject name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                color: darkMode ? '#f9fafb' : '#111827',
                borderColor: darkMode ? '#4b5563' : '#d1d5db'
              }}
            />
            
          </div>
        </div>
      </div>

        {/* Attendance Cards */}
        {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 grid-cols-1"> */}
        <div className="flex flex-col gap-5 max-w-[90%] m-auto min-w-[70%] mt-5">
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((record, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(record.subjectId, record.subjectName)}
                className="bg-gray-200 rounded-2xl shadow-lg p-6 flex flex-col items-start transition hover:shadow-xl cursor-pointer transform hover:scale-105"
                style={{
                  backgroundColor: darkMode ? '#1f2937' : '#e5e7eb'
                }}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <h2 
                    className="text-lg font-bold text-gray-800"
                    style={{
                      color: darkMode ? '#f9fafb' : '#1f2937'
                    }}
                  >
                    {record.subjectName}
                  </h2>
                  <svg 
                    className="w-5 h-5 text-blue-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p 
                  className="text-sm text-gray-500 mb-2"
                  style={{
                    color: darkMode ? '#9ca3af' : '#6b7280'
                  }}
                >
                  Total Classes: {record.totalClasses}
                </p>
                <p 
                  className="text-xs text-blue-500 mb-2"
                >
                  Click to view attendance calendar →
                </p>

                <div className="w-full flex justify-between items-center">
                  <div>
                    <p 
                      className="text-gray-600 text-sm"
                      style={{
                        color: darkMode ? '#d1d5db' : '#4b5563'
                      }}
                    >
                      Present
                    </p>
                    <p 
                      className="text-lg font-semibold"
                      style={{
                        color: darkMode ? '#f9fafb' : '#111827'
                      }}
                    >
                      {record.presentCount}
                    </p>
                  </div>

                  <div>
                    <p 
                      className="text-gray-600 text-sm"
                      style={{
                        color: darkMode ? '#d1d5db' : '#4b5563'
                      }}
                    >
                      Attendance
                    </p>
                    <span
                      className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                        parseFloat(record.percentage) >= 75
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {record.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div 
              className="col-span-full text-center text-gray-500"
              style={{
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}
            >
              No attendance data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Student;
