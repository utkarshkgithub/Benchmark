// components/InstructorQR.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { QRCodeCanvas } from "qrcode.react";
import {
    generateQr,
    fetchInstructorSubjects,
} from "../../../../services/opretions/Subject";

const TWO_MIN = 120;

const InstructorQR = () => {
    const { token, user } = useSelector((s) => s.auth);

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loading, setLoading] = useState(false);

    const [qrData, setQrData] = useState(""); // shortId string from backend
    const [showQR, setShowQR] = useState(false);
    const [remaining, setRemaining] = useState(TWO_MIN);
    const timerRef = useRef(null);

    // ✅ Load instructor subjects
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

    // ✅ Generate QR
    const onGenerate = async () => {
        if (!selectedSubject) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("subjectCode", selectedSubject.subjectCode);
        try {
            const res = await generateQr(token, formData);
            const code = res?.data?.shortId || res?.data?.token || ""; // backend should return shortId
            if (!code) throw new Error("QR code missing in response");

            setQrData(code);
            setShowQR(true);
            setRemaining(TWO_MIN);
            startCountdown();
        } catch (e) {
            console.error("Generate QR failed:", e);
            alert("Failed to generate QR");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Countdown timer
    const startCountdown = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) {
                    clearInterval(timerRef.current);
                    closeQR();
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
    };

    const closeQR = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setShowQR(false);
        setQrData("");
        setRemaining(TWO_MIN);
    };

    useEffect(() => {
        return () => timerRef.current && clearInterval(timerRef.current);
    }, []);

    const timeLabel = useMemo(() => {
        const m = Math.floor(remaining / 60).toString().padStart(2, "0");
        const s = (remaining % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }, [remaining]);

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {!showQR && (
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

            {/* ✅ Fullscreen QR Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center gap-6 max-w-lg w-full">
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {selectedSubject?.subjectName} (
                                {selectedSubject?.subjectCode})
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

                        {/* ✅ Enlarged QR */}
                        <QRCodeCanvas value={qrData} size={500} className="p-4" />

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={closeQR}
                                className="px-6 py-3 rounded-lg bg-red-600 text-white text-lg"
                            >
                                Close
                            </button>
                            <button
                                onClick={onGenerate}
                                className="px-6 py-3 rounded-lg bg-indigo-600 text-white text-lg"
                            >
                                Regenerate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorQR;
