import React from 'react'
import { useSelector } from 'react-redux'

function Instructor() {
  const {user} = useSelector((state)=>state.auth);
  console.log(user)
  return (
    <div className='text-black'>
      {user?.subjectsTaught.map((subject,index)=>(
        <p key={index}>
          {subject.subjectName} <label htmlFor=""> </label>
          ({subject.subjectCode})
        </p>)
      )}
    </div>
  )
}

export default Instructor
