import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  deleteSubject,
  fetchAllStudents,
  fetchAllSubjects
} from "../../../../services/opretions/Subject";
import { deleteStudent } from "../../../../services/opretions/Settings";

const Admin = () => {
  const { token } = useSelector((state) => state.auth);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subjectSortField, setSubjectSortField] = useState(null);
  const [subjectSortOrder, setSubjectSortOrder] = useState("asc");
  const [studentSortField, setStudentSortField] = useState(null);
  const [studentSortOrder, setStudentSortOrder] = useState("asc");

  const navigate = useNavigate();

  const fetcheSubject = async () => {
    setLoading(true);
    try {
      const res = await fetchAllSubjects();
      setSubjects(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to fetch subjects");
    }
    setLoading(false);
  };

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const res = await fetchAllStudents();
      setStudents(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to fetch students");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetcheSubject();
    fetchStudent();
  }, []);

  useEffect(() => {
    const filtered = subjects.filter((subject) =>
      subject.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [subjects, searchTerm]);

  const handleAddSubject = () => {
    navigate("/dashboard/create-subject");
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      await deleteSubject(subjectId, token);
      toast.success("Subject deleted successfully");
      fetcheSubject();
    } catch (error) {
      toast.error("Failed to delete subject");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      await deleteStudent(studentId, token);
      toast.success("Student deleted successfully");
      fetchStudent();
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };

  // Helper to access nested fields
  const getFieldValue = (obj, field) => {
    if (!field.includes(".")) return obj[field];
    const keys = field.split(".");
    let value = obj;
    for (let key of keys) {
      value = value ? value[key] : "";
    }
    return value || "";
  };

  // Sorting logic
  const sortData = (data, field, order) => {
    if (!field) return data;
    return [...data].sort((a, b) => {
      let aField = getFieldValue(a, field);
      let bField = getFieldValue(b, field);
      if (typeof aField === "string") aField = aField.toLowerCase();
      if (typeof bField === "string") bField = bField.toLowerCase();
      if (aField < bField) return order === "asc" ? -1 : 1;
      if (aField > bField) return order === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortSubjects = () => {
    return sortData(filteredSubjects, subjectSortField, subjectSortOrder);
  };

  const sortStudents = () => {
    return sortData(students, studentSortField, studentSortOrder);
  };

  const handleSubjectSort = (field) => {
    if (subjectSortField === field) {
      setSubjectSortOrder(subjectSortOrder === "asc" ? "desc" : "asc");
    } else {
      setSubjectSortField(field);
      setSubjectSortOrder("asc");
    }
  };

  const handleStudentSort = (field) => {
    if (studentSortField === field) {
      setStudentSortOrder(studentSortOrder === "asc" ? "desc" : "asc");
    } else {
      setStudentSortField(field);
      setStudentSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-100">
        <p className="text-gray-600 text-lg">Loading...</p>
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
    <div className="max-h-[calc(100vh-70px)] w-[calc(100vw-100px)] overflow-hidden">
      <div className="overflow-scroll max-h-[calc(100vh-70px)] p-4 space-y-8">

        {/* Subjects Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage Subjects</h1>
            <button onClick={handleAddSubject} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors mt-2">
              + Add Subject
            </button>
          </div>
          <input
            type="text"
            placeholder="Search by subject code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          <div className="bg-white rounded-lg shadow-md overflow-scroll max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSubjectSort("subjectName")}>
                    SUBJECT NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSubjectSort("subjectCode")}>
                    CODE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    INSTRUCTOR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSubjectSort("semester")}>
                    SEMESTER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BRANCH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortSubjects().map((subject) => (
                  <tr key={subject._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{subject.subjectName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.subjectCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.instructor?.firstName} {subject.instructor?.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.semester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.branches?.join(", ")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteSubject(subject._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Students</h1>
          <div className="bg-white rounded-lg shadow-md overflow-scroll max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleStudentSort("userId.firstName")}>
                    NAME
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleStudentSort("rollNumber")}>
                    ROLL NUMBER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleStudentSort("branch")}>
                    BRANCH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleStudentSort("semester")}>
                    SEMESTER
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortStudents().map((student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.userId?.firstName} {student.userId?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteStudent(student._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
