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

const TWO_MIN = 120;

const InstructorQR = () => {
    const { token, user } = useSelector((s) => s.auth);

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loading, setLoading] = useState(false);

    const [qrData, setQrData] = useState("");
    const [currentAttendanceId, setCurrentAttendanceId] = useState(null);
    const [remaining, setRemaining] = useState(TWO_MIN);
    const timerRef = useRef(null);

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [initialAttendance, setInitialAttendance] = useState({});
    const [viewMode, setViewMode] = useState("initial"); // "initial", "qr", "list"

    useEffect(() => {
        (async () => {
            try {
                const res = await fetchInstructorSubjects(token);
                const list = res?.data?.subjects || [];
                setSubjects(list);
                if (list.length > 0) setSelectedSubject(list[0]);
            } catch (e) {
                console.error("Failed to fetch subjects:", e);
            }
        })();
    }, [token]);

    useEffect(() => {
        if (remaining <= 0 && viewMode === 'qr') {
            (async () => await closeQR())();
        }
    }, [remaining, viewMode]);

    const onGenerate = async () => {
        if (!selectedSubject) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("subjectId", selectedSubject._id);
        try {
            const res = await generateQr(token, formData);
            const code = res?.data?.token || "";
            const attendanceId = res?.data?.attendenceId || null;

            if (!code || !attendanceId) throw new Error("QR code or Attendance ID missing in response");

            setQrData(code);
            setCurrentAttendanceId(attendanceId);
            setViewMode("qr");
            setRemaining(TWO_MIN);
            startCountdown();
        } catch (e) {
            console.error("Generate QR failed:", e);
            alert("Failed to generate QR");
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
        try {
            const studentRes = await getSubjectStudents(token, selectedSubject._id);
            setStudents(studentRes?.data?.subject?.students || []);

            const attendanceRes = await getAttendanceDetails(token, currentAttendanceId);
            const attendanceRecord = attendanceRes?.data?.attendance;
            if (attendanceRecord) {
                const studentStatus = attendanceRecord.students.reduce((acc, rec) => {
                    acc[rec.student] = rec.status === "Present";
                    return acc;
                }, {});
                setAttendance(studentStatus);
                setInitialAttendance(studentStatus);
            }
        } catch (e) {
            console.error("Failed to fetch attendance data:", e);
            alert("Could not load student attendance. Please try again.");
            setViewMode("initial");
            setQrData("");
            return;
        } finally {
            setLoading(false);
        }

        setViewMode("list");
        setRemaining(TWO_MIN);
    };

    const handleCheckboxChange = (studentId, isChecked) => {
        setAttendance((prev) => ({ ...prev, [studentId]: isChecked }));
    };

    const handleSubmitAttendance = async () => {
        setLoading(true);
        try {
            const finalAttendance = Object.keys(attendance).reduce((acc, studentId) => {
                acc[studentId] = attendance[studentId] ? "Present" : "Absent";
                return acc;
            }, {});

            await updateAttendance(token, currentAttendanceId, finalAttendance);
            alert("Attendance updated successfully!");

            setViewMode("initial");
            setQrData("");
            setStudents([]);
            setAttendance({});
            setInitialAttendance({});
            setCurrentAttendanceId(null);
        } catch (e) {
            console.error("Failed to update attendance:", e);
            alert("Failed to submit changes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => timerRef.current && clearInterval(timerRef.current);
    }, []);

    const timeLabel = useMemo(() => {
        if (remaining < 0) return "00:00";
        const m = Math.floor(remaining / 60)
            .toString()
            .padStart(2, "0");
        const s = (remaining % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }, [remaining]);

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {viewMode === "initial" && (
                <>
                    <h2 className="text-2xl font-bold mb-6">Instructor Dashboard</h2>
                    <div className="bg-white rounded-xl shadow p-5 mb-6">
                        <div className="text-gray-700 mb-3">
                            Welcome,{" "}
                            <strong>
                                {user?.firstName?.toUpperCase()}{" "}
                                {user?.lastName?.toUpperCase()}
                            </strong>
                        </div>
                        <label className="block text-sm font-medium mb-2">
                            Select Subject
                        </label>
                        <select
                            className="w-full border rounded p-2 mb-4"
                            value={selectedSubject?._id || ""}
                            onChange={(e) => {
                                const subj = subjects.find(
                                    (s) => s._id === e.target.value
                                );
                                setSelectedSubject(subj || null);
                            }}
                        >
                            <option value="">-- choose --</option>
                            {subjects.map((s) => (
                                <option key={s._id} value={s._id}>
                                    {s.subjectName} ({s.subjectCode})
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={onGenerate}
                            disabled={!selectedSubject || loading}
                            className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
                        >
                            {loading ? "Generating..." : "Generate QR"}
                        </button>
                    </div>
                </>
            )}

            {viewMode === "qr" && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center gap-6 max-w-lg w-full">
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {selectedSubject?.subjectName} ({selectedSubject?.subjectCode})
                            </div>
                            <div
                                className={`inline-block mt-2 px-4 py-2 rounded-full border text-lg ${
                                    remaining <= 30
                                        ? "border-red-500 text-red-600"
                                        : "border-green-500 text-green-600"
                                }`}
                            >
                                Time remaining: <b>{timeLabel}</b>
                            </div>
                        </div>
                        <QRCodeCanvas value={qrData} size={500} className="p-4" />
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={async () => await closeQR()}
                                className="px-6 py-3 rounded-lg bg-red-600 text-white text-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === "list" && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">
                        Attendance for {selectedSubject?.subjectName}
                    </h2>
                    <div className="flex justify-between items-center mb-4">
                        <p>Total Students: {students.length}</p>
                        <button
                            onClick={handleSubmitAttendance}
                            disabled={loading}
                            className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Submit Changes"}
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5">
                        {students.map((student) => (
                            <div
                                key={student._id}
                                className="flex items-center justify-between py-2 border-b"
                            >
                                <span>
                                    {student.firstName} {student.lastName}
                                </span>
                                <div className="flex items-center">
                                    <label
                                        htmlFor={`att-${student._id}`}
                                        className="mr-2"
                                    >
                                        {attendance[student._id] ? "Present" : "Absent"}
                                    </label>
                                    <input
                                        type="checkbox"
                                        id={`att-${student._id}`}
                                        checked={!!attendance[student._id]}
                                        onChange={(e) =>
                                            handleCheckboxChange(student._id, e.target.checked)
                                        }
                                        className="form-checkbox h-5 w-5 text-indigo-600"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            setViewMode("initial");
                            setQrData("");
                            setStudents([]);
                            setAttendance({});
                            setInitialAttendance({});
                            setCurrentAttendanceId(null);
                        }}
                        className="mt-4 px-4 py-2 rounded bg-gray-500 text-white"
                    >
                        Back to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default InstructorQR;
