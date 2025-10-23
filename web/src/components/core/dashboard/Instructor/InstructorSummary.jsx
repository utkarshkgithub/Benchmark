// components/InstructorSummary.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { getInstructorSummary } from "../../../../services/opretions/Subject";
import { ChevronUp, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';

const InstructorSummary = () => {
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
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

  const exportToPDF = () => {
    const subject = summary.find((s) => s.subjectId === selectedSubject);
    if (!subject) return;

    const doc = new jsPDF();
    const tableColumn = ["Roll No", "Name", "Present", "Total", "Percentage"];
    const tableRows = [];

    processedStudents.forEach(student => {
        const studentData = [
            student.rollNumber,
            student.name,
            student.present,
            student.total,
            `${student.percentage}%`
        ];
        tableRows.push(studentData);
    });

    autoTable(doc, { 
      head: [tableColumn], 
      body: tableRows, 
      startY: 20 
    });
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    doc.text(`Overall Attendance Report - ${subject.subjectName} (${subject.subjectCode}) - ${dateStr}`, 14, 15);
    doc.save(`Overall_Attendance_${subject.subjectCode}_${dateStr}.pdf`);
  }

  const exportToExcel = () => {
    const subject = summary.find((s) => s.subjectId === selectedSubject);
    if (!subject) return;

    const tableColumn = ["Roll No", "Name", "Present", "Total", "Percentage"];
    const tableRows = processedStudents.map(student => ({
      "Roll No": student.rollNumber,
      "Name": student.name,
      "Present": student.present,
      "Total": student.total,
      "Percentage": `${student.percentage}%`
    }));

    const ws = XLSX.utils.json_to_sheet(tableRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    const date = new Date();
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    XLSX.writeFile(wb, `Overall_Attendance_${subject.subjectCode}_${dateStr}.xlsx`);
  }

  const getAttendanceColor = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 85) return "text-green-600";
    if (percent >= 75) return "text-yellow-600";
    return "text-red-500";
  };

  if (loading) {
    return (
      <div className="p-6 mx-auto text-center" style={{
        color: darkMode ? '#9ca3af' : '#6b7280'
      }}>
        Loading attendance summary...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 mx-auto text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-3 sm:w-[calc(100vw-30px)] mx-auto space-y-6" style={{
      backgroundColor: darkMode ? '#111827' : '#ffffff'
    }}>
      <h2 className="sm:text-3xl text-2xl font-bold" style={{
        color: darkMode ? '#ffffff' : '#1f2937'
      }}>Attendance Summary</h2>

      {/* Subject Dropdown */}
      <div className="shadow-md rounded-xl p-2 border" style={{
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        borderColor: darkMode ? '#374151' : '#f3f4f6'
      }}>
        <label className="block mb-2 font-medium" style={{
          color: darkMode ? '#d1d5db' : '#374151'
        }}>
          Select Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full sm:w-1/2 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 transition focus:outline-none"
          style={{
            backgroundColor: darkMode ? '#374151' : '#ffffff',
            borderColor: darkMode ? '#4b5563' : '#d1d5db',
            color: darkMode ? '#ffffff' : '#1f2937'
          }}
        >
          <option value="">-- Choose a subject --</option>
          {summary.map((s) => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.subjectName} ({s.subjectCode})
            </option>
          ))}
        </select>
      </div>

      {/* Search and Export */}
      {selectedSubject && (
        <div className="shadow-md rounded-xl p-4 border flex justify-between items-center" style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderColor: darkMode ? '#374151' : '#f3f4f6'
        }}>
          <input
            type="text"
            placeholder="🔍 Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 transition focus:outline-none"
            style={{
              backgroundColor: darkMode ? '#374151' : '#ffffff',
              borderColor: darkMode ? '#4b5563' : '#d1d5db',
              color: darkMode ? '#ffffff' : '#1f2937'
            }}
          />
          <div className="flex gap-x-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 rounded-lg border hover:opacity-80"
              style={{
                backgroundColor: darkMode ? '#374151' : '#f9fafb',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#ffffff' : '#6b7280'
              }}
            >
              Export to PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 rounded-lg border hover:opacity-80"
              style={{
                backgroundColor: darkMode ? '#374151' : '#f9fafb',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#ffffff' : '#6b7280'
              }}
            >
              Export to Excel
            </button>
          </div>
        </div>
      )}

      {/* Students Table */}
      {selectedSubject && (
        <div className="rounded-xl shadow-lg border overflow-hidden" style={{
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          borderColor: darkMode ? '#374151' : '#f3f4f6'
        }}>
          {processedStudents.length === 0 ? (
            <p className="p-6 text-center" style={{
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}>
              No students found for this subject.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 border-b z-10" style={{
                  backgroundColor: darkMode ? '#374151' : '#f9fafb',
                  borderColor: darkMode ? '#4b5563' : '#e5e7eb'
                }}>
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
                        className="sm:p-4 p-1 text-left font-semibold cursor-pointer select-none"
                        onClick={() => col.key !== "total" && handleSort(col.key)}
                        style={{
                          color: darkMode ? '#d1d5db' : '#374151'
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortConfig.key === col.key &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-4 h-4" style={{
                                color: darkMode ? '#9ca3af' : '#6b7280'
                              }} />
                            ) : (
                              <ChevronDown className="w-4 h-4" style={{
                                color: darkMode ? '#9ca3af' : '#6b7280'
                              }} />
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
                      className="border-b transition-colors"
                      style={{
                        borderColor: darkMode ? '#374151' : '#f3f4f6'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td className="p-3 font-medium" style={{
                        color: darkMode ? '#d1d5db' : '#374151'
                      }}>
                        {stu.rollNumber}
                      </td>
                      <td className="p-3" style={{
                        color: darkMode ? '#ffffff' : '#1f2937'
                      }}>{stu.name}</td>
                      <td className="p-3" style={{
                        color: darkMode ? '#d1d5db' : '#374151'
                      }}>{stu.present}</td>
                      <td className="p-3" style={{
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}>{stu.total}</td>
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
