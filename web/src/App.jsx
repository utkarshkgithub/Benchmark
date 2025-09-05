import './App.css'
import Navbar from './components/common/Navbar.jsx'
import Home from './page/Home.jsx'
import Signup from './page/Signup.jsx'
import About from './page/About.jsx'
import { Route, Routes } from 'react-router-dom'
import Login from './page/Login.jsx'
import OpenRoute from './components/common/OpenRoute.jsx'
import VerifyEmail from './page/VerifyEmail.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import DashBoard from './page/DashBoard.jsx'
import { ACCOUNT_TYPE } from './utils/constants.js'
import MyProfile from './components/core/dashboard/index.jsx';
import { useSelector } from 'react-redux'
import ForgotPassword from './components/core/outside/ForgotPassword.jsx'
import UpdatePassword from './components/core/outside/UpdatePassword.jsx'
import Admin from './components/core/dashboard/Admin/Admin.jsx'
import AddSubject from './components/core/dashboard/Admin/AddSubject.jsx'
import Instructor from './components/core/dashboard/Instructor/Instructor.jsx'
import Student from './components/core/dashboard/Student/Student.jsx'
import ContectUs from './components/core/outside/ContectUs.jsx'
import PersonalDetails from './page/PersonalDetails.jsx'
import InstructorQR from './components/core/dashboard/Instructor/InstructorQR.jsx'
import InstructorSummary from './components/core/dashboard/Instructor/InstructorSummary.jsx'
import Error from './components/common/Error.jsx'

function App() {

const { user } = useSelector((state) => state.auth);
// /
  return (
    <div >
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

        
      {/* <PWABadge /> */}
      {/* <BackgroundBeams/> */}
    </div>
  )
}

export default App
