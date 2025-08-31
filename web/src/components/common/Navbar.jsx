import React from 'react'
import CTAButton from './CTAButton'
import { Link } from 'react-router-dom'
import { FaGraduationCap } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import ProfileDropDown from './ProfileDropDown'
function Navbar() {
  const {token} = useSelector((state)=>state.auth)
  const {user} = useSelector((state)=>state.auth)

  // console.log(token)
  return (
    <nav className="w-full flex justify-center items-center p-2 bg-black/5 backdrop-blur-md border-b border-b-black/20">
      {/* Brand */}
      <div className='flex justify-between items-center md:w-[75%] w-[90%]'>
        <Link to="/">
        <h2 className="text-2xl font-bold text-black tracking-wide flex justify-center items-center gap-2">
          <FaGraduationCap  className="mx-auto h-12 w-12 text-teal-600" />BENCHMARK
        </h2>
        </Link>
        {
          !token && (<div className='flex gap-2'>
          <Link to='/login'>
            <CTAButton text="Login" active={false} />
          </Link>
          <Link to='/signup'>
            <CTAButton text="Signup" active="true" />
          </Link>


        </div>)
        }
        {
          token && <ProfileDropDown user={user}/>
        }
      </div>

    </nav>
  )
}

export default Navbar
