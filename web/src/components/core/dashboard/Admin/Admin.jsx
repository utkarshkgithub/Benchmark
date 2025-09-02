import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { fetchAllSubjects } from "../../../../services/opretions/Subject";


const Admin = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetcheSubject  = async () =>{
    setLoading(true);
    try {
      const res = await fetchAllSubjects();
      setSubjects(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to fetch subjects");
    }
    setLoading(false);
  }


  useEffect(() => {   
    fetcheSubject();
  }, []); // The empty dependency array ensures this effect runs only once on mount

  useEffect(() => {
    const filtered = subjects.filter(subject => 
      subject.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [subjects, searchTerm]);

const handleAddSubject = () =>{
  navigate("/dashboard/create-subject");
}


  const handleDelete = async (subjectId) => {
    
    alert("handle delet clicked.");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-100">
        <p className="text-gray-600 text-lg">Loading subjects...</p>
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
    <div className="  max-h-[calc(100vh-70px)] w-[calc(100vw-100px)] overflow-hidden">
      <div className=" overflow-scroll max-h-[calc(100vh-70px)]">

      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Subjects</h1>
        <button onClick={handleAddSubject} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors mt-2">
          + Add Subject
        </button>
      </div>
      <div className="mb-4 ml-1">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by subject code..."
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
      <div className="bg-white rounded-lg shadow-md overflow-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SUBJECT NAME
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CODE
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                INSTRUCTOR
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SEMESTER
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                BRANCH
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubjects.map((subject) => (
              <tr key={subject._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                  {subject.subjectName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subject.subjectCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subject.instructor?.firstName} {subject.instructor?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subject.semester}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subject.branches?.join(", ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(subject._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default Admin;