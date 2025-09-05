import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchStudentAttendance } from "../../../../services/opretions/Subject";

const Student = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch attendance
  const getAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetchStudentAttendance(token);
      setAttendance(res?.data?.attendance || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Failed to fetch attendance");
    }
    setLoading(false);
  };

  useEffect(() => {
    getAttendance();
  }, []);

  useEffect(() => {
    const filtered = attendance.filter((record) =>
      record.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAttendance(filtered);
  }, [attendance, searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-100">
        <p className="text-gray-600 text-lg">Loading attendance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-70px)] w-[calc(100vw-30px)] overflow-hidden mt-4">
      <div className="overflow-scroll max-h-[calc(100vh-70px)]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome {user.firstName} {user.lastName} 👋
          </h1>
        </div>

        {/* Search bar */}
        <div className="mb-6 ml-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by subject name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Attendance Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((record, index) => (
              <div
                key={index}
                className="bg-gray-200 rounded-2xl shadow-lg p-6 flex flex-col items-start transition hover:shadow-xl"
              >
                <h2 className="text-lg font-bold text-gray-800 mb-1">
                  {record.subjectName}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Total Classes: {record.totalClasses}
                </p>

                <div className="w-full flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">Present</p>
                    <p className="text-lg font-semibold">{record.presentCount}</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm">Attendance</p>
                    <span
                      className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                        parseFloat(record.percentage) >= 75
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {record.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No attendance data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Student;
