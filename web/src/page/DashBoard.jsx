
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom';
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import Sidebar from '../components/core/dashboard/Sidebar';

function DashBoard() {
  const [open, setOpen] = useState(true);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const { loading: profileLoading } = useSelector((state) => state.profile);
  const { user } = useSelector((state) => state.auth)
  // console.log(user)
  if (authLoading || profileLoading) {
    return (
      <div className='mt-20 dark:text-white text-black'>
        Loading...
      </div>
    )
  }
  return (
    <div className=' flex gap-2 box-border'>
      <div className='w-[50px] bg-white p-4  flex flex-col'>
        
        <div className='w-[50px]'>
          <Sidebar />
        </div>
      </div>


      <div className='bg-white'>

        <Outlet></Outlet>

      </div>
    </div>
  )
}

export default DashBoard;

// import React from 'react'

// function DashBoard() {
//   return (
//     <div>
//       DashBoard
//     </div>
//   )
// }

// export default DashBoard
