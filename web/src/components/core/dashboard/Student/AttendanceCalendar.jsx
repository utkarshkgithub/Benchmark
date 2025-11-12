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
  
  // Modal state for day details - moved here to follow Rules of Hooks
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openDayModal = (record, date) => {
    setSelectedRecord({ record, date });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

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

  const getAttendanceForDate = (date) => {
    if (!attendanceData?.attendanceRecords) return null;
    
    const dateStr = formatDate(date);
    // Match by local date components to avoid timezone shifts (createdAt may be in UTC)
    return attendanceData.attendanceRecords.find((record) => {
      const raw = record.date || record.timestamp || record.classDate || record.createdAt || record;
      const recordDate = new Date(raw);
      // normalize to local date components
      const y = recordDate.getFullYear();
      const m = String(recordDate.getMonth() + 1).padStart(2, '0');
      const d = String(recordDate.getDate()).padStart(2, '0');
      const recDateStr = `${y}-${m}-${d}`;
      return recDateStr === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
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
  // We'll render 6 weeks (42 cells) for consistent UI
  const totalCells = 42;
  
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-300 rounded-full transition-colors"
              style={{ 
                backgroundColor: darkMode ? '#4b5563' : 'transparent',
                color: darkMode ? '#f9fafb' : '#1f2937'
              }}
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToToday}
              className="px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              style={{
                backgroundColor: darkMode ? '#4b5563' : 'transparent',
                color: darkMode ? '#f9fafb' : '#1f2937'
              }}
            >
              Today
            </button>
          </div>

          <h2 
            className="text-xl font-semibold"
            style={{ color: darkMode ? '#f9fafb' : '#1f2937' }}
          >
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-300 rounded-full transition-colors"
              style={{ 
                backgroundColor: darkMode ? '#4b5563' : 'transparent',
                color: darkMode ? '#f9fafb' : '#1f2937'
              }}
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
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

        {/* Calendar Grid (6 weeks) */}
        <div className="grid grid-cols-7">
          {Array.from({ length: totalCells }).map((_, cellIndex) => {
            const dateNumber = cellIndex - firstDay + 1;
            const isInMonth = dateNumber >= 1 && dateNumber <= daysInMonth;

            if (!isInMonth) {
              return (
                <div
                  key={`empty-${cellIndex}`}
                  className="h-20 border-b border-r"
                  style={{ borderColor: darkMode ? '#4b5563' : '#e5e7eb' }}
                />
              );
            }

            const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dateNumber);
            currentDate.setHours(0, 0, 0, 0);
            const attendance = getAttendanceForDate(currentDate);
            const isToday = formatDate(currentDate) === formatDate(today);

            return (
              <button
                key={cellIndex}
                onClick={() => openDayModal(attendance, currentDate)}
                className={`h-20 border-r border-t p-2 relative text-left hover:shadow-inner transition-colors focus:outline-none ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{
                  borderColor: darkMode ? '#4b5563' : '#e5e7eb',
                  backgroundColor: attendance 
                    ? attendance.isPresent 
                      ? (darkMode ? '#065f46' : '#dcfce7')  // Green for present
                      : (darkMode ? '#7f1d1d' : '#fef2f2')  // Red for absent
                    : (darkMode ? '#1f2937' : '#ffffff')    // Default
                }}
                aria-label={
                  attendance
                    ? `${formatDate(currentDate)} - ${attendance.status}`
                    : `${formatDate(currentDate)} - No class`
                }
              >
                <div 
                  className="font-semibold"
                  style={{ color: darkMode ? '#f9fafb' : '#1f2937' }}
                >
                  {dateNumber}
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className={`max-w-md w-full p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">{selectedRecord?.date ? selectedRecord.date.toDateString() : 'Day details'}</h3>
              <button onClick={closeModal} className="text-sm px-2 py-1 rounded hover:bg-gray-200">Close</button>
            </div>

            {selectedRecord?.record ? (
              <div className="space-y-2">
                <p><strong>Status:</strong> {selectedRecord.record.isPresent ? 'Present' : 'Absent'}</p>
                <p><strong>Total Present in class:</strong> {selectedRecord.record.totalPresent ?? '-'}</p>
                <p><strong>Class ID:</strong> {selectedRecord.record.classId ?? '-'}</p>
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">No class or attendance recorded for this day.</div>
            )}
          </div>
        </div>
      )}

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