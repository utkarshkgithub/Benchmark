
const BASE_URL = import.meta.env.VITE_BASE_URL;

// console.log("base_url:-", BASE_URL)


// AUTH ENDPOINTS`
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendOTP",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/verifyotp",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword"
}



export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/setting/updateDisplayPicture",
  UPDATE_PROFILE_API: BASE_URL + "/setting/updateProfile",
  DELETE_PROFILE_API: BASE_URL + "/setting/deleteProfile",
  DELETE_STUDENT_API: BASE_URL + "/setting/delete-student",
}


export const subjectEndPoints = {
  ADD_SUBJECT_API: BASE_URL + "/subject/create-subject",
  FATCH_INSTRUCTOR_API: BASE_URL + "/subject/fetch-instructor",
  FETCH_ALL_SUBJECTS_API: BASE_URL + "/subject/fetch-subjects",
  FETCH_ALL_STUDENTS_API: BASE_URL + "/subject/fetch-students",
  FETCH_STUDENT_ATTENDANCE_API: BASE_URL + "/subject/student",
  FETCH_SUBJECTS_BY_INSTRUCTOR: BASE_URL + "/subject/instructor-subjects",
  FETCH_ATTENDANCE_BY_SUBJECT: BASE_URL + "/subject/fetch-by-subject",
  FETCH_GENRATE_API: BASE_URL + "/subject/qrcode",
  GET_SUBJECT_STUDENTS_API: BASE_URL + "/subject/getSubjectStudents",
  GET_ATTENDANCE_DETAILS_API: BASE_URL + "/subject/getAttendanceDetails",
  UPDATE_ATTENDANCE_API: BASE_URL + "/subject/updateAttendance",
  INSTRUCTOR_SUMMARY_API: BASE_URL + "/subject/instructor-summary",
  DELETE_SUBJECT_API:BASE_URL + "/subject/delete-subject"
}

export const locationEndPoints = {
  ADD_LOCATION_API: BASE_URL + "/location/create",
  FETCH_LOCATIONS_API: BASE_URL + "/location/all",
};