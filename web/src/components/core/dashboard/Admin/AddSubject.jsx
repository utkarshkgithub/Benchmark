import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { addSubject } from '../../../../services/opretions/Subject';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiConnector } from '../../../../services/apiconnector';
import { subjectEndPoints } from '../../../../services/api';
import toast from 'react-hot-toast';

const AddSubject = () => {
  const [allInstructor, setAllInstructor] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  const { token } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fetchInstructor = async () => {
    try {
      const response = await apiConnector("GET", subjectEndPoints.FATCH_INSTRUCTOR_API);
      setAllInstructor(response?.data?.data || []);
      // console.log(response?.data?.data);
    } catch (err) {
      console.error("Error fetching instructors:", err);
    }
  };

  useEffect(() => {
    fetchInstructor();
  }, []);

  const onSubmit = async (data) => {
    // console.log("instructor",data.instructor);
    
    // ✅ Ensure branches is always an array
    const branches = Array.isArray(data.branches) ? data.branches : [data.branches];
    
    const formData = {
      subjectName: data.subjectName,
      subjectCode: data.subjectCode,
      instructor: data.instructor,
      semester: data.semester,
      branches: branches,
      isMinor: data.isMinor ? true : false
    };

    try {
      setLoading(true);
      await addSubject(formData, token, navigate);
      reset();
    } catch (error) {
      console.log("CREATE SUBJECT API ERROR............", error);
      toast.error(error?.response?.data?.message || "Could Not Create Subject");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    toast.success("Form cancelled");
    navigate("/dashboard/admin");
  };

  return (
    <div className="flex justify-center w-[calc(100vw-70px)] items-center p-4" style={{
      backgroundColor: darkMode ? '#111827' : '#f9fafb'
    }}>
      <div className="rounded-lg shadow-lg p-8 w-full max-w-2xl" style={{
        backgroundColor: darkMode ? '#1f2937' : '#ffffff'
      }}>
        <h2 className="text-2xl font-bold mb-2" style={{
          color: darkMode ? '#ffffff' : '#1f2937'
        }}>Add New Subject</h2>
        <p className="text-sm mb-6" style={{
          color: darkMode ? '#d1d5db' : '#6b7280'
        }}>
          Fill in the details below to create a new subject for the curriculum.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>Subject Name</label>
              <input
                type="text"
                placeholder="e.g., Advanced Calculus"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}
                {...register('subjectName', { required: true })}
              />
            </div>

            {/* Subject Code */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>Subject Code</label>
              <input
                type="text"
                placeholder="e.g., MATH301"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}
                {...register('subjectCode', { required: true })}
              />
            </div>

            {/* Instructor */}
            <div className="col-span-full">
              <label className="block text-sm font-medium mb-1" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>Instructor</label>
              <select
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}
                {...register('instructor', { required: true })}
              >
                <option value="">Select an instructor</option>
                {allInstructor.map((instructor,index) => (
                  <option value={instructor._id} key={index}>
                    {instructor.firstName} {instructor.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>Semester</label>
              <select
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
                style={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#ffffff' : '#1f2937'
                }}
                {...register('semester', { required: true })}
              >
                <option value="">Select a semester</option>
                <option value="I">Semester 1</option>
                <option value="II">Semester 2</option>
                <option value="III">Semester 3</option>
                <option value="IV">Semester 4</option>
                <option value="V">Semester 5</option>
                <option value="VI">Semester 6</option>
                <option value="VII">Semester 7</option>
                <option value="VIII">Semester 8</option>
              </select>
            </div>

            {/* Branches */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>Branches</label>
              <div className="space-y-2 mt-1">
                {["CSE", "ECE", "MNC", "MAE", "PG","NONE"].map((branch) => (
                  <label key={branch} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={branch}
                      {...register('branches', { required: "Please select at least one branch" })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                      style={{
                        backgroundColor: darkMode ? '#374151' : '#ffffff',
                        borderColor: darkMode ? '#4b5563' : '#d1d5db'
                      }}
                    />
                    <span className="text-sm" style={{
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>{branch}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Is Minor */}
            <div className="col-span-full">
              <label className="flex items-center space-x-2 text-sm font-medium mb-1" style={{
                color: darkMode ? '#d1d5db' : '#374151'
              }}>
                <input
                  type="checkbox"
                  {...register('isMinor')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#d1d5db'
                  }}
                />
                <span>Is this a Minor Subject?</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border rounded-md font-medium hover:opacity-80"
              style={{
                backgroundColor: darkMode ? '#374151' : '#f9fafb',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
                color: darkMode ? '#ffffff' : '#374151'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md shadow-sm text-white bg-blue-600 font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubject;
