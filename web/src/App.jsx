import './App.css'
import Navbar from './components/common/Navbar.jsx'
import Home from './page/Home.jsx'
import { Route, Routes } from 'react-router-dom'
import OpenRoute from './components/common/OpenRoute.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import { ACCOUNT_TYPE } from './utils/constants.js'
import { useSelector } from 'react-redux'
import Error from './components/common/Error.jsx'
import { Suspense, lazy } from 'react'

// Lazy load heavy components
const About = lazy(() => import('./page/About.jsx'))
const Signup = lazy(() => import('./page/Signup.jsx'))
const Login = lazy(() => import('./page/Login.jsx'))
const VerifyEmail = lazy(() => import('./page/VerifyEmail.jsx'))
const DashBoard = lazy(() => import('./page/DashBoard.jsx'))
const MyProfile = lazy(() => import('./components/core/dashboard/index.jsx'))
const ForgotPassword = lazy(() => import('./components/core/outside/ForgotPassword.jsx'))
const UpdatePassword = lazy(() => import('./components/core/outside/UpdatePassword.jsx'))
const Admin = lazy(() => import('./components/core/dashboard/Admin/Admin.jsx'))
const AddSubject = lazy(() => import('./components/core/dashboard/Admin/AddSubject.jsx'))
const Instructor = lazy(() => import('./components/core/dashboard/Instructor/Instructor.jsx'))
const Student = lazy(() => import('./components/core/dashboard/Student/Student.jsx'))
const ContectUs = lazy(() => import('./components/core/outside/ContectUs.jsx'))
const PersonalDetails = lazy(() => import('./page/PersonalDetails.jsx'))
const InstructorQR = lazy(() => import('./components/core/dashboard/Instructor/InstructorQR.jsx'))
const InstructorSummary = lazy(() => import('./components/core/dashboard/Instructor/InstructorSummary.jsx'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
)

function App() {

const { user } = useSelector((state) => state.auth);
// /
  return (
    <div >
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
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
      </Suspense>

        
      {/* <PWABadge /> */}
      {/* <BackgroundBeams/> */}
    </div>
  )
}

export default App
