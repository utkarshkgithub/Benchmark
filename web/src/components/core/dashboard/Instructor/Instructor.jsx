import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { subjectEndPoints } from "../../../../services/api";
import { apiConnector } from "../../../../services/apiconnector";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

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

  // Export to PDF function
  const exportToPDF = () => {
    try {
      if (filteredRecords.length === 0) {
        alert("No attendance records to export!");
        return;
      }

      console.log("Starting PDF export...");
      const doc = new jsPDF();
      const selectedSubjectName = subjects.find(s => s._id === selectedSubject)?.subjectName || "All Subjects";
      console.log("PDF document created, subject:", selectedSubjectName);
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Attendance Report", 14, 22);
    
    // Subject and date info
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Subject: ${selectedSubjectName}`, 14, 35);
    doc.text(`Date Filter: ${searchDate || "All Dates"}`, 14, 45);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 55);
    
    // Prepare detailed student data for each date
    let allStudentData = [];
    
    filteredRecords.forEach((record) => {
      // Handle date properly - if it's already in YYYY-MM-DD format, use it directly
      const date = record.date.includes('T') 
        ? new Date(record.date).toLocaleDateString() 
        : record.date;
      
      // Add each student as a separate row
      record.presentStudent.forEach((stu) => {
        const studentData = [
          date,
          stu.student?.firstName && stu.student?.lastName 
            ? `${stu.student.firstName} ${stu.student.lastName}`
            : stu.name || `${stu.firstName || ''} ${stu.lastName || ''}`.trim() || 'N/A',
          stu.student?.email || stu.email || 'N/A',
          stu.markedAt 
            ? new Date(stu.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : 'N/A'
        ];
        allStudentData.push(studentData);
      });
    });

    // Updated table headers for detailed view
    const tableColumn = ["Attendance Date", "Full Name", "Email", "Marked At"];

    // Create manual table since autoTable is not working
    let currentY = 75;
    const rowHeight = 8;
    const colWidths = [35, 50, 60, 30]; // Column widths
    const colPositions = [14, 49, 99, 159]; // X positions for columns
    
    // Draw table headers
    doc.setFillColor(71, 85, 105);
    doc.rect(14, currentY - 6, 175, rowHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Attendance Date", colPositions[0] + 2, currentY);
    doc.text("Full Name", colPositions[1] + 2, currentY);
    doc.text("Email", colPositions[2] + 2, currentY);
    doc.text("Marked At", colPositions[3] + 2, currentY);
    
    currentY += rowHeight;
    
    // Draw table rows
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    
    allStudentData.forEach((row, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(14, currentY - 6, 175, rowHeight, 'F');
      }
      
      // Draw cell borders and text
      doc.setDrawColor(200, 200, 200);
      
      // Draw vertical lines
      doc.line(14, currentY - 6, 14, currentY + 2);
      doc.line(colPositions[1], currentY - 6, colPositions[1], currentY + 2);
      doc.line(colPositions[2], currentY - 6, colPositions[2], currentY + 2);
      doc.line(colPositions[3], currentY - 6, colPositions[3], currentY + 2);
      doc.line(189, currentY - 6, 189, currentY + 2);
      
      // Draw horizontal line
      doc.line(14, currentY + 2, 189, currentY + 2);
      
      // Add text content
      doc.setTextColor(0, 0, 0);
      doc.text(String(row[0]).substring(0, 15), colPositions[0] + 2, currentY);
      doc.text(String(row[1]).substring(0, 20), colPositions[1] + 2, currentY);
      doc.text(String(row[2]).substring(0, 25), colPositions[2] + 2, currentY);
      doc.text(String(row[3]).substring(0, 12), colPositions[3] + 2, currentY);
      
      currentY += rowHeight;
      
      // Add new page if needed
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
    });
    
    // Draw final border
    doc.line(14, currentY, 189, currentY);

    // Add summary at the bottom
    const finalY = currentY + 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Records: ${allStudentData.length} students across ${filteredRecords.length} class session(s)`, 14, finalY);

    // Save the PDF with detailed student information
    const fileName = `detailed_attendance_${selectedSubjectName.replace(/\s+/g, '_')}_${searchDate || 'all_dates'}.pdf`;
    console.log("Saving PDF with filename:", fileName);
    doc.save(fileName);
    console.log("PDF export completed successfully!");
    
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please check the console for details.");
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    if (filteredRecords.length === 0) {
      alert("No attendance records to export!");
      return;
    }

    const selectedSubjectName = subjects.find(s => s._id === selectedSubject)?.subjectName || "All Subjects";
    
    // Prepare detailed student data for Excel
    const excelData = [];
    
    filteredRecords.forEach((record) => {
      // Handle date properly - if it's already in YYYY-MM-DD format, use it directly
      const date = record.date.includes('T') 
        ? new Date(record.date).toLocaleDateString() 
        : record.date;
      
      // Add each student as a separate row
      record.presentStudent.forEach((stu) => {
        excelData.push({
          "Attendance Date": date,
          "Full Name": stu.student?.firstName && stu.student?.lastName 
            ? `${stu.student.firstName} ${stu.student.lastName}`
            : stu.name || `${stu.firstName || ''} ${stu.lastName || ''}`.trim() || 'N/A',
          "Email": stu.student?.email || stu.email || 'N/A',
          "Marked At": stu.markedAt 
            ? new Date(stu.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : 'N/A'
        });
      });
    });    // Create workbook with detailed student data
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Details");
    
    // Create summary sheet
    const summaryData = filteredRecords.map((record) => ({
      "Date": record.date.includes('T') 
        ? new Date(record.date).toLocaleDateString() 
        : record.date,
      "Subject": selectedSubjectName,
      "Present Students": record.presentStudent.length,
      "Class Duration": "N/A", // Can be added if available
      "Notes": `${record.presentStudent.length} students attended this class`
    }));
    
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

    // Set column widths for detailed data
    const columnWidths = [
      { wch: 18 }, // Attendance Date
      { wch: 30 }, // Full Name
      { wch: 35 }, // Email
      { wch: 18 }  // Marked At (with seconds)
    ];
    ws['!cols'] = columnWidths;

    // Save the Excel file with detailed student data
    const fileName = `detailed_attendance_${selectedSubjectName.replace(/\s+/g, '_')}_${searchDate || 'all_dates'}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

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
            <div className="space-y-3 transform ">
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
            <div className="space-y-3 transform ">
              <label className="block text-sm font-bold mb-2 uppercase tracking-wider" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>
                Search by Date
              </label>
              <div className="relative group">
                <input
                  type="date"
                  className="w-full border-2 rounded-xl px-4 py-4  focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#fdf2f8',
                    borderColor: darkMode ? '#4b5563' : '#e2e8f0',
                    color: darkMode ? '#ffffff' : '#374151'
                  }}
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
                
              </div>
            </div>
          </div>
          
          {/* Export Buttons - Only show when records are available */}
          {filteredRecords.length > 0 && (
            <div className="mt-6">
              <p className="text-sm mb-3 text-center md:text-right" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                Export detailed student data from {filteredRecords.length} class session{filteredRecords.length !== 1 ? 's' : ''} 
                ({filteredRecords.reduce((sum, rec) => sum + rec.presentStudent.length, 0)} total attendance records)
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <button
                onClick={exportToPDF}
                className="group flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: darkMode ? '#dc2626' : '#ef4444',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#b91c1c' : '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#dc2626' : '#ef4444';
                }}
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Detailed PDF
              </button>
              
              <button
                onClick={exportToExcel}
                className="group flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: darkMode ? '#16a34a' : '#22c55e',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#15803d' : '#16a34a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode ? '#16a34a' : '#22c55e';
                }}
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Detailed Excel
              </button>
            </div>
            </div>
          )}
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
                              <div className="flex justify-between items-center mb-4">
                                <h4 
                                  style={{
                                    color: darkMode ? '#e5e7eb' : '#1f2937'
                                  }}
                                  className="text-lg font-bold flex items-center"
                                >
                                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  Present Students ({rec.presentStudent.length})
                                </h4>
                                <div className="text-sm" style={{
                                  color: darkMode ? '#9ca3af' : '#6b7280'
                                }}>
                                  Class Date: {rec.date.includes('T') 
                                    ? new Date(rec.date).toLocaleDateString() 
                                    : rec.date}
                                </div>
                              </div>
                              {/* Present Students Table */}
                              <div className="overflow-x-auto">
                                <div className="mb-4 flex flex-wrap gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      const sortedStudents = [...rec.presentStudent].sort((a, b) => {
                                        const nameA = (a.student?.firstName && a.student?.lastName 
                                          ? `${a.student.firstName} ${a.student.lastName}`
                                          : a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim()).toLowerCase();
                                        const nameB = (b.student?.firstName && b.student?.lastName 
                                          ? `${b.student.firstName} ${b.student.lastName}`
                                          : b.name || `${b.firstName || ''} ${b.lastName || ''}`.trim()).toLowerCase();
                                        return nameA.localeCompare(nameB);
                                      });
                                      const updatedRecords = [...filteredRecords];
                                      updatedRecords[index].presentStudent = sortedStudents;
                                      setFilteredRecords(updatedRecords);
                                    }}
                                    className="px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                    style={{
                                      backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
                                      color: darkMode ? '#ffffff' : '#374151'
                                    }}
                                  >
                                    Sort by Name
                                  </button>
                                  <button
                                    onClick={() => {
                                      const sortedStudents = [...rec.presentStudent].sort((a, b) => {
                                        const timeA = new Date(a.markedAt).getTime();
                                        const timeB = new Date(b.markedAt).getTime();
                                        return timeA - timeB;
                                      });
                                      const updatedRecords = [...filteredRecords];
                                      updatedRecords[index].presentStudent = sortedStudents;
                                      setFilteredRecords(updatedRecords);
                                    }}
                                    className="px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                    style={{
                                      backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
                                      color: darkMode ? '#ffffff' : '#374151'
                                    }}
                                  >
                                    Sort by Time
                                  </button>
                                </div>
                                <table className="min-w-full divide-y" style={{
                                  borderColor: darkMode ? '#374151' : '#e5e7eb'
                                }}>
                                  <thead style={{
                                    backgroundColor: darkMode ? '#374151' : '#f9fafb'
                                  }}>
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{
                                        color: darkMode ? '#d1d5db' : '#374151'
                                      }}>
                                        Name
                                      </th>
                                      <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{
                                        color: darkMode ? '#d1d5db' : '#374151'
                                      }}>
                                        Email
                                      </th>
                                      <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider" style={{
                                        color: darkMode ? '#d1d5db' : '#374151'
                                      }}>
                                        Marked At
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y" style={{
                                    backgroundColor: darkMode ? 'transparent' : '#ffffff',
                                    borderColor: darkMode ? '#374151' : '#e5e7eb'
                                  }}>
                                    {rec.presentStudent.map((stu, stuIndex) => (
                                      <tr 
                                        key={stu.studentId || stu._id}
                                        className="transition-colors animate-fade-in-student"
                                        style={{
                                          animationDelay: `${stuIndex * 0.1}s`
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = darkMode ? '#374151' : '#f9fafb';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                      >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center">
                                            
                                            <div className="text-sm font-medium" style={{
                                              color: darkMode ? '#ffffff' : '#1f2937'
                                            }}>
                                              {stu.student?.firstName && stu.student?.lastName 
                                                ? `${stu.student.firstName} ${stu.student.lastName}`
                                                : stu.name || `${stu.firstName || ''} ${stu.lastName || ''}`.trim() || 'N/A'
                                              }
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="text-sm" style={{
                                            color: darkMode ? '#9ca3af' : '#6b7280'
                                          }}>
                                            {stu.student?.email || stu.email || 'N/A'}
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{
                                            backgroundColor: darkMode ? '#065f46' : '#d1fae5',
                                            color: darkMode ? '#6ee7b7' : '#065f46'
                                          }}>
                                            {/* <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div> */}
                                            {stu.markedAt 
                                              ? new Date(stu.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' ,second:"2-digit"})
                                              : 'N/A'
                                            }
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
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