// components/InstructorSummary.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { getInstructorSummary } from "../../../../services/opretions/Subject";
import { ChevronUp, ChevronDown } from "lucide-react";

const InstructorSummary = () => {
  const { token } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedSubject, setSelectedSubject] = useState("");

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

  const processedStudents = useMemo(() => {
    if (!selectedSubject) return [];

    const subject = summary.find((s) => s.subjectId === selectedSubject);
    if (!subject) return [];

    return subject.students
      .filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "percentage") {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [summary, searchTerm, sortConfig, selectedSubject]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const getAttendanceColor = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 85) return "text-green-600";
    if (percent >= 75) return "text-yellow-600";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="p-6  mx-auto text-center text-gray-600">
        Loading attendance summary...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6  mx-auto text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-3 sm:w-[calc(100vw-30px)] mx-auto space-y-6">
      <h2 className="sm:text-3xl text-2xl font-bold text-gray-800"> Attendance Summary</h2>

      {/* Subject Dropdown */}
      <div className="bg-white shadow-md rounded-xl p-2 border border-gray-100">
        <label className="block mb-2 font-medium text-gray-700">
          Select Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full sm:w-1/2 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="">-- Choose a subject --</option>
          {summary.map((s) => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.subjectName} ({s.subjectCode})
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      {selectedSubject && (
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-100">
          <input
            type="text"
            placeholder="🔍 Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      )}

      {/* Students Table */}
      {selectedSubject && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {processedStudents.length === 0 ? (
            <p className="p-6 text-center text-gray-500">
              No students found for this subject.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                  <tr>
                    {[
                      { key: "rollNumber", label: "Roll No" },
                      { key: "name", label: "Name" },
                      { key: "present", label: "Present" },
                      { key: "total", label: "Total" },
                      { key: "percentage", label: "Percentage" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="sm:p-4 p-1 text-left font-semibold text-gray-700 cursor-pointer select-none"
                        onClick={() => col.key !== "total" && handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortConfig.key === col.key &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ))}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedStudents.map((stu) => (
                    <tr
                      key={stu.studentId}
                      className="hover:bg-gray-50 border-b border-gray-100 transition-colors"
                    >
                      <td className="p-3 font-medium text-gray-700">
                        {stu.rollNumber}
                      </td>
                      <td className="p-3 text-gray-800">{stu.name}</td>
                      <td className="p-3 text-gray-700">{stu.present}</td>
                      <td className="p-3 text-gray-600">{stu.total}</td>
                      <td
                        className={`p-3 font-semibold ${getAttendanceColor(
                          stu.percentage
                        )}`}
                      >
                        {stu.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstructorSummary;
