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
        // console.log("fetch subject API RESPONSE............", response);

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
        // console.log("Add subject API RESPONSE............", response);

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
    const toastId = toast.loading("Loading ...");
    try {
        const response = await apiConnector(
            "GET",

            subjectEndPoints.FETCH_STUDENT_ATTENDANCE_API,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        // console.log("Attendance API RESPONSE:", response);

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



export const generateQr = async (token, formData) => {
    // console.log("subjectCode",subjectCode)
    const toastId = toast.loading("Loading...");
    try {
        const response = await apiConnector(
            "POST",
            subjectEndPoints.FETCH_GENRATE_API,
            formData,
            {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            }
        );

        // console.log("GENRATE QR TOKEN API RESPONSE:", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("GENRATE QR TOKEN successfully");
        return response;
    } catch (error) {
        console.error("GENRATE QR TOKEN API ERROR:", error);
        toast.error(error.message || "Failed to GENRATE QR TOKEN");
    } finally {
        toast.dismiss(toastId);
    }
}



export const fetchInstructorSubjects = async (token) => {
    const toastId = toast.loading("Loading ...");
    try {
        const response = await apiConnector(
            "GET",

            subjectEndPoints.FETCH_SUBJECTS_BY_INSTRUCTOR,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        // console.log("FETCH SUBJECTS BY INSTRUCTOR API RESPONSE:", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("FETCH SUBJECTS BY INSTRUCTOR successfully");
        return response;
    } catch (error) {
        console.error("FETCH SUBJECTS BY INSTRUCTOR API ERROR:", error);
        toast.error(error.message || "Failed to FETCH SUBJECTS BY INSTRUCTOR");
    } finally {
        toast.dismiss(toastId);
    }
}

export const getSubjectStudents = async (token, subjectId) => {
    const toastId = toast.loading("Loading students...");
    try {
        const response = await apiConnector(
            "POST",
            subjectEndPoints.GET_SUBJECT_STUDENTS_API,
            { subjectId },
            {
                Authorization: `Bearer ${token}`,
            }
        );
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("Students loaded");
        return response;
    } catch (error) {
        console.error("GET_SUBJECT_STUDENTS_API API ERROR............", error);
        toast.error("Failed to load students");
    } finally {
        toast.dismiss(toastId);
    }
};

export const getAttendanceDetails = async (token, attendanceId) => {
    const toastId = toast.loading("Fetching attendance...");
    try {
        const response = await apiConnector(
            "POST",
            subjectEndPoints.GET_ATTENDANCE_DETAILS_API,
            { attendanceId },
            {
                Authorization: `Bearer ${token}`,
            }
        );
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("Attendance loaded");
        return response;
    } catch (error) {
        console.error("GET_ATTENDANCE_DETAILS_API API ERROR............", error);
        toast.error("Failed to load attendance");
    } finally {
        toast.dismiss(toastId);
    }
};

export const updateAttendance = async (token, attendanceId, updatedStudents) => {
    const toastId = toast.loading("Submitting changes...");
    try {
        const response = await apiConnector(
            "PUT",
            subjectEndPoints.UPDATE_ATTENDANCE_API,
            { attendanceId, updatedStudents },
            {
                Authorization: `Bearer ${token}`,
            }
        );
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("Attendance updated");
        return response;
    } catch (error) {
        console.error("UPDATE_ATTENDANCE_API API ERROR............", error);
        toast.error("Failed to update attendance");
    } finally {
        toast.dismiss(toastId);
    }
};



export const getInstructorSummary = async (token) => {
    const toastId = toast.loading("Loading summary...");
    try {
        const response = await apiConnector(
            "GET",
            subjectEndPoints.INSTRUCTOR_SUMMARY_API,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        // console.log("INSTRUCTOR SUMMARY API RESPONSE:", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        toast.success("Summary loaded");
        return response;
    } catch (error) {
        console.error("INSTRUCTOR SUMMARY API ERROR:", error);
        toast.error(error.message || "Failed to fetch summary");
    } finally {
        toast.dismiss(toastId);
    }
};
