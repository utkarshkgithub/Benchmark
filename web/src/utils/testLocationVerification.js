// Debug Test File - Location Verification Test
// Use this to test location verification manually

// Test Cases:
// 1. QR with location + student far away = Should get error
// 2. QR with location + student nearby = Should mark attendance
// 3. QR with location + no student coords = Should get error

const testLocationVerification = () => {
    // Test coordinates (you can replace with actual coordinates)
    const classLocation = {
        latitude: 28.6139,   // Example: Delhi coordinates
        longitude: 77.2090
    };

    const studentNearby = {
        latitude: 28.6140,   // ~11 meters away
        longitude: 77.2091
    };

    const studentFaraway = {
        latitude: 28.6200,   // ~680 meters away  
        longitude: 77.2150
    };

    // Haversine distance calculation function
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const R = 6371000; // earth radius in meters
        
        const lat1Rad = toRad(lat1);
        const lon1Rad = toRad(lon1);
        const lat2Rad = toRad(lat2);
        const lon2Rad = toRad(lon2);
        
        const dlat = lat2Rad - lat1Rad;
        const dlon = lon2Rad - lon1Rad;
        
        const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) + 
                 Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
                 Math.sin(dlon / 2) * Math.sin(dlon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return Math.round(R * c); // distance in meters
    };

    console.log("=== Location Verification Test ===");
    console.log(`Class Location: ${classLocation.latitude}, ${classLocation.longitude}`);
    
    const nearbyDistance = calculateDistance(
        classLocation.latitude, classLocation.longitude,
        studentNearby.latitude, studentNearby.longitude
    );
    
    const farawayDistance = calculateDistance(
        classLocation.latitude, classLocation.longitude,
        studentFaraway.latitude, studentFaraway.longitude
    );
    
    console.log(`\nStudent Nearby: ${studentNearby.latitude}, ${studentNearby.longitude}`);
    console.log(`Distance: ${nearbyDistance}m (Should be ALLOWED - ≤50m)`);
    
    console.log(`\nStudent Far Away: ${studentFaraway.latitude}, ${studentFaraway.longitude}`);
    console.log(`Distance: ${farawayDistance}m (Should be REJECTED - >50m)`);
    
    console.log("\n=== Test Scenarios ===");
    console.log("1. QR with location + student nearby → ✅ Attendance marked");
    console.log("2. QR with location + student far away → ❌ Error: Too far");
    console.log("3. QR with location + no coordinates → ❌ Error: Location required");
    
    return {
        classLocation,
        studentNearby,
        studentFaraway,
        nearbyDistance,
        farawayDistance
    };
};

// Test with your actual coordinates
console.log(testLocationVerification());

export default testLocationVerification;