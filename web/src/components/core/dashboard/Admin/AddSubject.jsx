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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fetchInstructor = async () => {
    try {
      const response = await apiConnector("GET", subjectEndPoints.FATCH_INSTRUCTOR_API);
      setAllInstructor(response?.data?.data || []);
      console.log(response?.data?.data);
    } catch (err) {
      console.error("Error fetching instructors:", err);
    }
  };

  useEffect(() => {
    fetchInstructor();
  }, []);

  const onSubmit = async (data) => {
    console.log("instructor",data.instructor);
    
    const formData = new FormData();
    formData.append("subjectName", data.subjectName);
    formData.append("subjectCode", data.subjectCode);
    formData.append("instructor", data.instructor);
    formData.append("semester", data.semester);

    // ✅ Ensure branches is always an array
    const branches = Array.isArray(data.branches) ? data.branches : [data.branches];
    branches.forEach(branch => {
      formData.append("branches", branch);
    });

    // Handle isMinor
    formData.append("isMinor", data.isMinor ? true : false);

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

  const handleCancel = () => reset();

  return (
    <div className="flex justify-center w-[calc(100vw-70px)] items-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Add New Subject</h2>
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details below to create a new subject for the curriculum.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
              <input
                type="text"
                placeholder="e.g., Advanced Calculus"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                {...register('subjectName', { required: true })}
              />
            </div>

            {/* Subject Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
              <input
                type="text"
                placeholder="e.g., MATH301"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                {...register('subjectCode', { required: true })}
              />
            </div>

            {/* Instructor */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Branches</label>
              <div className="space-y-2 mt-1">
                {["CSE", "ECE", "MNC", "MAE", "PG"].map((branch) => (
                  <label key={branch} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={branch}
                      {...register('branches', { required: "Please select at least one branch" })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{branch}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Is Minor */}
            <div className="col-span-full">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                <input
                  type="checkbox"
                  {...register('isMinor')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md shadow-sm text-white bg-blue-600 font-medium hover:bg-blue-700"
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
