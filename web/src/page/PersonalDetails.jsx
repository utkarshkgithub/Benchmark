
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signUp } from "../services/opretions/Auth.js";
import { fetchAllSubjects } from "../services/opretions/Subject.js";

function PersonalDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { signupData } = useSelector((state) => state.auth);
  
  // Get theme state
  const themeState = useSelector((state) => state.theme)
  const darkMode = themeState?.darkMode || false

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [autoSubjects, setAutoSubjects] = useState([]);              // branch+semester subjects
  const [minorSubjects, setMinorSubjects] = useState([]);            // semester + isMinor:true
  const [selectedMinorSubjects, setSelectedMinorSubjects] = useState([]); // user-chosen minors
  const [isMinor, setIsMinor] = useState(false);

  const [formData, setFormData] = useState({
    deviceId: "",
    rollNumber: "",
    branch: "",
    semester: "",
    department: "",
  });

  // Fetch all subjects on mount
  const fetcheSubject = async () => {
    setLoading(true);
    try {
      const res = await fetchAllSubjects();
      setSubjects(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
    setLoading(false);
  };

  useEffect(() => { fetcheSubject(); }, []);

  // Redirect if signupData missing
  useEffect(() => {
    if (!signupData) navigate("/signup");
  }, [signupData, navigate]);

  // Recompute lists when branch/semester change
  useEffect(() => {
    if (formData.branch && formData.semester) {
      const autos = subjects.filter(
        (sub) =>
          sub.semester === formData.semester &&
          Array.isArray(sub.branches) &&
          sub.branches.includes(formData.branch)
      );
      setAutoSubjects(autos);

      const minors = subjects.filter(
        (sub) => sub.semester === formData.semester && sub.isMinor === true
      );
      setMinorSubjects(minors);

      // Reset minor selections on change
      setSelectedMinorSubjects([]);
    } else {
      setAutoSubjects([]);
      setMinorSubjects([]);
      setSelectedMinorSubjects([]);
    }
  }, [formData.branch, formData.semester, subjects]);

  const handleOnChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Minor select toggles
  const handleMinorSelect = (subjectId) => {
    setSelectedMinorSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // If user unticks Minor, clear chosen minors
  useEffect(() => {
    if (!isMinor) setSelectedMinorSubjects([]);
  }, [isMinor]);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (!signupData) return;

    const { accountType, firstName, lastName, email, password, confirmPassword, otp } = signupData;

    // Combine auto + chosen minors
    const finalSubjects = [
      // ...autoSubjects.map((s) => s._id),
      ...selectedMinorSubjects,
    ];

    if (accountType === "Student") {
      dispatch(
        signUp(
          accountType,
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          otp,
          navigate,
          formData.deviceId,
          formData.rollNumber,
          formData.branch,
          formData.semester,
          "",              // department (student ke liye khali)
          isMinor,         // ✅ ab isMinor sahi jagah pe
          finalSubjects    // ✅ ab selectedSubjects sahi jagah pe
        )
      );

    } else if (accountType === "Instructor") {
      dispatch(
        signUp(
          accountType,
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          otp,
          navigate,
          "",
          "",
          "",
          "",
          formData.department
        )
      );
    }
  };

  return (
    <div 
      className="min-h-screen mt-20 flex items-center justify-center"
      style={{
        backgroundColor: darkMode ? '#111827' : '#f9fafb',
        color: darkMode ? '#ffffff' : '#111827'
      }}
    >
      {loading ? (
        <div 
          className="text-xl"
          style={{
            color: darkMode ? '#ffffff' : '#111827'
          }}
        >
          Loading...
        </div>
      ) : (
        <div 
          className="w-full max-w-md p-6 rounded-lg shadow-md"
          style={{
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            boxShadow: darkMode 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          <h1 
            className="text-2xl font-bold mb-4"
            style={{
              color: darkMode ? '#f9fafb' : '#111827'
            }}
          >
            Provide Additional Details
          </h1>

          {signupData?.accountType === "Student" && (
            <form onSubmit={handleOnSubmit} className="space-y-5">
              <input
                type="text"
                name="deviceId"
                value={formData.deviceId}
                onChange={handleOnChange}
                placeholder="Device ID"
                className="w-full px-3 py-2 border rounded-md"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#6b7280' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#111827'
                }}
                required
              />
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleOnChange}
                placeholder="Roll Number"
                className="w-full px-3 py-2 border rounded-md"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#6b7280' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#111827'
                }}
                required
              />

              <select
                name="branch"
                value={formData.branch}
                onChange={handleOnChange}
                className="w-full px-3 py-2 border rounded-md"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#6b7280' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#111827'
                }}
                required
              >
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="MAE">MAE</option>
                <option value="MNC">MNC</option>
                <option value="PG">PG</option>
              </select>

              <select
                name="semester"
                value={formData.semester}
                onChange={handleOnChange}
                className="w-full px-3 py-2 border rounded-md"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#6b7280' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#111827'
                }}
                required
              >
                <option value="">Select Semester</option>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
                <option value="VI">VI</option>
                <option value="VII">VII</option>
                <option value="VIII">VIII</option>
              </select>

              {/* Auto subjects (visible, checked, not changeable) */}
              {formData.branch && formData.semester && (
                <div className="space-y-2">
                  <h3 
                    className="font-semibold"
                    style={{
                      color: darkMode ? '#f9fafb' : '#111827'
                    }}
                  >
                    Your Subjects (Auto-selected)
                  </h3>
                  {autoSubjects.length > 0 ? (
                    autoSubjects.map((sub) => (
                      <label key={sub._id} className="flex items-center gap-2 opacity-80">
                        <input type="checkbox" checked readOnly disabled />
                        <span
                          style={{
                            color: darkMode ? '#d1d5db' : '#374151'
                          }}
                        >
                          {sub.subjectName} ({sub.subjectCode})
                        </span>
                      </label>
                    ))
                  ) : (
                    <p 
                      className="text-sm"
                      style={{
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      No subjects found for this Branch & Semester.
                    </p>
                  )}
                </div>
              )}

              {/* Minor toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isMinor"
                  checked={isMinor}
                  onChange={(e) => setIsMinor(e.target.checked)}
                />
                <label 
                  htmlFor="isMinor"
                  style={{
                    color: darkMode ? '#f9fafb' : '#111827'
                  }}
                >
                  Opt for Minor Subjects
                </label>
              </div>

              {/* Minor subjects (only when opted) */}
              {isMinor && formData.semester && (
                <div className="space-y-2">
                  <h3 
                    className="font-semibold"
                    style={{
                      color: darkMode ? '#f9fafb' : '#111827'
                    }}
                  >
                    Available Minor Subjects
                  </h3>
                  {minorSubjects.length > 0 ? (
                    minorSubjects.map((sub) => (
                      <label key={sub._id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedMinorSubjects.includes(sub._id)}
                          onChange={() => handleMinorSelect(sub._id)}
                        />
                        <span
                          style={{
                            color: darkMode ? '#d1d5db' : '#374151'
                          }}
                        >
                          {sub.subjectName} ({sub.subjectCode})
                        </span>
                      </label>
                    ))
                  ) : (
                    <p 
                      className="text-sm"
                      style={{
                        color: darkMode ? '#9ca3af' : '#6b7280'
                      }}
                    >
                      No minor subjects available for this semester.
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-4 rounded-md font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 text-white"
              >
                Create Account
              </button>
            </form>
          )}

          {signupData?.accountType === "Instructor" && (
            <form onSubmit={handleOnSubmit} className="space-y-5">
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleOnChange}
                placeholder="Department"
                className="w-full px-3 py-2 border rounded-md"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#6b7280' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#111827'
                }}
                required
              />
              <button 
                type="submit" 
                className="w-full py-2 px-4 rounded-md font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-800 text-white"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default PersonalDetails;
