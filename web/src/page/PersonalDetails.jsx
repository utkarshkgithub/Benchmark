import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signUp } from "../services/opretions/Auth.js";

function PersonalDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { signupData, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    deviceId: "",
    rollNumber: "",
    branch: "",
    semester: "",
    department: "",
  });

  useEffect(() => {
    if (!signupData) {
      navigate("/signup");
    }
  }, [signupData, navigate]);

  const handleOnChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (!signupData) return;

    const { accountType, firstName, lastName, email, password, confirmPassword, otp } = signupData;

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
          formData.semester
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
    <div className="min-h-screen mt-20 flex items-center justify-center bg-gray-900 text-white">
      {loading ? (
        <div className="text-xl">Loading...</div>
      ) : (
        <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Provide Additional Details</h1>

          {signupData?.accountType === "Student" && (
            <form onSubmit={handleOnSubmit} className="space-y-5">
              <input
                type="text"
                name="deviceId"
                value={formData.deviceId}
                onChange={handleOnChange}
                placeholder="Device ID"
                className="w-full px-3 py-2 border rounded-md text-black"
                required
              />
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleOnChange}
                placeholder="Roll Number"
                className="w-full px-3 py-2 border rounded-md text-black"
                required
              />
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleOnChange}
                placeholder="Branch"
                className="w-full px-3 py-2 border rounded-md text-black"
                required
              />
              <select
                name="semester"
                value={formData.semester}
                onChange={handleOnChange}
                className="w-full px-3 py-2 border rounded-md text-black"
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
              <button type="submit" className="w-full py-2 px-4 bg-teal-600 rounded-md text-white">
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
                className="w-full px-3 py-2 border rounded-md text-black"
                required
              />
              <button type="submit" className="w-full py-2 px-4 bg-teal-600 rounded-md text-white">
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
