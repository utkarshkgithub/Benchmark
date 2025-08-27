
const BASE_URL = import.meta.env.VITE_BASE_URL;

console.log("base_url:-",BASE_URL)


// AUTH ENDPOINTS`
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendOTP",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
//   RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
//   RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}
