
const FALLBACK_BASE_URL = "https://benchmark-official.onrender.com";

const rawBaseUrl = import.meta.env.VITE_BASE_URL?.trim() || FALLBACK_BASE_URL;
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");
const API_BASE_URL = normalizedBaseUrl.endsWith("/api/v3")
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api/v3`;

// console.log("base_url:-", BASE_URL)


// AUTH ENDPOINTS`
export const endpoints = {
  SENDOTP_API: API_BASE_URL + "/auth/sendOTP",
  SIGNUP_API: API_BASE_URL + "/auth/signup",
  LOGIN_API: API_BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: API_BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: API_BASE_URL + "/auth/verifyotp",
  CHANGE_PASSWORD_API: API_BASE_URL + "/auth/changepassword"
}



export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: API_BASE_URL + "/setting/updateDisplayPicture",
  UPDATE_PROFILE_API: API_BASE_URL + "/setting/updateProfile",
  DELETE_PROFILE_API: API_BASE_URL + "/setting/deleteProfile",
  DELETE_STUDENT_API: API_BASE_URL + "/setting/delete-student",
}


export const subjectEndPoints = {
  ADD_SUBJECT_API: API_BASE_URL + "/subject/create-subject",
  FATCH_INSTRUCTOR_API: API_BASE_URL + "/subject/fetch-instructor",
  FETCH_ALL_SUBJECTS_API: API_BASE_URL + "/subject/fetch-subjects",
  FETCH_ALL_STUDENTS_API: API_BASE_URL + "/subject/fetch-students",
  FETCH_STUDENT_ATTENDANCE_API: API_BASE_URL + "/subject/student",
  FETCH_SUBJECTS_BY_INSTRUCTOR: API_BASE_URL + "/subject/instructor-subjects",
  FETCH_ATTENDANCE_BY_SUBJECT: API_BASE_URL + "/subject/fetch-by-subject",
  FETCH_GENRATE_API: API_BASE_URL + "/subject/qrcode",
  VERIFY_QR_API: API_BASE_URL + "/subject/verifyqrcode",
  GET_SUBJECT_STUDENTS_API: API_BASE_URL + "/subject/getSubjectStudents",
  GET_ATTENDANCE_DETAILS_API: API_BASE_URL + "/subject/getAttendanceDetails",
  UPDATE_ATTENDANCE_API: API_BASE_URL + "/subject/updateAttendance",
  INSTRUCTOR_SUMMARY_API: API_BASE_URL + "/subject/instructor-summary",
  DELETE_SUBJECT_API:API_BASE_URL + "/subject/delete-subject"
}

export const locationEndPoints = {
  ADD_LOCATION_API: API_BASE_URL + "/location/create",
  FETCH_LOCATIONS_API: API_BASE_URL + "/location/all",
};