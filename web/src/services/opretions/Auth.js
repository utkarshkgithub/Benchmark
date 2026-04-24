import { setToken, setLoading, setUserauth } from "../../Slices/authSlice.js"
import { setUserprofile } from '../../Slices/profileSlice.js'
import { apiConnector } from "../apiconnector.js"
import { endpoints } from '../api.js'
import toast from "react-hot-toast"
// import { error } from "toastr"

export function sendOtp(email, navigate) {

  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", endpoints.SENDOTP_API, {
        email,
      })
      // console.log("SENDOTP API RESPONSE............", response)

      // console.log(response.data.success)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("OTP Sent Successfully")
      navigate("/verify-email")
    } catch (error) {
      console.log("SENDOTP API ERROR............", error)
      toast.error("Could Not Send OTP")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}





export function signUp(
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  otp,
  navigate,
  deviceId = "",
  rollNumber = "",
  branch = "",
  semester = "",
  department = "",
  isMinor = false,
  selectedSubjects = []
) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      // Create the request payload
      const signupData = {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
        deviceId,
        rollNumber,
        branch,
        semester,
        department,
        subjects: selectedSubjects,
      };

      // Log all data being sent
      // console.log("🚀 SIGNUP REQUEST DATA:");
      // console.log("----------------------------------------");
      // console.log("👤 Basic Info:");
      // console.log("   First Name:", firstName);
      // console.log("   Last Name:", lastName);
      // console.log("   Email:", email);
      // console.log("   Account Type:", accountType);
      // console.log("   OTP:", otp);
      // console.log("----------------------------------------");
      
      // if (accountType === "Student") {
        // console.log("📚 Student Specific Data:");
        // console.log("   Device ID:", deviceId);
        // console.log("   Roll Number:", rollNumber);
        // console.log("   Branch:", branch);
        // console.log("   Semester:", semester);
        // console.log("   Is Minor Opted:", isMinor);
        // console.log("   Selected Subjects:", selectedSubjects);
      // } else {
      //   console.log("👨‍🏫 Instructor Specific Data:");
      //   console.log("   Department:", department);
      // }
      // console.log("----------------------------------------");

      const response = await apiConnector("POST", endpoints.SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
        deviceId,
        rollNumber,
        branch,
        semester,
        department,
        subjects: selectedSubjects, // ✅ add this
      });


      // console.log("🔄 SIGNUP API RESPONSE:");
      // console.log("----------------------------------------");
      // console.log("Status:", response.status);
      // console.log("Success:", response.data.success);
      // console.log("Message:", response.data.message);
      // console.log("User Details:", response.data.userDetails);
      // console.log("Additional Data:", response.data.user);
      // console.log("----------------------------------------");

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Signup Successful");
      navigate("/login");
    } catch (error) {
      console.log("SIGNUP API ERROR............", error.message);
      toast.error("Signup Failed");
      navigate("/signup");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}



export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    console.log("email1:-", email)
    console.log("password:-", password)
    try {
      const response = await apiConnector("POST", endpoints.LOGIN_API, {
        email,
        password,
      });

      console.log("LOGIN API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Login Successful");

      // Extract token and user data
      const token = response.data.token;
      const user = response.data.user;

      // Set user image if not provided
      const userImage = user?.image
        ? user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName}%20${user.lastName}`;

      // Save token and user to Redux store
      dispatch(setToken(token));
      dispatch(setUserauth({ ...user, image: userImage }));

      // Persist token and user in local storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ ...user, image: userImage }));
      console.log(user.accountType)
      // Navigate to dashboard based on account type
      const dashboardPath = user.accountType === "Admin"
        ? "/dashboard/admin"
        : user.accountType === "Instructor"
          ? "/dashboard/instructor"
          : "/dashboard/student";
      navigate(dashboardPath);
    } catch (error) {
      console.log("LOGIN API ERROR............", error);
      toast.error(error.response?.data?.message || "Login Failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function SENDPasswordResetOTP(email,extra,setEmailSent) {
  return async (dispatch) => {
    // console.log(extra)
    // console.log(email)

    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", endpoints.SENDOTP_API, {
        email,
        extra,
        checkUserPresent: true,
      })
      // console.log("SENDOTP API RESPONSE............", response)

      // console.log(response.data.success)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("OTP Sent Successfully")
      setEmailSent(true)
    } catch (error) {
      console.log("SENDOTP API ERROR............", error)
      toast.error("Could Not Send OTP")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}



export function resetPassword(otp,password,email ,navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", endpoints.RESETPASSWORD_API, {
        otp,
        password,
        email
      })

      // console.log("RESETPASSWORD RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Password Reset Successfully")
      navigate("/login")
    } catch (error) {
      console.log("RESETPASSWORD ERROR............", error)
      toast.error("Failed To Reset Password")
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

export function logout(navigate) {

  return (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUserauth(null))
    dispatch(setUserprofile(null))
    // dispatch(resetCart())
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")
  }
}