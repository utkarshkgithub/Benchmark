
const BASE_URL = import.meta.env.VITE_BASE_URL;

console.log("base_url:-",BASE_URL)


// AUTH ENDPOINTS`
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendOTP",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword"
}



export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/setting/updateDisplayPicture",
  UPDATE_PROFILE_API: BASE_URL + "/setting/updateProfile",
  DELETE_PROFILE_API: BASE_URL + "/setting/deleteProfile",
}


  export const subjectEndPoints = {
    ADD_SUBJECT_API:BASE_URL + "/subject/create-subject",
    FATCH_INSTRUCTOR_API:BASE_URL + "/subject/fetch-instructor",
    FETCH_ALL_SUBJECTS_API:BASE_URL + "/subject/fetch-subjects",
    FETCH_STUDENT_ATTENDANCE_API: BASE_URL + "/subject/student",
    FETCH_SUBJECTS_BY_INSTRUCTOR: BASE_URL + "/subject/instructor-subjects",
    FETCH_ATTENDANCE_BY_SUBJECT:BASE_URL + "/subject/fetch-by-subject",
    FETCH_GENRATE_API:BASE_URL+"/subject/qrcode"
    
  }