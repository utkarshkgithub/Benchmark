// components/InstructorSummary.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { getInstructorSummary } from "../../../../services/opretions/Subject";

const InstructorSummary = () => {
  const { token } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const fetchSummary = async () => {
      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await getInstructorSummary(token);
        setSummary(res?.data?.summary || []);
      } catch (e) {
        console.error("Failed to load instructor summary:", e);
        setError(e.message || "Failed to load attendance summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  // Filter and sort students
  const processedSummary = useMemo(() => {
    return summary.map(subject => ({
      ...subject,
      students: subject.students
        .filter(student => 
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (!sortConfig.key) return 0;
          
          let aValue = a[sortConfig.key];
          let bValue = b[sortConfig.key];
          
          // Handle percentage sorting
          if (sortConfig.key === 'percentage') {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
          }
          
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        })
    }));
  }, [summary, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getAttendanceColor = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 85) return "text-green-600";
    if (percent >= 75) return "text-yellow-600";
    return "text-red-500";
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return "↕️";
    return sortConfig.direction === 'asc' ? "↑" : "↓";
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading attendance summary...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Summary</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📊 Attendance Summary</h2>
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {summary.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-xl text-gray-500 mb-2">No subjects or data available</p>
          <p className="text-gray-400">Check back later or contact your administrator.</p>
        </div>
      )}

      {processedSummary.map((subject) => {
        const avgAttendance = subject.students.length > 0 
          ? (subject.students.reduce((sum, stu) => sum + parseFloat(stu.percentage), 0) / subject.students.length).toFixed(1)
          : 0;
        
        const lowAttendanceCount = subject.students.filter(stu => parseFloat(stu.percentage) < 75).length;

        return (
          <div
            key={subject.subjectId}
            className="mb-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-[calc(100vw-100px)]"
          >
            {/* Subject Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {subject.subjectName} ({subject.subjectCode})
                  </h3>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <span>
                      📅 Total Classes: <strong className="text-indigo-600">{subject.totalClasses}</strong>
                    </span>
                    <span>
                      👥 Students: <strong className="text-indigo-600">{subject.students.length}</strong>
                    </span>
                    <span>
                      📊 Average Attendance: <strong className="text-indigo-600">{avgAttendance}%</strong>
                    </span>
                  </div>
                </div>
                
                {lowAttendanceCount > 0 && (
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    ⚠️ {lowAttendanceCount} below 75%
                  </div>
                )}
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th 
                      className="p-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('rollNumber')}
                    >
                      Roll No {getSortIcon('rollNumber')}
                    </th>
                    <th 
                      className="p-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      Name {getSortIcon('name')}
                    </th>
                    <th 
                      className="p-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('present')}
                    >
                      Present {getSortIcon('present')}
                    </th>
                    <th className="p-3 text-left font-semibold text-gray-700">
                      Total
                    </th>
                    <th 
                      className="p-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('percentage')}
                    >
                      Percentage {getSortIcon('percentage')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subject.students.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No students found matching your search criteria
                      </td>
                    </tr>
                  ) : (
                    subject.students.map((stu) => (
                      <tr 
                        key={stu.studentId} 
                        className="hover:bg-gray-50 border-b border-gray-100 transition-colors"
                      >
                        <td className="p-3 font-medium text-gray-700">{stu.rollNumber}</td>
                        <td className="p-3 text-gray-800">{stu.name}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {stu.present}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{stu.total}</td>
                        <td className="p-3">
                          <span className={`font-semibold ${getAttendanceColor(stu.percentage)}`}>
                            {stu.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InstructorSummary;