


                // components/InstructorQR.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    generateQr,
    fetchInstructorSubjects,
    getSubjectStudents,
    getAttendanceDetails,
    updateAttendance,
} from "../../../../services/opretions/Subject";
import { Link } from "react-router-dom";
import Button from "../../../common/Button";

const TWO_MINUTES = 119; // 2 minutes = 120 seconds, minus 1 for display purposes

export default function InstructorQR() {
    const { token, user } = useSelector((s) => s.auth);
    const { darkMode } = useSelector((s) => s.theme);

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [qrData, setQrData] = useState("");
    const [currentAttendanceId, setCurrentAttendanceId] = useState(null);
    const [remaining, setRemaining] = useState(TWO_MINUTES);
    const timerRef = useRef(null);

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [initialAttendance, setInitialAttendance] = useState({});
    const [viewMode, setViewMode] = useState("initial"); // "initial", "qr", "list", "submitted"
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name"); // sorting option
    const [allSelected, setAllSelected] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setError(null);
                const res = await fetchInstructorSubjects(token);
                const list = res?.data?.subjects || [];
                setSubjects(list);
                if (list.length > 0) setSelectedSubject(list[0]);
            } catch (e) {
                console.error("Failed to fetch subjects:", e);
                setError("Failed to load subjects. Please refresh the page.");
            }
        };
        fetchSubjects();
    }, [token]);

    useEffect(() => {
        if (remaining <= 0 && viewMode === "qr") {
            closeQR();
        }
    }, [remaining, viewMode]);

    // Add this useEffect to update allSelected state when attendance changes
    useEffect(() => {
        if (students.length > 0) {
            const allPresent = students.every(student => attendance[student._id]);
            setAllSelected(allPresent);
        }
    }, [attendance, students]);

    const onGenerate = async () => {
        if (!selectedSubject) return;
        console.log(selectedSubject._id);
        // If QR is active, just show the existing QR without regenerating
        if (viewMode === "qr" && remaining > 0) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData();
        formData.append("subjectId", selectedSubject._id);

        try {
            const res = await generateQr(token, formData);
            const code = res?.data?.token || "";
            const attendanceId = res?.data?.attendanceId || null;

            if (!code || !attendanceId) {
                throw new Error("QR code or Attendance ID missing in response");
            }

            setQrData(code);
            setCurrentAttendanceId(attendanceId);
            setViewMode("qr");
            setRemaining(TWO_MINUTES);
            startCountdown();
        } catch (e) {
            console.error("Generate QR failed:", e);
            setError("Failed to generate QR code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const startCountdown = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setRemaining((r) => r - 1);
        }, 1000);
    };

    const closeQR = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setLoading(true);
        setError(null);

        try {
            const studentRes = await getSubjectStudents(token, selectedSubject._id);
            const allStudents = studentRes?.data?.students || [];
            
            const attendanceRes = await getAttendanceDetails(token, currentAttendanceId);
            const attendanceRecord = attendanceRes?.data?.attendance;

            if (attendanceRecord) {
                // Create attendance status map for checkboxes
                const studentStatus = attendanceRecord.students.reduce((acc, rec) => {
                    acc[rec.student] = rec.status === "Present";
                    return acc;
                }, {});
                
                // Merge attendance details (including markedAt) with student data
                const studentsWithAttendance = allStudents.map(student => {
                    const attendanceInfo = attendanceRecord.students.find(att => att.student === student._id);
                    return {
                        ...student,
                        status: attendanceInfo?.status || "Absent",
                        markedAt: attendanceInfo?.markedAt || null
                    };
                });
                
                setStudents(studentsWithAttendance);
                setAttendance(studentStatus);
                setInitialAttendance(studentStatus);
            } else {
                setStudents(allStudents);
            }

            setViewMode("list");
        } catch (e) {
            console.error("Failed to fetch attendance data:", e);
            setError("Could not load student attendance. Please try again.");
            resetToInitial();
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (studentId, isChecked) => {
        setAttendance((prev) => ({ ...prev, [studentId]: isChecked }));
    };

    // Add this function to handle toggling all students
    const toggleAllStudents = () => {
        const newAllSelected = !allSelected;
        setAllSelected(newAllSelected);
        
        const newAttendance = {};
        students.forEach(student => {
            newAttendance[student._id] = newAllSelected;
        });
        
        setAttendance(newAttendance);
    };

    const handleSubmitAttendance = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await updateAttendance(token, currentAttendanceId, attendance);
            setViewMode("submitted");
            setSuccessMessage("Attendance updated successfully!");
        } catch (e) {
            console.error("Failed to update attendance:", e);
            setError("Failed to submit attendance changes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewAttendance = () => {
        resetToInitial();
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Name", "Roll Number", "Status", "Marked At"];
        const tableRows = [];

        sortedStudents.forEach((student) => {
            const markedAt = student.markedAt 
                ? new Date(student.markedAt).toLocaleString()
                : "—";
            
            const studentData = [
                `${student.userId.firstName} ${student.userId.lastName}`,
                student.rollNumber,
                attendance[student._id] ? "Present" : "Absent",
                markedAt,
            ];
            tableRows.push(studentData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        doc.text(
            `Attendance Report - ${selectedSubject.subjectName} (${selectedSubject.subjectCode}) - ${dateStr}`,
            14,
            15
        );
        doc.save(`Attendance_${selectedSubject.subjectCode}_${dateStr}.pdf`);
    };

    const resetToInitial = () => {
        setViewMode("initial");
        setQrData("");
        setStudents([]);
        setAttendance({});
        setInitialAttendance({});
        setCurrentAttendanceId(null);
        setSearchTerm("");
        setRemaining(TWO_MINUTES);
        setError(null);
        setSuccessMessage(null);
        setAllSelected(false);
    };

    useEffect(() => {
        return () => timerRef.current && clearInterval(timerRef.current);
    }, []);

    const timeLabel = useMemo(() => {
        if (remaining < 0) return "00:00";
        const m = Math.floor(remaining / 60).toString().padStart(2, "0");
        const s = (remaining % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }, [remaining]);

    const filteredStudents = useMemo(() => {
        return students.filter(
            (student) =>
                `${student.userId.firstName} ${student.userId.lastName}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    // sorted students
    const sortedStudents = useMemo(() => {
        const sorted = [...filteredStudents];
        if (sortBy === "name") {
            sorted.sort((a, b) =>
                `${a.userId.firstName} ${a.userId.lastName}`.localeCompare(
                    `${b.userId.firstName} ${b.userId.lastName}`
                )
            );
        } else if (sortBy === "rollNumber") {
            sorted.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
        } else if (sortBy === "status") {
            sorted.sort((a, b) => {
                const statusA = attendance[a._id] ? 1 : 0;
                const statusB = attendance[b._id] ? 1 : 0;
                return statusB - statusA; // Present first
            });
        }
        return sorted;
    }, [filteredStudents, sortBy, attendance]);

    const attendanceStats = useMemo(() => {
        const totalStudents = students.length;
        const presentCount = Object.values(attendance).filter(Boolean).length;
        const absentCount = totalStudents - presentCount;
        const attendanceRate =
            totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;
        return { totalStudents, presentCount, absentCount, attendanceRate };
    }, [students, attendance]);

    const getTimerColor = () => {
        if (remaining <= 15) return "text-red-600 border-red-500 bg-gradient-to-r from-red-50 to-pink-50"; // Last 5 minutes
        if (remaining <= 30) return "text-orange-600 border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50"; // Last 10 minutes
        return "text-green-600 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50";
    };

    return (
        <div className="min-h-screen p-6" style={{
            background: darkMode 
                ? 'linear-gradient(to bottom right, #111827, #1f2937, #374151)' 
                : 'linear-gradient(to bottom right, #f8fafc, #eff6ff, #faf5ff)'
        }}>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="animate-fade-in">
                    <h1 className="font-extrabold text-4xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 bg-clip-text text-transparent mb-2">
                        QR Attendance System
                    </h1>
                    <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>

                {/* Banners */}
                {error && (
                    <div className="rounded-2xl p-6 shadow-lg text-sm font-semibold bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-2 border-red-200 animate-slide-down">
                        <div className="flex items-center">
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white text-sm">!</span>
                            </div>
                            {error}
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="rounded-2xl p-6 shadow-lg text-sm font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-2 border-green-200 animate-slide-down">
                        <div className="flex items-center">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white text-sm">✓</span>
                            </div>
                            {successMessage}
                        </div>
                    </div>
                )}

                {/* Initial Dashboard */}
                {viewMode === "initial" && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Welcome Card */}
                        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 animate-slide-up">
                            <div className="relative">
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
                                <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full animate-bounce-slow"></div>
                                
                                <h2 className="text-3xl font-bold mb-4 relative z-10">Welcome back!</h2>
                                <p className="text-2xl font-bold mb-2 relative z-10">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-indigo-100 mb-8 relative z-10">
                                    Manage your classes and attendance with our modern QR system.
                                </p>
                                
                                <div className="flex justify-center">
                                    <Link
                                        to="/dashboard/attendence-summary"
                                        className="group relative"
                                    >
                                        <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/40 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                        <button className="relative px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg" style={{
                                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                            color: darkMode ? '#ffffff' : '#4f46e5'
                                        }}>
                                            View Summary
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Select Subject Card */}
                        <div className="backdrop-blur-sm border rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 animate-slide-up" style={{ 
                            animationDelay: '0.2s',
                            backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                            borderColor: darkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                        }}>
                            <h3 className="text-2xl font-bold mb-6 relative" style={{
                                color: darkMode ? '#ffffff' : '#1f2937'
                            }}>
                                Generate QR Code
                                <div className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
                            </h3>
                            
                            <label className="block text-sm font-bold mb-3 uppercase tracking-wider" style={{
                                color: darkMode ? '#d1d5db' : '#374151'
                            }}>
                                Select Subject
                            </label>
                            
                            <div className="relative group mb-8">
                                <select
                                    className="w-full appearance-none bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-gray-200 rounded-xl px-6 py-4 pr-12 text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300 shadow-sm hover:border-gray-300 hover:shadow-md font-medium"
                                    value={selectedSubject?._id || ""}
                                    onChange={(e) => {
                                        const subj = subjects.find((s) => s._id === e.target.value);
                                        setSelectedSubject(subj || null);
                                    }}
                                >
                                    <option value="">-- Choose a subject --</option>
                                    {subjects.map((s) => (
                                        <option key={s._id} value={s._id}>
                                            {s.subjectName} ({s.subjectCode})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none group-hover:text-blue-500 transition-colors duration-200">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <Button
                                onClick={onGenerate}
                                disabled={!selectedSubject}
                                loading={loading}
                                variant="primary"
                                size="lg"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                            >
                                Generate QR Code
                            </Button>
                        </div>
                    </div>
                )}

                {/* QR View */}
                {viewMode === "qr" && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
                        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-3xl w-full max-w-md md:max-w-xl lg:max-w-3xl space-y-6 text-center animate-scale-in">
                            <div className="flex justify-evenly mt-4">
                                <div className="relative">
                                <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {selectedSubject?.subjectName}
                                </h3>
                                <p className="text-lg text-gray-600 font-semibold">
                                    {selectedSubject?.subjectCode}
                                </p>
                            </div>

                            <div className={`inline-flex items-center px-6 py-1 rounded-2xl border-2 font-bold text-lg ${getTimerColor()} shadow-lg animate-pulse-timer`}>
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{timeLabel}</span>
                            </div>
                            </div>

                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex justify-center shadow-inner">
                                <div className="relative">
                                    <div className="absolute -inset-4  rounded-2xl opacity-20 blur-lg animate-pulse"></div>
                                    <div className="relative bg-white rounded-2xl shadow-lg">
                                        <QRCodeCanvas 
                                            value={qrData} 
                                            size={620} 
                                            style={{ width: "100%", height: "auto" }}
                                            className="animate-fade-in" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={closeQR}
                                    className="w-fit p-4 rounded-xl border-2 border-blue-500 text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 font-bold"
                                >
                                    📋 Close & Review Attendance
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Attendance Review */}
                {viewMode === "list" && (
                    <div className="space-y-8">
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-slide-up">
                            <div 
                                style={{
                                    backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                    borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.2)'
                                }}
                                className="backdrop-blur-sm rounded-2xl p-6 border shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-white text-xl font-bold">{attendanceStats.totalStudents}</span>
                                </div>
                                <p 
                                    style={{
                                        color: darkMode ? '#9ca3af' : '#6b7280'
                                    }}
                                    className="text-sm font-semibold"
                                >
                                    Total Students
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-white text-xl font-bold">{attendanceStats.presentCount}</span>
                                </div>
                                <p className="text-sm text-green-700 font-semibold">Present</p>
                            </div>
                            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-200 shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-white text-xl font-bold">{attendanceStats.absentCount}</span>
                                </div>
                                <p className="text-sm text-red-700 font-semibold">Absent</p>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                <div className="w-15 h-15 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-white text-lg font-bold">{attendanceStats.attendanceRate}%</span>
                                </div>
                                <p className="text-sm text-indigo-700 font-semibold">Rate</p>
                            </div>
                        </div>

                        {/* Toggle All Button */}
                        <div 
                            style={{
                                backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.2)'
                            }}
                            className="backdrop-blur-sm rounded-2xl p-6 border shadow-lg animate-slide-up"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h4 
                                        style={{
                                            color: darkMode ? '#e5e7eb' : '#1f2937'
                                        }}
                                        className="text-lg font-bold mb-1"
                                    >
                                        Mark All Students
                                    </h4>
                                    <p 
                                        style={{
                                            color: darkMode ? '#9ca3af' : '#6b7280'
                                        }}
                                        className="text-sm"
                                    >
                                        Toggle all students as present or absent
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <span 
                                        style={{
                                            color: darkMode ? '#d1d5db' : '#374151'
                                        }}
                                        className="mr-3 text-sm font-medium"
                                    >
                                        {allSelected ? 'All Present' : 'All Absent'}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleAllStudents}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Search + Sort */}
                        <div 
                            style={{
                                backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                                animationDelay: '0.1s'
                            }}
                            className="backdrop-blur-sm rounded-2xl p-6 border shadow-lg animate-slide-up"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div className="relative flex-1 group">
                                    <input
                                        type="text"
                                        placeholder="🔍 Search students by name or roll number..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.8)' : 'linear-gradient(to right, rgba(219, 234, 254, 1), rgba(237, 233, 254, 1))',
                                            borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                            color: darkMode ? '#e5e7eb' : '#374151'
                                        }}
                                        className="w-full border-2 rounded-xl px-6 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-300 font-medium"
                                    />
                                </div>

                                <div className="relative group">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{
                                            backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.8)' : 'linear-gradient(to right, rgba(243, 232, 255, 1), rgba(252, 231, 243, 1))',
                                            borderColor: darkMode ? '#4b5563' : '#d1d5db',
                                            color: darkMode ? '#e5e7eb' : '#374151'
                                        }}
                                        className="w-full lg:w-56 border-2 rounded-xl px-6 py-4 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all duration-300 font-medium"
                                    >
                                        <option value="name">📝 Sort by Name</option>
                                        <option value="rollNumber">🔢 Sort by Roll</option>
                                        <option value="status">📊 Sort by Status</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Students Table */}
                        <div 
                            style={{
                                backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                                animationDelay: '0.2s'
                            }}
                            className="backdrop-blur-sm border rounded-2xl shadow-lg overflow-hidden animate-slide-up"
                        >
                            {sortedStudents.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div 
                                        style={{
                                            backgroundColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : '#f3f4f6'
                                        }}
                                        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                                    >
                                        <span className="text-4xl">😔</span>
                                    </div>
                                    <p 
                                        style={{
                                            color: darkMode ? '#9ca3af' : '#6b7280'
                                        }}
                                        className="text-xl font-semibold"
                                    >
                                        No students found
                                    </p>
                                    <p 
                                        style={{
                                            color: darkMode ? '#6b7280' : '#9ca3af'
                                        }}
                                    >
                                        Try adjusting your search criteria
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead 
                                            style={{
                                                background: darkMode 
                                                    ? 'linear-gradient(to right, rgba(75, 85, 99, 0.8), rgba(55, 65, 81, 0.8))'
                                                    : 'linear-gradient(to right, rgba(249, 250, 251, 1), rgba(243, 244, 246, 1))',
                                                borderColor: darkMode ? '#4b5563' : '#d1d5db'
                                            }}
                                            className="border-b-2"
                                        >
                                            <tr>
                                                <th 
                                                    style={{
                                                        color: darkMode ? '#e5e7eb' : '#1f2937'
                                                    }}
                                                    className="p-6 text-left font-bold"
                                                >
                                                    Student Name
                                                </th>
                                                <th 
                                                    style={{
                                                        color: darkMode ? '#e5e7eb' : '#1f2937'
                                                    }}
                                                    className="p-6 text-left font-bold"
                                                >
                                                    Roll Number
                                                </th>
                                                <th 
                                                    style={{
                                                        color: darkMode ? '#e5e7eb' : '#1f2937'
                                                    }}
                                                    className="p-6 text-center font-bold"
                                                >
                                                    Status
                                                </th>
                                                <th 
                                                    style={{
                                                        color: darkMode ? '#e5e7eb' : '#1f2937'
                                                    }}
                                                    className="p-6 text-center font-bold"
                                                >
                                                    Marked At
                                                </th>
                                                <th 
                                                    style={{
                                                        color: darkMode ? '#e5e7eb' : '#1f2937'
                                                    }}
                                                    className="p-6 text-center font-bold"
                                                >
                                                    Mark Present
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedStudents.map((s, i) => (
                                                <tr
                                                    key={s._id}
                                                    style={{
                                                        backgroundColor: i % 2 === 0 
                                                            ? (darkMode ? 'rgba(55, 65, 81, 0.3)' : '#ffffff')
                                                            : (darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(249, 250, 251, 0.5)'),
                                                        borderColor: darkMode ? '#4b5563' : '#f3f4f6',
                                                        animationDelay: `${i * 0.05}s`
                                                    }}
                                                    className="transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-25 hover:to-purple-25 animate-fade-in-row border-b"
                                                >
                                                    <td className="p-6">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                                                {s.userId.firstName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p 
                                                                    style={{
                                                                        color: darkMode ? '#e5e7eb' : '#111827'
                                                                    }}
                                                                    className="font-semibold"
                                                                >
                                                                    {s.userId.firstName} {s.userId.lastName}
                                                                </p>
                                                                <p 
                                                                    style={{
                                                                        color: darkMode ? '#9ca3af' : '#6b7280'
                                                                    }}
                                                                    className="text-xs"
                                                                >
                                                                    {s.userId.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td 
                                                        style={{
                                                            color: darkMode ? '#d1d5db' : '#374151'
                                                        }}
                                                        className="p-6 font-medium"
                                                    >
                                                        {s.rollNumber}
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        <span
                                                            className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                                                                attendance[s._id] 
                                                                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200" 
                                                                    : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200"
                                                            }`}
                                                        >
                                                            {attendance[s._id] ? "Present" : "Absent"}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        {s.markedAt ? (
                                                            <div className="text-xs">
                                                                <div 
                                                                    style={{
                                                                        color: darkMode ? '#d1d5db' : '#374151'
                                                                    }}
                                                                    className="font-medium"
                                                                >
                                                                    {new Date(s.markedAt).toLocaleDateString()}
                                                                </div>
                                                                <div 
                                                                    style={{
                                                                        color: darkMode ? '#9ca3af' : '#6b7280'
                                                                    }}
                                                                >
                                                                    {new Date(s.markedAt).toLocaleTimeString()}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span 
                                                                style={{
                                                                    color: darkMode ? '#6b7280' : '#9ca3af'
                                                                }}
                                                                className="text-xs"
                                                            >
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-6 text-center">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={!!attendance[s._id]}
                                                                onChange={(e) => handleCheckboxChange(s._id, e.target.checked)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500"></div>
                                                        </label>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div 
                            style={{
                                animationDelay: '0.3s'
                            }}
                            className="flex flex-col sm:flex-row justify-end gap-4 animate-slide-up"
                        >
                            <button
                                onClick={resetToInitial}
                                style={{
                                    backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.8)' : '#f9fafb',
                                    borderColor: darkMode ? '#6b7280' : '#d1d5db',
                                    color: darkMode ? '#d1d5db' : '#4b5563'
                                }}
                                className="px-6 py-3 rounded-xl border-2 font-medium transition-all transform hover:scale-105"
                            >
                                Back
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                            >
                                📄 Export PDF
                            </button>
                            <button
                                onClick={handleSubmitAttendance}
                                disabled={loading}
                                className={`px-6 py-3 rounded-xl font-medium text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
                                    loading 
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Submitting...
                                    </div>
                                ) : (
                                    "Submit Attendance"
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Submitted View */}
                {viewMode === "submitted" && (
                    <div className="text-center space-y-8 animate-scale-in">
                        <div 
                            style={{
                                backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.2)'
                            }}
                            className="backdrop-blur-sm rounded-3xl p-12 shadow-2xl border max-w-2xl mx-auto"
                        >
                            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-celebration">
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            
                            <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 bg-clip-text text-transparent mb-4">
                                Attendance Updated Successfully!
                            </h3>
                            
                            <p 
                                style={{
                                    color: darkMode ? '#9ca3af' : '#4b5563'
                                }}
                                className="text-xl mb-8"
                            >
                                All changes have been saved and synchronized across the system.
                            </p>
                            
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">{attendanceStats.totalStudents}</p>
                                        <p className="text-sm text-green-700">Total</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">{attendanceStats.presentCount}</p>
                                        <p className="text-sm text-green-700">Present</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">{attendanceStats.attendanceRate}%</p>
                                        <p className="text-sm text-green-700">Rate</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleViewAttendance}
                                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}
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

                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
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

                @keyframes bounce-slow {
                    0%, 100% { 
                        transform: translateY(0px) rotate(0deg); 
                    }
                    50% { 
                        transform: translateY(-10px) rotate(5deg); 
                    }
                }

                @keyframes pulse-timer {
                    0%, 100% { 
                        transform: scale(1); 
                    }
                    50% { 
                        transform: scale(1.05); 
                    }
                }

                @keyframes bounce-celebration {
                    0%, 20%, 53%, 80%, 100% {
                        animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
                        transform: translate3d(0, 0, 0);
                    }
                    40%, 43% {
                        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
                        transform: translate3d(0, -30px, 0);
                    }
                    70% {
                        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
                        transform: translate3d(0, -15px, 0);
                    }
                    90% {
                        transform: translate3d(0, -4px, 0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }

                .animate-slide-up {
                    opacity: 0;
                    animation: slide-up 0.8s ease-out forwards;
                }

                .animate-slide-down {
                    animation: slide-down 0.5s ease-out forwards;
                }

                .animate-scale-in {
                    animation: scale-in 0.5s ease-out forwards;
                }

                .animate-fade-in-row {
                    opacity: 0;
                    animation: fade-in-row 0.6s ease-out forwards;
                }

                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }

                .animate-pulse-timer {
                    animation: pulse-timer 2s ease-in-out infinite;
                }

                .animate-bounce-celebration {
                    animation: bounce-celebration 1s ease-in-out;
                }

                /* Custom gradient backgrounds */
                .from-blue-25 { --tw-gradient-from: rgba(239, 246, 255, 0.5); }
                .to-purple-25 { --tw-gradient-to: rgba(250, 245, 255, 0.5); }

                /* Scrollbar styling */
                .scrollbar-hide::-webkit-scrollbar {
                    width: 0px;
                    background: transparent;
                }
                .scrollbar-hide {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
            `}</style>
        </div>
    );
}