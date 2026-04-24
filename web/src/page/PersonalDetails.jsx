
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signUp } from "../services/opretions/Auth.js";
import { fetchAllSubjects } from "../services/opretions/Subject.js";
import Button from "../components/common/Button.jsx";

function PersonalDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { signupData } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [autoSubjects, setAutoSubjects] = useState([]);
  const [minorSubjects, setMinorSubjects] = useState([]);
  const [selectedMinorSubjects, setSelectedMinorSubjects] = useState([]);
  const [isMinor, setIsMinor] = useState(false);

  const [formData, setFormData] = useState({
    deviceId: "",
    rollNumber: "",
    branch: "",
    semester: "",
    department: "",
  });

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetchAllSubjects();
      setSubjects(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!signupData) navigate("/signup");
  }, [signupData, navigate]);

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

  const handleMinorSelect = (subjectId) => {
    setSelectedMinorSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  useEffect(() => {
    if (!isMinor) setSelectedMinorSubjects([]);
  }, [isMinor]);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (!signupData) return;

    const { accountType, firstName, lastName, email, password, confirmPassword, otp } = signupData;

    const finalSubjects = [
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
          "",
          isMinor,
          finalSubjects
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
    <div className="cb-auth-page">
      {loading ? (
        <div className="text-xl" style={{ color: "var(--text-primary)" }}>
          Loading...
        </div>
      ) : (
        <div className="cb-auth-card !max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.13em]" style={{ color: "var(--cb-link)" }}>
            onboarding details
          </p>
          <h1 className="cb-display-tight mt-2 text-3xl font-medium" style={{ color: "var(--text-primary)" }}>
            Complete your profile
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Add role-specific details to finalize your account creation.
          </p>

          {signupData?.accountType === "Student" && (
            <form onSubmit={handleOnSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Roll number
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleOnChange}
                    placeholder="Roll Number"
                    className="cb-input mt-2"
                    required
                  />
                </div>
              </div>

              <select
                name="branch"
                value={formData.branch}
                onChange={handleOnChange}
                className="cb-input"
                required
              >
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="MAE">MAE</option>
                <option value="MNC">MNC</option>
                <option value="PG">PG</option>
                <option value="NONE">NONE</option>
              </select>

              <select
                name="semester"
                value={formData.semester}
                onChange={handleOnChange}
                className="cb-input"
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

              {formData.branch && formData.semester && (
                <div className="space-y-2 rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Auto-selected subjects
                  </h3>
                  {autoSubjects.length > 0 ? (
                    autoSubjects.map((sub) => (
                      <label key={sub._id} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <input type="checkbox" checked readOnly disabled />
                        <span>{sub.subjectName} ({sub.subjectCode})</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      No subjects found for this Branch & Semester.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border-subtle)" }}>
                <input
                  type="checkbox"
                  id="isMinor"
                  checked={isMinor}
                  onChange={(e) => setIsMinor(e.target.checked)}
                />
                <label htmlFor="isMinor" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Opt for Minor Subjects
                </label>
              </div>

              {isMinor && formData.semester && (
                <div className="space-y-2 rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)" }}>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Available Minor Subjects
                  </h3>
                  {minorSubjects.length > 0 ? (
                    minorSubjects.map((sub) => (
                      <label key={sub._id} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <input
                          type="checkbox"
                          checked={selectedMinorSubjects.includes(sub._id)}
                          onChange={() => handleMinorSelect(sub._id)}
                        />
                        <span>{sub.subjectName} ({sub.subjectCode})</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      No minor subjects available for this semester.
                    </p>
                  )}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Create Account
              </Button>
            </form>
          )}

          {signupData?.accountType === "Instructor" && (
            <form onSubmit={handleOnSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleOnChange}
                  placeholder="Department"
                  className="cb-input mt-2"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full">
                Create Account
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default PersonalDetails;
