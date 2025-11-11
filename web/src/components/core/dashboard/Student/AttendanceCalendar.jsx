import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getDetailedAttendanceBySubject } from "../../../../services/opretions/Subject";
import { toast } from "react-hot-toast";

const AttendanceCalendar = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const themeState = useSelector((state) => state.theme);
  const darkMode = themeState?.darkMode || false;

  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch detailed attendance data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDetailedAttendanceBySubject(token, subjectId);
        setAttendanceData(data);
      } catch (error) {
        console.error("Error fetching detailed attendance:", error);
        toast.error("Failed to load attendance details");
      } finally {
        setLoading(false);
      }
    };

    if (subjectId && token) {
      fetchData();
    }
  }, [subjectId, token]);

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    // Use local date to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getAttendanceForDate = (date) => {
    if (!attendanceData?.attendanceRecords) return null;
    
    const dateStr = formatDate(date);
    return attendanceData.attendanceRecords.find(record => {
      const recordDate = new Date(record.date);
      return formatDate(recordDate) === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <div 
        className="flex justify-center items-center h-screen"
        style={{ backgroundColor: darkMode ? '#111827' : '#f3f4f6' }}
      >
        <p style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>
          Loading attendance calendar...
        </p>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div 
        className="flex justify-center items-center h-screen"
        style={{ backgroundColor: darkMode ? '#111827' : '#f3f4f6' }}
      >
        <p className="text-red-500">Failed to load attendance data</p>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  
  // Create today's date without time to avoid timezone issues
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div 
      className="max-w-4xl mx-auto p-6"
      style={{ backgroundColor: darkMode ? '#111827' : '#ffffff' }}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          style={{ color: darkMode ? '#60a5fa' : '#2563eb' }}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        
        <h1 
          className="lg:text-2xl sm:text-xl  font-bold"
          style={{ color: darkMode ? '#f9fafb' : '#1f2937' }}
        >
          {attendanceData.subject.name} - Attendance Calendar
        </h1>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div 
          className="p-4 rounded-lg shadow"
          style={{ backgroundColor: darkMode ? '#1f2937' : '#e5e7eb' }}
        >
          <p 
            className="text-sm"
            style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
          >
            Total Classes
          </p>
          <p 
            className="text-2xl font-bold"
            style={{ color: darkMode ? '#f9fafb' : '#1f2937' }}
          >
            {attendanceData.statistics.totalClasses}
          </p>
        </div>
        
        <div 
          className="p-4 rounded-lg shadow"
          style={{ backgroundColor: darkMode ? '#1f2937' : '#e5e7eb' }}
        >
          <p 
            className="text-sm"
            style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
          >
            Present
          </p>
          <p 
            className="text-2xl font-bold text-green-600"
          >
            {attendanceData.statistics.presentCount}
          </p>
        </div>
        
        <div 
          className="p-4 rounded-lg shadow"
          style={{ backgroundColor: darkMode ? '#1f2937' : '#e5e7eb' }}
        >
          <p 
            className="text-sm"
            style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
          >
            Absent
          </p>
          <p 
            className="text-2xl font-bold text-red-600"
          >
            {attendanceData.statistics.absentCount}
          </p>
        </div>
        
        <div 
          className="p-4 rounded-lg shadow"
          style={{ backgroundColor: darkMode ? '#1f2937' : '#e5e7eb' }}
        >
          <p 
            className="text-sm"
            style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
          >
            Percentage
          </p>
          <p 
            className={`text-2xl font-bold ${
              parseFloat(attendanceData.statistics.attendancePercentage) >= 75 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}
          >
            {attendanceData.statistics.attendancePercentage}%
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div 
        className="rounded-lg shadow-lg overflow-hidden"
        style={{ backgroundColor: darkMode ? '#1f2937' : '#ffffff' }}
      >
        {/* Calendar Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}
        >
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-300 rounded-full transition-colors"
            style={{ 
              backgroundColor: darkMode ? '#4b5563' : 'transparent',
              color: darkMode ? '#f9fafb' : '#1f2937'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 
            className="text-xl font-semibold"
            style={{ color: darkMode ? '#f9fafb' : '#1f2937' }}
          >
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-300 rounded-full transition-colors"
            style={{ 
              backgroundColor: darkMode ? '#4b5563' : 'transparent',
              color: darkMode ? '#f9fafb' : '#1f2937'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-3 text-center font-semibold border-b"
              style={{ 
                color: darkMode ? '#9ca3af' : '#6b7280',
                borderColor: darkMode ? '#4b5563' : '#e5e7eb'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="h-20 border-b border-r"
              style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}
            />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            currentDate.setHours(0, 0, 0, 0); // Normalize time to avoid timezone issues
            const attendance = getAttendanceForDate(currentDate);
            const isToday = formatDate(currentDate) === formatDate(today);

            return (
              <div
                key={day}
                className={`h-20 border-2 p-2 relative ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ 
                  borderColor: darkMode ? '#4b5563' : '#e5e7eb',
                  backgroundColor: attendance 
                    ? attendance.isPresent 
                      ? darkMode ? '#065f46' : '#dcfce7'  // Green for present
                      : darkMode ? '#7f1d1d' : '#fef2f2'  // Red for absent
                    : darkMode ? '#1f2937' : '#ffffff'    // Default
                }}
              >
                <div 
                  className="font-semibold"
                  style={{ color: darkMode ? '#f9fafb' : '#1f2937' }}
                >
                  {day}
                </div>
                
                {attendance && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div
                      className={`text-xs text-center py-1 rounded ${
                        attendance.isPresent
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {attendance.status}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 border border-green-400 rounded mr-2"></div>
          <span style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>Present</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-200 border border-red-400 rounded mr-2"></div>
          <span style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>Absent</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded mr-2"></div>
          <span style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>No Class</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;