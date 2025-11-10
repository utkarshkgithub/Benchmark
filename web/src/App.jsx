import './App.css'
import Navbar from './components/common/Navbar.jsx'
import Home from './page/Home.jsx'
import { Route, Routes } from 'react-router-dom'
import OpenRoute from './components/common/OpenRoute.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import { ACCOUNT_TYPE } from './utils/constants.js'
import { useSelector, useDispatch } from 'react-redux'
import { initializeTheme } from './Slices/themeSlice.js'
import Error from './components/common/Error.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { useEffect } from 'react' 
import About from './page/About.jsx'
import Signup from './page/Signup.jsx'
import Login from './page/Login.jsx'
import VerifyEmail from './page/VerifyEmail.jsx'
import DashBoard from './page/DashBoard.jsx'
import MyProfile from './components/core/dashboard/index.jsx'
import ForgotPassword from './components/core/outside/ForgotPassword.jsx'
import UpdatePassword from './components/core/outside/UpdatePassword.jsx'
import Admin from './components/core/dashboard/Admin/Admin.jsx'
import AddSubject from './components/core/dashboard/Admin/AddSubject.jsx'
import Instructor from './components/core/dashboard/Instructor/Instructor.jsx'
import Student from './components/core/dashboard/Student/Student.jsx'
import AttendanceCalendar from './components/core/dashboard/Student/AttendanceCalendar.jsx'
import ContectUs from './components/core/outside/ContectUs.jsx'
import PersonalDetails from './page/PersonalDetails.jsx'
import InstructorQR from './components/core/dashboard/Instructor/InstructorQR.jsx'
import InstructorSummary from './components/core/dashboard/Instructor/InstructorSummary.jsx'
function App() {
const { user } = useSelector((state) => state.auth);
const themeState = useSelector((state) => state.theme);
const darkMode = themeState?.darkMode || false;
const dispatch = useDispatch(); 
useEffect(() => {
  dispatch(initializeTheme());
}, [dispatch]); 
useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [darkMode]);

  return (
    <ThemeProvider>
      <div 
        className="min-h-screen" 
        style={{
          backgroundColor: darkMode ? '#111827' : '#ffffff',
          color: darkMode ? '#ffffff' : '#111827'
        }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="learn" element={<About />} />
          <Route path="login" element={<OpenRoute><Login /></OpenRoute>} />
          <Route path="signup" element={<OpenRoute><Signup /></OpenRoute>} />
          <Route path="verify-email" element={<OpenRoute> <VerifyEmail /> </OpenRoute>} />
          <Route path="personal-details" element={<OpenRoute> <PersonalDetails /> </OpenRoute>} />
          <Route path="forgot-password" element={ <OpenRoute> <ForgotPassword /> </OpenRoute> }/>
          <Route path="update-password/:id" element={<OpenRoute><UpdatePassword /></OpenRoute>}/>
          <Route path="contact" element={ <ContectUs /> } />



          <Route element={<ProtectedRoute> <DashBoard /> </ProtectedRoute>} >
            <Route path="dashboard/my-profile" element={<ProtectedRoute> <MyProfile /> </ProtectedRoute>} />
          {
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route path="dashboard/student" element={<ProtectedRoute><Student/></ProtectedRoute>} />
                <Route path="dashboard/student/attendance/:subjectId" element={<ProtectedRoute><AttendanceCalendar/></ProtectedRoute>} />
              </>
            )
          }
          {
            user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                <Route path="dashboard/instructor" element={<ProtectedRoute><Instructor/></ProtectedRoute>} />
                <Route path="dashboard/genrate-qr" element={<ProtectedRoute><InstructorQR/></ProtectedRoute>} />
                <Route path="dashboard/attendence-summary" element={<ProtectedRoute><InstructorSummary/></ProtectedRoute>} />

              </>
            )
          }
          {
            user?.accountType === ACCOUNT_TYPE.ADMIN && (
              <>
                <Route path="dashboard/admin" element={<ProtectedRoute><Admin/></ProtectedRoute>} />
                <Route path="dashboard/create-subject" element={<ProtectedRoute> <AddSubject /> </ProtectedRoute>} />
              </>
            )
          }
        </Route>
        <Route path='*' element={<Error/>}></Route>
        </Routes> 
      </div>
    </ThemeProvider>
  )
}

export default App
