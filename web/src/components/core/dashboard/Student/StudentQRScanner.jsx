// Example: Student QR Scanner with Location Verification
// Add this to your student component where QR scanning happens

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { verifyQr } from '../../services/opretions/Subject';
import toast from 'react-hot-toast';

const StudentQRScanner = () => {
    const [qrCode, setQrCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useSelector((state) => state.auth);

    const handleQRScan = async (scannedQrCode) => {
        if (!scannedQrCode || !token) {
            toast.error("Invalid QR code or missing authentication");
            return;
        }

        setLoading(true);

        // Get student's current location
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by this browser. Please use a device with GPS capability.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const studentLat = position.coords.latitude;
                    const studentLng = position.coords.longitude;
                    
                    console.log(`Student Location: ${studentLat}, ${studentLng}`);

                    // Call verifyQr with student coordinates
                    const response = await verifyQr(token, scannedQrCode, studentLat, studentLng);
                    
                    if (response?.data?.success) {
                        const { locationName, distanceMeters } = response.data;
                        toast.success(
                            `Attendance marked successfully! ${
                                locationName ? `Location: ${locationName}` : ''
                            }${distanceMeters ? ` (Distance: ${distanceMeters}m)` : ''}`
                        );
                    }
                } catch (error) {
                    console.error("QR Verification Error:", error);
                    // Error is already handled by verifyQr function via toast
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                setLoading(false);
                console.error("Geolocation Error:", error);
                
                let errorMessage = "Location access denied. ";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "Please allow location access in your browser settings and try again.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Location information is unavailable. Please check your GPS settings.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "Location request timed out. Please try again.";
                        break;
                    default:
                        errorMessage += "An unknown error occurred while getting your location.";
                        break;
                }
                toast.error(errorMessage);
            },
            {
                enableHighAccuracy: true,  // Use GPS for better accuracy
                timeout: 10000,           // 10 second timeout
                maximumAge: 60000        // Cache location for 1 minute
            }
        );
    };

    // Manual QR input for testing
    const handleManualSubmit = () => {
        if (qrCode.trim()) {
            handleQRScan(qrCode.trim());
        } else {
            toast.error("Please enter a QR code");
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Scan QR for Attendance</h2>
            
            {/* Manual QR Input for Testing */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    QR Code (for testing)
                </label>
                <input
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Enter QR code manually"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button
                onClick={handleManualSubmit}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
            >
                {loading ? 'Verifying...' : 'Mark Attendance'}
            </button>

            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Note:</strong> Location access is required to mark attendance.</p>
                <p>Make sure you are within 50 meters of the class location.</p>
            </div>
        </div>
    );
};

export default StudentQRScanner;