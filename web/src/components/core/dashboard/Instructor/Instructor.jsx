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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 min-w-[calc(100vw-100px)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center">
           Welcome, {user.firstName.toUpperCase()} {user.lastName.toUpperCase()}
            
          </div>
        </div>

        {/* Controls Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Subject
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-3 pr-10 text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 shadow-sm hover:border-gray-300"
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
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Search */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search by Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 shadow-sm hover:border-gray-300"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Attendance Records</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Branch
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Total Students
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Present Students
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec, index) => (
                    <React.Fragment key={rec._id}>
                      <tr className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">
                              {rec.date.split("T")[0]}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {rec.branch}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {rec.totalStudents}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {rec.presentStudent.length}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({Math.round((rec.presentStudent.length / rec.totalStudents) * 100)}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                              expandedRow === index
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md'
                            }`}
                            onClick={() =>
                              setExpandedRow(expandedRow === index ? null : index)
                            }
                          >
                            {expandedRow === index ? (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                Hide Students
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Show Students
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedRow === index && (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 bg-gradient-to-r from-blue-25 to-purple-25">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Present Students ({rec.presentStudent.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {rec.presentStudent.map((stu) => (
                                  <div key={stu._id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors duration-150">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                      {stu.firstName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {stu.firstName} {stu.lastName}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {stu.email}
                                      </p>
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
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No attendance records found</h3>
                        <p className="text-gray-500">
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
    </div>
  );
};

export default Instructor;