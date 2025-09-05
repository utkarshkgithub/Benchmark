// components/InstructorQR.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { QRCodeCanvas } from "qrcode.react";
import {
    generateQr,
    fetchInstructorSubjects,
    getSubjectStudents,
    getAttendanceDetails,
    updateAttendance,
} from "../../../../services/opretions/Subject";
import { Link } from "react-router-dom";

const TWO_MIN = 5;

const InstructorQR = () => {
    const { token, user } = useSelector((s) => s.auth);

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const [qrData, setQrData] = useState("");
    const [currentAttendanceId, setCurrentAttendanceId] = useState(null);
    const [remaining, setRemaining] = useState(TWO_MIN);
    const timerRef = useRef(null);

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [initialAttendance, setInitialAttendance] = useState({});
    const [viewMode, setViewMode] = useState("initial"); // "initial", "qr", "list", "submitted"
    const [searchTerm, setSearchTerm] = useState("");

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

    const onGenerate = async () => {
        if (!selectedSubject) return;
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
            setRemaining(TWO_MIN);
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
            setStudents(studentRes?.data?.subject?.students || []);

            const attendanceRes = await getAttendanceDetails(
                token,
                currentAttendanceId
            );
            const attendanceRecord = attendanceRes?.data?.attendance;

            if (attendanceRecord) {
                const studentStatus = attendanceRecord.students.reduce((acc, rec) => {
                    acc[rec.student] = rec.status === "Present";
                    return acc;
                }, {});
                setAttendance(studentStatus);
                setInitialAttendance(studentStatus);
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

    const handleSubmitAttendance = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const finalAttendance = Object.keys(attendance).reduce(
                (acc, studentId) => {
                    acc[studentId] = attendance[studentId] ? "Present" : "Absent";
                    return acc;
                },
                {}
            );

            await updateAttendance(token, currentAttendanceId, finalAttendance);

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
        // TODO: Navigate to the attendance history page for the subject
        resetToInitial();
    };

    const resetToInitial = () => {
        setViewMode("initial");
        setQrData("");
        setStudents([]);
        setAttendance({});
        setInitialAttendance({});
        setCurrentAttendanceId(null);
        setSearchTerm("");
        setRemaining(TWO_MIN);
        setError(null);
        setSuccessMessage(null);
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
                `${student.firstName} ${student.lastName}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [students, searchTerm]);

    const attendanceStats = useMemo(() => {
        const totalStudents = students.length;
        const presentCount = Object.values(attendance).filter(Boolean).length;
        const absentCount = totalStudents - presentCount;
        const attendanceRate =
            totalStudents > 0
                ? ((presentCount / totalStudents) * 100).toFixed(1)
                : 0;

        return { totalStudents, presentCount, absentCount, attendanceRate };
    }, [students, attendance]);

    const getTimerColor = () => {
        if (remaining <= 30) return "text-red-600 border-red-500 bg-red-50";
        if (remaining <= 60) return "text-orange-600 border-orange-500 bg-orange-50";
        return "text-green-600 border-green-500 bg-green-50";
    };

    return (
        <div className="p-6 w-[calc(100vw-100px)] mx-auto space-y-8">
            {/* Banners */}
            {error && (
                <div className="rounded-lg p-4 shadow text-sm font-medium bg-red-50 text-red-800 border border-red-200">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="rounded-lg p-4 shadow text-sm font-medium bg-green-50 text-green-800 border border-green-200">
                    {successMessage}
                </div>
            )}

            {/* Initial Dashboard */}
            {viewMode === "initial" && (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
                        <p className="text-lg font-medium">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="mt-2 text-indigo-100">
                            Manage your classes and attendance here.
                        </p>
                        <div className="h-20 flex items-center justify-center">
                            <Link to='/dashboard/attendence-summary' className="bg-white p-2 rounded-xl text-xl text-black">
                                <button>
                                    View Summary
                                </button>
                            </Link>

                        </div>
                    </div>

                    {/* Select Subject Card */}
                    <div className="bg-white border rounded-2xl shadow-sm p-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Subject
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

                        <button
                            onClick={onGenerate}
                            disabled={!selectedSubject || loading}
                            className={`mt-6 w-full py-3 rounded-xl font-medium text-white transition-all ${!selectedSubject || loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg"
                                }`}
                        >
                            {loading ? "Generating QR..." : "Generate QR Code"}
                        </button>
                    </div>

                </div>
            )}

            {/* QR Modal */}
            {viewMode === "qr" && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 ">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-1 text-center">
                        <h3 className="text-2xl font-bold text-gray-800">
                            {selectedSubject?.subjectName}
                        </h3>
                        <p className="text-gray-500">{selectedSubject?.subjectCode}</p>

                        <div
                            className={`inline-flex items-center px-4 rounded-full border-2 ${getTimerColor()}`}
                        >
                            <span className="font-bold">{timeLabel}</span>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6">
                            <QRCodeCanvas value={qrData} size={420} />
                        </div>

                        <div className="flex flex-col gap-3">

                            <button
                                onClick={resetToInitial}
                                className="w-full py-2 rounded-xl border text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Review */}
            {viewMode === "list" && (
                <div className="space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-6 border shadow-sm text-center">
                            <p className="text-lg font-bold">{attendanceStats.totalStudents}</p>
                            <p className="text-sm text-gray-500">Total Students</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-6 border shadow-sm text-center">
                            <p className="text-lg font-bold text-green-600">{attendanceStats.presentCount}</p>
                            <p className="text-sm text-green-700">Present</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-6 border shadow-sm text-center">
                            <p className="text-lg font-bold text-red-600">{attendanceStats.absentCount}</p>
                            <p className="text-sm text-red-700">Absent</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-6 border shadow-sm text-center">
                            <p className="text-lg font-bold text-indigo-600">{attendanceStats.attendanceRate}%</p>
                            <p className="text-sm text-indigo-700">Rate</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                    />

                    {/* Students Table */}
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        {filteredStudents.length === 0 ? (
                            <p className="p-6 text-center text-gray-500">
                                No students found.
                            </p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-left">Roll</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((s, i) => (
                                        <tr
                                            key={s._id}
                                            className={`hover:bg-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                                }`}
                                        >
                                            <td className="p-3">
                                                {s.firstName} {s.lastName}
                                            </td>
                                            <td className="p-3">{s.rollNumber}</td>
                                            <td className="p-3 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${attendance[s._id]
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {attendance[s._id] ? "Present" : "Absent"}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!attendance[s._id]}
                                                    onChange={(e) =>
                                                        handleCheckboxChange(s._id, e.target.checked)
                                                    }
                                                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">

                        <button
                            onClick={resetToInitial}
                            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
                        >
                            Back
                        </button>

                        <button
                            onClick={handleSubmitAttendance}
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
            )}
            {/* Submitted View */}
            {viewMode === "submitted" && (
                <div className="bg-white border rounded-2xl shadow-sm p-8 text-center space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">Attendance Submitted!</h2>
                    <p className="text-gray-600">
                        The attendance for <strong>{selectedSubject?.subjectName}</strong> has been recorded.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={handleViewAttendance}
                            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                        >
                            View Attendance History
                        </button>
                        <button
                            onClick={resetToInitial}
                            className="px-6 py-3 rounded-xl border text-gray-600 hover:bg-gray-50"
                        >
                            Mark Another Attendance
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default InstructorQR;
