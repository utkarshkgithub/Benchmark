import toast from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { subjectEndPoints } from "../api";



export const fetchAllSubjects = async (navigate) => {
    const toastId = toast.loading("Loading...");
    try {
        const response = await apiConnector(
            "GET",
            subjectEndPoints.FETCH_ALL_SUBJECTS_API,
            null
        );
        console.log("fetch subject API RESPONSE............", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("Subject fetched Successfully");
        return response;
    } catch (error) {
        console.log("Add subject API ERROR............", error);
        toast.error(error.message || "Failed To Add subject");
    } finally {
        toast.dismiss(toastId);
    }
};



export const addSubject = async (formData, token, navigate) => {
    const toastId = toast.loading("Loading...");
    try {
        const response = await apiConnector(
            "POST",
            subjectEndPoints.ADD_SUBJECT_API,
            formData,
            {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            }
        );
        console.log("Add subject API RESPONSE............", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Subject Added Successfully");
        navigate("/dashboard/admin");
    } catch (error) {
        console.log("Add subject API ERROR............", error);
        toast.error(error.message || "Failed To Add subject");
    } finally {
        toast.dismiss(toastId);
    }
};


export const fetchStudentAttendance = async (token) => {
    const toastId = toast.loading("Loading Attendance...");
    try {
        const response = await apiConnector(
            "GET",
            
            subjectEndPoints.FETCH_STUDENT_ATTENDANCE_API,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        console.log("Attendance API RESPONSE:", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Attendance fetched successfully");
        return response;
    } catch (error) {
        console.error("Attendance API ERROR:", error);
        toast.error(error.message || "Failed to fetch attendance");
    } finally {
        toast.dismiss(toastId);
    }
};
