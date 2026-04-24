import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchStudentAttendance } from "../../../../services/opretions/Subject";

const Student = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

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

  // Handle card click to navigate to calendar view
  const handleCardClick = (subjectId, subjectName) => {
    navigate(`/dashboard/student/attendance/${subjectId}`, {
      state: { subjectName }
    });
  };

  if (loading) {
    return (
      <div 
        className="cb-auth-page"
        style={{
          minHeight: 'calc(100vh - 80px)'
        }}
      >
        <div className="cb-card rounded-3xl px-6 py-5 text-center" style={{ color: 'var(--text-primary)' }}>
          Loading attendance...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="cb-auth-page"
        style={{
          minHeight: 'calc(100vh - 80px)'
        }}
      >
        <div className="cb-card rounded-3xl px-6 py-5 text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[calc(100vh-80px)] px-4 py-8"
      style={{
        background:
          'radial-gradient(circle at 12% 18%, rgba(0, 82, 255, 0.10), transparent 34%), radial-gradient(circle at 86% 80%, rgba(10, 11, 13, 0.08), transparent 32%), var(--surface-primary)'
      }}
    >
      <div className="cb-container space-y-6">
        <header className="cb-card rounded-3xl p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: 'var(--cb-link)' }}>
                Student Dashboard
              </p>
              <h1 className="cb-display-tight mt-2 text-3xl font-medium md:text-4xl" style={{ color: 'var(--text-primary)' }}>
                Welcome {user.firstName} {user.lastName}
              </h1>
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder="Search by subject name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cb-input"
              />
            </div>
          </div>
        </header>

        <div className="space-y-4">
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((record, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(record.subjectId, record.subjectName)}
                className="cb-card cursor-pointer rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  background: 'var(--surface-primary)'
                }}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <h2 
                    className="text-xl font-semibold"
                    style={{
                      color: 'var(--text-primary)'
                    }}
                  >
                    {record.subjectName}
                  </h2>
                  <svg 
                    className="h-5 w-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--cb-blue)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p 
                  className="mb-2 text-sm"
                  style={{
                    color: 'var(--text-secondary)'
                  }}
                >
                  Total Classes: {record.totalClasses}
                </p>
                <p 
                  className="mb-4 text-xs font-semibold"
                  style={{ color: 'var(--cb-link)' }}
                >
                  Click to view attendance calendar →
                </p>

                <div className="w-full flex justify-between items-center">
                  <div>
                    <p 
                      className="text-sm"
                      style={{
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Present
                    </p>
                    <p 
                      className="text-lg font-semibold"
                      style={{
                        color: 'var(--text-primary)'
                      }}
                    >
                      {record.presentCount}
                    </p>
                  </div>

                  <div>
                    <p 
                      className="text-sm"
                      style={{
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Attendance
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
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
            <div 
                className="text-center"
              style={{
                  color: 'var(--text-secondary)'
              }}
            >
              No attendance data available
            </div>
          )}
          </div>
      </div>
    </div>
  );
};

export default Student;
